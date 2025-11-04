# Debug Backend Crash - Check Function Logs

The backend is still crashing. We need to see the actual error message in Vercel logs.

---

## Step 1: Check Function Logs (IMPORTANT!)

### How to View Logs:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Click your backend project**

3. **Click "Deployments" tab**

4. **Click on the LATEST deployment** (top of the list)

5. **Click "Functions" tab** (at the top)

6. **Click on "api/index"** (or "api/index.ts")

7. **Look at the error logs** - you'll see red error messages

---

## Step 2: What to Look For

The logs will show the actual error. Common errors:

### Error 1: Missing Environment Variables
```
Missing required environment variables: DATABASE_URL, JWT_SECRET
```
**Fix:** Go back to Settings → Environment Variables and verify all 6 are added

### Error 2: JWT_SECRET Too Short
```
JWT_SECRET must be at least 32 characters
```
**Fix:** Make JWT_SECRET longer (use the one I provided - it's 79 characters)

### Error 3: Database Connection Failed
```
ECONNREFUSED
Connection refused
getaddrinfo ENOTFOUND
```
**Fix:** Check DATABASE_URL is correct

### Error 4: Module Not Found
```
Cannot find module 'express'
Module not found
```
**Fix:** This means npm install didn't run - redeploy

---

## Step 3: Verify Environment Variables Were Saved

1. **Go to:** Settings → Environment Variables
2. **Check you see all 6 variables:**
   - DATABASE_URL
   - JWT_SECRET
   - FRONTEND_URL
   - EMPLOYEE_DASHBOARD_URL
   - NODE_ENV
   - PORT

3. **If any are missing:** Add them and redeploy

---

## Step 4: Verify You Redeployed After Adding Variables

**IMPORTANT:** Environment variables only apply to NEW deployments!

If you added variables but didn't redeploy:
1. Go to **Deployments** tab
2. Click **three dots (•••)** on latest deployment
3. Click **"Redeploy"**
4. Wait for new deployment to complete
5. Test again

---

## Step 5: Copy the Error Message

Once you see the error in the function logs:

1. **Take a screenshot** OR
2. **Copy the error text**
3. **Send it to me**

I'll tell you exactly what's wrong and how to fix it!

---

## Quick Checklist

Before checking logs, verify:

- [ ] All 6 environment variables are added in Vercel
- [ ] Each variable has a value (not empty)
- [ ] You clicked "Save" for each variable
- [ ] You redeployed the backend AFTER adding variables
- [ ] The new deployment completed successfully

---

## Alternative: Check Build Logs

If the function logs don't show anything:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Look at **"Building"** section
4. Scroll through the build output
5. Look for any red error messages

Common build errors:
- TypeScript compilation errors
- Missing dependencies
- Invalid configuration

---

## Most Likely Causes

Based on the error, it's probably one of these:

1. **Variables not saved properly** → Go to Settings → Env Variables and re-check
2. **Didn't redeploy after adding variables** → Redeploy now
3. **Database connection issue** → Check DATABASE_URL format
4. **JWT_SECRET issue** → Make sure it's 32+ characters

---

## What to Send Me

To help debug, please send:

1. **Screenshot of function logs** (the red error messages)
   OR
2. **Copy-paste of the error text**

Also confirm:
- ✅ You added all 6 environment variables
- ✅ You clicked "Save" for each one
- ✅ You redeployed after adding them

---

**Let's check those logs to see the actual error!** 🔍
