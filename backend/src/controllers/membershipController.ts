import { Request, Response } from 'express';
import { MembershipPlanModel } from '../models/MembershipPlan';
import { UserMembershipModel } from '../models/UserMembership';
import { MembershipUsageModel } from '../models/MembershipUsage';
import Stripe from 'stripe';

// Initialize Stripe only if API key is provided and valid
let stripe: Stripe | null = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey && stripeKey.startsWith('sk_')) {
  try {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia',
    });
  } catch (error) {
    console.warn('⚠️  Stripe membership initialization failed:', error);
  }
}

// Get all available membership plans
export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const plans = await MembershipPlanModel.findAll();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user's current membership status
export async function getMembershipStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const membership = await UserMembershipModel.findActiveByUserId(req.user.userId);

    if (!membership) {
      res.json({ membership: null });
      return;
    }

    // Get usage history
    const usageHistory = await MembershipUsageModel.findByMembershipId(membership.id, 10);
    const todayUsageCount = await MembershipUsageModel.getTodayUsageByMembershipId(membership.id);

    // Get plan details
    const plan = await MembershipPlanModel.findById(membership.plan_id);

    res.json({
      membership: {
        ...membership,
        plan,
        usageHistory,
        todayUsageCount,
        canRedeemToday: todayUsageCount === 0 && membership.coffees_remaining > 0,
      }
    });
  } catch (error) {
    console.error('Get membership status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create a new membership subscription
export async function createSubscription(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if Stripe is configured
    if (!stripe) {
      res.status(503).json({
        error: 'Membership subscriptions require Stripe configuration',
        note: 'Please contact the administrator to set up payment processing'
      });
      return;
    }

    const { planId, paymentMethodId } = req.body;

    // Check if user already has an active membership
    const existingMembership = await UserMembershipModel.findActiveByUserId(req.user.userId);
    if (existingMembership) {
      res.status(400).json({ error: 'You already have an active membership' });
      return;
    }

    // Get plan details
    const plan = await MembershipPlanModel.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Membership plan not found' });
      return;
    }

    // Create or get Stripe customer
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    let customer: Stripe.Customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Attach payment method to customer if not already attached
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            recurring: {
              interval: plan.interval as 'week' | 'month' | 'year',
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
          },
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Calculate period dates
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Create membership record
    const membership = await UserMembershipModel.create({
      user_id: req.user.userId,
      plan_id: planId,
      status: 'active',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      coffees_remaining: plan.coffees_per_interval,
    });

    res.status(201).json({
      membership,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent
        ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret
        : null,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}

// Cancel membership (at period end)
export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if Stripe is configured
    if (!stripe) {
      res.status(503).json({
        error: 'Membership cancellation requires Stripe configuration',
        note: 'Please contact the administrator'
      });
      return;
    }

    const membership = await UserMembershipModel.findActiveByUserId(req.user.userId);
    if (!membership) {
      res.status(404).json({ error: 'No active membership found' });
      return;
    }

    if (!membership.stripe_subscription_id) {
      res.status(400).json({ error: 'Invalid membership subscription' });
      return;
    }

    // Cancel Stripe subscription at period end
    await stripe.subscriptions.update(membership.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update membership record
    await UserMembershipModel.cancelAtPeriodEnd(membership.id);

    res.json({
      message: 'Subscription will be cancelled at the end of the current period',
      membership: {
        ...membership,
        cancel_at_period_end: true,
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

// Redeem a coffee using membership
export async function redeemCoffee(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { coffeeName } = req.body;

    const membership = await UserMembershipModel.findActiveByUserId(req.user.userId);
    if (!membership) {
      res.status(404).json({ error: 'No active membership found' });
      return;
    }

    // Check if user already redeemed today
    const todayUsageCount = await MembershipUsageModel.getTodayUsageByMembershipId(membership.id);
    if (todayUsageCount > 0) {
      res.status(400).json({ error: 'You have already redeemed your daily coffee' });
      return;
    }

    // Check if membership has coffees remaining
    if (membership.coffees_remaining <= 0) {
      res.status(400).json({ error: 'No coffees remaining in current period' });
      return;
    }

    // Decrement coffees
    const updated = await UserMembershipModel.decrementCoffees(membership.id);
    if (!updated) {
      res.status(500).json({ error: 'Failed to redeem coffee' });
      return;
    }

    // Record usage
    await MembershipUsageModel.create({
      user_membership_id: membership.id,
      coffee_name: coffeeName,
    });

    res.json({
      message: 'Coffee redeemed successfully',
      coffeesRemaining: membership.coffees_remaining - 1,
    });
  } catch (error) {
    console.error('Redeem coffee error:', error);
    res.status(500).json({ error: 'Failed to redeem coffee' });
  }
}
