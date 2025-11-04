import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { BusinessHoursModel } from './BusinessHours';

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
  scheduled_time?: Date;
  is_scheduled?: boolean;
  reminder_sent?: boolean;
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
  user_email?: string;
}

export interface CreateOrderData {
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  payment_intent_id: string;
  pickup_time?: Date;
  scheduled_time?: Date;
  is_scheduled?: boolean;
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
        `INSERT INTO orders (user_id, guest_email, guest_name, guest_phone, total, status, payment_intent_id, tracking_token, pickup_time, scheduled_time, is_scheduled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
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
          orderData.scheduled_time,
          orderData.is_scheduled || false,
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
      `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
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
      `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.tracking_token = $1`,
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
      `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
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
      `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.status IN (${placeholders})
       ORDER BY o.created_at ASC`,
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
      `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT $1`,
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

  /**
   * Validate scheduled time for an order
   */
  static async validateScheduledTime(scheduledTime: Date): Promise<{
    valid: boolean;
    error?: string;
  }> {
    const now = new Date();

    // Check minimum advance notice (30 minutes)
    const minTime = new Date(now.getTime() + 30 * 60 * 1000);
    if (scheduledTime < minTime) {
      return {
        valid: false,
        error: 'Orders must be scheduled at least 30 minutes in advance',
      };
    }

    // Check maximum advance (7 days)
    const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (scheduledTime > maxTime) {
      return {
        valid: false,
        error: 'Orders can only be scheduled up to 7 days in advance',
      };
    }

    // Check business hours
    const isOpen = await BusinessHoursModel.isOpen(scheduledTime);
    if (!isOpen) {
      return {
        valid: false,
        error: 'Selected time is outside business hours',
      };
    }

    // Check slot capacity
    const capacity = await BusinessHoursModel.getSlotCapacityWithSettings(scheduledTime);
    if (!capacity.available) {
      return {
        valid: false,
        error: 'This time slot is fully booked. Please select another time.',
      };
    }

    return { valid: true };
  }

  /**
   * Get all orders scheduled for a specific date
   */
  static async getScheduledOrders(date: Date): Promise<OrderWithItems[]> {
    // Create start and end of day for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orderResult = await pool.query(
      `SELECT * FROM orders
       WHERE is_scheduled = true
         AND scheduled_time >= $1
         AND scheduled_time <= $2
         AND status != 'cancelled'
       ORDER BY scheduled_time ASC`,
      [startOfDay, endOfDay]
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

  /**
   * Get orders that need reminder notifications
   */
  static async getOrdersNeedingReminders(): Promise<OrderWithItems[]> {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    const orderResult = await pool.query(
      `SELECT * FROM orders
       WHERE is_scheduled = true
         AND reminder_sent = false
         AND scheduled_time BETWEEN $1 AND $2
         AND status != 'cancelled'`,
      [now, reminderTime]
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

  /**
   * Mark reminder as sent
   */
  static async markReminderSent(orderId: number): Promise<void> {
    await pool.query(
      'UPDATE orders SET reminder_sent = true WHERE id = $1',
      [orderId]
    );
  }
}
