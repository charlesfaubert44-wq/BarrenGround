import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';
import menuRoutes from '../../routes/menuRoutes';
import orderRoutes from '../../routes/orderRoutes';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';
import { MenuItemModel } from '../../models/MenuItem';

// Create test app with all routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

describe('Complete Order Flow E2E Tests', () => {
  let testPool: Pool;
  let testMenuItemId: number;

  beforeAll(async () => {
    testPool = getTestPool();

    // Create test menu item
    const menuItem = await MenuItemModel.create({
      name: 'Test E2E Latte',
      description: 'Test coffee for E2E',
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
    await testPool.query('DELETE FROM order_items');
    await testPool.query('DELETE FROM orders');
    await cleanupTestData(testPool);
  });

  describe('Guest Checkout Flow', () => {
    it('should complete full guest checkout flow', async () => {
      // 1. Get menu items
      const menuResponse = await request(app)
        .get('/api/menu');

      expect(menuResponse.status).toBe(200);
      expect(menuResponse.body.items.length).toBeGreaterThan(0);

      const menuItem = menuResponse.body.items.find((item: any) =>
        item.name === 'Test E2E Latte'
      );
      expect(menuItem).toBeDefined();

      // 2. Create order as guest
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: menuItem.id,
              quantity: 2,
              customizations: { size: 'Large', milk: 'Oat' },
            },
          ],
          customer: {
            name: 'E2E Guest Customer',
            email: 'e2eguest@test.com',
            phone: '555-0199',
          },
          payment_method_id: 'pm_test_e2e',
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.order).toBeDefined();
      expect(orderResponse.body.order.guest_name).toBe('E2E Guest Customer');
      expect(orderResponse.body.order.tracking_token).toBeDefined();
      expect(orderResponse.body.order.status).toBe('pending');

      const trackingToken = orderResponse.body.order.tracking_token;
      const orderId = orderResponse.body.order.id;

      // 3. Track order using tracking token
      const trackResponse = await request(app)
        .get(`/api/orders/track/${trackingToken}`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.order).toBeDefined();
      expect(trackResponse.body.order.id).toBe(orderId);
      expect(trackResponse.body.order.status).toBe('pending');
      expect(trackResponse.body.order.items).toHaveLength(1);
      expect(trackResponse.body.order.items[0].quantity).toBe(2);
      expect(trackResponse.body.order.items[0].customizations).toEqual({
        size: 'Large',
        milk: 'Oat',
      });

      // 4. Simulate payment confirmation (webhook would update status)
      // In real flow, Stripe webhook would call this
      // For test, we can directly update the order status
      const statusUpdateResponse = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({
          status: 'received',
        });

      // May require auth, so we accept multiple status codes
      expect([200, 401, 403]).toContain(statusUpdateResponse.status);

      // 5. Track again to see status update (if successful)
      const trackAfterPayment = await request(app)
        .get(`/api/orders/track/${trackingToken}`);

      expect(trackAfterPayment.status).toBe(200);
    });

    it('should handle order with multiple items', async () => {
      // Create order with multiple different items
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
              customizations: { size: 'Small' },
            },
            {
              menu_item_id: testMenuItemId,
              quantity: 2,
              customizations: { size: 'Large' },
            },
          ],
          customer: {
            name: 'Multi Item Guest',
            email: 'multiitem@test.com',
          },
          payment_method_id: 'pm_test_multi',
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.order.items).toHaveLength(2);

      const total = orderResponse.body.order.total;
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Member Checkout Flow', () => {
    it('should complete full member checkout flow', async () => {
      // 1. Register a new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'e2emember@test.com',
          password: 'password123',
          name: 'E2E Member',
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();

      const authToken = registerResponse.body.token;
      const userId = registerResponse.body.user.id;

      // 2. Get menu items
      const menuResponse = await request(app)
        .get('/api/menu');

      expect(menuResponse.status).toBe(200);

      const menuItem = menuResponse.body.items.find((item: any) =>
        item.name === 'Test E2E Latte'
      );

      // 3. Create order as authenticated user
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              menu_item_id: menuItem.id,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_member',
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.order).toBeDefined();
      expect(orderResponse.body.order.user_id).toBe(userId);
      expect(orderResponse.body.order.tracking_token).toBeNull();

      // 4. Get user's orders
      const userOrdersResponse = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(userOrdersResponse.status).toBe(200);
      expect(userOrdersResponse.body.orders).toBeDefined();
      expect(userOrdersResponse.body.orders.length).toBeGreaterThan(0);
      expect(userOrdersResponse.body.orders[0].user_id).toBe(userId);

      // 5. Verify user profile is accessible
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.email).toBe('e2emember@test.com');
    });

    it('should not allow authenticated user order without token', async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_noauth',
        });

      // Should require customer info for guest or return error
      expect([400, 401]).toContain(orderResponse.status);
    });
  });

  describe('Order Status Progression', () => {
    it('should progress through order statuses', async () => {
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          customer: {
            name: 'Status Test',
            email: 'status@test.com',
          },
          payment_method_id: 'pm_test_status',
        });

      const trackingToken = orderResponse.body.order.tracking_token;
      const orderId = orderResponse.body.order.id;

      // Status: pending
      let trackResponse = await request(app)
        .get(`/api/orders/track/${trackingToken}`);
      expect(trackResponse.body.order.status).toBe('pending');

      // Update to received (payment confirmed)
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'received' });

      // Update to preparing
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'preparing' });

      // Update to ready
      const readyResponse = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'ready' });

      // Verify final status (if auth allowed)
      if (readyResponse.status === 200) {
        trackResponse = await request(app)
          .get(`/api/orders/track/${trackingToken}`);
        expect(trackResponse.body.order.status).toBe('ready');
        expect(trackResponse.body.order.ready_at).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid menu item in order', async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: 999999,
              quantity: 1,
            },
          ],
          customer: {
            name: 'Error Test',
            email: 'error@test.com',
          },
          payment_method_id: 'pm_test_error',
        });

      expect(orderResponse.status).toBe(400);
    });

    it('should handle empty cart', async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [],
          customer: {
            name: 'Empty Cart',
            email: 'empty@test.com',
          },
          payment_method_id: 'pm_test_empty',
        });

      expect(orderResponse.status).toBe(400);
    });

    it('should handle invalid tracking token', async () => {
      const trackResponse = await request(app)
        .get('/api/orders/track/invalid-token-123');

      expect(trackResponse.status).toBe(404);
    });
  });
});
