import { MenuItemModel } from '../../models/MenuItem';
import { getTestPool, cleanupTestData, closeTestDatabase } from '../../config/testDatabase';
import { Pool } from 'pg';

describe('MenuItem Model', () => {
  let testPool: Pool;

  beforeAll(async () => {
    testPool = getTestPool();
  });

  afterAll(async () => {
    await cleanupTestData(testPool);
    await closeTestDatabase(testPool);
  });

  afterEach(async () => {
    await testPool.query('DELETE FROM menu_items WHERE name LIKE \'Test %\'');
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      const itemData = {
        name: 'Test Cappuccino',
        description: 'A test cappuccino',
        price: 4.75,
        category: 'Coffee',
        available: true,
      };

      const item = await MenuItemModel.create(itemData);

      expect(item.id).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.price).toBe(itemData.price);
      expect(item.category).toBe(itemData.category);
      expect(item.available).toBe(true);
    });

    it('should create menu item with image URL', async () => {
      const itemData = {
        name: 'Test Mocha',
        description: 'A test mocha',
        price: 5.25,
        category: 'Coffee',
        image_url: 'https://example.com/mocha.jpg',
        available: true,
      };

      const item = await MenuItemModel.create(itemData);

      expect(item.image_url).toBe(itemData.image_url);
    });

    it('should create unavailable menu item', async () => {
      const itemData = {
        name: 'Test Unavailable',
        description: 'Currently unavailable',
        price: 3.50,
        category: 'Coffee',
        available: false,
      };

      const item = await MenuItemModel.create(itemData);

      expect(item.available).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should retrieve all menu items', async () => {
      // Create test items
      await MenuItemModel.create({
        name: 'Test Item 1',
        description: 'Test',
        price: 4.00,
        category: 'Coffee',
        available: true,
      });

      await MenuItemModel.create({
        name: 'Test Item 2',
        description: 'Test',
        price: 5.00,
        category: 'Food',
        available: false,
      });

      const items = await MenuItemModel.getAll();

      expect(items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAvailable', () => {
    it('should retrieve only available menu items', async () => {
      // Create available item
      await MenuItemModel.create({
        name: 'Test Available',
        description: 'Test',
        price: 4.00,
        category: 'Coffee',
        available: true,
      });

      // Create unavailable item
      await MenuItemModel.create({
        name: 'Test Unavailable',
        description: 'Test',
        price: 5.00,
        category: 'Coffee',
        available: false,
      });

      const items = await MenuItemModel.getAvailable();

      // All returned items should be available
      items.forEach(item => {
        if (item.name.startsWith('Test')) {
          expect(item.available).toBe(true);
        }
      });
    });
  });

  describe('getById', () => {
    it('should retrieve menu item by id', async () => {
      const created = await MenuItemModel.create({
        name: 'Test GetById',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const item = await MenuItemModel.getById(created.id);

      expect(item).not.toBeNull();
      expect(item?.id).toBe(created.id);
      expect(item?.name).toBe('Test GetById');
    });

    it('should return null for non-existent id', async () => {
      const item = await MenuItemModel.getById(999999);
      expect(item).toBeNull();
    });
  });

  describe('updateAvailability', () => {
    it('should update item availability to false', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Availability',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const updated = await MenuItemModel.updateAvailability(created.id, false);

      expect(updated?.available).toBe(false);
    });

    it('should update item availability to true', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Availability 2',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: false,
      });

      const updated = await MenuItemModel.updateAvailability(created.id, true);

      expect(updated?.available).toBe(true);
    });
  });

  describe('update', () => {
    it('should update menu item name', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Old Name',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const updated = await MenuItemModel.update(created.id, {
        name: 'Test New Name',
      });

      expect(updated?.name).toBe('Test New Name');
    });

    it('should update menu item price', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Price Update',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const updated = await MenuItemModel.update(created.id, {
        price: 5.50,
      });

      expect(updated?.price).toBe(5.50);
    });

    it('should update multiple fields', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Multi Update',
        description: 'Old description',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const updated = await MenuItemModel.update(created.id, {
        name: 'Test Updated',
        description: 'New description',
        price: 6.00,
      });

      expect(updated?.name).toBe('Test Updated');
      expect(updated?.description).toBe('New description');
      expect(updated?.price).toBe(6.00);
    });

    it('should return null for empty update', async () => {
      const created = await MenuItemModel.create({
        name: 'Test No Update',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const updated = await MenuItemModel.update(created.id, {});

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete menu item', async () => {
      const created = await MenuItemModel.create({
        name: 'Test Delete',
        description: 'Test',
        price: 4.50,
        category: 'Coffee',
        available: true,
      });

      const success = await MenuItemModel.delete(created.id);
      expect(success).toBe(true);

      const deleted = await MenuItemModel.getById(created.id);
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const success = await MenuItemModel.delete(999999);
      expect(success).toBe(false);
    });
  });
});
