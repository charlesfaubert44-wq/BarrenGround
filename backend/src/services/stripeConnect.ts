import Stripe from 'stripe';
import { Shop } from '../models/Shop';

// Platform Stripe instance (uses platform secret key)
const platformStripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

/**
 * Get Stripe instance for a specific shop
 * If shop has Connect account, use that. Otherwise use platform account.
 */
export function getStripeForShop(shop: Shop): Stripe | null {
  if (!platformStripe) return null;

  // If shop has their own Stripe Connect account, use it
  if (shop.stripe_account_id) {
    return platformStripe; // Same instance, different account via options
  }

  // Otherwise use platform account
  return platformStripe;
}

/**
 * Create payment intent with shop-specific account
 */
export async function createPaymentIntent(
  shop: Shop,
  amount: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripeForShop(shop);
  if (!stripe) return null;

  const options: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(amount * 100), // Cents
    currency: 'usd',
    metadata,
  };

  // If using Connect account, specify it
  if (shop.stripe_account_id) {
    return await stripe.paymentIntents.create(options, {
      stripeAccount: shop.stripe_account_id,
    });
  }

  // Otherwise create on platform account
  return await stripe.paymentIntents.create(options);
}

/**
 * Create Stripe Connect onboarding link for shop
 */
export async function createConnectAccountLink(shop: Shop): Promise<string | null> {
  if (!platformStripe) return null;

  // Create Connect account if doesn't exist
  let accountId = shop.stripe_account_id;

  if (!accountId) {
    const account = await platformStripe.accounts.create({
      type: 'standard',
      email: shop.email,
      business_profile: {
        name: shop.display_name,
      },
    });
    accountId = account.id;

    // Update shop with account ID
    const { ShopModel } = await import('../models/Shop');
    await ShopModel.update(shop.id, { stripe_account_id: accountId });
  }

  // Create account link for onboarding
  const accountLink = await platformStripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/settings/payments/refresh`,
    return_url: `${process.env.FRONTEND_URL}/settings/payments/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}
