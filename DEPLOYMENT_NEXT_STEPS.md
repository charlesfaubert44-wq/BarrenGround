# 🚀 Deployment Next Steps - Backend Deployed!

**Status:** ✅ Backend API deployed successfully on Vercel!

Now let's complete the full deployment by deploying the frontends and configuring everything.

---

## 📋 Quick Checklist

- [x] Backend API deployed
- [ ] Customer Frontend deployed
- [ ] Employee Dashboard deployed
- [ ] Backend environment variables configured
- [ ] Frontend environment variables configured
- [ ] CORS configured with actual URLs
- [ ] Stripe webhooks configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] All apps tested

---

## Step 1: Get Your Backend API URL

1. Go to your Vercel dashboard
2. Click on your backend project
3. Copy the **Production URL** (e.g., `https://barrenground-api.vercel.app`)
4. **Save this URL** - you'll need it for the frontends!

---

## Step 2: Deploy Customer Frontend

### 2.1 Create New Vercel Project

1. Go to https://vercel.com/new
2. Import your `BarrenGround` repository
3. **Configure:**
   ```
   Project Name: barrenground-customer
   Framework Preset: Vite
   Root Directory: customer-frontend     ← Important!
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 2.2 Add Environment Variables

Before deploying, add these in the Vercel project settings:

```env
VITE_API_URL=https://your-backend-api.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Replace:
- `your-backend-api.vercel.app` with your actual backend URL from Step 1
- `pk_test_xxx` with your Stripe publishable key

### 2.3 Deploy

Click "Deploy" and wait for it to complete.

**Save the customer frontend URL** (e.g., `https://barrenground-customer.vercel.app`)

---

## Step 3: Deploy Employee Dashboard

### 3.1 Create New Vercel Project

1. Go to https://vercel.com/new
2. Import your `BarrenGround` repository again
3. **Configure:**
   ```
   Project Name: barrenground-employee
   Framework Preset: Vite
   Root Directory: employee-dashboard     ← Important!
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 3.2 Add Environment Variables

```env
VITE_API_URL=https://your-backend-api.vercel.app
```

### 3.3 Deploy

Click "Deploy" and wait for it to complete.

**Save the employee dashboard URL** (e.g., `https://barrenground-employee.vercel.app`)

---

## Step 4: Update Backend Environment Variables

Now that you have all 3 URLs, update the backend:

1. Go to your **backend project** in Vercel
2. Go to **Settings → Environment Variables**
3. **Add/Update these variables:**

### Required Variables:
```env
# Database (your Supabase connection)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-production-jwt-secret-256-bit-random-key

# Frontend URLs (UPDATE WITH YOUR ACTUAL URLS!)
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Node Environment
NODE_ENV=production
PORT=3000
```

### Optional (but recommended):
```env
# Stripe Webhook (we'll set this up in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid Email (optional)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@barrengroundcoffee.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

4. **After updating, redeploy the backend:**
   - Go to "Deployments" tab
   - Click three dots (•••) on latest deployment
   - Click "Redeploy"

This ensures CORS is configured with your actual frontend URLs!

---

## Step 5: Configure Stripe Webhooks

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint:**
   - Click "Add endpoint"
   - **Endpoint URL:** `https://your-backend-api.vercel.app/webhooks/stripe`
   - Replace `your-backend-api.vercel.app` with your actual backend URL

3. **Select Events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. **Copy Webhook Secret:**
   - After creating, click on the webhook
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to backend environment variables as `STRIPE_WEBHOOK_SECRET`
   - Redeploy backend

---

## Step 6: Run Database Migrations

Your Supabase database needs the schema:

1. **Go to Supabase SQL Editor:**
   - https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/sql/new

2. **Run All Migrations:**
   - Follow the steps in `RUN_MIGRATIONS_MANUAL.md`
   - Run migrations 1-6 in order:
     1. Base Schema (users, orders, menu_items, etc.)
     2. Promos & News
     3. User Roles
     4. Loyalty Points
     5. Order Scheduling
     6. Email Logging

3. **Verify Tables Created:**
   - Go to Supabase → Table Editor
   - You should see all tables

---

## Step 7: Create Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Generate password hash locally first (see below)
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES (
  'admin@barrengroundcoffee.com',
  '$2b$10$YourHashedPasswordHere',
  'Admin User',
  'admin',
  NOW()
);
```

**To generate password hash:**

```bash
# Run locally in your terminal
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10, (err, hash) => console.log(hash));"
```

Copy the hash and paste it in the SQL above.

---

## Step 8: Test Your Deployment

### Test Backend API
```bash
curl https://your-backend-api.vercel.app/health
# Should return: {"status":"ok"}

curl https://your-backend-api.vercel.app/api/menu
# Should return menu items (or empty array)
```

### Test Customer Frontend
1. Visit: `https://barrenground-customer.vercel.app`
2. Check:
   - [ ] Site loads without errors
   - [ ] Menu displays
   - [ ] Can add items to cart
   - [ ] Login/Register works
   - [ ] Check browser console for CORS errors (should be none)

### Test Employee Dashboard
1. Visit: `https://barrenground-employee.vercel.app`
2. Check:
   - [ ] Site loads
   - [ ] Login page displays
   - [ ] Can login with admin credentials
   - [ ] Orders page loads

---

## Step 9: Seed Initial Data (Optional)

Add some menu items via the employee dashboard:

1. Login to employee dashboard
2. Go to "Menu Management"
3. Add a few coffee items with:
   - Name, description, price
   - Category (e.g., "Hot Coffee", "Espresso")
   - Mark as available

---

## 🎉 Deployment Complete!

Your full stack is now live:

- ☕ **Customer Frontend:** Order coffee online
- 👨‍💼 **Employee Dashboard:** Manage orders and menu
- 🔌 **Backend API:** Serverless functions on Vercel
- 🗄️ **Database:** Supabase PostgreSQL
- 💳 **Payments:** Stripe integration
- 📧 **Emails:** SendGrid (if configured)

---

## 🔍 Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` in backend match exact deployment URLs
- No trailing slashes
- Redeploy backend after changes

### Database Connection Fails
- Check `DATABASE_URL` is correct
- Verify Supabase allows connections from 0.0.0.0/0
- Check connection pooling is enabled

### Stripe Payments Fail
- Verify `STRIPE_SECRET_KEY` is set
- Check webhook is configured
- View Stripe Dashboard → Developers → Webhooks for errors

### Build Fails on Redeploy
- Clear Vercel build cache: Settings → Clear build cache
- Check TypeScript compiles locally: `npm run build`
- Verify all environment variables are set

---

## 📚 Documentation

- [Vercel Quick Start](VERCEL_QUICK_START.md)
- [Vercel Full Guide](VERCEL_DEPLOYMENT_GUIDE.md)
- [Database Migrations](RUN_MIGRATIONS_MANUAL.md)
- [API Reference](backend/API_REFERENCE.md)
- [Testing Guide](backend/TESTING_GUIDE.md)

---

## 🆘 Need Help?

Check the logs:
- **Vercel:** Project → Deployments → Click deployment → View Function Logs
- **Supabase:** Project → Logs
- **Stripe:** Dashboard → Developers → Webhooks → View logs

---

**Congratulations on deploying your backend! 🚀**

Follow the steps above to complete your full deployment.
