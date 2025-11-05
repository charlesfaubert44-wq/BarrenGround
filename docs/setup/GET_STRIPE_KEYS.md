# Get Stripe API Keys - Quick Guide

You need Stripe keys to process payments in your coffee ordering system.

---

## Option 1: Get Stripe Keys (5 Minutes)

### Step 1: Create Stripe Account (Free)

1. Go to https://stripe.com
2. Click **"Start now"** (top right)
3. Fill in your email and create password
4. Complete the sign-up form
5. You'll be in **Test Mode** by default (perfect for development!)

### Step 2: Get Your API Keys

1. **After signing in**, you'll see the Stripe Dashboard
2. Click **"Developers"** in the top menu
3. Click **"API keys"** in the left sidebar
4. You'll see two keys:

   **Publishable key** (starts with `pk_test_`)
   ```
   pk_test_51abc...xyz
   ```
   → Use this in **frontend** environment variables

   **Secret key** (starts with `sk_test_`)
   ```
   sk_test_51abc...xyz
   ```
   → Use this in **backend** environment variables

5. **Copy both keys** and save them somewhere safe

### Step 3: Add to Vercel

**Backend Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_test_51abc...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51abc...xyz
```

**Customer Frontend Environment Variables:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc...xyz
```

Then redeploy all projects that use Stripe.

---

## Option 2: Deploy Without Stripe (For Now)

You can deploy and test everything except payments:

### What Works Without Stripe:
- ✅ Menu browsing
- ✅ User registration/login
- ✅ Add items to cart
- ✅ Employee dashboard
- ✅ Order management
- ✅ Loyalty points
- ✅ Scheduling orders
- ✅ Promos and news

### What Won't Work:
- ❌ Payment processing
- ❌ Order checkout (will show Stripe error)
- ❌ Memberships/subscriptions

### Deploy Without Stripe:

**Backend Environment Variables (Minimum Required):**
```env
# Database (required)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Authentication (required)
JWT_SECRET=your-random-256-bit-secret-key-here

# Frontend URLs (required for CORS)
FRONTEND_URL=https://your-customer-frontend.vercel.app
EMPLOYEE_DASHBOARD_URL=https://your-employee-dashboard.vercel.app

# Node Environment
NODE_ENV=production
PORT=3000

# Stripe - Leave these out for now
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
```

**Customer Frontend Environment Variables:**
```env
# Backend API (required)
VITE_API_URL=https://your-backend-api.vercel.app

# Stripe - Leave this out for now
# VITE_STRIPE_PUBLISHABLE_KEY=
```

The app will work but show an error at checkout. You can add Stripe keys later!

---

## Recommended: Get Stripe Test Keys

**Why I recommend getting Stripe keys now:**

1. **It's free** - No credit card needed for test mode
2. **Takes 5 minutes** - Very quick setup
3. **Test mode only** - Not processing real money
4. **Complete testing** - Test the full order flow

### Test Mode vs Live Mode

- **Test Mode** (default):
  - Uses test keys (`pk_test_...`, `sk_test_...`)
  - No real money is charged
  - Use test card numbers (e.g., `4242 4242 4242 4242`)
  - Perfect for development and testing

- **Live Mode** (when you go to production):
  - Uses live keys (`pk_live_...`, `sk_live_...`)
  - Processes real payments
  - Requires business verification
  - Switch to this when you're ready to launch

You'll stay in **Test Mode** for now!

---

## Test Card Numbers (Once You Have Stripe)

Use these in the checkout form to test:

**Success:**
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)

**Decline:**
- **Card:** `4000 0000 0000 0002`

**Requires 3D Secure:**
- **Card:** `4000 0027 6000 3184`

---

## Quick Decision Guide

**Choose Option 1 (Get Stripe Keys) if:**
- ✅ You want to test the complete order flow
- ✅ You have 5 minutes to create an account
- ✅ You want to see payments working

**Choose Option 2 (Deploy Without Stripe) if:**
- ✅ You want to deploy quickly right now
- ✅ You'll add payment processing later
- ✅ You just want to test other features first

**My recommendation:** Get Stripe test keys - it only takes 5 minutes and you'll have a fully working system!

---

## After Getting Stripe Keys

1. Add keys to Vercel environment variables (backend & frontend)
2. Redeploy all projects
3. Test checkout with card `4242 4242 4242 4242`
4. Orders should complete successfully! 🎉

---

## Need Help?

- **Stripe Documentation:** https://stripe.com/docs/keys
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Dashboard:** https://dashboard.stripe.com

Let me know once you have the keys and I'll help you configure them! 🚀
