# Backend Environment Variables - Copy-Paste Ready

Add these 6 variables to your Vercel backend project.

**Go to:** Vercel Dashboard → Backend Project → Settings → Environment Variables

---

## Required Variables (Copy-Paste These)

### Variable 1: DATABASE_URL
```
postgresql://postgres:njmiBkhT2rKeBOwD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
```

### Variable 2: JWT_SECRET
```
barrenground-coffee-production-jwt-secret-key-2025-random-string-32-chars-minimum
```

### Variable 3: FRONTEND_URL (Temporary - Update Later)
```
https://vercel.app
```
**Note:** Update this to your actual customer frontend URL after deployment!

### Variable 4: EMPLOYEE_DASHBOARD_URL (Temporary - Update Later)
```
https://vercel.app
```
**Note:** Update this to your actual employee dashboard URL after deployment!

### Variable 5: NODE_ENV
```
production
```

### Variable 6: PORT
```
3000
```

---

## How to Add Each Variable

For each variable above:

1. Click **"Add New"** button
2. **Name/Key:** Enter the variable name (e.g., `DATABASE_URL`)
3. **Value:** Copy-paste the value from above
4. **Environment:** Check all three boxes:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click **"Save"**
6. Repeat for all 6 variables

---

## After Adding All 6 Variables

1. **Redeploy Backend:**
   - Go to "Deployments" tab
   - Click three dots (•••) on latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

2. **Test Backend:**
   ```bash
   curl https://your-backend-api.vercel.app/health
   ```
   Should return: `{"status":"ok"}`

3. **Next Steps:**
   - Deploy customer frontend → Get URL
   - Deploy employee dashboard → Get URL
   - Update `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` with real URLs
   - Redeploy backend to apply CORS settings

---

## Verify All Variables Are Set

After adding, you should see all 6 in the Environment Variables list:

- ✅ DATABASE_URL = `postgresql://postgres:...`
- ✅ JWT_SECRET = `barrenground-coffee-production...`
- ✅ FRONTEND_URL = `https://vercel.app` (temporary)
- ✅ EMPLOYEE_DASHBOARD_URL = `https://vercel.app` (temporary)
- ✅ NODE_ENV = `production`
- ✅ PORT = `3000`

---

## Quick Copy-Paste Format

If you prefer to copy all at once, here's the format:

```
DATABASE_URL=postgresql://postgres:njmiBkhT2rKeBOwD@db.rsjkxinexrtxgtyppqxy.supabase.co:5432/postgres
JWT_SECRET=barrenground-coffee-production-jwt-secret-key-2025-random-string-32-chars-minimum
FRONTEND_URL=https://vercel.app
EMPLOYEE_DASHBOARD_URL=https://vercel.app
NODE_ENV=production
PORT=3000
```

---

**After adding these and redeploying, your backend will start successfully! ✅**
