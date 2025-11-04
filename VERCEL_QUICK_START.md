# ⚡ Vercel Quick Start - Deploy in 10 Minutes

## Prerequisites Check ✓

- [ ] GitHub account connected to Vercel
- [ ] Supabase database URL ready
- [ ] Stripe API keys (test mode is fine)

---

## 🚀 Deploy All 3 Projects

### Via Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend API
cd backend
vercel --prod
# ✅ Copy the deployment URL (e.g., barrenground-api.vercel.app)

# Deploy customer frontend
cd ../customer-frontend
vercel --prod
# ✅ Copy the deployment URL

# Deploy employee dashboard
cd ../employee-dashboard
vercel --prod
# ✅ Copy the deployment URL
```

---

## 🔐 Add Environment Variables (Required!)

### Backend API
Go to: Vercel Dashboard → barrenground-api → Settings → Environment Variables

**Add these (minimum required):**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=change-this-to-random-256-bit-secret
STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=https://your-customer-frontend.vercel.app
EMPLOYEE_DASHBOARD_URL=https://your-employee-dashboard.vercel.app
NODE_ENV=production
```

**Redeploy after adding variables!**

### Customer Frontend
Go to: Vercel Dashboard → barrenground-customer → Settings → Environment Variables

```env
VITE_API_URL=https://your-backend-api.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**Redeploy after adding variables!**

### Employee Dashboard
Go to: Vercel Dashboard → barrenground-employee → Settings → Environment Variables

```env
VITE_API_URL=https://your-backend-api.vercel.app
```

**Redeploy after adding variables!**

---

## ✅ Verify Deployment

1. **Backend health check:**
   ```bash
   curl https://your-backend-api.vercel.app/health
   # Should return: {"status":"ok"}
   ```

2. **Customer site:** Visit in browser
   - Menu should load
   - No CORS errors in console

3. **Employee dashboard:** Visit in browser
   - Login page loads

---

## 🐛 If Something Breaks

### CORS Errors?
- Make sure `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` in backend match EXACT deployment URLs
- No trailing slashes!
- Redeploy backend after fixing

### Database Connection Fails?
- Double-check `DATABASE_URL` from Supabase
- Run migrations: See `RUN_MIGRATIONS_MANUAL.md`

### Build Errors?
- Run `npm run build` locally first to catch errors
- Check Node version matches `.nvmrc` (20.10.0)

---

## 📚 Full Guide

For detailed configuration, troubleshooting, and advanced features:
👉 See `VERCEL_DEPLOYMENT_GUIDE.md`

---

**That's it!** Your app is now live on Vercel 🎉

URLs will be:
- API: `https://barrenground-api.vercel.app`
- Customer: `https://barrenground-customer.vercel.app`
- Employee: `https://barrenground-employee.vercel.app`

(Actual names depend on what Vercel assigns or what you configure)
