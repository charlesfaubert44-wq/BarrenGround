# Windows Setup Guide

## Step 1: Check if PostgreSQL is Installed

Open PowerShell and try:

```powershell
# Check if PostgreSQL is installed
Get-Service -Name postgresql*
```

### If PostgreSQL is NOT installed:

**Download and Install:**
1. Go to https://www.postgresql.org/download/windows/
2. Download the installer (PostgreSQL 15 or 16)
3. Run installer
4. **Remember the password you set for the 'postgres' user!**
5. Keep default port (5432)

## Step 2: Option A - Use pgAdmin (GUI - Easiest)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Enter your master password
3. Expand "Servers" → "PostgreSQL 15" (or 16)
4. Enter the password you set during installation
5. Right-click "Databases" → "Create" → "Database"
   - Database name: `barrenground`
   - Click "Save"
6. Click on the new `barrenground` database
7. Click "Query Tool" button (or Tools → Query Tool)
8. Click "Open File" button
9. Navigate to: `C:\Users\Charles\Desktop\Projects - Clean folder\BarrenGround\backend\src\config\schema.sql`
10. Click "Execute/Run" button (▶️ play icon or F5)
11. You should see "Query returned successfully" and 7 rows inserted

**Done! Skip to Step 3.**

## Step 2: Option B - Use psql Command Line

### Add PostgreSQL to PATH:

1. Open "Environment Variables":
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Click "Environment Variables" button
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin` (or `\16\` if you installed version 16)
   - Click "OK" on all windows

2. **Close and reopen PowerShell** (important!)

3. Test if it works:
```powershell
psql --version
```

### Create Database:

```powershell
# Navigate to project
cd "C:\Users\Charles\Desktop\Projects - Clean folder\BarrenGround"

# Create database (you'll be prompted for password)
psql -U postgres -c "CREATE DATABASE barrenground;"

# Load schema
psql -U postgres -d barrenground -f backend\src\config\schema.sql

# Verify (should show 7)
psql -U postgres -d barrenground -c "SELECT COUNT(*) FROM menu_items;"
```

## Step 3: Update Backend .env

Edit `backend\.env`:

```env
# Update YOUR_PASSWORD with the password you set during PostgreSQL installation
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barrenground

# These can stay as-is for testing
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
JWT_SECRET=barrenground_secret_change_in_production_2025
FRONTEND_URL=http://localhost:5173
EMPLOYEE_DASHBOARD_URL=http://localhost:5174
NODE_ENV=development
```

## Step 4: Start Everything

Open **3 PowerShell windows**:

### PowerShell 1 - Backend
```powershell
cd "C:\Users\Charles\Desktop\Projects - Clean folder\BarrenGround\backend"
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected
```

### PowerShell 2 - Customer Frontend
```powershell
cd "C:\Users\Charles\Desktop\Projects - Clean folder\BarrenGround\customer-frontend"
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
```

### PowerShell 3 - Employee Dashboard
```powershell
cd "C:\Users\Charles\Desktop\Projects - Clean folder\BarrenGround\employee-dashboard"
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5174/
```

## Step 5: Test It

1. Open browser to **http://localhost:5173**
2. Click "Menu" - you should see 7 items
3. Try adding something to cart

## Troubleshooting

### Error: "ECONNREFUSED" when starting backend

**Problem:** Database isn't running

**Solution:**
1. Open Services (Win + R, type `services.msc`)
2. Find "postgresql-x64-15" (or 16)
3. Right-click → Start
4. Restart backend

### Error: "password authentication failed"

**Problem:** Wrong password in .env file

**Solution:**
- Edit `backend\.env`
- Update the DATABASE_URL with correct password
- Restart backend

### Error: "database does not exist"

**Problem:** Database wasn't created

**Solution:**
- Use pgAdmin (Option A above) to create database
- OR add PostgreSQL to PATH and run create commands

### Can't find pgAdmin

**Where to find it:**
- Start Menu → PostgreSQL 15 → pgAdmin 4
- OR: `C:\Program Files\PostgreSQL\15\pgAdmin 4\bin\pgAdmin4.exe`

### PostgreSQL not installed at all?

**Download from:**
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Pick version 15 or 16, Windows x86-64.

---

## Quick Summary

**Easiest path (recommended):**
1. ✅ Install PostgreSQL if needed
2. ✅ Open pgAdmin 4
3. ✅ Create database "barrenground"
4. ✅ Run the schema.sql file in Query Tool
5. ✅ Edit backend/.env with your password
6. ✅ Start backend, then frontends
7. ✅ Open http://localhost:5173

Need more help? Tell me where you got stuck!
