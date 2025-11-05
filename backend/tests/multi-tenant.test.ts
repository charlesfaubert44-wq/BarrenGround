import { ShopModel } from '../src/models/Shop';
import { UserModel } from '../src/models/User';
import { OrderModel } from '../src/models/Order';
import { MenuItemModel } from '../src/models/MenuItem';

describe('Multi-Tenant Isolation', () => {
  const shop1 = 'testshop1';
  const shop2 = 'testshop2';

  beforeAll(async () => {
    // Create two test shops
    await ShopModel.create({
      id: shop1,
      name: 'Test Shop 1',
      display_name: 'Test Shop 1',
      email: 'shop1@test.com',
      subdomain: 'shop1',
    });

    await ShopModel.create({
      id: shop2,
      name: 'Test Shop 2',
      display_name: 'Test Shop 2',
      email: 'shop2@test.com',
      subdomain: 'shop2',
    });
  });

  test('Users are isolated by shop', async () => {
    // Create user in shop1
    const user1 = await UserModel.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      shop_id: shop1,
    });

    // Same email in shop2 should be allowed
    const user2 = await UserModel.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      shop_id: shop2,
    });

    // Should be different users
    expect(user1.id).not.toBe(user2.id);

    // Query should only return user from specific shop
    const foundUser1 = await UserModel.findByEmail('user@test.com', shop1);
    const foundUser2 = await UserModel.findByEmail('user@test.com', shop2);

    expect(foundUser1?.id).toBe(user1.id);
    expect(foundUser2?.id).toBe(user2.id);
  });

  test('Orders are isolated by shop', async () => {
    // Create orders for each shop
    const order1 = await OrderModel.create({
      shop_id: shop1,
      guest_email: 'guest@test.com',
      guest_name: 'Guest',
      total: 10,
      payment_intent_id: 'test_pi_1',
      items: [{
        menu_item_id: 1,
        menu_item_name: 'Coffee',
        quantity: 1,
        price_snapshot: 10,
      }],
    });

    const order2 = await OrderModel.create({
      shop_id: shop2,
      guest_email: 'guest@test.com',
      guest_name: 'Guest',
      total: 15,
      payment_intent_id: 'test_pi_2',
      items: [{
        menu_item_id: 1,
        menu_item_name: 'Coffee',
        quantity: 1,
        price_snapshot: 15,
      }],
    });

    // Get orders by status should only return shop-specific orders
    const shop1Orders = await OrderModel.getByStatus(['pending'], shop1);
    const shop2Orders = await OrderModel.getByStatus(['pending'], shop2);

    expect(shop1Orders.find(o => o.id === order1.id)).toBeDefined();
    expect(shop1Orders.find(o => o.id === order2.id)).toBeUndefined();

    expect(shop2Orders.find(o => o.id === order2.id)).toBeDefined();
    expect(shop2Orders.find(o => o.id === order1.id)).toBeUndefined();
  });

  test('Menu items are isolated by shop', async () => {
    const item1 = await MenuItemModel.create({
      name: 'Shop 1 Coffee',
      price: 5,
      category: 'beverages',
    }, shop1);

    const item2 = await MenuItemModel.create({
      name: 'Shop 2 Coffee',
      price: 6,
      category: 'beverages',
    }, shop2);

    // Get all items should only return shop-specific items
    const shop1Items = await MenuItemModel.getAll(shop1);
    const shop2Items = await MenuItemModel.getAll(shop2);

    expect(shop1Items.find(i => i.id === item1.id)).toBeDefined();
    expect(shop1Items.find(i => i.id === item2.id)).toBeUndefined();

    expect(shop2Items.find(i => i.id === item2.id)).toBeDefined();
    expect(shop2Items.find(i => i.id === item1.id)).toBeUndefined();
  });
});
