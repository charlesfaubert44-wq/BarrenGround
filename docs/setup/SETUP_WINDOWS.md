# Windows Setup Guide

This guide will help you set up the Barren Ground Coffee ordering system on Windows.

## Prerequisites

### 1. Install PostgreSQL

**Download PostgreSQL:**
- Visit: https://www.postgresql.org/download/windows/
- Download PostgreSQL 15 or higher
- Run the installer
- During installation, remember the password you set for the `postgres` user
- Install on default port `5432`

**Verify Installation:**
```powershell
# Open a new PowerShell window after installation
postgres --version
```

### 2. Install Node.js

**Download Node.js:**
- Visit: https://nodejs.org/
- Download Node.js 20 LTS or higher
- Run the installer

**Verify Installation:**
```powershell
node --version
npm --version
```

## Quick Setup

### Step 1: Install Dependencies

```powershell
# From the project root
npm run install:all
```

### Step 2: Configure Environment Variables

**Backend (.env):**
```powershell
cd backend
copy .env.example .env
```

Edit `backend\.env` with your settings:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barrenground
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
JWT_SECRET=your_jwt_secret_here_change_in_production
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

**Customer Frontend (.env):**
```powershell
cd ..\customer-frontend
copy .env.example .env
```

The default values should work:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_WS_URL=ws://localhost:5000
```

**Employee Dashboard (.env):**
```powershell
cd ..\employee-dashboard
copy .env.example .env
```

The default values should work:
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Step 3: Create Database

**Option A: Using pgAdmin (GUI - Recommended for Windows)**

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to your PostgreSQL server (use the password you set)
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `barrenground`
5. Click "Save"

**Option B: Using PowerShell**

```powershell
# Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE barrenground;"
```

### Step 4: Set Up Database Schema and Demo Data

```powershell
# From the backend directory
cd backend

# This will create all tables and add 53 demo menu items
npm run db:setup
```

**Expected Output:**
```
🔄 Connecting to database...
📝 Running schema SQL...
✅ Database setup complete!
📊 Menu items, membership plans, and tables created successfully.
```

### Step 5: Start All Services

```powershell
# From the project root
cd ..
npm run dev
```

This will start:
- ✅ Backend API on http://localhost:5000
- ✅ Customer Frontend on http://localhost:8890
- ✅ Employee Dashboard on http://localhost:8889

## Troubleshooting

### PostgreSQL Not Running

**Check if PostgreSQL is running:**
```powershell
Get-Service -Name postgresql*
```

**Start PostgreSQL:**
```powershell
Start-Service postgresql-x64-15  # Version number may vary
```

Or use the Windows Services app (services.msc) to start "PostgreSQL".

### Database Connection Errors

**Test your database connection:**
```powershell
cd backend
npm run db:setup
```

If you see connection errors:

1. **Check your DATABASE_URL** in `backend\.env`
2. **Verify PostgreSQL is running** (see above)
3. **Check the password** matches what you set during installation
4. **Verify the database exists:**
   - Open pgAdmin
   - Check if `barrenground` database is listed

### Port Already in Use

If you get "port already in use" errors:

**Find what's using the port:**
```powershell
netstat -ano | findstr :5000
```

**Kill the process:**
```powershell
taskkill /PID <PID_NUMBER> /F
```

### Menu Items Not Showing

**Re-seed the menu:**
```powershell
cd backend
npm run db:seed
```

This will clear existing items and add all 53 demo menu items.

## Alternative: Run Without Database

If you're having database issues, you can run the backend without a database using mock data:

```powershell
cd backend
npm run dev:no-db
```

**Note:** This uses in-memory data that resets when you restart the server.

## Database Management Tools

### pgAdmin 4 (Recommended for Windows)

Installed automatically with PostgreSQL. Use it to:
- View tables and data
- Run SQL queries
- Backup/restore databases
- Monitor database performance

### Command Line (psql)

If you added PostgreSQL to your PATH during installation:

```powershell
# Connect to database
psql -U postgres -d barrenground

# List tables
\dt

# View menu items
SELECT * FROM menu_items;

# Exit
\q
```

## Default Test Credentials

### Employee Login

Once you've set up the database, you'll need to create an employee account:

1. Start the backend: `npm run dev`
2. Use a tool like Postman or curl to create an employee:

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"employee@barrenground.com\",\"password\":\"employee123\",\"name\":\"Test Employee\",\"phone\":\"555-0100\"}'
```

Then login at: http://localhost:8889

### Customer Account

Register at: http://localhost:8890/register

## File Locations

- Backend: `backend\`
- Customer Frontend: `customer-frontend\`
- Employee Dashboard: `employee-dashboard\`
- Database Schema: `backend\src\config\schema.sql`
- Setup Scripts: `backend\src\scripts\`

## Next Steps

1. ✅ Visit http://localhost:8890 - Customer ordering interface
2. ✅ Visit http://localhost:8889 - Employee dashboard
3. ✅ Test the complete order flow
4. ✅ Explore the menu management features

## Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Verify all services are running
3. Check the console logs for error messages
4. Ensure all environment variables are set correctly
