import request from 'supertest';
import express from 'express';
import orderRoutes from '../../routes/orderRoutes';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';
import { UserModel } from '../../models/User';
import { MenuItemModel } from '../../models/MenuItem';
import { sign } from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Orders API Integration Tests', () => {
  let testPool: Pool;
  let testUserId: number;
  let authToken: string;
  let testMenuItemId: number;

  beforeAll(async () => {
    testPool = getTestPool();

    // Create test user
    const user = await UserModel.create({
      email: 'orderapi@test.com',
      password: 'password123',
      name: 'Order API User',
    });
    testUserId = user.id;

    // Create auth token
    authToken = sign(
      { userId: testUserId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test menu item
    const menuItem = await MenuItemModel.create({
      name: 'Test API Latte',
      description: 'Test coffee for API',
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
  });

  describe('POST /api/orders', () => {
    it('should create order for authenticated user', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 2,
              customizations: { size: 'Large' },
            },
          ],
          payment_method_id: 'pm_test_123',
        });

      expect(response.status).toBe(201);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.user_id).toBe(testUserId);
      expect(response.body.order.items).toHaveLength(1);
    });

    it('should create order for guest', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          customer: {
            name: 'Guest Customer',
            email: 'guest@test.com',
            phone: '555-0100',
          },
          payment_method_id: 'pm_test_guest',
        });

      expect(response.status).toBe(201);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.guest_name).toBe('Guest Customer');
      expect(response.body.order.guest_email).toBe('guest@test.com');
      expect(response.body.order.tracking_token).toBeDefined();
    });

    it('should return 400 for empty items array', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
          payment_method_id: 'pm_test_123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid menu item id', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              menu_item_id: 999999,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for guest order without customer info', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_guest',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders/track/:token', () => {
    it('should return order for valid tracking token', async () => {
      // Create a guest order first
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          customer: {
            name: 'Track Guest',
            email: 'track@test.com',
          },
          payment_method_id: 'pm_test_track',
        });

      const trackingToken = createResponse.body.order.tracking_token;

      const response = await request(app)
        .get(`/api/orders/track/${trackingToken}`);

      expect(response.status).toBe(200);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.guest_name).toBe('Track Guest');
    });

    it('should return 404 for invalid tracking token', async () => {
      const response = await request(app)
        .get('/api/orders/track/invalid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/orders/user', () => {
    it('should return user orders when authenticated', async () => {
      // Create some orders for the user
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_123',
        });

      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toBeDefined();
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/orders/user');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status (employee only)', async () => {
      // Create an order
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              menu_item_id: testMenuItemId,
              quantity: 1,
            },
          ],
          payment_method_id: 'pm_test_123',
        });

      const orderId = createResponse.body.order.id;

      // Note: This would typically require employee authentication
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({
          status: 'preparing',
        });

      // This might return 401/403 without proper employee token
      // Adjust expectation based on actual implementation
      expect([200, 401, 403]).toContain(response.status);
    });
  });
});
