import { OrderModel } from '../../models/Order';
import { UserModel } from '../../models/User';
import { MenuItemModel } from '../../models/MenuItem';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';

describe('Order Model', () => {
  let testPool: Pool;
  let testUserId: number;
  let testMenuItemId: number;

  beforeAll(async () => {
    testPool = getTestPool();

    // Create test user
    const user = await UserModel.create({
      email: 'ordertest@test.com',
      password: 'password123',
      name: 'Order Test User',
    });
    testUserId = user.id;

    // Create test menu item
    const menuItem = await MenuItemModel.create({
      name: 'Test Latte',
      description: 'Test coffee',
      price: 4.50,
      category: 'Coffee',
      available: true,
    });
    testMenuItemId = menuItem.id;
  });

  afterAll(async () => {
    await cleanupTestData(testPool);
    await closeTestDatabase(testPool);
  });

  afterEach(async () => {
    // Clean up orders between tests
    await testPool.query('DELETE FROM order_items');
    await testPool.query('DELETE FROM orders');
  });

  describe('create', () => {
    it('should create order for authenticated user', async () => {
      const orderData = {
        user_id: testUserId,
        total: 9.00,
        payment_intent_id: 'pi_test_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 2,
            price_snapshot: 4.50,
          },
        ],
      };

      const order = await OrderModel.create(orderData);

      expect(order.id).toBeDefined();
      expect(order.user_id).toBe(testUserId);
      expect(order.total).toBe(9.00);
      expect(order.status).toBe('pending');
      expect(order.tracking_token).toBeNull();
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
    });

    it('should create order for guest with tracking token', async () => {
      const orderData = {
        guest_email: 'guest@test.com',
        guest_name: 'Guest User',
        guest_phone: '555-0100',
        total: 4.50,
        payment_intent_id: 'pi_guest_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const order = await OrderModel.create(orderData);

      expect(order.id).toBeDefined();
      expect(order.user_id).toBeNull();
      expect(order.guest_email).toBe('guest@test.com');
      expect(order.guest_name).toBe('Guest User');
      expect(order.tracking_token).toBeDefined();
      expect(order.tracking_token).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    it('should create order with multiple items', async () => {
      const orderData = {
        user_id: testUserId,
        total: 13.50,
        payment_intent_id: 'pi_multi_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 2,
            price_snapshot: 4.50,
          },
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
            customizations: { size: 'Large', milk: 'Oat' },
          },
        ],
      };

      const order = await OrderModel.create(orderData);

      expect(order.items).toHaveLength(2);
      expect(order.items[1].customizations).toEqual({ size: 'Large', milk: 'Oat' });
    });

    it('should create order with pickup time', async () => {
      const pickupTime = new Date(Date.now() + 3600000); // 1 hour from now
      const orderData = {
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_pickup_123',
        pickup_time: pickupTime,
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const order = await OrderModel.create(orderData);

      expect(order.pickup_time).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve order by id', async () => {
      const orderData = {
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_getbyid_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const created = await OrderModel.create(orderData);
      const retrieved = await OrderModel.getById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.items).toHaveLength(1);
    });

    it('should return null for non-existent id', async () => {
      const order = await OrderModel.getById(999999);
      expect(order).toBeNull();
    });
  });

  describe('getByTrackingToken', () => {
    it('should retrieve order by tracking token', async () => {
      const orderData = {
        guest_email: 'trackguest@test.com',
        guest_name: 'Track Guest',
        total: 4.50,
        payment_intent_id: 'pi_track_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const created = await OrderModel.create(orderData);
      const retrieved = await OrderModel.getByTrackingToken(created.tracking_token!);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.guest_email).toBe('trackguest@test.com');
    });

    it('should return null for invalid tracking token', async () => {
      const order = await OrderModel.getByTrackingToken('invalid-token');
      expect(order).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should retrieve all orders for user', async () => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        await OrderModel.create({
          user_id: testUserId,
          total: 4.50,
          payment_intent_id: `pi_user_${i}`,
          items: [
            {
              menu_item_id: testMenuItemId,
              menu_item_name: 'Test Latte',
              quantity: 1,
              price_snapshot: 4.50,
            },
          ],
        });
      }

      const orders = await OrderModel.getByUserId(testUserId);

      expect(orders).toHaveLength(3);
      expect(orders[0].user_id).toBe(testUserId);
    });

    it('should return empty array for user with no orders', async () => {
      const orders = await OrderModel.getByUserId(999999);
      expect(orders).toHaveLength(0);
    });
  });

  describe('getByStatus', () => {
    it('should retrieve orders by status', async () => {
      // Create orders with different statuses
      const order1 = await OrderModel.create({
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_status_1',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      });

      await OrderModel.updateStatus(order1.id, 'preparing');

      const order2 = await OrderModel.create({
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_status_2',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      });

      await OrderModel.updateStatus(order2.id, 'ready');

      const preparingOrders = await OrderModel.getByStatus(['preparing', 'ready']);

      expect(preparingOrders.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const orderData = {
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_updatestatus_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const order = await OrderModel.create(orderData);
      expect(order.status).toBe('pending');

      const updated = await OrderModel.updateStatus(order.id, 'preparing');
      expect(updated?.status).toBe('preparing');
    });

    it('should set ready_at timestamp when status is ready', async () => {
      const orderData = {
        user_id: testUserId,
        total: 4.50,
        payment_intent_id: 'pi_ready_123',
        items: [
          {
            menu_item_id: testMenuItemId,
            menu_item_name: 'Test Latte',
            quantity: 1,
            price_snapshot: 4.50,
          },
        ],
      };

      const order = await OrderModel.create(orderData);
      const updated = await OrderModel.updateStatus(order.id, 'ready');

      expect(updated?.ready_at).toBeDefined();
    });
  });

  describe('getRecentOrders', () => {
    it('should retrieve recent orders with limit', async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await OrderModel.create({
          user_id: testUserId,
          total: 4.50,
          payment_intent_id: `pi_recent_${i}`,
          items: [
            {
              menu_item_id: testMenuItemId,
              menu_item_name: 'Test Latte',
              quantity: 1,
              price_snapshot: 4.50,
            },
          ],
        });
      }

      const orders = await OrderModel.getRecentOrders(3);

      expect(orders.length).toBeLessThanOrEqual(3);
    });
  });
});
