# Fix Vercel Deployment - Monorepo Configuration

## The Problem

Vercel is looking for a "public" output directory because it doesn't know this is a serverless backend API in a monorepo.

## The Solution

You need to configure the **Root Directory** in Vercel dashboard settings.

---

## Step-by-Step Fix

### Option 1: Fix in Vercel Dashboard (Recommended)

1. **Go to your Vercel project** (the one that's failing)
   - Visit: https://vercel.com/dashboard

2. **Go to Project Settings**
   - Click on your project
   - Click "Settings" tab

3. **Set Root Directory**
   - Scroll to "Root Directory"
   - Click "Edit"
   - Enter: `backend`
   - Click "Save"

4. **Verify Build Settings**
   - Framework Preset: **Other** (or leave blank)
   - Build Command: `npm run build`
   - Output Directory: **Leave empty** (serverless functions don't need this)
   - Install Command: `npm install`

5. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

---

### Option 2: Create a New Project (If Settings Don't Work)

If the above doesn't work, create a fresh project:

1. **Go to Vercel Dashboard**
   - https://vercel.com/new

2. **Import your GitHub repository**
   - Select: `BarrenGround` repo

3. **Configure the project:**
   ```
   Project Name: barrenground-api
   Framework Preset: Other
   Root Directory: backend          ← CRITICAL!
   Build Command: npm run build
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables** (if not already set):
   ```env
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-jwt-secret
   STRIPE_SECRET_KEY=sk_test_xxx
   NODE_ENV=production
   FRONTEND_URL=https://your-customer-frontend.vercel.app
   EMPLOYEE_DASHBOARD_URL=https://your-employee-dashboard.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will now find `backend/vercel.json` and use serverless config

---

## Why This Fixes It

### Before (Root Directory = empty):
```
Vercel looks at: /vercel.json        ← Doesn't exist (we deleted it)
Vercel uses: Default static site settings
Result: Looks for "public" directory ❌
```

### After (Root Directory = backend):
```
Vercel looks at: /backend/vercel.json  ← Exists! Has serverless config
Vercel uses: Serverless function config from vercel.json
Result: Builds api/index.ts as serverless function ✅
```

---

## Verify It Worked

After redeploying, you should see in the build logs:

```
✓ Running "vercel build"
✓ Running "npm install"
✓ Running "npm run build" (tsc)
✓ Serverless Function "api/index.ts" created
✓ Build completed successfully
```

**No more "public directory" error!**

---

## For Multiple Apps (Full Monorepo)

Create **3 separate Vercel projects**:

### Project 1: Backend API
- Root Directory: `backend`
- Config: Uses `backend/vercel.json` (serverless)

### Project 2: Customer Frontend
- Root Directory: `customer-frontend`
- Config: Uses `customer-frontend/vercel.json` (Vite static site)

### Project 3: Employee Dashboard
- Root Directory: `employee-dashboard`
- Config: Uses `employee-dashboard/vercel.json` (Vite static site)

Each project deploys independently from the same GitHub repo!

---

## Quick Checklist

- [ ] Vercel project Root Directory set to `backend`
- [ ] Framework Preset set to "Other" or blank
- [ ] Output Directory is empty/blank
- [ ] Build Command is `npm run build`
- [ ] Environment variables added
- [ ] Redeployed with new settings

Once these are set, the deployment will succeed! ✅
