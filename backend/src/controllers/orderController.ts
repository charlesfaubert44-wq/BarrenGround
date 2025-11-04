import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { UserMembershipModel } from '../models/UserMembership';
import { MembershipUsageModel } from '../models/MembershipUsage';
import { UserModel } from '../models/User';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';

// Initialize Stripe only if API key is provided and valid
let stripe: Stripe | null = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey && stripeKey.startsWith('sk_')) {
  try {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-10-29.clover',
    });
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.warn('⚠️  Stripe initialization failed:', error);
  }
} else {
  console.warn('⚠️  Stripe is not configured. Payment processing will be mocked.');
  console.warn('   To enable Stripe, set STRIPE_SECRET_KEY in your .env file');
}

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

    const { items, guest_email, guest_name, guest_phone, pickup_time, useMembership } = req.body;

    // Calculate total
    let total = items.reduce(
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

    let membershipUsed = false;
    let membershipId: number | undefined;

    // Handle membership redemption
    if (useMembership && user_id) {
      const membership = await UserMembershipModel.findActiveByUserId(user_id);

      if (membership && membership.coffees_remaining > 0) {
        // Check if user already redeemed today
        const todayUsageCount = await MembershipUsageModel.getTodayUsageByMembershipId(membership.id);

        if (todayUsageCount === 0) {
          // Find the first coffee item and make it free
          const coffeeItem = items.find((item: any) =>
            item.menu_item_name.toLowerCase().includes('coffee') ||
            item.menu_item_name.toLowerCase().includes('espresso') ||
            item.menu_item_name.toLowerCase().includes('latte') ||
            item.menu_item_name.toLowerCase().includes('cappuccino') ||
            item.menu_item_name.toLowerCase().includes('americano') ||
            item.menu_item_name.toLowerCase().includes('mocha')
          );

          if (coffeeItem) {
            // Reduce total by coffee price (for one quantity)
            total -= coffeeItem.price_snapshot;
            membershipUsed = true;
            membershipId = membership.id;
          }
        }
      }
    }

    // Create Stripe PaymentIntent only if there's a charge
    let paymentIntent: Stripe.PaymentIntent | null = null;
    if (total > 0) {
      if (stripe) {
        // Real Stripe payment
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            user_id: user_id?.toString() || 'guest',
            guest_email: guest_email || '',
            membership_used: membershipUsed.toString(),
          },
        });
      } else {
        // Mock payment when Stripe is not configured
        paymentIntent = {
          id: `mock_pi_${Date.now()}`,
          client_secret: `mock_secret_${Date.now()}`,
        } as Stripe.PaymentIntent;
        console.log('⚠️  Using mock payment (Stripe not configured)');
      }
    }

    // Create order in database
    const order = await OrderModel.create({
      user_id,
      guest_email,
      guest_name,
      guest_phone,
      total,
      payment_intent_id: paymentIntent?.id || 'membership-free',
      pickup_time: pickup_time ? new Date(pickup_time) : undefined,
      items,
    });

    // Record membership usage if applicable
    if (membershipUsed && membershipId) {
      await UserMembershipModel.decrementCoffees(membershipId);
      const coffeeItem = items.find((item: any) =>
        item.menu_item_name.toLowerCase().includes('coffee') ||
        item.menu_item_name.toLowerCase().includes('espresso') ||
        item.menu_item_name.toLowerCase().includes('latte') ||
        item.menu_item_name.toLowerCase().includes('cappuccino') ||
        item.menu_item_name.toLowerCase().includes('americano') ||
        item.menu_item_name.toLowerCase().includes('mocha')
      );

      await MembershipUsageModel.create({
        user_membership_id: membershipId,
        order_id: order.id,
        coffee_name: coffeeItem?.menu_item_name,
      });
    }

    // Update last_order_id for registered users
    if (user_id) {
      await UserModel.updateLastOrder(user_id, order.id);
    }

    res.status(201).json({
      order,
      clientSecret: paymentIntent?.client_secret || null,
      membershipUsed,
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
  body('status').isIn(['pending', 'received', 'preparing', 'ready', 'cancelled']),
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

export async function getLastOrder(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user || !user.last_order_id) {
      res.status(404).json({ error: 'No previous orders found' });
      return;
    }

    const order = await OrderModel.getById(user.last_order_id);
    if (!order) {
      res.status(404).json({ error: 'Last order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get last order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCustomerStatus(req: Request, res: Response): Promise<void> {
  try {
    const { trackingToken } = req.params;
    const { customerStatus } = req.body;

    if (!trackingToken) {
      res.status(400).json({ error: 'Tracking token is required' });
      return;
    }

    if (!['on-my-way', 'delayed', 'wont-make-it'].includes(customerStatus)) {
      res.status(400).json({ error: 'Invalid customer status' });
      return;
    }

    const order = await OrderModel.updateCustomerStatus(trackingToken, customerStatus);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Broadcast to WebSocket clients (staff dashboard)
    const io = req.app.get('io');
    if (io) {
      const fullOrder = await OrderModel.getByTrackingToken(trackingToken);
      io.emit('customer_status_updated', fullOrder);
    }

    res.json(order);
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
