import { Request, Response } from 'express';
import { PaymentMethodModel } from '../models/PaymentMethod';
import { UserModel } from '../models/User';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

// Get all payment methods for authenticated user
export async function getPaymentMethods(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const paymentMethods = await PaymentMethodModel.findByUserId(req.user.userId);
    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create SetupIntent for adding a new payment method
export async function createSetupIntent(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!stripe) {
      res.status(503).json({ error: 'Payment processing not available' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: user.id.toString(),
        },
      });
      customerId = customer.id;
      await UserModel.updateStripeCustomerId(user.id, customerId);
    }

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        user_id: user.id.toString(),
      },
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    console.error('Create setup intent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Save payment method after SetupIntent succeeds
export async function savePaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!stripe) {
      res.status(503).json({ error: 'Payment processing not available' });
      return;
    }

    const { payment_method_id, is_default } = req.body;

    if (!payment_method_id) {
      res.status(400).json({ error: 'Payment method ID is required' });
      return;
    }

    // Retrieve payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

    // Save to database
    const savedPaymentMethod = await PaymentMethodModel.create({
      user_id: req.user.userId,
      stripe_payment_method_id: payment_method_id,
      type: paymentMethod.type,
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      exp_month: paymentMethod.card?.exp_month,
      exp_year: paymentMethod.card?.exp_year,
      is_default: is_default || false,
    });

    res.status(201).json({
      message: 'Payment method saved successfully',
      paymentMethod: savedPaymentMethod,
    });
  } catch (error) {
    console.error('Save payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Set a payment method as default
export async function setDefaultPaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const paymentMethod = await PaymentMethodModel.setAsDefault(
      parseInt(id),
      req.user.userId
    );

    if (!paymentMethod) {
      res.status(404).json({ error: 'Payment method not found' });
      return;
    }

    res.json({
      message: 'Default payment method updated',
      paymentMethod,
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete a payment method
export async function deletePaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!stripe) {
      res.status(503).json({ error: 'Payment processing not available' });
      return;
    }

    const { id } = req.params;

    // Get payment method from database
    const paymentMethod = await PaymentMethodModel.findById(parseInt(id));

    if (!paymentMethod || paymentMethod.user_id !== req.user.userId) {
      res.status(404).json({ error: 'Payment method not found' });
      return;
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(paymentMethod.stripe_payment_method_id);
    } catch (stripeError) {
      console.error('Stripe detach error:', stripeError);
      // Continue even if Stripe fails - we still want to remove from our DB
    }

    // Delete from database
    await PaymentMethodModel.delete(parseInt(id), req.user.userId);

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
