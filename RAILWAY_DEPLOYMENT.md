# Railway Deployment Guide

This guide will walk you through deploying your Barren Ground Coffee ordering system to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Your GitHub repository pushed to GitHub
3. Stripe account with API keys

## Deployment Steps

### Step 1: Set Up Railway Project

1. Go to https://railway.app and log in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your `BarrenGround` repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database and provide a `DATABASE_URL` automatically

### Step 3: Deploy Backend

1. Click "+ New" → "GitHub Repo" → Select your repo again
2. Railway will detect it's a Node.js project
3. Set the **Root Directory** to `backend`
4. Add the following **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   STRIPE_SECRET_KEY=sk_live_your_live_key_or_sk_test_for_testing
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   JWT_SECRET=your_strong_random_secret_here
   FRONTEND_URL=https://your-customer-frontend.up.railway.app
   EMPLOYEE_DASHBOARD_URL=https://your-employee-dashboard.up.railway.app
   ```

   **Note:** For `DATABASE_URL`, click the "Variable Reference" button and select your Postgres database → `DATABASE_URL`

5. Click "Deploy"
6. Once deployed, note your backend URL (e.g., `https://backend-production-xxxx.up.railway.app`)

### Step 4: Deploy Customer Frontend

1. Click "+ New" → "GitHub Repo" → Select your repo again
2. Set the **Root Directory** to `customer-frontend`
3. Add the following **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_or_pk_test_for_testing
   ```

4. Click "Deploy"
5. Once deployed, note your customer frontend URL

### Step 5: Deploy Employee Dashboard

1. Click "+ New" → "GitHub Repo" → Select your repo again
2. Set the **Root Directory** to `employee-dashboard`
3. Add the following **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   VITE_WS_URL=wss://your-backend-url.up.railway.app
   ```

4. Click "Deploy"
5. Once deployed, note your employee dashboard URL

### Step 6: Update Backend Environment Variables

Now that you have the frontend URLs, go back to your **Backend service** and update:
```
FRONTEND_URL=https://your-actual-customer-frontend-url.up.railway.app
EMPLOYEE_DASHBOARD_URL=https://your-actual-employee-dashboard-url.up.railway.app
```

The backend will automatically redeploy with the updated CORS settings.

### Step 7: Set Up Stripe Webhooks

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Enter your webhook URL: `https://your-backend-url.up.railway.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add it to your Backend's `STRIPE_WEBHOOK_SECRET` environment variable in Railway

### Step 8: Initialize Database

The database tables need to be created. You have two options:

**Option A: Use Railway's PostgreSQL Query Editor**
1. Click on your PostgreSQL database in Railway
2. Go to the "Query" tab
3. Copy the SQL schema from `backend/src/config/schema.sql` and run it

**Option B: Connect locally and run migrations**
1. In Railway, click your PostgreSQL database
2. Click "Connect" and copy the connection string
3. Run locally: `psql "your-connection-string" -f backend/src/config/schema.sql`

## Your Deployed URLs

After deployment, you'll have:

- **Customer Frontend**: `https://customer-frontend-production-xxxx.up.railway.app`
- **Employee Dashboard**: `https://employee-dashboard-production-xxxx.up.railway.app`
- **Backend API**: `https://backend-production-xxxx.up.railway.app`

## Environment Variables Summary

### Backend
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=https://customer-frontend-production-xxxx.up.railway.app
EMPLOYEE_DASHBOARD_URL=https://employee-dashboard-production-xxxx.up.railway.app
```

### Customer Frontend
```env
VITE_API_URL=https://backend-production-xxxx.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### Employee Dashboard
```env
VITE_API_URL=https://backend-production-xxxx.up.railway.app
VITE_WS_URL=wss://backend-production-xxxx.up.railway.app
```

## Troubleshooting

### Build Failures

**Frontend build issues:**
- Check that all environment variables are set correctly
- Make sure the root directory is set to the correct folder
- Check the build logs for specific errors

**Backend issues:**
- Ensure DATABASE_URL is connected to the Postgres service
- Verify all required environment variables are set
- Check that the start command is correct: `npm run start`

### CORS Errors

If you see CORS errors:
1. Verify the backend's `FRONTEND_URL` and `EMPLOYEE_DASHBOARD_URL` match your actual deployed frontend URLs
2. Make sure there are no trailing slashes in the URLs
3. Redeploy the backend after updating environment variables

### Database Connection Issues

- Ensure the PostgreSQL service is running
- Verify the DATABASE_URL reference is correct
- Check that the database tables were created successfully

### WebSocket Connection Issues

- Make sure `VITE_WS_URL` uses `wss://` (secure WebSocket) not `ws://`
- Verify the URL points to your backend service
- Check browser console for connection errors

## Custom Domains (Optional)

To add custom domains:
1. Click on your service in Railway
2. Go to "Settings" → "Domains"
3. Click "Generate Domain" or "Custom Domain"
4. Follow the DNS configuration instructions

## Monitoring

Railway provides built-in monitoring:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments

Access these by clicking on each service in your Railway dashboard.

## Costs

Railway pricing (as of 2024):
- $5 of free credit per month
- Pay-as-you-go after free credit
- Typical cost for this stack: ~$10-20/month depending on usage

## Next Steps

1. Test the complete order flow
2. Create an employee account in the database
3. Test payment processing with Stripe test cards
4. Monitor logs for any errors
5. Set up custom domains if desired
6. Switch to Stripe live keys when ready for production

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check your application logs in Railway dashboard
