# Verify Environment Variables Are Set

Your build is succeeding, but the function crashes at runtime. This means environment variables aren't set or aren't being read.

---

## Step 1: Verify Variables in Vercel Dashboard

1. **Go to your backend project in Vercel**
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar
4. **You should see 6 variables listed:**

```
✓ DATABASE_URL = postgresql://postgres:...
✓ JWT_SECRET = barrenground-coffee-production...
✓ FRONTEND_URL = https://vercel.app
✓ EMPLOYEE_DASHBOARD_URL = https://vercel.app
✓ NODE_ENV = production
✓ PORT = 3000
```

### If They're Missing:
- Add them now (see BACKEND_ENV_VARS.md)
- After adding ALL 6, redeploy

### If They're There:
- Continue to Step 2

---

## Step 2: Check Which Environments Are Checked

For EACH variable, click on it and verify:

**All three boxes should be checked:**
- ☑ Production
- ☑ Preview
- ☑ Development

If any are unchecked:
1. Click "Edit" on the variable
2. Check all three boxes
3. Click "Save"
4. Redeploy after fixing

---

## Step 3: Verify This Was the LATEST Deployment

The build log shows commit `739f758` was deployed.

Check if this is the latest:
```bash
git log --oneline -1
```

Should show: `739f758` or newer

If you see a newer commit locally, you need to redeploy from the correct commit.

---

## Step 4: Check Runtime Logs (Not Build Logs)

The build succeeded, but we need to see the **runtime error**:

1. **Go to Vercel Dashboard** → Your backend project
2. **Click "Deployments"** tab
3. **Click the deployment** that just completed
4. **Click "Functions"** tab (top menu)
5. **Click "api/index"**
6. **Try to invoke the function:**
   - Visit: `https://your-backend-api.vercel.app/health`
7. **Immediately go back to the Functions tab**
8. **Refresh the logs** - you should see the error

The error will be something like:
```
Error: Missing required environment variables: DATABASE_URL, JWT_SECRET
```
OR
```
Error: JWT_SECRET must be at least 32 characters
```
OR
```
TypeError: Cannot read property 'DATABASE_URL' of undefined
```

---

## Common Issue: Variables Not Applied to Deployment

**IMPORTANT:** Environment variables only apply to deployments created AFTER they were added.

If you:
1. Deployed first
2. Then added variables
3. But didn't redeploy

→ The function won't have the variables!

**Solution:**
1. Go to **Deployments** tab
2. Click **three dots (•••)** on latest deployment
3. Click **"Redeploy"**
4. Wait for completion
5. Test again

---

## Step 5: Alternative - Check Deployment Environment Variables

You can verify which variables a specific deployment has:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Scroll down to **"Environment Variables"** section
4. You should see all 6 variables listed

If you don't see them here, they weren't applied to this deployment.

---

## Quick Test: Try a Different Endpoint

Instead of `/health`, try visiting:
```
https://your-backend-api.vercel.app/
```

This might give a different error message that's more helpful.

---

## Most Likely Solution

Based on the symptoms, here's what probably happened:

1. You deployed the backend first
2. Backend was failing
3. You added environment variables
4. But you **didn't redeploy after adding them**

**Fix:**
1. Verify all 6 variables are in Settings → Environment Variables
2. **Redeploy** (Deployments → ••• → Redeploy)
3. Wait for new deployment to complete
4. Test: `https://your-backend-api.vercel.app/health`

---

## What to Check

Please verify and send me:

1. **Screenshot of Settings → Environment Variables page**
   - Shows all 6 variables are set

2. **Screenshot or text of the runtime error**
   - From Functions → api/index logs after visiting `/health`

3. **Confirm you redeployed AFTER adding variables**
   - Yes / No

This will help me pinpoint the exact issue!

---

## Expected Behavior

Once environment variables are properly set and applied:

**Visit:** `https://your-backend-api.vercel.app/health`

**Should return:**
```json
{"status":"ok"}
```

**Instead of:** 500 FUNCTION_INVOCATION_FAILED error

---

**Let's check those environment variables in the dashboard!** 🔍
