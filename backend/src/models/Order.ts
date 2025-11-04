import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Order {
  id: number;
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'cancelled';
  payment_intent_id: string;
  tracking_token?: string;
  pickup_time?: Date;
  ready_at?: Date;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  price_snapshot: number;
  customizations?: Record<string, string>;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer_name: string;
}

export interface CreateOrderData {
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  payment_intent_id: string;
  pickup_time?: Date;
  items: Array<{
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price_snapshot: number;
    customizations?: Record<string, string>;
  }>;
}

export class OrderModel {
  static async create(orderData: CreateOrderData): Promise<OrderWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create tracking token for guest orders
      const tracking_token = orderData.user_id ? null : uuidv4();

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, guest_email, guest_name, guest_phone, total, status, payment_intent_id, tracking_token, pickup_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          orderData.user_id,
          orderData.guest_email,
          orderData.guest_name,
          orderData.guest_phone,
          orderData.total,
          'pending',
          orderData.payment_intent_id,
          tracking_token,
          orderData.pickup_time,
        ]
      );

      const order = orderResult.rows[0];

      // Insert order items
      const items: OrderItem[] = [];
      for (const item of orderData.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price_snapshot, customizations)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            order.id,
            item.menu_item_id,
            item.menu_item_name,
            item.quantity,
            item.price_snapshot,
            item.customizations ? JSON.stringify(item.customizations) : null,
          ]
        );
        items.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        items,
        customer_name: order.guest_name || 'Registered User',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getById(id: number): Promise<OrderWithItems | null> {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) return null;

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return {
      ...order,
      items: itemsResult.rows,
      customer_name: order.guest_name || 'Registered User',
    };
  }

  static async getByTrackingToken(token: string): Promise<OrderWithItems | null> {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE tracking_token = $1',
      [token]
    );

    if (orderResult.rows.length === 0) return null;

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    return {
      ...order,
      items: itemsResult.rows,
      customer_name: order.guest_name || 'Registered User',
    };
  }

  static async getByUserId(userId: number): Promise<OrderWithItems[]> {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders: OrderWithItems[] = [];

    for (const order of orderResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows,
        customer_name: 'Registered User',
      });
    }

    return orders;
  }

  static async getByStatus(statuses: string[]): Promise<OrderWithItems[]> {
    const placeholders = statuses.map((_, i) => `$${i + 1}`).join(', ');

    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE status IN (${placeholders}) ORDER BY created_at ASC`,
      statuses
    );

    const orders: OrderWithItems[] = [];

    for (const order of orderResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows,
        customer_name: order.guest_name || 'Registered User',
      });
    }

    return orders;
  }

  static async updateStatus(id: number, status: Order['status']): Promise<Order | null> {
    // If status is 'ready', set ready_at to current timestamp
    if (status === 'ready') {
      const result = await pool.query(
        'UPDATE orders SET status = $1, ready_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0] || null;
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async updateCustomerStatus(trackingToken: string, customerStatus: string): Promise<Order | null> {
    const result = await pool.query(
      'UPDATE orders SET customer_status = $1, customer_status_updated_at = NOW() WHERE tracking_token = $2 RETURNING *',
      [customerStatus, trackingToken]
    );
    return result.rows[0] || null;
  }

  static async getRecentOrders(limit: number = 50): Promise<OrderWithItems[]> {
    const orderResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    const orders: OrderWithItems[] = [];

    for (const order of orderResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows,
        customer_name: order.guest_name || 'Registered User',
      });
    }

    return orders;
  }
}
