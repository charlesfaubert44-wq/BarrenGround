# Deploy Without Stripe - Quick Guide

Deploy your full application now, add payment processing later.

---

## What You Need

✅ **Backend API URL** (you already have this from Vercel)
✅ **Supabase Database URL** (from earlier: https://rsjkxinexrtxgtyppqxy.supabase.co)
✅ **JWT Secret** (any random string - I'll help generate one)

---

## Step 1: Configure Backend Environment Variables

Go to your backend project in Vercel → Settings → Environment Variables

### Required Variables (Add These):

```env
# Database (use your Supabase connection string)
DATABASE_URL=postgresql://postgres:njmiBkhT2rKeBOwD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres

# Authentication (generate a random string)
JWT_SECRET=barrenground-coffee-2025-jwt-secret-production-key-change-this-random-string

# Frontend URLs (you'll update these after deploying frontends)
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889

# Environment
NODE_ENV=production
PORT=3000
```

**Note:** We'll update `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` after deploying the frontends!

### Save and Redeploy

After adding these:
1. Click "Save"
2. Go to Deployments tab
3. Click three dots (•••) on latest deployment
4. Click "Redeploy"

---

## Step 2: Deploy Customer Frontend

### 2.1 Create New Vercel Project

1. Go to https://vercel.com/new
2. Import your `BarrenGround` repository
3. **Configure:**

```
Project Name: barrenground-customer
Framework Preset: Vite
Root Directory: customer-frontend     ← IMPORTANT!
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.2 Add Environment Variables

**IMPORTANT:** Add this BEFORE deploying:

```env
VITE_API_URL=https://your-backend-api.vercel.app
```

Replace `your-backend-api.vercel.app` with your actual backend URL.

### 2.3 Deploy

Click "Deploy" and wait for it to complete.

**Copy the customer frontend URL** (e.g., `https://barrenground-customer.vercel.app`)

---

## Step 3: Deploy Employee Dashboard

### 3.1 Create New Vercel Project

1. Go to https://vercel.com/new
2. Import your `BarrenGround` repository again
3. **Configure:**

```
Project Name: barrenground-employee
Framework Preset: Vite
Root Directory: employee-dashboard     ← IMPORTANT!
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

**Copy the employee dashboard URL** (e.g., `https://barrenground-employee.vercel.app`)

---

## Step 4: Update Backend CORS Settings

Now that you have all 3 URLs, update the backend:

1. Go to backend project in Vercel
2. Settings → Environment Variables
3. **Update these two variables:**

```env
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app
```

Replace with your actual URLs!

4. **Redeploy backend** (Deployments → ••• → Redeploy)

This fixes CORS so frontends can talk to backend!

---

## Step 5: Run Database Migrations

Your Supabase database needs tables:

1. **Go to Supabase SQL Editor:**
   https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/sql/new

2. **Run migrations in this order:**

### Migration 1: Base Schema (MUST RUN FIRST!)

Open `RUN_MIGRATIONS_MANUAL.md` and copy Step 2 (Base Schema SQL).

This creates:
- users table
- orders table
- menu_items table
- payment_methods table
- membership tables

Paste in SQL Editor and click "Run".

### Migration 2: Promos & News (Optional - Skip for now)

You can skip this and add later.

### Migration 3: User Roles (Required)

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Migration 4: Loyalty Points (Optional - Skip for now)

You can add later when needed.

### Migration 5: Order Scheduling (Optional - Skip for now)

You can add later when needed.

### Migration 6: Email Logging (Optional - Skip for now)

You can add later when needed.

**For now, just run Migrations 1 and 3 to get started!**

---

## Step 6: Create Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Create admin user
-- Password will be: admin123 (change this after first login!)
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES (
  'admin@barrengroundcoffee.com',
  '$2b$10$rKEqLz5Yqm4Xh0JdYf.xOe0vZ9Hq7YzK5M9jxN3wP8uL2cV6bA1K2',
  'Admin User',
  'admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify it was created
SELECT id, email, name, role FROM users WHERE role = 'admin';
```

**Login credentials:**
- Email: `admin@barrengroundcoffee.com`
- Password: `admin123`

**IMPORTANT:** Change this password after first login!

---

## Step 7: Add Menu Items

1. **Login to employee dashboard:**
   - Go to your employee dashboard URL
   - Login with admin credentials above

2. **Add menu items:**
   - Go to "Menu Management"
   - Click "Add Item"
   - Add some coffee items:

Example items:
```
Name: Americano
Category: Hot Coffee
Price: 3.50
Description: Espresso with hot water

Name: Latte
Category: Hot Coffee
Price: 4.50
Description: Espresso with steamed milk

Name: Cappuccino
Category: Hot Coffee
Price: 4.50
Description: Espresso with foamed milk
```

---

## Step 8: Test Everything

### ✅ Test Backend
```bash
curl https://your-backend-api.vercel.app/health
# Should return: {"status":"ok"}

curl https://your-backend-api.vercel.app/api/menu
# Should return menu items array
```

### ✅ Test Customer Frontend

Visit: `https://your-customer-frontend.vercel.app`

Check:
- [ ] Site loads without errors
- [ ] Menu page shows items
- [ ] Can add items to cart
- [ ] Can register/login
- [ ] Open browser console - no CORS errors

**What won't work:**
- ❌ Checkout (will show Stripe error) - that's expected!

### ✅ Test Employee Dashboard

Visit: `https://your-employee-dashboard.vercel.app`

Check:
- [ ] Site loads
- [ ] Can login with admin credentials
- [ ] Menu management works
- [ ] Can add/edit menu items
- [ ] Orders page loads (will be empty)

---

## 🎉 You're Live!

Your coffee ordering system is now deployed!

### What Works:
✅ Menu browsing
✅ User registration/login
✅ Add items to cart
✅ Employee dashboard
✅ Menu management
✅ Order management UI

### What to Add Later:
- [ ] Stripe keys for payment processing
- [ ] SendGrid for email notifications
- [ ] Google OAuth for social login
- [ ] Loyalty points system (needs migration)
- [ ] Order scheduling (needs migration)
- [ ] Promo system (needs migration)

---

## Quick Reference

**Your URLs:**
- Backend API: `https://your-backend-api.vercel.app`
- Customer Site: `https://your-customer-frontend.vercel.app`
- Employee Dashboard: `https://your-employee-dashboard.vercel.app`

**Admin Login:**
- Email: `admin@barrengroundcoffee.com`
- Password: `admin123`

**Database:**
- Supabase: `https://app.supabase.com/project/rsjkxinexrtxgtyppqxy`

---

## When You're Ready to Add Stripe

1. Get Stripe test keys: See `GET_STRIPE_KEYS.md`
2. Add to backend env vars:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```
3. Add to customer frontend env vars:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```
4. Redeploy all projects
5. Test checkout with card: `4242 4242 4242 4242`

---

**Congratulations! Your app is live! 🚀☕**
