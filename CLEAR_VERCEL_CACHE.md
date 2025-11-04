# Clear Vercel Build Cache

Vercel is still using cached uuid v13. We need to force a clean rebuild.

---

## Option 1: Clear Cache in Vercel Dashboard (Recommended)

### Step 1: Go to Project Settings
1. Open https://vercel.com/dashboard
2. Click your **backend project**
3. Click **"Settings"** tab

### Step 2: Clear Build Cache
1. Scroll down to **"Build & Development Settings"**
2. Find **"Build Cache"** section
3. Click **"Clear Build Cache"** button
4. Confirm the action

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click **three dots (•••)** on latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT:** Check the box for **"Use existing Build Cache: NO"**
5. Click **"Redeploy"**

This forces Vercel to:
- Delete cached node_modules
- Run fresh `npm install` with new package-lock.json
- Install uuid 9.0.1 (not cached v13)

---

## Option 2: Trigger Clean Deploy via CLI

If you have Vercel CLI installed:

```bash
cd backend
vercel --prod --force
```

This bypasses cache and does a fresh build.

---

## Option 3: Add .vercel to .gitignore (Already Done)

We already have `.vercel` in `.gitignore`, but just to be sure:

```bash
# In backend/.gitignore
.vercel
```

This prevents Vercel cache from being committed.

---

## Verify the Fix

After clearing cache and redeploying:

1. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Latest → Build Logs
   - Look for: `npm install` output
   - Should show: `uuid@9.0.1` being installed (not 13.0.0)

2. **Check Function Logs:**
   - Visit: `https://your-backend-api.vercel.app/health`
   - Go to: Deployments → Latest → Functions → api/index
   - Should NOT see uuid ERR_REQUIRE_ESM error

3. **Test Health Endpoint:**
   ```bash
   curl https://your-backend-api.vercel.app/health
   ```
   Should return: `{"status":"ok"}`

---

## Why This Keeps Happening

**The Problem:**
1. First deployment installed uuid v13 (from old package.json)
2. Vercel cached the node_modules folder
3. We changed to uuid v9.0.1
4. But Vercel keeps using cached node_modules (has v13)

**The Solution:**
Clear the cache to force fresh npm install with new package-lock.json

---

## Expected Build Log Output (After Cache Clear)

You should see in build logs:

```
Installing dependencies...
npm install

added 518 packages in 6s

uuid@9.0.1  ← Should show version 9, not 13!
```

---

## If It Still Fails

If clearing cache doesn't work, we have one more option:

**Lock uuid to exact version (no caret):**

Edit `backend/package.json`:
```json
"uuid": "9.0.1"  // Remove the ^ symbol
```

Then:
1. Delete package-lock.json
2. Run `npm install`
3. Commit and push
4. Clear Vercel cache
5. Redeploy

---

**Go to Vercel Settings and clear the build cache now!** 🗑️
