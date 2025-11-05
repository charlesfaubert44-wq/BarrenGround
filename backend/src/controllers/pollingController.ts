import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import pool from '../config/database';

/**
 * Get orders updated since a specific timestamp
 * Used by employee dashboard for efficient polling
 */
export async function getOrdersUpdatedSince(req: Request, res: Response): Promise<void> {
  try {
    const { since } = req.query;

    if (!since) {
      res.status(400).json({ error: 'since parameter is required (ISO 8601 timestamp)' });
      return;
    }

    const sinceDate = new Date(since as string);

    if (isNaN(sinceDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    // Get orders updated since the given timestamp
    const result = await pool.query(
      `SELECT o.*,
        COALESCE(json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price_snapshot', oi.price_snapshot
          ) ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.updated_at > $1 AND o.shop_id = $2
      GROUP BY o.id
      ORDER BY o.updated_at DESC`,
      [sinceDate, req.shop!.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders updated since error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get count of orders by status
 * Used by employee dashboard for quick status check
 */
export async function getOrderStatusCounts(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) as count
      FROM orders
      WHERE status IN ('received', 'preparing', 'ready') AND shop_id = $1
      GROUP BY status`,
      [req.shop!.id]
    );

    const counts: Record<string, number> = {
      received: 0,
      preparing: 0,
      ready: 0,
    };

    result.rows.forEach((row) => {
      counts[row.status] = parseInt(row.count);
    });

    res.json(counts);
  } catch (error) {
    console.error('Get order status counts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
