# 🔧 Run Migrations Manually (Supabase Dashboard)

## Your Corporate Network is Blocking Direct Database Access

Your network firewall is preventing direct connections to Supabase. No problem - we can run migrations through the Supabase web dashboard instead!

---

## Step-by-Step: Run All 6 Migrations

### 1. Open Supabase SQL Editor

Visit: **https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/sql/new**

Or:
1. Go to https://app.supabase.com
2. Click on your project (`rsjkxinexrtxgtyppqxy`)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

---

### 2. **IMPORTANT: Run Base Schema First!**

⚠️ **You MUST run this first** - it creates the core tables (users, orders, menu_items, etc.)

Copy and paste this SQL, then click **"Run"**:

```sql
-- =====================================================
-- BASE SCHEMA: Core Database Tables
-- =====================================================
-- This creates the foundation tables that all other migrations depend on

-- Users (registered customers)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  oauth_provider VARCHAR(50),
  oauth_provider_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  last_order_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  last4 VARCHAR(4),
  brand VARCHAR(50),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255) NOT NULL,
  tracking_token UUID,
  pickup_time TIMESTAMP,
  customer_status VARCHAR(50),
  customer_status_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL,
  customizations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Membership plans
CREATE TABLE IF NOT EXISTS membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval VARCHAR(50) NOT NULL,
  coffees_per_interval INTEGER NOT NULL,
  stripe_price_id VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User memberships
CREATE TABLE IF NOT EXISTS user_memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES membership_plans(id),
  status VARCHAR(50) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  coffees_remaining INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership usage
CREATE TABLE IF NOT EXISTS membership_usage (
  id SERIAL PRIMARY KEY,
  user_membership_id INTEGER REFERENCES user_memberships(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  coffee_name VARCHAR(255)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider_id ON users(oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_membership_usage_user_membership_id ON membership_usage(user_membership_id);

-- Insert sample membership plan
INSERT INTO membership_plans (name, description, price, interval, coffees_per_interval, active)
VALUES ('1 Coffee a Day', 'Enjoy one delicious coffee every day for just $25/week', 25.00, 'week', 7, true)
ON CONFLICT DO NOTHING;

-- Insert sample menu items (just a few - you can add more later)
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Espresso', 'Rich and bold double shot', 3.50, 'coffee', true),
  ('Latte', 'Smooth espresso with steamed milk', 4.75, 'coffee', true),
  ('Americano', 'Bold espresso with hot water', 3.75, 'coffee', true),
  ('Cappuccino', 'Classic espresso with foam', 4.50, 'coffee', true)
ON CONFLICT DO NOTHING;
```

✅ Click **"Run"** - You should see "Success" (may show warnings about sample data, that's OK)

---

### 3. Run Migration 1: Promo & News Tables

Copy and paste this entire SQL into the editor, then click **"Run"**:

```sql
-- =====================================================
-- MIGRATION 1: Promo & News Tables
-- =====================================================

-- Create promos table
CREATE TABLE IF NOT EXISTS promos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promos_active ON promos(active);
CREATE INDEX IF NOT EXISTS idx_promos_dates ON promos(start_date, end_date) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_news_active ON news(active);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority DESC, created_at DESC) WHERE active = true;
```

✅ Click **"Run"** - You should see "Success. No rows returned"

---

### 4. Run Migration 2: User Roles (Security)

```sql
-- =====================================================
-- MIGRATION 2: User Roles (Security)
-- =====================================================

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Create index on role column
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to customer role (if any exist)
UPDATE users SET role = 'customer' WHERE role IS NULL;
```

✅ Click **"Run"**

---

### 5. Run Migration 3: Loyalty Points System

```sql
-- =====================================================
-- MIGRATION 3: Loyalty Points System
-- =====================================================

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0,
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add loyalty columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_birthday_bonus_year INTEGER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_order ON loyalty_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(loyalty_points);
```

✅ Click **"Run"**

---

### 6. Run Migration 4: Order Scheduling System

```sql
-- =====================================================
-- MIGRATION 4: Order Scheduling System
-- =====================================================

-- Add scheduling columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  max_orders_per_slot INTEGER DEFAULT 20,
  slot_duration_minutes INTEGER DEFAULT 15
);

-- Insert default business hours (Monday-Saturday, 7 AM - 6 PM, Sunday closed)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed)
VALUES
  (0, '00:00', '00:00', true),   -- Sunday closed
  (1, '07:00', '18:00', false),  -- Monday
  (2, '07:00', '18:00', false),  -- Tuesday
  (3, '07:00', '18:00', false),  -- Wednesday
  (4, '07:00', '18:00', false),  -- Thursday
  (5, '07:00', '18:00', false),  -- Friday
  (6, '07:00', '18:00', false)   -- Saturday
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_scheduled ON orders(scheduled_time) WHERE is_scheduled = true;
CREATE INDEX IF NOT EXISTS idx_orders_reminder ON orders(reminder_sent, scheduled_time) WHERE is_scheduled = true;
```

✅ Click **"Run"**

---

### 7. Run Migration 5: Email Logging System

```sql
-- =====================================================
-- MIGRATION 5: Email Logging System
-- =====================================================

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  error TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Add email preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

-- Add user_email to orders for easy access
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
```

✅ Click **"Run"**

---

## ✅ Verify Migrations Completed

After running all 5 migrations, verify in the Table Editor:

1. Click **"Table Editor"** in left sidebar
2. You should now see these tables:
   - ✅ promos
   - ✅ news
   - ✅ loyalty_transactions
   - ✅ business_hours
   - ✅ email_logs
   - ✅ users (with new columns: role, loyalty_points, date_of_birth, email_notifications)
   - ✅ orders (with new columns: scheduled_time, is_scheduled, reminder_sent, user_email)

3. Click on **`business_hours`** table - should have 7 rows (one for each day of the week)

---

## 🎯 Create Admin User

Once migrations are complete, make yourself an admin:

1. **Register through your app first:**
   - Start your app: `npm run dev`
   - Visit: http://localhost:8890
   - Register a new account

2. **Then make yourself admin:**
   - Go to Supabase SQL Editor
   - Run this (replace with your email):
     ```sql
     UPDATE users
     SET role = 'admin'
     WHERE email = 'your-email@example.com';

     -- Verify it worked
     SELECT id, email, name, role FROM users WHERE role = 'admin';
     ```

---

## 🚀 Start Your Application

Now you can start everything:

```bash
# From project root
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Customer Frontend: http://localhost:8890
- Employee Dashboard: http://localhost:8889

---

## ✨ Test New Features

1. **Employee Dashboard** (http://localhost:8889)
   - Login with your admin account
   - Go to "Promo Management" → Create a promo
   - Go to "News Management" → Create news article
   - Go to "Menu Management" → Create/edit menu items

2. **Customer Frontend** (http://localhost:8890)
   - Register/Login
   - Place an order → Check loyalty points earned
   - Try scheduling an order for tomorrow
   - Visit your Loyalty page

3. **Verify in Supabase:**
   - Go to Table Editor
   - Check `promos` table for your new promo
   - Check `loyalty_transactions` for point transactions
   - Check `business_hours` for scheduling config

---

## 🌐 Corporate Network Alternative

If your app still can't connect from localhost, you can:

1. **Use Supabase's built-in APIs:**
   - Supabase provides REST APIs that might not be blocked
   - Consider using Supabase client libraries

2. **Deploy to cloud:**
   - Deploy backend to Vercel/Railway/Render
   - Cloud servers can usually connect to Supabase

3. **Use VPN or mobile hotspot:**
   - Bypass corporate firewall restrictions

4. **Ask IT to whitelist:**
   - Request `*.supabase.co` be whitelisted
   - Port 5432 (PostgreSQL) needs to be open

---

## 📋 Summary

Instead of running `npx ts-node src/scripts/runAllMigrations.ts`, you:

1. ✅ Copy/paste each SQL migration into Supabase SQL Editor
2. ✅ Click "Run" for each one
3. ✅ Verify tables created in Table Editor
4. ✅ Create admin user
5. ✅ Start your app with `npm run dev`

All 5 migrations should take about **5 minutes** to run manually.

---

**Once complete, all 8 new features will be ready to use!** 🎉
