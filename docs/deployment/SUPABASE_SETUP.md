# 🚀 Supabase Database Setup Guide

## Your Supabase Project

**Project URL:** https://rsjkxinexrtxgtyppqxy.supabase.co

Great choice! Using Supabase means:
- ✅ No local PostgreSQL installation needed
- ✅ Free tier (500MB database, 2GB bandwidth)
- ✅ Automatic backups
- ✅ Built-in database management UI
- ✅ Production-ready from day one

---

## Step 1: Get Your Database Connection String

### Option A: From Supabase Dashboard (Recommended)

1. **Go to your Supabase project:**
   - Visit: https://rsjkxinexrtxgtyppqxy.supabase.co
   - Or login at: https://app.supabase.com

2. **Navigate to Database Settings:**
   - Click "Project Settings" (gear icon in sidebar)
   - Click "Database" in the left menu

3. **Copy Connection String:**
   - Scroll to "Connection string"
   - Select "URI" tab
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
     ```

4. **Replace `[YOUR-PASSWORD]`:**
   - Use the password you set when creating the project
   - Or reset it in Settings → Database → Database password

### Option B: Manual Construction

If you know your password, construct the URL:

```
postgresql://postgres:YOUR_PASSWORD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD` with your actual Supabase database password.

---

## Step 2: Configure Your Backend

### Create .env File

```bash
cd backend
copy .env.example .env
```

### Edit backend/.env

Open `backend/.env` and add your Supabase connection string:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres

# Security
JWT_SECRET=super-secure-jwt-secret-key-change-this-to-32-characters-minimum

# Server
PORT=5000
NODE_ENV=development

# Frontend URLs
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889

# Email (Optional - works in mock mode without this)
# SENDGRID_API_KEY=SG.your_key_here
# FROM_EMAIL=orders@barrengroundcoffee.com

# Stripe (Optional - for testing only)
# STRIPE_SECRET_KEY=sk_test_your_key
# STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**Important:** Replace `YOUR_PASSWORD` with your actual Supabase database password!

---

## Step 3: Run Migrations

Now that you have Supabase configured, run all migrations:

```bash
cd backend
npx ts-node src/scripts/runAllMigrations.ts
```

### Expected Output:

```
🚀 Starting All Database Migrations for Barren Ground Coffee
================================================================

🔌 Testing database connection...
   ✅ Connected to: postgres
   ✅ User: postgres
   ✅ PostgreSQL version: PostgreSQL 15.x

🔄 Running migration: Promo & News Tables
   ✅ Promo & News Tables completed successfully

🔄 Running migration: User Roles (Security)
   ✅ User Roles (Security) completed successfully

🔄 Running migration: Loyalty Points System
   ✅ Loyalty Points System completed successfully

🔄 Running migration: Order Scheduling System
   ✅ Order Scheduling System completed successfully

🔄 Running migration: Email Logging System
   ✅ Email Logging System completed successfully

================================================================
📊 Migration Summary
================================================================

Total migrations: 5
✅ Successful: 5
⏱️  Duration: 3.2s

Migration Results:
  1. ✅ Promo & News Tables (success)
  2. ✅ User Roles (Security) (success)
  3. ✅ Loyalty Points System (success)
  4. ✅ Order Scheduling System (success)
  5. ✅ Email Logging System (success)

🎉 All migrations completed successfully!

📋 Next Steps:
   1. Create an admin user
   2. Set a strong JWT_SECRET in .env
   3. Restart the backend server: npm run dev
   4. Test the new features!
```

---

## Step 4: Verify in Supabase Dashboard

After migrations complete, check your Supabase dashboard:

1. **Go to Table Editor:**
   - Visit: https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/editor
   - Or click "Table Editor" in sidebar

2. **Verify Tables Created:**
   You should see all these tables:
   - ✅ users
   - ✅ menu_items
   - ✅ orders
   - ✅ order_items
   - ✅ **promos** (new!)
   - ✅ **news** (new!)
   - ✅ **loyalty_transactions** (new!)
   - ✅ **business_hours** (new!)
   - ✅ **email_logs** (new!)
   - ✅ membership_plans
   - ✅ user_memberships
   - ✅ membership_usage
   - ✅ payment_methods

3. **Check Sample Data:**
   - Click on `business_hours` → Should have 7 rows (Mon-Sun)
   - Click on `menu_items` → Should have sample menu items

---

## Step 5: Create Admin User

### Option A: Via Supabase SQL Editor

1. **Go to SQL Editor:**
   - Visit: https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/sql
   - Or click "SQL Editor" in sidebar

2. **Run this query:**
   ```sql
   -- First, register a user through your app
   -- Then update their role to admin with this query:

   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';

   -- Verify it worked
   SELECT id, email, name, role FROM users WHERE role = 'admin';
   ```

### Option B: After First Registration

1. Register a user through the app at http://localhost:8890
2. Then run the SQL above to make them an admin

---

## Step 6: Start Your Application

```bash
# From project root
npm run dev
```

This starts:
- ✅ Backend API: http://localhost:5000
- ✅ Customer Frontend: http://localhost:8890
- ✅ Employee Dashboard: http://localhost:8889

---

## Troubleshooting

### Error: "password authentication failed"

**Problem:** Wrong password in DATABASE_URL

**Solution:**
1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset Database Password"
3. Set a new password (save it!)
4. Update `backend/.env` with new password

### Error: "connection timeout"

**Problem:** Supabase project might be paused (free tier auto-pauses after inactivity)

**Solution:**
1. Go to your Supabase dashboard
2. The project will auto-resume when you visit it
3. Wait 30 seconds and try again

### Error: "database 'barrenground' does not exist"

**Not a problem!** Supabase uses the database name `postgres` by default. Our migrations work with whatever database is in the connection string.

### Verify Connection

Test your database connection:

```bash
cd backend
npm run db:test
```

Should output:
```
✅ Database connection successful!
Database: postgres
User: postgres
```

---

## Supabase Free Tier Limits

Your free tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 500 MB file storage

This is **more than enough** for development and small production deployments!

---

## Supabase Features You Can Use

### 1. Database Backups

Supabase automatically backs up your database daily. Access backups:
- Dashboard → Database → Backups

### 2. SQL Editor

Run queries directly:
- Dashboard → SQL Editor

Useful queries:
```sql
-- See all orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check loyalty points
SELECT u.email, u.loyalty_points, COUNT(lt.id) as transactions
FROM users u
LEFT JOIN loyalty_transactions lt ON u.id = lt.user_id
GROUP BY u.id;

-- View scheduled orders
SELECT * FROM orders WHERE is_scheduled = true;

-- Check business hours
SELECT * FROM business_hours ORDER BY day_of_week;
```

### 3. Table Editor

Browse and edit data visually:
- Dashboard → Table Editor
- Click any table to view/edit rows

### 4. Database Monitoring

View performance:
- Dashboard → Database → Disk Usage
- Monitor query performance

---

## Production Deployment with Supabase

When ready for production:

1. **Create Production Project:**
   - New Supabase project for production
   - Use stronger password
   - Enable all security features

2. **Update Connection Pooling:**
   Supabase provides a connection pooler for better performance:
   ```env
   # Use this for production
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:6543/postgres?pgbouncer=true
   ```

3. **Enable SSL:**
   Add to connection string:
   ```env
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require
   ```

4. **Set Environment Variables:**
   In your hosting platform (Vercel, Railway, etc.), set:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (strong 32+ char secret)
   - `SENDGRID_API_KEY` (for emails)
   - `STRIPE_SECRET_KEY` (for payments)

---

## Quick Reference

### Get Database URL
```
Dashboard → Settings → Database → Connection string → URI
```

### View Tables
```
Dashboard → Table Editor
```

### Run SQL
```
Dashboard → SQL Editor
```

### Check Logs
```
Dashboard → Database → Logs
```

### Reset Password
```
Dashboard → Settings → Database → Reset Database Password
```

---

## Next Steps

1. ✅ Configure `.env` with your Supabase DATABASE_URL
2. ✅ Run migrations: `npx ts-node src/scripts/runAllMigrations.ts`
3. ✅ Verify tables in Supabase dashboard
4. ✅ Start app: `npm run dev`
5. ✅ Register user and make them admin
6. ✅ Test all new features!

---

## Support

**Supabase Documentation:** https://supabase.com/docs
**Supabase Dashboard:** https://app.supabase.com
**Your Project:** https://app.supabase.com/project/rsjkxinexrtxgtyppqxy

If you run into issues:
1. Check Supabase Dashboard → Database → Logs
2. Verify connection string in `.env`
3. Test connection: `npm run db:test`
4. Check backend console logs

---

**You're almost there! Just need to:**
1. Get your DATABASE_URL from Supabase
2. Add it to `backend/.env`
3. Run: `npx ts-node src/scripts/runAllMigrations.ts`

Then you'll have all 8 features running on a cloud database! 🚀
