# Vercel Deployment Guide - Barren Ground Coffee

Complete guide for deploying the Barren Ground Coffee ordering system to Vercel.

## 🏗️ Architecture Overview

This project uses a **monorepo structure** with three separate Vercel projects:

1. **Backend API** (`backend/`) - Express.js serverless functions
2. **Customer Frontend** (`customer-frontend/`) - React/Vite customer-facing app
3. **Employee Dashboard** (`employee-dashboard/`) - React/Vite admin panel

## 📋 Prerequisites

- ✅ Vercel account (free tier works)
- ✅ GitHub repository connected to Vercel
- ✅ Supabase database (PostgreSQL)
- ✅ Stripe account for payments
- ✅ SendGrid account for emails (optional)
- ✅ Google OAuth credentials (optional)

## 🚀 Quick Start (3 Projects)

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy Backend API
cd backend
vercel --prod

# Deploy Customer Frontend
cd ../customer-frontend
vercel --prod

# Deploy Employee Dashboard
cd ../employee-dashboard
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

You'll create **three separate projects** in Vercel:

#### 1️⃣ Deploy Backend API

1. Go to https://vercel.com/new
2. **Import Git Repository** → Select your `BarrenGround` repo
3. **Configure Project:**
   - **Project Name:** `barrenground-api`
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave empty (serverless)
   - **Install Command:** `npm install`

4. **Add Environment Variables** (see section below)
5. Click **Deploy**

#### 2️⃣ Deploy Customer Frontend

1. Go to https://vercel.com/new
2. **Import Git Repository** → Select your `BarrenGround` repo
3. **Configure Project:**
   - **Project Name:** `barrenground-customer`
   - **Framework Preset:** Vite
   - **Root Directory:** `customer-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables** (see section below)
5. Click **Deploy**

#### 3️⃣ Deploy Employee Dashboard

1. Go to https://vercel.com/new
2. **Import Git Repository** → Select your `BarrenGround` repo
3. **Configure Project:**
   - **Project Name:** `barrenground-employee`
   - **Framework Preset:** Vite
   - **Root Directory:** `employee-dashboard`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables** (see section below)
5. Click **Deploy**

---

## 🔐 Environment Variables Configuration

### Backend API Environment Variables

Add these in Vercel dashboard: **Project Settings → Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-production-jwt-secret-change-this-to-random-256-bit-key

# URLs (Update after deployment)
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# SendGrid Email (Optional)
SENDGRID_API_KEY=SG.xxxx
FROM_EMAIL=noreply@barrengroundcoffee.com

# Node Environment
NODE_ENV=production
PORT=3000
```

### Customer Frontend Environment Variables

```bash
# Backend API URL (Update after backend deployment)
VITE_API_URL=https://barrenground-api.vercel.app

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx

# Google OAuth Client ID (Optional)
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### Employee Dashboard Environment Variables

```bash
# Backend API URL (Update after backend deployment)
VITE_API_URL=https://barrenground-api.vercel.app
```

---

## 🔄 Post-Deployment Configuration

### Step 1: Update CORS Origins

After deploying, update the backend environment variables with actual URLs:

```bash
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app
```

Then **redeploy** the backend for CORS to work properly.

### Step 2: Configure Stripe Webhooks

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://barrenground-api.vercel.app/webhooks/stripe`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to backend environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy backend

### Step 3: Configure Google OAuth Redirect URIs

If using Google OAuth:

1. Go to Google Cloud Console → **APIs & Services → Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add **Authorized redirect URIs:**
   - `https://barrenground-api.vercel.app/api/auth/google/callback`
4. Save changes

### Step 4: Run Database Migrations

Your database should already be set up from the manual migrations. If not, run them via Supabase SQL Editor:

1. Go to https://app.supabase.com/project/[YOUR-PROJECT-ID]/sql/new
2. Follow the steps in `RUN_MIGRATIONS_MANUAL.md`

### Step 5: Create Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Create admin user
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES (
  'admin@barrengroundcoffee.com',
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash your password
  'Admin User',
  'admin',
  NOW()
);

-- Verify
SELECT id, email, name, role FROM users WHERE role = 'admin';
```

To generate a password hash, run locally:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10, (err, hash) => console.log(hash));"
```

---

## ✅ Verification Checklist

After deployment, verify everything works:

### Backend API
- [ ] Health check: `https://barrenground-api.vercel.app/health`
- [ ] API responds: `https://barrenground-api.vercel.app/api/menu`
- [ ] No CORS errors in browser console
- [ ] Database connection works (check logs)

### Customer Frontend
- [ ] Site loads: `https://barrenground-customer.vercel.app`
- [ ] Menu items display
- [ ] Login/Register works
- [ ] Stripe checkout works (test mode)
- [ ] Orders can be placed

### Employee Dashboard
- [ ] Site loads: `https://barrenground-employee.vercel.app`
- [ ] Admin login works
- [ ] Orders display in real-time
- [ ] Menu management works
- [ ] Promos/News CRUD works

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:**
1. Check backend `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` match exact deployment URLs
2. No trailing slashes in URLs
3. Redeploy backend after updating environment variables

### Issue: Database Connection Fails

**Symptoms:** `ECONNREFUSED` or `connection timeout`

**Solution:**
1. Verify `DATABASE_URL` is correct (copy from Supabase settings)
2. Check Supabase allows connections from `0.0.0.0/0` (Settings → Database → Connection pooling)
3. Use connection pooling URL if available: `postgresql://postgres:[PASSWORD]@[POOLER].pooler.supabase.com:6543/postgres`

### Issue: Stripe Webhooks Fail

**Symptoms:** Orders stuck in "processing" state

**Solution:**
1. Verify webhook endpoint is registered in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe
3. View webhook logs in Stripe Dashboard → Developers → Webhooks
4. Check Vercel function logs for errors

### Issue: Function Timeout (Error 504)

**Solution:**
1. Increase function timeout in `backend/vercel.json`:
   ```json
   "functions": {
     "api/index.ts": {
       "maxDuration": 60
     }
   }
   ```
2. Pro accounts get 60s, Hobby accounts get 10s max
3. Consider upgrading to Pro if needed

### Issue: Build Fails

**Common causes:**
- TypeScript errors → Run `npm run build` locally first
- Missing dependencies → Check `package.json`
- Node version mismatch → Add `.nvmrc` file:
  ```
  20.10.0
  ```

### Issue: Environment Variables Not Working

**Solution:**
1. Verify variables are set in Vercel dashboard (Project Settings → Environment Variables)
2. Check variable names match exactly (case-sensitive)
3. For Vite apps, variables MUST start with `VITE_`
4. Redeploy after adding/changing environment variables

---

## 📊 Monitoring & Logs

### View Logs

1. **Vercel Dashboard** → Select Project → **Deployments** → Click on deployment
2. Click **Functions** tab to see serverless function logs
3. Click **Build Logs** to see build output

### Set Up Error Monitoring (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/node @sentry/react
```

Add to `backend/src/server.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `master` branch:

- **Production:** Push to `master` → Auto-deploys to production
- **Preview:** Create PR → Auto-deploys to preview URL
- **Rollback:** Vercel Dashboard → Deployments → Click "Promote to Production" on any previous deployment

### Branch Strategy

```bash
main/master     → Production (all 3 projects)
develop         → Staging (optional)
feature/*       → Preview deployments
```

---

## 💰 Cost Estimates

### Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ⚠️ 10s function timeout
- ⚠️ No team collaboration

### Pro Tier ($20/month)
- ✅ Everything in Hobby
- ✅ 60s function timeout
- ✅ Team collaboration
- ✅ Advanced analytics
- ✅ Password protection

---

## 🔒 Security Best Practices

1. **Rotate Secrets Regularly**
   - Change `JWT_SECRET` every 90 days
   - Rotate API keys quarterly

2. **Use Environment Variables**
   - Never commit secrets to Git
   - Use Vercel's encrypted environment variables

3. **Enable Rate Limiting**
   - Already configured in the app
   - Monitor for abuse in Vercel Analytics

4. **HTTPS Only**
   - Vercel provides automatic HTTPS
   - Enforce HTTPS in production (already configured)

5. **Database Security**
   - Use Supabase RLS (Row Level Security)
   - Enable connection pooling
   - Regular backups (Supabase auto-backups)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/hosting/vercel)
- [Stripe + Vercel Guide](https://vercel.com/guides/getting-started-with-stripe-on-vercel)

---

## 🆘 Support

If you encounter issues:

1. Check Vercel function logs (Deployments → Functions tab)
2. Review build logs (Deployments → Build Logs tab)
3. Verify environment variables are set correctly
4. Test API endpoints with Postman/curl
5. Check Supabase database connection in logs

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain (e.g., `app.barrengroundcoffee.com`)
   - Update environment variables with new domain

2. **Email Templates**
   - Customize email templates in `backend/src/templates/emailTemplates.ts`
   - Add your branding and logo

3. **Analytics**
   - Enable Vercel Analytics (free with Pro)
   - Or integrate Google Analytics

4. **Monitoring**
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Configure Vercel notifications for failed deployments

5. **Performance**
   - Enable Vercel Edge Network (automatic)
   - Configure caching headers
   - Optimize images with Vercel Image Optimization

---

**🎉 Congratulations!** Your Barren Ground Coffee ordering system is now live on Vercel!
