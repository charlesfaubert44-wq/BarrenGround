# Stripe Setup Guide

The Barren Ground Coffee app uses Stripe for payment processing. **Stripe is optional** - the app will work in "mock payment" mode if Stripe is not configured.

## Running Without Stripe (Current Setup)

The app is currently running in **mock payment mode**. When you see these messages in the backend console:

```
⚠️  Stripe is not configured. Payment processing will be mocked.
   To enable Stripe, set STRIPE_SECRET_KEY in your .env file
⚠️  Using mock payment (Stripe not configured)
```

This means:
- ✅ Orders can be created
- ✅ Customers can "checkout"
- ✅ Orders appear in employee dashboard
- ⚠️  No real payment processing
- ⚠️  All payments are simulated

**This is perfect for development and testing!**

## Why Add Real Stripe?

Only set up Stripe if you need:
- Real payment processing
- Credit card validation
- Production deployment
- Testing the full payment flow

## Setting Up Stripe (Optional)

### Step 1: Create a Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" (it's free)
3. Complete the registration

### Step 2: Get Your API Keys

1. After logging in, go to: https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 3: Update Your Configuration Files

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Customer Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 4: Set Up Webhooks (Optional - For Production)

Webhooks notify your backend when payments succeed or fail.

**For Local Development:**

1. Install Stripe CLI:
   ```powershell
   # Download from https://github.com/stripe/stripe-cli/releases
   # Or use Scoop:
   scoop install stripe
   ```

2. Login to Stripe:
   ```powershell
   stripe login
   ```

3. Forward webhooks to your local backend:
   ```powershell
   stripe listen --forward-to localhost:5000/webhooks/stripe
   ```

4. Copy the webhook secret (starts with `whsec_`) and add to `backend\.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

**For Production:**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret and add to your production `.env`

### Step 5: Restart Your Backend

```powershell
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

You should now see:
```
✅ Stripe initialized successfully
```

## Testing Stripe Integration

### Test Card Numbers

Use these test cards in the customer frontend:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Card:**
- Card: `4000 0000 0000 0002`

**More test cards:** https://stripe.com/docs/testing

### Test the Payment Flow

1. Go to customer frontend: http://localhost:8890
2. Add items to cart
3. Go to checkout
4. Enter test card details
5. Complete order
6. Check employee dashboard - order should appear

### Monitor Stripe Dashboard

View test transactions at: https://dashboard.stripe.com/test/payments

## Stripe Features in the App

### One-Time Payments
- ✅ Customer checkout
- ✅ Order creation
- ✅ Payment confirmation via webhook
- ✅ Order status updates

### Subscriptions (Membership Plans)
- ✅ "1 Coffee a Day" membership
- ✅ Recurring billing
- ✅ Usage tracking
- ✅ Subscription management
- ✅ Auto-renewal

## Troubleshooting

### "Stripe is not configured" Message

**Cause:** Invalid or missing `STRIPE_SECRET_KEY`

**Fix:**
1. Check `backend\.env` has valid key starting with `sk_test_`
2. No spaces before or after the key
3. Key must be on a single line

### "Invalid API Key" Error

**Cause:** Wrong key or expired key

**Fix:**
1. Get a fresh key from https://dashboard.stripe.com/test/apikeys
2. Make sure you're using the **Secret key**, not Publishable key
3. Restart backend after updating

### Payment Not Processing

**Cause:** Webhook not configured or failing

**Fix:**
1. Check webhook secret is correct
2. If testing locally, make sure `stripe listen` is running
3. Check backend logs for webhook errors

### Frontend Shows Stripe Error

**Cause:** Missing or invalid publishable key

**Fix:**
1. Check `customer-frontend\.env` has valid key starting with `pk_test_`
2. Restart the customer frontend

## Switching Between Test and Live Mode

Stripe has two modes:

**Test Mode** (for development):
- Keys start with `sk_test_` and `pk_test_`
- No real money
- Use test card numbers

**Live Mode** (for production):
- Keys start with `sk_live_` and `pk_live_`
- Real money transactions
- Real credit cards only

**Toggle in Stripe Dashboard:** Look for "Test mode" switch in top-right corner

## Production Checklist

Before going live with real payments:

- [ ] Get live API keys from Stripe
- [ ] Update `.env` files with live keys (`sk_live_`, `pk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Enable HTTPS (Stripe requires it)
- [ ] Complete Stripe account verification
- [ ] Test with real card (small amount)
- [ ] Set up email notifications for failed payments
- [ ] Configure proper error handling
- [ ] Review Stripe pricing: https://stripe.com/pricing

## Cost

**Stripe Fees:**
- 2.9% + $0.30 per successful card charge
- No monthly fees
- No setup fees
- Free test mode

**Example:**
- $5.00 order = $0.30 + (2.9% × $5.00) = $0.30 + $0.15 = **$0.45 fee**
- You receive: **$4.55**

## Additional Resources

- Stripe Documentation: https://stripe.com/docs
- Testing Guide: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api
- Webhook Guide: https://stripe.com/docs/webhooks

## Need Help?

- Stripe Support: https://support.stripe.com
- Stripe Discord: https://stripe.com/discord
