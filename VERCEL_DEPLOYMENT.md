# Vercel Deployment Guide

This guide will walk you through deploying your Barren Ground Coffee ordering system to Vercel with polling-based real-time updates.

## Architecture

The application has been optimized for Vercel's serverless platform:
- **Backend**: Express API running on Vercel serverless functions
- **Customer Frontend**: React/Vite SPA
- **Employee Dashboard**: React/Vite SPA with 5-second polling
- **Database**: PostgreSQL (use Vercel Postgres or external provider)
- **Real-time Updates**: Polling-based (no WebSockets needed)

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your GitHub repository pushed to GitHub
3. Stripe account with API keys
4. PostgreSQL database (Vercel Postgres, Supabase, or Neon)

## Deployment Steps

### Step 1: Set Up PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Name it `barrenground-db`
4. Copy the connection string

**Option B: External Provider (Supabase/Neon)**
1. Sign up at https://supabase.com or https://neon.tech
2. Create a new PostgreSQL database
3. Copy the connection string

### Step 2: Initialize Database Schema

Connect to your database and run the schema:

```bash
psql "your-connection-string" -f backend/src/config/schema.sql
```

Or use your database provider's SQL editor to run the contents of `backend/src/config/schema.sql`.

### Step 3: Deploy Backend API

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Project Name**: `barrenground-backend`
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_connection_string
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
   STRIPE_WEBHOOK_SECRET=whsec_... (configure after deployment)
   JWT_SECRET=your_strong_random_secret_here
   FRONTEND_URL=https://your-customer-app.vercel.app
   EMPLOYEE_DASHBOARD_URL=https://your-employee-app.vercel.app
   ```

5. Click **Deploy**
6. Note your backend URL (e.g., `https://barrenground-backend.vercel.app`)

### Step 4: Deploy Customer Frontend

1. Click "Add New Project" in Vercel
2. Import the same GitHub repository
3. Configure the project:
   - **Project Name**: `barrenground-customer`
   - **Root Directory**: `customer-frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
   ```

5. Click **Deploy**
6. Note your customer frontend URL

### Step 5: Deploy Employee Dashboard

1. Click "Add New Project" in Vercel
2. Import the same GitHub repository
3. Configure the project:
   - **Project Name**: `barrenground-employee`
   - **Root Directory**: `employee-dashboard`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

5. Click **Deploy**
6. Note your employee dashboard URL

### Step 6: Update Backend CORS Settings

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update these variables with your actual frontend URLs:
   ```
   FRONTEND_URL=https://your-actual-customer-url.vercel.app
   EMPLOYEE_DASHBOARD_URL=https://your-actual-employee-url.vercel.app
   ```
4. Redeploy the backend (Deployments → click "..." → Redeploy)

### Step 7: Set Up Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Enter: `https://your-backend.vercel.app/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to backend environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
7. Redeploy the backend

## Your Deployed URLs

After deployment, you'll have:

- **Customer Frontend**: `https://barrenground-customer.vercel.app`
- **Employee Dashboard**: `https://barrenground-employee.vercel.app`
- **Backend API**: `https://barrenground-backend.vercel.app`

## Environment Variables Summary

### Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=https://barrenground-customer.vercel.app
EMPLOYEE_DASHBOARD_URL=https://barrenground-employee.vercel.app
```

### Customer Frontend
```env
VITE_API_URL=https://barrenground-backend.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### Employee Dashboard
```env
VITE_API_URL=https://barrenground-backend.vercel.app
```

## How Real-Time Updates Work

Since Vercel serverless functions don't support WebSockets, we use **polling**:

### Customer Frontend
- **Order tracking page**: Polls every 10 seconds for order status updates
- Fast enough for good UX, minimal bandwidth usage

### Employee Dashboard
- **Order queue**: Polls every 5 seconds for new orders
- Plays notification sound when new orders arrive
- Auto-refresh indicator shows polling is active

## Polling Performance

- **Bandwidth**: ~1-2 KB per request
- **Latency**: 5-10 second update delay
- **Cost**: Free tier covers ~100k requests/month
- **UX**: Smooth and responsive for this use case

## Troubleshooting

### Build Failures

**TypeScript errors**:
- All TypeScript errors have been fixed
- If you see new ones, check that dependencies are installed

**Environment variables missing**:
- Verify all variables are set in Vercel dashboard
- Check for typos in variable names

### CORS Errors

If you see CORS errors in browser console:
1. Verify backend's `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` match actual URLs
2. Remove trailing slashes from URLs
3. Redeploy backend after updating variables

### Database Connection Issues

**Connection timeout**:
- Vercel Postgres: Check that database is in same region
- External DB: Verify connection string is correct
- Check database allows connections from `0.0.0.0/0` (or Vercel IPs)

**SSL errors**:
- Add `?sslmode=require` to connection string
- Or use `ssl: { rejectUnauthorized: false }` for development

### Stripe Webhook Failures

**Webhook not receiving events**:
1. Check webhook URL is correct
2. Verify endpoint is publicly accessible
3. Check Stripe dashboard → Webhooks → Recent deliveries for errors
4. Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Polling Not Working

**Employee dashboard not updating**:
- Check browser console for API errors
- Verify `VITE_API_URL` is correct
- Check network tab - should see requests every 5 seconds

**Customer tracking not updating**:
- Same checks as above
- Poll interval is 10 seconds

## Custom Domains (Optional)

To add custom domains:

1. Go to project Settings → Domains
2. Add your domain (e.g., `order.barrengroundcoffee.com`)
3. Configure DNS records as shown:
   - **Type**: CNAME
   - **Name**: order (or @)
   - **Value**: cname.vercel-dns.com
4. Wait for DNS propagation (5-30 minutes)
5. Update environment variables with new domains
6. Redeploy all projects

## Monitoring

Vercel provides built-in monitoring:

### Analytics
- Project → Analytics
- View page views, unique visitors, top pages

### Logs
- Project → Deployments → View Function Logs
- Real-time logs for debugging

### Performance
- Project → Speed Insights (if enabled)
- Core Web Vitals metrics

## Costs

Vercel pricing:
- **Hobby (Free)**:
  - 100 GB bandwidth/month
  - 100 GB-hours serverless function execution
  - Perfect for development and small businesses

- **Pro ($20/month)**:
  - 1 TB bandwidth
  - 1000 GB-hours execution
  - Team collaboration features
  - Recommended for production

## Scaling

The polling architecture scales well:
- **Customers**: Frontend is static, infinite scale
- **Employees**: 5s polling = 720 requests/hour per employee
- **Backend**: Serverless auto-scales with traffic

For 10 employees + 100 orders/day:
- ~10k requests/day
- Well within free tier limits

## Production Checklist

- [ ] All three apps deployed successfully
- [ ] Environment variables configured
- [ ] Database initialized with schema
- [ ] Stripe webhooks configured and tested
- [ ] Test complete order flow end-to-end
- [ ] Create employee account in database
- [ ] Test payment with Stripe test cards
- [ ] Verify polling works on both frontends
- [ ] Configure custom domains (optional)
- [ ] Switch to Stripe live keys
- [ ] Enable Vercel analytics
- [ ] Set up monitoring/alerts

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Report bugs in your repository

## Next Steps

1. Test the complete ordering flow
2. Create employee test accounts
3. Verify real-time updates work
4. Set up production Stripe keys
5. Configure custom domains
6. Monitor performance and costs

Enjoy your Vercel-deployed coffee ordering system! ☕
