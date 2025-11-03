import { Request, Response } from 'express';
import Stripe from 'stripe';
import { OrderModel } from '../models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('Webhook signature missing');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
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
  // This is a simplified approach - in production you'd want a more robust system
  const orders = await OrderModel.getByStatus(['pending']);
  const order = orders.find((o) => o.payment_intent_id === paymentIntent.id);

  if (order) {
    await OrderModel.updateStatus(order.id, 'received');

    // Broadcast new order to employees via WebSocket
    const io = req.app.get('io');
    if (io) {
      const fullOrder = await OrderModel.getById(order.id);
      io.emit('new_order', fullOrder);
    }

    console.log(`Order ${order.id} marked as received`);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);

  // Find order and mark as cancelled
  const orders = await OrderModel.getByStatus(['pending']);
  const order = orders.find((o) => o.payment_intent_id === paymentIntent.id);

  if (order) {
    await OrderModel.updateStatus(order.id, 'cancelled');
    console.log(`Order ${order.id} marked as cancelled due to payment failure`);
  }
}
