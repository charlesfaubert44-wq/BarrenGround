# Barren Ground Coffee - Online Ordering System

An online ordering system for Barren Ground Coffee enabling customers to place pickup orders with full payment processing, and employees to manage orders in real-time.

## Project Structure

```
BarrenGround/
├── customer-frontend/     # Customer-facing React app
├── employee-dashboard/    # Employee order management app
├── backend/              # Node.js + Express API server
└── docs/                 # Documentation and design files
```

## Tech Stack

### Customer Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query (React Query)
- Zustand (state management)
- Stripe React library

### Employee Dashboard
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Socket.io-client (WebSocket)
- Recharts (analytics)

### Backend API
- Node.js + TypeScript
- Express
- PostgreSQL
- Socket.io (WebSocket server)
- Stripe SDK
- bcrypt + JWT (authentication)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Quick Start (Recommended)

```bash
# Install all dependencies
npm run install:all

# Set up environment files
# Copy .env.example to .env in each directory (backend, customer-frontend, employee-dashboard)

# Set up database (PostgreSQL must be running)
psql -U postgres -d postgres -f backend/src/config/schema.sql

# Start all services at once
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Customer Frontend on `http://localhost:5173` (Vite default)
- Employee Dashboard on `http://localhost:5174` (Vite default)

### Manual Setup (Individual Services)

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your database credentials and API keys

# Set up database (PostgreSQL must be running)
psql -U postgres -d postgres -f src/config/schema.sql

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 2. Customer Frontend Setup

```bash
cd customer-frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY, and VITE_WS_URL

# Start development server
npm run dev
```

The customer frontend will run on `http://localhost:5173`

#### 3. Employee Dashboard Setup

```bash
cd employee-dashboard

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update VITE_API_URL and VITE_WS_URL

# Start development server
npm run dev
```

The employee dashboard will run on `http://localhost:5174`

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:5173
EMPLOYEE_DASHBOARD_URL=http://localhost:5174
NODE_ENV=development
```

### Customer Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_WS_URL=ws://localhost:5000
# Vite dev server runs on port 5173 by default
```

### Employee Dashboard (.env)
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
# Vite dev server runs on port 5174 by default
```

## Port Configuration

| Service | Port |
|---------|------|
| Backend API | 5000 |
| Customer Frontend | 5173 (Vite) |
| Employee Dashboard | 5174 (Vite) |
| PostgreSQL | 5432 |

## Features

### Customer Features
- Browse menu by category
- Add items to cart with customizations
- Guest and registered user checkout
- Stripe payment integration
- **Loyalty Points System** - Earn and redeem points on purchases
- **Advanced Order Scheduling** - Schedule orders up to 7 days in advance
- Order tracking with real-time status updates
- User account with order history
- View active promotions and news
- Email notifications for order status

### Employee Features
- Real-time order queue with polling
- Order status management (received → preparing → ready → completed)
- **Scheduled Orders Management** - View and manage future orders
- Order history with advanced search
- **Full Menu CRUD** - Create, edit, delete menu items
- **Promo & News Management** - Create and manage promotions/announcements
- Menu item availability toggle
- Analytics dashboard with Recharts
- **Role-Based Access Control** - Admin-only features
- Email notification logs

## Development Status

✅ **COMPLETE - FULLY FUNCTIONAL MVP**

**Customer Frontend:**
- ✅ Project structure and routing
- ✅ Layout components with authentication
- ✅ Home page
- ✅ Menu page with cart functionality
- ✅ Shopping cart with persistence (Zustand)
- ✅ Authentication (Login, Register, Logout)
- ✅ Full Stripe checkout integration with payment form
- ✅ Order success page
- ✅ Order tracking page with real-time status updates
- ✅ Account page with order history
- ✅ Guest and registered user checkout

**Employee Dashboard:**
- ✅ Project structure and routing
- ✅ Dashboard layout with authentication
- ✅ Employee login/logout
- ✅ Order queue page with real API integration
- ✅ Menu management with availability toggle
- ✅ Order history with full order details
- ✅ WebSocket real-time updates for new orders
- ✅ Order status update workflow
- ✅ Live connection indicator
- ✅ Sound notifications for new orders

**Backend API:**
- ✅ Express server with TypeScript
- ✅ PostgreSQL database connection (Supabase-ready)
- ✅ Complete database schema with migrations
- ✅ JWT authentication system with Google OAuth
- ✅ User registration and login endpoints
- ✅ Menu CRUD endpoints (admin-protected)
- ✅ Order creation and management endpoints
- ✅ Order status tracking with polling
- ✅ **Loyalty points system** - Earn, redeem, transaction history
- ✅ **Advanced scheduling** - Business hours validation, future orders
- ✅ **Promo & News CRUD** - Full management with admin protection
- ✅ **Email notifications** - SendGrid integration (7 email types)
- ✅ **Security hardening** - Rate limiting, Helmet, HTTPS enforcement
- ✅ **Role-based authorization** - Admin/user separation
- ✅ Stripe PaymentIntent creation
- ✅ Stripe webhook handler for payment confirmation
- ✅ Polling endpoints for real-time updates (Vercel-compatible)
- ✅ Input validation with express-validator
- ✅ Input sanitization (XSS protection)
- ✅ CORS configuration
- ✅ **70% test coverage** - Jest + Supertest

## What's Working

The entire ordering flow is functional:

1. **Customer Journey:**
   - Browse menu and add items to cart
   - Register/login or checkout as guest
   - Enter payment details via Stripe
   - Receive order confirmation
   - Track order status in real-time

2. **Employee Journey:**
   - Login to dashboard
   - View incoming orders in real-time
   - Receive sound notifications for new orders
   - Update order status (received → preparing → ready → completed)
   - View order history
   - Manage menu item availability

3. **Real-Time Features:**
   - WebSocket connection between backend and employee dashboard
   - Instant order notifications
   - Live order status updates
   - Connection status indicator

## Ready for Testing

The system is ready for end-to-end testing with these components:
- Full payment processing (test mode)
- Real-time order management
- Complete order tracking
- Authentication and authorization
- Database persistence

## Next Steps for Production

1. **Testing:**
   - Test complete customer order flow
   - Test employee order management
   - Test payment processing with Stripe test cards
   - Test WebSocket reconnection
   - Mobile responsiveness testing

2. **Enhancements:**
   - Add email notifications (order confirmation, ready for pickup)
   - Implement analytics charts with Recharts
   - Add order search and filtering
   - Add pickup time validation
   - Implement order cancellation/refunds

3. **Deployment:**
   - **Vercel (Recommended)**:
     - Quick Start: See [VERCEL_QUICK_START.md](docs/deployment/VERCEL_QUICK_START.md)
     - Full Guide: See [VERCEL_DEPLOYMENT_GUIDE.md](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
     - Deploy all 3 apps to Vercel in 10 minutes
     - Polling-based real-time updates (5-10s)
     - Serverless, auto-scaling, free tier available
     - Database migrations: See [RUN_MIGRATIONS_MANUAL.md](docs/deployment/RUN_MIGRATIONS_MANUAL.md)

## Documentation

> **📖 Complete Documentation Index:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Full guide to all documentation

### Getting Started
- [Quick Start](docs/setup/QUICKSTART.md) - Fast setup guide
- [Setup Guide](docs/setup/SETUP.md) - Detailed setup instructions
- [Windows Setup](docs/setup/SETUP_WINDOWS.md) - Windows-specific instructions

### Deployment
- [Vercel Quick Start](docs/deployment/VERCEL_QUICK_START.md) - Deploy in 10 minutes
- [Vercel Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Complete configuration & troubleshooting
- [Railway Deployment](docs/deployment/RAILWAY_DEPLOYMENT.md) - Alternative hosting option
- [Database Migrations](docs/deployment/RUN_MIGRATIONS_MANUAL.md) - Production database setup
- [Supabase Setup](docs/deployment/SUPABASE_SETUP.md) - Database configuration

### Implementation Status
- [Implementation Complete](IMPLEMENTATION_COMPLETE.md) - All 8 tasks completed (Nov 4, 2025)
- [Security Implementation](docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md) - Security hardening details
- [Testing Implementation](docs/features/TESTING_IMPLEMENTATION_SUMMARY.md) - Test suite details
- [Scheduling Implementation](docs/features/SCHEDULING_IMPLEMENTATION_SUMMARY.md) - Order scheduling details
- [Email Implementation](docs/features/TASK_008_IMPLEMENTATION_SUMMARY.md) - Email notification details

### Backend Documentation
- [API Reference](backend/API_REFERENCE.md) - Complete API documentation
- [Testing Guide](backend/TESTING_GUIDE.md) - Running backend tests
- [Email Setup](backend/EMAIL_SETUP.md) - SendGrid configuration
- [Migration Guide](backend/MIGRATION_GUIDE.md) - Database migrations

### Configuration & Security
- [Backend Environment Variables](docs/setup/BACKEND_ENV_VARS.md) - Complete env var reference
- [Security Features](docs/security/SECURITY.md) - Security overview
- [Security Verification](docs/security/SECURITY_VERIFICATION_CHECKLIST.md) - Testing security
- [Stripe Setup](docs/setup/STRIPE_SETUP.md) - Payment integration
- [Get Stripe Keys](docs/setup/GET_STRIPE_KEYS.md) - Stripe credential guide

### Features
- [Membership Implementation](docs/features/MEMBERSHIP_IMPLEMENTATION.md) - Membership system details
- [Membership Demo](docs/features/MEMBERSHIP_DEMO.md) - Testing membership features
- [Employee Dashboard Features](docs/features/EMPLOYEE_DASHBOARD_FEATURES.md) - Dashboard capabilities

### Architecture & Design
- [Product Requirements](docs/plans/2025-11-01-coffee-ordering-system-prd.md) - PRD
- [System Design](docs/plans/2025-11-01-coffee-ordering-system-design.md) - Architecture
- [Design Guidelines](DESIGN_GUIDELINES.md) - UI/UX design system

## License

ISC
