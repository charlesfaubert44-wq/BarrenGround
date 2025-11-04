# 🔍 How to Find Your Supabase Connection String

## Step-by-Step Guide

### Step 1: Go to Supabase Dashboard

Visit: **https://app.supabase.com**

(You should be automatically redirected to your project, or you'll see a list of projects)

---

### Step 2: Open Your Project

If you see multiple projects, click on the one with URL:
**rsjkxinexrtxgtyppqxy**

Or directly visit:
**https://app.supabase.com/project/rsjkxinexrtxgtyppqxy**

---

### Step 3: Navigate to Database Settings

Look at the **LEFT SIDEBAR** and click the **GEAR ICON** at the bottom:

```
☰ Home
📊 Table Editor
🔐 Authentication
💾 Storage
📝 SQL Editor
...
⚙️ Settings  ← CLICK THIS (gear icon at bottom)
```

---

### Step 4: Click "Database" in Settings

After clicking Settings, you'll see a menu. Click **"Database"**:

```
Settings Menu:
- General
- API
- Database  ← CLICK THIS
- Authentication
- Storage
- Billing
```

---

### Step 5: Find Connection String Section

Scroll down on the Database page until you see:

**"Connection string"** or **"Connection info"**

You'll see several tabs:
- **Postgres**
- **URI** ← **CLICK THIS TAB**
- **JDBC**
- **.NET**
- etc.

---

### Step 6: Copy the URI

Under the **URI** tab, you'll see something like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

**Copy this entire string!**

---

### Step 7: Get Your Password

The connection string shows `[YOUR-PASSWORD]` - you need to replace this.

**Option A: You remember your password**
- Replace `[YOUR-PASSWORD]` with your actual password
- Done!

**Option B: You forgot your password**
- On the same Database settings page, scroll up slightly
- Look for **"Database password"** or **"Reset database password"**
- Click **"Generate a new password"** or **"Reset password"**
- **IMPORTANT:** Copy and save the new password immediately!
- Replace `[YOUR-PASSWORD]` in the connection string with this new password

---

## Alternative Method: Connection Pooler

If you can't find "Connection string", try this:

### Navigate to Project Settings

1. Click **Settings** (gear icon) in left sidebar
2. Click **"Database"**
3. Look for **"Connection pooling"** section
4. You should see:
   - **Host:** `db.rsjkxinexrtxgtyppqxy.supabase.co`
   - **Port:** `5432` (or `6543` for pooler)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** (click to reveal or reset)

### Construct the URL manually:

```
postgresql://postgres:YOUR_PASSWORD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD` with your actual password.

---

## Quick Visual Guide

**Navigation Path:**
```
Supabase Dashboard
  → Settings (⚙️ gear icon at bottom left)
    → Database (in settings menu)
      → Scroll to "Connection string" section
        → Click "URI" tab
          → Copy the connection string!
```

---

## What the Connection String Looks Like

It should be ONE LONG line like this:

```
postgresql://postgres:your_actual_password@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

**Components:**
- `postgresql://` - Protocol
- `postgres:` - Username
- `your_actual_password` - Your password ← **THIS IS WHAT YOU NEED TO SET**
- `@db.rsjkxinexrtxgtyppqxy.supabase.co` - Your Supabase host
- `:5432` - Port
- `/postgres` - Database name

---

## Still Can't Find It?

### Try Direct API Settings

1. Go to: **https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/settings/api**
2. Scroll down to **"Database"** or **"Config"** section
3. Look for connection details there

### Or Check Project API

1. Click **"Project Settings"** → **"API"**
2. Look for **"Project URL"** and **"API URL"**
3. The database host is usually: `db.[your-project-ref].supabase.co`

For your project, it's: `db.rsjkxinexrtxgtyppqxy.supabase.co`

---

## Manual Construction (If All Else Fails)

Based on your project URL, your connection string should be:

```
postgresql://postgres:YOUR_PASSWORD_HERE@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

**You just need to:**
1. Get/reset your database password
2. Replace `YOUR_PASSWORD_HERE` with it
3. Use this connection string in your `.env` file

---

## How to Reset Password

1. **Dashboard** → **Settings** (gear icon)
2. **Database** tab
3. Scroll to **"Database password"** section
4. Click **"Reset database password"** or **"Generate new password"**
5. **IMPORTANT:** Copy the new password immediately (you won't see it again!)
6. Use this password in your connection string

---

## Test Your Connection String

Once you have it, test it:

```bash
cd backend

# Create .env file
copy .env.example .env

# Edit .env and add:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres

# Test connection
npm run db:test
```

You should see:
```
✅ Database connection successful!
```

---

## Summary

**Where to look:**
1. Supabase Dashboard (https://app.supabase.com)
2. Settings ⚙️ (gear icon, bottom left)
3. Database tab
4. Scroll to "Connection string" or "Connection info"
5. Click "URI" tab
6. Copy the string

**What you need:**
- Your database password (get it or reset it)
- The connection string format above
- Put it in `backend/.env` as `DATABASE_URL`

**Need help?**
- Direct link to your settings: https://app.supabase.com/project/rsjkxinexrtxgtyppqxy/settings/database
- If that doesn't work, the password reset is on the same page

Let me know if you're still having trouble finding it!
