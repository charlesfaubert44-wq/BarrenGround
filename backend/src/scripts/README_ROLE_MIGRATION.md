# User Role Migration Guide

This migration adds role-based access control to the Barren Ground Coffee system.

## What This Migration Does

1. Adds a `role` column to the `users` table
2. Creates an index on the `role` column for performance
3. Adds a constraint to ensure only valid roles ('customer', 'employee', 'admin')
4. Sets all existing users to 'customer' role by default

## How to Apply the Migration

### Option 1: Using psql command line

```bash
# Connect to your database
psql -U your_username -d barrenground

# Run the migration
\i backend/src/scripts/addUserRoles.sql
```

### Option 2: Using a PostgreSQL client (e.g., pgAdmin, DBeaver)

1. Open your PostgreSQL client
2. Connect to the `barrenground` database
3. Open the file `backend/src/scripts/addUserRoles.sql`
4. Execute the SQL commands

### Option 3: Using Node.js

```bash
cd backend
node -e "const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const sql = fs.readFileSync('src/scripts/addUserRoles.sql', 'utf8'); pool.query(sql).then(() => { console.log('Migration complete'); pool.end(); }).catch(err => { console.error('Migration failed:', err); pool.end(); });"
```

## After Migration

### 1. Create Admin User

You need to promote at least one user to admin:

```sql
-- Replace with your admin email
UPDATE users SET role = 'admin' WHERE email = 'admin@barrengroundcoffee.com';
```

### 2. Create Employee Users (Optional)

To create employee accounts:

```sql
-- Replace with employee email
UPDATE users SET role = 'employee' WHERE email = 'employee@barrengroundcoffee.com';
```

### 3. Verify Migration

```sql
-- Check that the role column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';

-- Check user roles
SELECT id, email, role FROM users;

-- Check the constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users' AND constraint_name = 'check_user_role';
```

## Role Descriptions

- **customer** (default): Can place orders, view order history, manage profile
- **employee**: Customer permissions + manage menu, promotions, news, view all orders
- **admin**: Employee permissions + full system access

## Security Notes

- The migration is idempotent (safe to run multiple times)
- Uses `IF NOT EXISTS` to prevent errors if already applied
- All existing users are set to 'customer' by default for safety
- You must manually promote users to 'employee' or 'admin'

## Troubleshooting

### Error: "relation 'users' does not exist"
Make sure you've run the main database setup first:
```bash
cd backend
npm run setup-db
```

### Error: "column 'role' already exists"
The migration has already been applied. This is safe to ignore.

### Unable to connect to database
1. Verify DATABASE_URL environment variable is set
2. Check that PostgreSQL is running
3. Verify database credentials are correct

## Rollback (if needed)

To remove the role column:

```sql
-- WARNING: This will delete all role data
ALTER TABLE users DROP COLUMN IF EXISTS role;
DROP INDEX IF EXISTS idx_users_role;
```

## Production Deployment

Before deploying to production:

1. **Test the migration in a staging environment first**
2. **Backup your production database**
3. **Apply the migration during low-traffic period**
4. **Immediately create at least one admin user**
5. **Verify role-based access is working correctly**

## Support

For issues with the migration, contact the development team or refer to:
- SECURITY.md for security policy
- SECURITY_IMPLEMENTATION_SUMMARY.md for implementation details
