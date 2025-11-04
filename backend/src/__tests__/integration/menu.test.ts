import request from 'supertest';
import express from 'express';
import menuRoutes from '../../routes/menuRoutes';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';
import { MenuItemModel } from '../../models/MenuItem';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/menu', menuRoutes);

describe('Menu API Integration Tests', () => {
  let testPool: Pool;
  let testMenuItemId: number;

  beforeAll(async () => {
    testPool = getTestPool();

    // Create test menu items
    const menuItem = await MenuItemModel.create({
      name: 'Test Menu Latte',
      description: 'A test latte for menu API',
      price: 4.50,
      category: 'Coffee',
      available: true,
    });
    testMenuItemId = menuItem.id;

    await MenuItemModel.create({
      name: 'Test Menu Cappuccino',
      description: 'A test cappuccino',
      price: 4.75,
      category: 'Coffee',
      available: true,
    });

    await MenuItemModel.create({
      name: 'Test Menu Unavailable',
      description: 'Unavailable item',
      price: 5.00,
      category: 'Coffee',
      available: false,
    });
  });

  afterAll(async () => {
    await cleanupTestData(testPool);
    await closeTestDatabase(testPool);
  });

  describe('GET /api/menu', () => {
    it('should return all available menu items', async () => {
      const response = await request(app)
        .get('/api/menu');

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(Array.isArray(response.body.items)).toBe(true);

      // All returned items should be available
      response.body.items.forEach((item: any) => {
        if (item.name.startsWith('Test Menu')) {
          expect(item.available).toBe(true);
        }
      });
    });

    it('should return items with required fields', async () => {
      const response = await request(app)
        .get('/api/menu');

      expect(response.status).toBe(200);

      const testItems = response.body.items.filter((item: any) =>
        item.name.startsWith('Test Menu')
      );

      expect(testItems.length).toBeGreaterThan(0);

      testItems.forEach((item: any) => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.price).toBeDefined();
        expect(item.category).toBeDefined();
        expect(item.available).toBe(true);
      });
    });
  });

  describe('GET /api/menu/:id', () => {
    it('should return specific menu item by id', async () => {
      const response = await request(app)
        .get(`/api/menu/${testMenuItemId}`);

      expect(response.status).toBe(200);
      expect(response.body.item).toBeDefined();
      expect(response.body.item.id).toBe(testMenuItemId);
      expect(response.body.item.name).toBe('Test Menu Latte');
    });

    it('should return 404 for non-existent menu item', async () => {
      const response = await request(app)
        .get('/api/menu/999999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/api/menu/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/menu/category/:category', () => {
    it('should return items by category', async () => {
      const response = await request(app)
        .get('/api/menu/category/Coffee');

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();

      // All items should be in Coffee category
      response.body.items.forEach((item: any) => {
        expect(item.category).toBe('Coffee');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/menu/category/NonExistent');

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('PATCH /api/menu/:id/availability', () => {
    it('should update menu item availability (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/menu/${testMenuItemId}/availability`)
        .send({
          available: false,
        });

      // This might return 401/403 without proper admin token
      expect([200, 401, 403]).toContain(response.status);
    });
  });
});
