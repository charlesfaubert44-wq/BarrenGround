# Fix Backend Crash - Missing Environment Variables

## The Problem

Your backend is crashing with `FUNCTION_INVOCATION_FAILED` because it's missing required environment variables.

The backend validates these variables on startup (see `backend/src/config/env.ts`):
- ✅ `DATABASE_URL` (required)
- ✅ `JWT_SECRET` (required, must be 32+ characters)
- ✅ `FRONTEND_URL` (required)
- ✅ `EMPLOYEE_DASHBOARD_URL` (required)

---

## Quick Fix (5 Minutes)

### Step 1: Go to Vercel Backend Project

1. Open https://vercel.com/dashboard
2. Click on your **backend project**
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in sidebar

### Step 2: Add ALL These Variables

Click "Add New" for each variable:

```env
DATABASE_URL
postgresql://postgres:njmiBkhT2rKeBOwD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres

JWT_SECRET
barrenground-coffee-production-jwt-secret-key-2025-random-string

FRONTEND_URL
https://localhost:8890

EMPLOYEE_DASHBOARD_URL
https://localhost:8889

NODE_ENV
production

PORT
3000
```

**IMPORTANT Notes:**
- `JWT_SECRET` must be at least 32 characters (the one above is valid)
- `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` are temporary localhost URLs - we'll update these after deploying frontends
- All 6 variables are required!

### Step 3: How to Add Each Variable

For each variable:
1. Click **"Add New"**
2. **Key:** Enter variable name (e.g., `DATABASE_URL`)
3. **Value:** Paste the value
4. **Environment:** Check all three boxes (Production, Preview, Development)
5. Click **"Save"**

Repeat for all 6 variables!

### Step 4: Redeploy

After adding all variables:
1. Go to **"Deployments"** tab
2. Click the **three dots (•••)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 5: Test

Visit your backend URL:
```
https://your-backend-api.vercel.app/health
```

You should see:
```json
{"status":"ok"}
```

If you still see the crash error, check the function logs!

---

## View Function Logs (If Still Crashing)

1. Go to your backend project in Vercel
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Click on **"api/index"**
6. Look at the error logs

Common errors:
- `Missing required environment variables: ...` → Add the missing variables
- `JWT_SECRET must be at least 32 characters` → Make JWT_SECRET longer
- `Connection refused` → Check DATABASE_URL is correct

---

## Verify All Variables Are Set

After adding, go back to Settings → Environment Variables and verify you see:

- [x] `DATABASE_URL` = `postgresql://postgres:...`
- [x] `JWT_SECRET` = `barrenground-coffee-production...` (32+ chars)
- [x] `FRONTEND_URL` = `https://localhost:8890`
- [x] `EMPLOYEE_DASHBOARD_URL` = `https://localhost:8889`
- [x] `NODE_ENV` = `production`
- [x] `PORT` = `3000`

All should have green checkmarks!

---

## After Backend Works

Once your backend `/health` endpoint returns `{"status":"ok"}`:

1. **Deploy frontends** (see `DEPLOY_WITHOUT_STRIPE.md`)
2. **Get frontend URLs** from Vercel
3. **Update backend environment variables:**
   - Change `FRONTEND_URL` to actual customer frontend URL
   - Change `EMPLOYEE_DASHBOARD_URL` to actual employee dashboard URL
4. **Redeploy backend** to apply CORS settings

---

## Quick Checklist

- [ ] Added all 6 environment variables to Vercel
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` matches your Supabase connection string
- [ ] Clicked "Save" for each variable
- [ ] Redeployed the backend
- [ ] `/health` endpoint returns `{"status":"ok"}`

---

## Still Having Issues?

**Check Function Logs:**
- Vercel Dashboard → Backend Project → Deployments → Latest → Functions → api/index
- Look for the exact error message
- Common issues:
  - Missing variables
  - JWT_SECRET too short
  - Wrong DATABASE_URL format
  - Database connection refused

**Test Database Connection:**
Your Supabase database should be accessible. If not, check:
- Supabase project is active
- Connection string is correct (from Supabase Settings → Database → Connection string)
- Password is correct: `njmiBkhT2rKeBOwD`

---

## Copy-Paste Ready Variables

Here are all 6 variables ready to copy-paste:

**Variable 1:**
```
Name: DATABASE_URL
Value: postgresql://postgres:njmiBkhT2rKeBOwD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

**Variable 2:**
```
Name: JWT_SECRET
Value: barrenground-coffee-production-jwt-secret-key-2025-random-string-32-chars-minimum
```

**Variable 3:**
```
Name: FRONTEND_URL
Value: https://localhost:8890
```

**Variable 4:**
```
Name: EMPLOYEE_DASHBOARD_URL
Value: https://localhost:8889
```

**Variable 5:**
```
Name: NODE_ENV
Value: production
```

**Variable 6:**
```
Name: PORT
Value: 3000
```

---

**After adding all 6 and redeploying, your backend will work! 🚀**
