# 🚀 Production Deployment Checklist

**Status:** Ready to Deploy
**Date Started:** November 4, 2025
**Target Platform:** Vercel (Recommended) + Supabase (Database)

---

## 📋 Pre-Deployment Checklist

### ✅ Code Status
- [x] All 8 core tasks completed
- [x] TypeScript types cleaned (0 `any` types)
- [x] Security hardening implemented
- [x] Test coverage: 70% backend, 60% frontend
- [x] Documentation complete and organized

### ⏳ Database Preparation
- [ ] **Supabase project created**
- [ ] **Database URL obtained**
- [ ] **All 5 migrations run** (see below)

### ⏳ Third-Party Services
- [ ] **Stripe account set up**
  - [ ] Test mode keys obtained
  - [ ] Production keys obtained (when ready)
  - [ ] Webhook endpoint configured
- [ ] **SendGrid account** (optional, for emails)
  - [ ] API key obtained
  - [ ] Sender email verified

### ⏳ Vercel Setup
- [ ] **Vercel account created**
- [ ] **GitHub repository** connected to Vercel
- [ ] **Vercel CLI installed**: `npm install -g vercel`

---

## 🗄️ STEP 1: Database Setup & Migrations

### 1.1 Create Supabase Database

1. **Go to:** https://supabase.com
2. **Create new project:**
   - Project name: `barrenground-coffee`
   - Database password: **SAVE THIS!** (min 16 chars)
   - Region: Choose closest to your users
3. **Get database URL:**
   - Go to: Project Settings → Database
   - Copy: Connection string (URI)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

**Status:** [ ] Complete

---

### 1.2 Run All Database Migrations

You need to run **5 migration scripts** in this order:

#### Migration 1: Base Schema
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Run the base schema
\i backend/src/config/schema.sql
```
**Status:** [ ] Complete

---

#### Migration 2: Promo & News Tables
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  -f backend/src/config/schema-promos.sql
```
**Status:** [ ] Complete

---

#### Migration 3: User Roles (Security)
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  -f backend/src/scripts/addUserRoles.sql
```
**Status:** [ ] Complete

---

#### Migration 4: Loyalty Points
```bash
# First, update the database URL in your .env
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

cd backend
npx ts-node src/scripts/migrateLoyalty.ts
```
**Status:** [ ] Complete

---

#### Migration 5: Order Scheduling
```bash
cd backend
npx ts-node src/scripts/migrateScheduling.ts
```
**Status:** [ ] Complete

---

#### Migration 6: Email Logging
```bash
cd backend
npx ts-node src/scripts/createEmailTables.ts
```
**Status:** [ ] Complete

---

### 1.3 Create Admin User

```sql
-- Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

-- First, register a user account through your app, then:
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Verify
SELECT id, email, role FROM users WHERE role = 'admin';
```

**Admin Email:** __________________ (fill in)

**Status:** [ ] Complete

---

## 🔐 STEP 2: Prepare Environment Variables

### 2.1 Generate Secrets

#### JWT Secret (REQUIRED - 32+ characters)
```bash
# Generate a secure JWT secret
openssl rand -base64 48
```
**Copy the output:** ________________________________________________

**Status:** [ ] Generated

---

#### Stripe Keys (REQUIRED for payments)

**Test Mode Keys:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_`): __________________________
3. Copy **Secret key** (starts with `sk_test_`): __________________________

**Production Keys** (when ready):
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_live_`): __________________________
3. Copy **Secret key** (starts with `sk_live_`): __________________________

**Status:** [ ] Test keys obtained | [ ] Production keys obtained

---

#### SendGrid API Key (OPTIONAL - for emails)

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Create new API key
3. Copy key (starts with `SG.`): __________________________
4. Verify sender email

**Status:** [ ] API key obtained | [ ] Skipping (using mock email mode)

---

### 2.2 Environment Variables Template

Create a secure note with these filled in:

```env
# ============================================
# BACKEND ENVIRONMENT VARIABLES
# ============================================

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Security (REQUIRED)
JWT_SECRET=[YOUR-48-CHAR-SECRET-FROM-ABOVE]
NODE_ENV=production

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_[YOUR-KEY]
STRIPE_WEBHOOK_SECRET=whsec_[GET-THIS-AFTER-WEBHOOK-SETUP]

# CORS Origins (REQUIRED - will update after Vercel deployment)
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app

# Email (OPTIONAL)
SENDGRID_API_KEY=SG.[YOUR-KEY]
FROM_EMAIL=orders@yourdomain.com
EMAIL_FROM_NAME=Barren Ground Coffee

# ============================================
# CUSTOMER FRONTEND VARIABLES
# ============================================

VITE_API_URL=https://barrenground-api.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR-KEY]

# ============================================
# EMPLOYEE DASHBOARD VARIABLES
# ============================================

VITE_API_URL=https://barrenground-api.vercel.app
```

**Status:** [ ] Template prepared with all values

---

## 🚀 STEP 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

**Status:** [ ] Installed

---

### 3.2 Login to Vercel

```bash
vercel login
```

**Status:** [ ] Logged in

---

### 3.3 Deploy Backend API

```bash
cd backend

# Deploy to production
vercel --prod

# Follow the prompts:
# - Link to existing project? No
# - Project name: barrenground-api (or your choice)
# - Deploy? Yes
```

**Backend URL:** https://__________________________________.vercel.app

**Status:** [ ] Deployed (initial)

---

### 3.4 Add Backend Environment Variables

1. **Go to:** https://vercel.com/dashboard
2. **Select:** Your backend project (barrenground-api)
3. **Go to:** Settings → Environment Variables
4. **Add ALL backend variables** from your template above
5. **Important:** Copy the exact URLs after deployment and update:
   - `FRONTEND_URL`
   - `EMPLOYEE_DASHBOARD_URL`

**Status:** [ ] Variables added

---

### 3.5 Redeploy Backend

```bash
# In backend directory
vercel --prod
```

**Status:** [ ] Redeployed with env vars

---

### 3.6 Test Backend Health

```bash
curl https://[YOUR-BACKEND-URL].vercel.app/api/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

**Status:** [ ] Backend health check passed

---

### 3.7 Deploy Customer Frontend

```bash
cd ../customer-frontend

# Deploy to production
vercel --prod

# Follow the prompts:
# - Link to existing project? No
# - Project name: barrenground-customer
# - Deploy? Yes
```

**Customer Frontend URL:** https://__________________________________.vercel.app

**Status:** [ ] Deployed (initial)

---

### 3.8 Add Customer Frontend Variables

1. **Go to:** Vercel Dashboard → barrenground-customer
2. **Settings → Environment Variables**
3. **Add:**
   ```
   VITE_API_URL=https://[YOUR-BACKEND-URL].vercel.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR-KEY]
   ```

**Status:** [ ] Variables added

---

### 3.9 Redeploy Customer Frontend

```bash
# In customer-frontend directory
vercel --prod
```

**Status:** [ ] Redeployed with env vars

---

### 3.10 Deploy Employee Dashboard

```bash
cd ../employee-dashboard

# Deploy to production
vercel --prod

# Project name: barrenground-employee
```

**Employee Dashboard URL:** https://__________________________________.vercel.app

**Status:** [ ] Deployed (initial)

---

### 3.11 Add Employee Dashboard Variables

1. **Go to:** Vercel Dashboard → barrenground-employee
2. **Settings → Environment Variables**
3. **Add:**
   ```
   VITE_API_URL=https://[YOUR-BACKEND-URL].vercel.app
   ```

**Status:** [ ] Variables added

---

### 3.12 Redeploy Employee Dashboard

```bash
# In employee-dashboard directory
vercel --prod
```

**Status:** [ ] Redeployed with env vars

---

### 3.13 Update Backend CORS URLs

**CRITICAL:** Now that you have the real frontend URLs, update the backend:

1. **Go to:** Vercel Dashboard → barrenground-api
2. **Settings → Environment Variables**
3. **Update:**
   ```
   FRONTEND_URL=https://[ACTUAL-CUSTOMER-URL].vercel.app
   EMPLOYEE_DASHBOARD_URL=https://[ACTUAL-EMPLOYEE-URL].vercel.app
   ```
4. **NO TRAILING SLASHES!**
5. **Redeploy backend:**
   ```bash
   cd backend
   vercel --prod
   ```

**Status:** [ ] CORS URLs updated and backend redeployed

---

## 🧪 STEP 4: Testing & Verification

### 4.1 Backend API Tests

```bash
# Health check
curl https://[YOUR-BACKEND-URL].vercel.app/api/health

# Menu endpoint
curl https://[YOUR-BACKEND-URL].vercel.app/api/menu

# Both should return valid JSON without errors
```

**Status:** [ ] API endpoints working

---

### 4.2 Customer Frontend Tests

**Open:** https://[YOUR-CUSTOMER-URL].vercel.app

- [ ] **Homepage loads** without errors
- [ ] **Menu page loads** with items
- [ ] **No CORS errors** in browser console (F12)
- [ ] **Cart functionality** works
- [ ] **Login/Register** pages load
- [ ] **Checkout page** loads

**Status:** [ ] Customer frontend working

---

### 4.3 Employee Dashboard Tests

**Open:** https://[YOUR-EMPLOYEE-URL].vercel.app

- [ ] **Login page loads**
- [ ] **Can login with admin account**
- [ ] **Order queue** displays
- [ ] **Menu management** loads
- [ ] **No CORS errors** in console

**Status:** [ ] Employee dashboard working

---

### 4.4 End-to-End Test: Place an Order

**Complete User Flow:**

1. [ ] Go to customer frontend
2. [ ] Browse menu
3. [ ] Add items to cart
4. [ ] Register a new account
5. [ ] Complete checkout with Stripe test card
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
6. [ ] Verify order confirmation
7. [ ] Check employee dashboard for new order
8. [ ] Update order status
9. [ ] Verify status update appears on customer order tracking

**Status:** [ ] End-to-end flow successful

---

### 4.5 Test Loyalty Points

1. [ ] Place an order (logged in)
2. [ ] Verify points awarded (1 point per $1)
3. [ ] Go to loyalty page
4. [ ] Check points balance displays
5. [ ] Try redeeming points at checkout

**Status:** [ ] Loyalty system working

---

### 4.6 Test Order Scheduling

1. [ ] Go to menu and add items
2. [ ] At checkout, select future time (tomorrow)
3. [ ] Verify time slots appear
4. [ ] Complete order
5. [ ] Check employee dashboard shows scheduled order

**Status:** [ ] Scheduling working

---

### 4.7 Test Email Notifications

**If SendGrid configured:**

1. [ ] Place order
2. [ ] Check email for order confirmation
3. [ ] Check Supabase `email_logs` table
4. [ ] Verify emails are being sent/logged

**If using mock mode:**

1. [ ] Check Vercel logs for email mock output
2. [ ] Verify `email_logs` table is populated

**Status:** [ ] Emails working | [ ] Skipped (mock mode)

---

## 🔒 STEP 5: Security Verification

### 5.1 Environment Security

- [ ] **JWT_SECRET is strong** (32+ characters, random)
- [ ] **Database password is strong** (16+ characters)
- [ ] **No secrets in Git** (check `.gitignore`)
- [ ] **Environment variables only in Vercel** (not in code)

**Status:** [ ] Security verified

---

### 5.2 HTTPS Verification

- [ ] **All URLs use HTTPS** (Vercel does this automatically)
- [ ] **No mixed content warnings** in browser console
- [ ] **Cookies are Secure** (check browser dev tools)

**Status:** [ ] HTTPS working

---

### 5.3 Rate Limiting Test

Try to login with wrong password 6 times:

- [ ] **After 5 failed attempts**, should be rate limited
- [ ] **Error message** displays rate limit warning

**Status:** [ ] Rate limiting working

---

### 5.4 Authorization Test

Try to access admin endpoints without permission:

1. [ ] Logout from employee dashboard
2. [ ] Try to access: `https://[BACKEND-URL]/api/menu` (POST request)
3. [ ] Should get `401 Unauthorized`

**Status:** [ ] Authorization working

---

## 📊 STEP 6: Monitoring Setup

### 6.1 Vercel Analytics

1. [ ] **Enable Vercel Analytics** for all 3 projects
2. [ ] **Check logs** in Vercel dashboard
3. [ ] **Set up alerts** for errors (optional)

**Status:** [ ] Monitoring enabled

---

### 6.2 Database Monitoring

1. [ ] **Go to:** Supabase Dashboard → Database
2. [ ] **Check:** Database size, connections
3. [ ] **Enable:** Database backups (automatic in Supabase)

**Status:** [ ] Database monitored

---

### 6.3 Stripe Monitoring

1. [ ] **Go to:** Stripe Dashboard → Developers → Webhooks
2. [ ] **Add webhook endpoint:**
   - URL: `https://[YOUR-BACKEND-URL].vercel.app/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. [ ] **Copy webhook secret** and add to backend env vars
4. [ ] **Redeploy backend**

**Webhook Secret:** whsec___________________________________

**Status:** [ ] Stripe webhooks configured

---

## 🎉 STEP 7: Go Live Checklist

### 7.1 Final Verification

- [ ] **All 3 apps deployed** and accessible
- [ ] **All environment variables** set correctly
- [ ] **Database migrations** completed
- [ ] **Admin user** created
- [ ] **End-to-end test** passed
- [ ] **No console errors** in browser
- [ ] **CORS configured** correctly
- [ ] **HTTPS working** on all URLs
- [ ] **Rate limiting** active
- [ ] **Stripe test payments** working
- [ ] **Email system** working (or mock mode confirmed)

**Status:** [ ] Ready to go live

---

### 7.2 Share URLs

**Your Production URLs:**

- **Customer Site:** https://__________________________________.vercel.app
- **Employee Dashboard:** https://__________________________________.vercel.app
- **API:** https://__________________________________.vercel.app

---

### 7.3 Next Steps After Launch

1. [ ] **Monitor Vercel logs** for first 24 hours
2. [ ] **Check error rates** in Vercel Analytics
3. [ ] **Monitor database performance** in Supabase
4. [ ] **Test on mobile devices**
5. [ ] **Share with beta testers** (if available)
6. [ ] **Collect feedback**
7. [ ] **Switch to Stripe production keys** when ready
8. [ ] **Set up custom domain** (optional)

---

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
- Check `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` match exact deployment URLs
- No trailing slashes
- Redeploy backend after changes

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure all migrations ran successfully

**Build Errors:**
- Run `npm run build` locally first
- Check Node version matches (20.10.0)
- Review Vercel build logs

**Stripe Errors:**
- Verify publishable/secret keys match (test vs production)
- Check webhook secret is configured
- Ensure webhook endpoint is accessible

---

## 📚 Additional Resources

- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Detailed troubleshooting
- [Security Verification](docs/security/SECURITY_VERIFICATION_CHECKLIST.md) - Security testing
- [API Reference](backend/API_REFERENCE.md) - All endpoints documented
- [Testing Guide](docs/setup/TESTING_QUICK_START.md) - Run tests

---

## ✅ Deployment Complete!

**Deployed by:** ___________________
**Deployment Date:** ___________________
**Production URLs Saved:** [ ] Yes

**Congratulations! Your Barren Ground Coffee ordering system is now live! ☕🚀**

---

**Next:** Monitor for 24-48 hours, collect feedback, and enjoy your production app!
