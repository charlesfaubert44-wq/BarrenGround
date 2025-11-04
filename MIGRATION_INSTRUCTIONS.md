# 📋 Database Migration Instructions

**Status:** PostgreSQL database is not currently running
**Action Required:** Install/Start PostgreSQL, then run migrations

---

## Current Situation

The database migrations cannot run because PostgreSQL is not installed or not running on your system.

**Error:** `ECONNREFUSED ::1:5432` and `ECONNREFUSED 127.0.0.1:5432`

This means PostgreSQL is not listening on port 5432 (the default PostgreSQL port).

---

## Option 1: Install PostgreSQL (Recommended)

### Windows Installation

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 installer
   - Or use direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run the Installer:**
   - Double-click the downloaded installer
   - Follow the setup wizard
   - **Important Settings:**
     - Port: 5432 (default)
     - Superuser password: `postgres` (or remember your custom password)
     - Locale: Default
   - Install Stack Builder: Optional

3. **Verify Installation:**
   ```bash
   # Open Command Prompt or PowerShell
   psql --version
   ```

4. **Start PostgreSQL Service:**
   ```bash
   # Using Windows Services
   services.msc
   # Find "postgresql-x64-15" (or similar)
   # Right-click → Start

   # Or using command line (as Administrator)
   net start postgresql-x64-15
   ```

---

## Option 2: Use Docker PostgreSQL (Alternative)

If you have Docker installed:

```bash
# Pull and run PostgreSQL container
docker run --name barrenground-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=barrenground \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps

# To stop later
docker stop barrenground-postgres

# To start again
docker start barrenground-postgres
```

---

## Option 3: Use Cloud Database (Production)

For production or if you don't want to install locally:

### Supabase (Free Tier)
1. Go to https://supabase.com
2. Create account and new project
3. Get database URL from Settings → Database
4. Update `backend/.env` with the connection string

### Railway (Free Trial)
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy DATABASE_URL from Variables tab
4. Update `backend/.env`

### Render (Free Tier)
1. Go to https://render.com
2. New → PostgreSQL
3. Copy Internal Database URL
4. Update `backend/.env`

---

## After PostgreSQL is Running

### Step 1: Create Environment File

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and set:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground
JWT_SECRET=<generate-strong-32-character-secret>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889
```

### Step 2: Create Database

```bash
cd backend
npm run db:create
```

This creates the `barrenground` database if it doesn't exist.

### Step 3: Run All Migrations

We've created a comprehensive migration script that will run all 5 migrations:

```bash
cd backend
npx ts-node src/scripts/runAllMigrations.ts
```

This will execute in order:
1. ✅ Promo & News Tables
2. ✅ User Roles (Security)
3. ✅ Loyalty Points System
4. ✅ Order Scheduling System
5. ✅ Email Logging System

**Expected Output:**
```
🚀 Starting All Database Migrations for Barren Ground Coffee
================================================================

🔌 Testing database connection...
   ✅ Connected to: barrenground
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
⏱️  Duration: 2.34s

Migration Results:
  1. ✅ Promo & News Tables (success)
  2. ✅ User Roles (Security) (success)
  3. ✅ Loyalty Points System (success)
  4. ✅ Order Scheduling System (success)
  5. ✅ Email Logging System (success)

🎉 All migrations completed successfully!
```

### Step 4: Create Admin User

After migrations complete, create an admin user:

```sql
-- Connect to database
psql -U postgres -d barrenground

-- Or if using default password
psql postgresql://postgres:postgres@localhost:5432/barrenground

-- Create admin user (update email)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Or insert if no users exist yet
-- (You'll need to register first through the app, then update the role)
```

### Step 5: Verify Migrations

Check that all tables were created:

```sql
-- List all tables
\dt

-- Should show:
-- business_hours
-- email_logs
-- loyalty_transactions
-- menu_items
-- news
-- order_items
-- orders
-- promos
-- users
-- user_memberships
-- membership_plans
-- membership_usage
-- payment_methods

-- Check a sample table
SELECT COUNT(*) FROM promos;
SELECT COUNT(*) FROM news;
SELECT COUNT(*) FROM loyalty_transactions;
```

---

## Manual Migration (If Automated Script Fails)

If the TypeScript migration script fails, you can run migrations manually:

### Migration 1: Promo & News
```bash
psql -U postgres -d barrenground -f backend/src/config/schema-promos.sql
```

### Migration 2: User Roles
```bash
psql -U postgres -d barrenground -f backend/src/scripts/addUserRoles.sql
```

### Migration 3: Loyalty Points
```bash
psql -U postgres -d barrenground -f backend/src/config/schema-loyalty.sql
```

### Migration 4: Order Scheduling
```bash
psql -U postgres -d barrenground -f backend/src/config/schema-scheduling.sql
```

### Migration 5: Email Logging
```sql
-- Run this SQL manually in psql
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  error TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
```

---

## Troubleshooting

### Issue: "psql: command not found"

**Solution:** Add PostgreSQL bin directory to PATH

1. Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\15\bin`)
2. Add to System PATH:
   - Windows Key → "Environment Variables"
   - System Variables → Path → Edit
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click OK, restart terminal

### Issue: "password authentication failed"

**Solution:** Update DATABASE_URL with correct password

```env
# In backend/.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barrenground
```

### Issue: "database 'barrenground' does not exist"

**Solution:** Create the database first

```bash
# Using npm script
cd backend
npm run db:create

# Or manually
createdb -U postgres barrenground

# Or via psql
psql -U postgres
CREATE DATABASE barrenground;
\q
```

### Issue: "already exists" errors during migration

**Solution:** This is normal if re-running migrations. The script handles this gracefully.

### Issue: Port 5432 already in use

**Solution:** Another PostgreSQL instance or process is using the port

```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Stop the process or use different port in DATABASE_URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/barrenground
```

---

## Verification Checklist

After running migrations, verify everything works:

- [ ] PostgreSQL is running (check Windows Services or Docker)
- [ ] Database `barrenground` exists
- [ ] All 5 migrations completed successfully
- [ ] Tables created (run `\dt` in psql)
- [ ] Admin user created
- [ ] Backend starts without errors: `npm run dev`
- [ ] Can access employee dashboard features

---

## Quick Reference

### Start PostgreSQL (Windows)
```bash
net start postgresql-x64-15
```

### Stop PostgreSQL (Windows)
```bash
net stop postgresql-x64-15
```

### Connect to Database
```bash
psql -U postgres -d barrenground
```

### Check Database Connection
```bash
cd backend
npm run db:test
```

### Run All Migrations
```bash
cd backend
npx ts-node src/scripts/runAllMigrations.ts
```

### Reset Database (Careful!)
```bash
dropdb -U postgres barrenground
createdb -U postgres barrenground
# Then run migrations again
```

---

## Next Steps After Migrations

1. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontends:**
   ```bash
   # In separate terminals
   cd customer-frontend && npm run dev
   cd employee-dashboard && npm run dev
   ```

3. **Test New Features:**
   - Visit http://localhost:8889 (employee dashboard)
   - Test Promo Management
   - Test News Management
   - Place an order to test loyalty points
   - Try scheduling an order
   - Check email logs

4. **Review Documentation:**
   - `IMPLEMENTATION_COMPLETE.md` - Full implementation summary
   - `SECURITY.md` - Security policy
   - Task-specific documentation in root directory

---

## Support

If you encounter issues:

1. Check PostgreSQL is running: `pg_isready`
2. Verify connection: `cd backend && npm run db:test`
3. Check logs in backend console
4. Review error messages carefully
5. Refer to task-specific documentation

**Common Windows PostgreSQL Path:**
`C:\Program Files\PostgreSQL\15\bin\psql.exe`

**Common Docker Command:**
`docker logs barrenground-postgres`

---

**Once PostgreSQL is running, execute:**
```bash
cd backend
npx ts-node src/scripts/runAllMigrations.ts
```

This will handle everything automatically! 🚀
