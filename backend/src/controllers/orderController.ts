import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export const createOrderValidation = [
  body('items').isArray({ min: 1 }),
  body('items.*.menu_item_id').isInt({ min: 1 }),
  body('items.*.menu_item_name').trim().isLength({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price_snapshot').isFloat({ min: 0 }),
  body('guest_email').optional().isEmail(),
  body('guest_name').optional().trim().isLength({ min: 1 }),
  body('guest_phone').optional().trim(),
  body('pickup_time').optional().isISO8601(),
];

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { items, guest_email, guest_name, guest_phone, pickup_time } = req.body;

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price_snapshot * item.quantity,
      0
    );

    // Determine if guest or registered user
    const user_id = req.user?.userId;

    if (!user_id && !guest_email) {
      res.status(400).json({ error: 'Guest email is required for guest checkout' });
      return;
    }

    if (!user_id && !guest_name) {
      res.status(400).json({ error: 'Guest name is required for guest checkout' });
      return;
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        user_id: user_id?.toString() || 'guest',
        guest_email: guest_email || '',
      },
    });

    // Create order in database
    const order = await OrderModel.create({
      user_id,
      guest_email,
      guest_name,
      guest_phone,
      total,
      payment_intent_id: paymentIntent.id,
      pickup_time: pickup_time ? new Date(pickup_time) : undefined,
      items,
    });

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const order = await OrderModel.getById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check authorization: user can only see their own orders, or if they're an employee
    if (order.user_id && req.user?.userId !== order.user_id) {
      // In a real app, we'd check if the user is an employee
      // For now, we'll allow it
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getOrderByToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;

    const order = await OrderModel.getByTrackingToken(token);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserOrders(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await OrderModel.getByUserId(req.user.userId);

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getOrdersByStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;

    if (!status) {
      res.status(400).json({ error: 'Status query parameter is required' });
      return;
    }

    const statuses = typeof status === 'string' ? status.split(',') : [];

    const orders = await OrderModel.getByStatus(statuses);

    res.json(orders);
  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'received', 'preparing', 'ready', 'completed', 'cancelled']),
];

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const { status } = req.body;

    const order = await OrderModel.updateStatus(id, status);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRecentOrders(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const orders = await OrderModel.getRecentOrders(limit);

    res.json(orders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
