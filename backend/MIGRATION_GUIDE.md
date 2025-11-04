# Database Migration Guide - Order Scheduling System

## Quick Start

### Option 1: Using the Migration Script (Recommended)
```bash
cd backend
npx ts-node src/scripts/migrateScheduling.ts
```

### Option 2: Manual SQL Execution
```bash
cd backend
psql -U postgres -d barrenground_db -f src/config/schema-scheduling.sql
```

### Option 3: Using npm script (if added)
```bash
cd backend
npm run db:migrate-scheduling
```

## What Gets Created

### 1. New Columns in `orders` Table
- `scheduled_time` (TIMESTAMP) - When the order is scheduled for
- `is_scheduled` (BOOLEAN) - Flag indicating if order is scheduled
- `reminder_sent` (BOOLEAN) - Flag tracking if reminder was sent
- `ready_at` (TIMESTAMP) - When order was marked ready (already existed, added if missing)

### 2. New Table: `business_hours`
```sql
CREATE TABLE business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL,      -- 0=Sunday, 1=Monday, etc.
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  max_orders_per_slot INTEGER DEFAULT 20,
  slot_duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Default Business Hours
- Sunday: Closed
- Monday-Saturday: 7:00 AM - 6:00 PM
- Max 20 orders per 15-minute slot

### 4. Indexes
- `idx_orders_scheduled` - Fast lookup of scheduled orders
- `idx_orders_reminder` - Fast lookup for reminder job
- `idx_business_hours_day` - Fast lookup by day of week

## Verification

After running the migration, verify it worked:

```sql
-- Check orders table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('scheduled_time', 'is_scheduled', 'reminder_sent');

-- Check business_hours table exists
SELECT COUNT(*) FROM business_hours;
-- Should return 7 (one row per day)

-- View business hours
SELECT
  CASE day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day,
  open_time,
  close_time,
  is_closed,
  max_orders_per_slot
FROM business_hours
ORDER BY day_of_week;
```

## Rollback (if needed)

If you need to rollback the changes:

```sql
-- Remove columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS scheduled_time;
ALTER TABLE orders DROP COLUMN IF EXISTS is_scheduled;
ALTER TABLE orders DROP COLUMN IF EXISTS reminder_sent;

-- Drop indexes
DROP INDEX IF EXISTS idx_orders_scheduled;
DROP INDEX IF EXISTS idx_orders_reminder;
DROP INDEX IF EXISTS idx_business_hours_day;

-- Drop business_hours table
DROP TABLE IF EXISTS business_hours;
```

## Troubleshooting

### Error: "column already exists"
This is normal if running migration multiple times. The script handles this gracefully.

### Error: "relation business_hours already exists"
The table already exists. You can skip or use the rollback and re-run.

### Error: "database connection refused"
Make sure PostgreSQL is running:
```bash
# Check PostgreSQL status
pg_ctl status

# Start PostgreSQL if needed
pg_ctl start
```

### Error: "permission denied"
Ensure your database user has CREATE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE barrenground_db TO your_user;
```

## Testing the Migration

After migration, test with these queries:

```sql
-- Test: Insert a scheduled order
INSERT INTO orders (
  guest_email,
  guest_name,
  total,
  status,
  payment_intent_id,
  scheduled_time,
  is_scheduled
) VALUES (
  'test@example.com',
  'Test Customer',
  15.99,
  'pending',
  'test_payment_123',
  NOW() + INTERVAL '2 hours',
  true
);

-- Test: Query scheduled orders
SELECT id, guest_name, scheduled_time, is_scheduled
FROM orders
WHERE is_scheduled = true
ORDER BY scheduled_time;

-- Test: Update business hours
UPDATE business_hours
SET open_time = '08:00', close_time = '17:00'
WHERE day_of_week = 1; -- Monday

-- Test: Check slot capacity (should work after server starts)
-- Via API: GET /api/scheduling/available-slots?date=2025-11-05
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Backup database before migration
- [ ] Test migration on staging environment
- [ ] Verify cron job starts correctly
- [ ] Test API endpoints
- [ ] Verify email reminders work (or mock)
- [ ] Check business hours configuration

### Migration Command for Production
```bash
# SSH into production server
ssh user@production-server

# Navigate to backend directory
cd /path/to/backend

# Run migration
npx ts-node src/scripts/migrateScheduling.ts

# Verify
npx ts-node -e "
  import pool from './src/config/database';
  pool.query('SELECT COUNT(*) FROM business_hours').then(r => {
    console.log('Business hours rows:', r.rows[0].count);
    process.exit(0);
  });
"

# Restart server
pm2 restart barrenground-backend
# or
systemctl restart barrenground
```

## Additional Configuration

### Customize Business Hours
```sql
-- Change hours for a specific day
UPDATE business_hours
SET open_time = '06:00', close_time = '20:00'
WHERE day_of_week = 5; -- Friday

-- Close on a specific day
UPDATE business_hours
SET is_closed = true
WHERE day_of_week = 0; -- Sunday

-- Increase slot capacity
UPDATE business_hours
SET max_orders_per_slot = 30
WHERE day_of_week = 6; -- Saturday
```

### Change Slot Duration
```sql
UPDATE business_hours
SET slot_duration_minutes = 20
WHERE day_of_week = 5; -- 20-minute slots on Friday
```

## Support

If you encounter issues:
1. Check database logs: `tail -f /var/log/postgresql/postgresql.log`
2. Verify connection string in `.env`
3. Check migration script output for specific errors
4. Review `SCHEDULING_IMPLEMENTATION_SUMMARY.md` for troubleshooting

---

**Last Updated**: November 4, 2025
