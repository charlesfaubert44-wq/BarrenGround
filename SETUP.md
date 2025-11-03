# Barren Ground Coffee - Setup Guide

This guide will help you set up and run the Barren Ground Coffee ordering system locally.

## Prerequisites

Make sure you have the following installed:
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Stripe Account** for payment processing (test mode)

## Step 1: Database Setup

### 1.1 Create Database

Open your PostgreSQL client (psql, pgAdmin, or any tool) and create the database:

```sql
CREATE DATABASE barrenground;
```

### 1.2 Run Schema

Navigate to the backend directory and run the schema file:

```bash
# Connect to PostgreSQL
psql -U postgres -d barrenground

# Run the schema
\i backend/src/config/schema.sql

# Or if the above doesn't work, use:
psql -U postgres -d barrenground -f backend/src/config/schema.sql
```

This will create all tables and add sample menu items.

### 1.3 Verify Database

```sql
# Connect to the database
\c barrenground

# List tables
\dt

# Check menu items
SELECT * FROM menu_items;
```

You should see 7 sample menu items.

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

The `.env` file is already created. Update these values:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barrenground
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
JWT_SECRET=barrenground_secret_change_in_production_2025
FRONTEND_URL=http://localhost:5173
EMPLOYEE_DASHBOARD_URL=http://localhost:5174
NODE_ENV=development
```

**Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password
- Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- For webhook secret, you'll set this up later with Stripe CLI

### 2.3 Start Backend Server

```bash
npm run dev
```

The server should start on `http://localhost:3000`. You should see:
```
Server running on port 3000
Database connected
```

### 2.4 Test the API

Open your browser or use curl:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}

curl http://localhost:3000/api/menu
# Should return menu items
```

## Step 3: Customer Frontend Setup

### 3.1 Install Dependencies

Open a new terminal:

```bash
cd customer-frontend
npm install
```

### 3.2 Configure Environment

The `.env` file is already created. Update:

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

Get your publishable key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

### 3.3 Start Customer Frontend

```bash
npm run dev
```

The app should start on `http://localhost:5173`.

### 3.4 Test the Frontend

1. Open `http://localhost:5173` in your browser
2. Navigate to Menu - you should see coffee and pastries
3. Try registering a new account
4. Add items to cart

## Step 4: Employee Dashboard Setup

### 4.1 Install Dependencies

Open a new terminal:

```bash
cd employee-dashboard
npm install
```

### 4.2 Configure Environment

The `.env` file is already created:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

No changes needed unless you changed the backend port.

### 4.3 Start Employee Dashboard

```bash
npm run dev
```

The dashboard should start on `http://localhost:5174`.

### 4.4 Test the Dashboard

1. Open `http://localhost:5174` in your browser
2. You'll see the login page (authentication not fully wired yet)
3. Navigate to Menu Management to see all menu items

## Step 5: Stripe Webhooks (Optional for Local Testing)

To test payment webhooks locally, you need the Stripe CLI.

### 5.1 Install Stripe CLI

- **macOS**: `brew install stripe/stripe-cli/stripe`
- **Windows**: Download from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases)
- **Linux**: See [Stripe CLI docs](https://stripe.com/docs/stripe-cli)

### 5.2 Login to Stripe

```bash
stripe login
```

### 5.3 Forward Webhooks

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

This will give you a webhook signing secret like `whsec_...`. Update your backend `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_CLI
```

Restart the backend server.

## Testing the Complete Flow

### 1. Create an Account
- Go to http://localhost:5173
- Click Register
- Fill in your details
- You should be logged in and redirected to the menu

### 2. Place an Order
- Add items to your cart
- Go to Cart
- Proceed to Checkout
- (Checkout with Stripe is partially implemented)

### 3. View Orders (Employee Dashboard)
- Go to http://localhost:5174
- Login (you'll need to create an employee account through the backend API or database)
- See orders in the queue
- Update order status

## Creating an Employee Account

Since the employee dashboard requires authentication, you need to create an employee user. You can do this via the API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@barrenground.com",
    "password": "employee123",
    "name": "Employee User"
  }'
```

Save the token returned, then use it to access employee endpoints.

## Troubleshooting

### Database Connection Errors

```
Error: connect ECONNREFUSED
```

**Solution:** Make sure PostgreSQL is running and the DATABASE_URL is correct.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Kill the process using the port or change the PORT in .env.

### Stripe Errors

```
Error: No API key provided
```

**Solution:** Make sure STRIPE_SECRET_KEY is set in backend/.env.

### CORS Errors in Browser

```
Access to fetch blocked by CORS policy
```

**Solution:** Make sure the backend CORS configuration includes your frontend URLs.

## Next Steps

Now that everything is set up:

1. **Implement Stripe Checkout** in the customer frontend
2. **Add WebSocket** real-time updates to employee dashboard
3. **Complete order tracking** for customers
4. **Add email notifications**
5. **Deploy to production**

## Development Commands

### Backend
```bash
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
```

### Customer Frontend
```bash
cd customer-frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Employee Dashboard
```bash
cd employee-dashboard
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

```
┌─────────────────────┐
│  Customer Frontend  │  (React + Vite)
│  localhost:5173     │  - Menu browsing
└──────────┬──────────┘  - Shopping cart
           │             - Checkout
           │             - Order tracking
           ▼
┌─────────────────────┐
│   Backend API       │  (Node.js + Express)
│   localhost:3000    │  - Authentication
└──────────┬──────────┘  - Order management
           │             - Payment processing
           │             - WebSocket server
           │
           ├─────────────────────┐
           ▼                     ▼
┌─────────────────────┐   ┌──────────────┐
│ Employee Dashboard  │   │  PostgreSQL  │
│ localhost:5174      │   │  Database    │
└─────────────────────┘   └──────────────┘
  - Order queue
  - Menu management
  - Analytics
```

## Support

For issues or questions, refer to the [main README](README.md) or check the design document in `docs/plans/`.
