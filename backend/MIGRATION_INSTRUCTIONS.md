# Database Migration Instructions for Promo & News Tables

## Prerequisites
- PostgreSQL must be installed and running
- You need access to the `barrenground` database
- You need the database credentials (username/password)

## Running the Migration

### Option 1: Using psql command line
```bash
cd backend
psql -U postgres -d barrenground -f src/config/schema-promos.sql
```

### Option 2: Using psql interactive shell
```bash
# Connect to the database
psql -U postgres -d barrenground

# Then run the SQL file
\i src/config/schema-promos.sql

# Exit psql
\q
```

### Option 3: Using a database GUI tool (pgAdmin, DBeaver, etc.)
1. Connect to your `barrenground` database
2. Open `backend/src/config/schema-promos.sql`
3. Execute the SQL script

## Verifying the Migration

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('promos', 'news');

-- Check promos table structure
\d promos

-- Check news table structure
\d news

-- Check indexes
\di idx_promos_active
\di idx_news_active
```

## What This Migration Creates

### Promos Table
- Stores promotional banners for the homepage
- Fields: id, title, description, image_url, link_url, active, start_date, end_date, created_at, updated_at
- Index on (active, start_date, end_date) for fast queries

### News Table
- Stores news announcements for the homepage
- Fields: id, title, content, image_url, active, priority, created_at, updated_at
- Index on (active, priority DESC) for fast queries

## Troubleshooting

### Error: "psql: command not found"
- Make sure PostgreSQL is installed
- Add PostgreSQL bin directory to your PATH

### Error: "FATAL: database 'barrenground' does not exist"
- Create the database first: `createdb -U postgres barrenground`
- Or use an existing database by changing the database name in the command

### Error: "permission denied"
- Make sure you have the correct database credentials
- Try using a different database user with appropriate permissions

## Next Steps

After successfully running the migration:
1. Restart your backend server
2. Test the endpoints using the employee dashboard
3. Verify CRUD operations work correctly
