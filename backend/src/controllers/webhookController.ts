import { Request, Response } from 'express';
import Stripe from 'stripe';
import { OrderModel } from '../models/Order';
import { UserMembershipModel } from '../models/UserMembership';
import { MembershipPlanModel } from '../models/MembershipPlan';

// Initialize Stripe only if API key is provided and valid
let stripe: Stripe | null = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

if (stripeKey && stripeKey.startsWith('sk_')) {
  try {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-10-29.clover',
    });
  } catch (error) {
    console.warn('⚠️  Stripe webhook initialization failed:', error);
  }
}

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  // Check if Stripe is configured
  if (!stripe) {
    console.warn('⚠️  Stripe webhook called but Stripe is not configured');
    res.status(200).json({ received: true, note: 'Stripe not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('Webhook signature missing');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent, req);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, req: Request): Promise<void> {
  console.log('Payment succeeded:', paymentIntent.id);

  // Find order by payment_intent_id and update status to 'received'
  const order = await OrderModel.findByPaymentIntentId(paymentIntent.id);

  if (order) {
    await OrderModel.updateStatus(order.id, 'received');
    console.log(`Order ${order.id} marked as received`);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);

  // Find order and mark as cancelled
  const order = await OrderModel.findByPaymentIntentId(paymentIntent.id);

  if (order) {
    await OrderModel.updateStatus(order.id, 'cancelled');
    console.log(`Order ${order.id} marked as cancelled due to payment failure`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);

  const membership = await UserMembershipModel.findByStripeSubscriptionId(subscription.id);

  if (membership) {
    // Update membership status based on subscription status
    let status: 'active' | 'canceled' | 'past_due' | 'expired' = 'active';
    if (subscription.status === 'canceled') {
      status = 'canceled';
    } else if (subscription.status === 'past_due') {
      status = 'past_due';
    } else if (subscription.status === 'unpaid' || subscription.status === 'incomplete_expired') {
      status = 'expired';
    }

    await UserMembershipModel.updateStatus(membership.id, status);

    // Reset coffees for new billing period if subscription is active
    if (subscription.status === 'active') {
      const plan = await MembershipPlanModel.findById(membership.plan_id, membership.shop_id);
      if (plan) {
        const sub = subscription as any;
        const periodStart = new Date((sub.current_period_start as number) * 1000);
        const periodEnd = new Date((sub.current_period_end as number) * 1000);
        await UserMembershipModel.resetCoffees(
          membership.id,
          plan.coffees_per_interval,
          periodStart,
          periodEnd
        );
        console.log(`Membership ${membership.id} coffees reset for new period`);
      }
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription deleted:', subscription.id);

  const membership = await UserMembershipModel.findByStripeSubscriptionId(subscription.id);

  if (membership) {
    await UserMembershipModel.updateStatus(membership.id, 'canceled');
    console.log(`Membership ${membership.id} marked as canceled`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment succeeded:', invoice.id);

  // If this is a subscription invoice, ensure membership is active
  const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string };
  if (invoiceWithSub.subscription && typeof invoiceWithSub.subscription === 'string') {
    const membership = await UserMembershipModel.findByStripeSubscriptionId(invoiceWithSub.subscription);

    if (membership && membership.status !== 'active') {
      await UserMembershipModel.updateStatus(membership.id, 'active');
      console.log(`Membership ${membership.id} reactivated after successful payment`);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment failed:', invoice.id);

  // Mark membership as past_due
  const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string };
  if (invoiceWithSub.subscription && typeof invoiceWithSub.subscription === 'string') {
    const membership = await UserMembershipModel.findByStripeSubscriptionId(invoiceWithSub.subscription);

    if (membership) {
      await UserMembershipModel.updateStatus(membership.id, 'past_due');
      console.log(`Membership ${membership.id} marked as past_due due to payment failure`);
    }
  }
}
