# 🚀 Quick Start: Run Migrations

## Current Status

✅ **All 8 features implemented and ready**
❌ **PostgreSQL database is not running** - Migrations blocked

---

## What You Need to Do

### 1️⃣ Install PostgreSQL (5 minutes)

**Option A: Windows Installer (Recommended)**
```
1. Download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Run installer, set password to: postgres
3. Keep port as: 5432
4. Finish installation
```

**Option B: Docker (If you have Docker)**
```bash
docker run --name barrenground-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=barrenground \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud Database (Easiest)**
```
1. Sign up at https://supabase.com (free)
2. Create new project
3. Get DATABASE_URL from Settings → Database
4. Skip to step 3 below
```

---

### 2️⃣ Create Environment File (1 minute)

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground
JWT_SECRET=please-change-this-to-a-secure-32-character-secret-key-for-production
```

---

### 3️⃣ Run Migrations (30 seconds)

**ONE COMMAND DOES IT ALL:**

```bash
cd backend
npx ts-node src/scripts/runAllMigrations.ts
```

This automatically runs all 5 migrations:
- ✅ Promo & News Tables
- ✅ User Roles (Security)
- ✅ Loyalty Points System
- ✅ Order Scheduling System
- ✅ Email Logging System

---

### 4️⃣ Start the Application (1 minute)

```bash
# From root directory
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Customer Frontend: http://localhost:8890
- Employee Dashboard: http://localhost:8889

---

## Verification

After migrations complete, you should see:

```
🎉 All migrations completed successfully!

📋 Next Steps:
   1. Create an admin user
   2. Set a strong JWT_SECRET
   3. Restart the backend server
   4. Test the new features!
```

---

## Test New Features

1. **Employee Dashboard** (http://localhost:8889)
   - Login as employee
   - Go to Promo Management → Create promo
   - Go to News Management → Create news article

2. **Customer Frontend** (http://localhost:8890)
   - Register/Login
   - Place an order → Check loyalty points
   - Try scheduling an order for tomorrow
   - View your loyalty page

3. **Check Database**
   ```sql
   psql -U postgres -d barrenground
   SELECT * FROM promos;
   SELECT * FROM loyalty_transactions;
   SELECT * FROM business_hours;
   ```

---

## If You Run Into Issues

1. **PostgreSQL not running:**
   ```bash
   # Windows Services
   net start postgresql-x64-15

   # Docker
   docker start barrenground-postgres
   ```

2. **Database doesn't exist:**
   ```bash
   cd backend
   npm run db:create
   ```

3. **See detailed guide:**
   - Read: `MIGRATION_INSTRUCTIONS.md`

---

## Summary

You're **almost there**! Just need to:

1. Install PostgreSQL (or use cloud)
2. Create `.env` file
3. Run: `npx ts-node src/scripts/runAllMigrations.ts`
4. Run: `npm run dev`

**Total time: ~10 minutes** ⏱️

Then you'll have all 8 features running! 🎉

---

## Quick Links

- **Full Guide:** [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)
- **Implementation Summary:** [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)
- **Security Guide:** [SECURITY.md](SECURITY.md)
- **PostgreSQL Download:** https://www.postgresql.org/download/windows/
- **Cloud Database (Supabase):** https://supabase.com
