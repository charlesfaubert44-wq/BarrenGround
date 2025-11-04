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
- Customer Frontend on `http://localhost:8890`
- Employee Dashboard on `http://localhost:8889`

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

The customer frontend will run on `http://localhost:8890`

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

The employee dashboard will run on `http://localhost:8889`

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889
NODE_ENV=development
```

### Customer Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_WS_URL=ws://localhost:5000
```

### Employee Dashboard (.env)
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## Port Configuration

| Service | Port |
|---------|------|
| Backend API | 5000 |
| Customer Frontend | 8890 |
| Employee Dashboard | 8889 |
| PostgreSQL | 5432 |

## Features

### Customer Features
- Browse menu by category
- Add items to cart
- Guest and registered user checkout
- Stripe payment integration
- Order tracking
- User account with order history

### Employee Features
- Real-time order queue
- Order status management (received → preparing → ready → completed)
- Order history with search
- Menu item availability toggle
- Basic analytics dashboard

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
- ✅ PostgreSQL database connection
- ✅ Complete database schema with sample data
- ✅ JWT authentication system
- ✅ User registration and login endpoints
- ✅ Menu CRUD endpoints
- ✅ Order creation and management endpoints
- ✅ Order status tracking
- ✅ Stripe PaymentIntent creation
- ✅ Stripe webhook handler for payment confirmation
- ✅ Socket.io WebSocket server for real-time updates
- ✅ Input validation with express-validator
- ✅ CORS configuration

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
   - **Vercel (Recommended)**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
     - Deploy all 3 apps to Vercel
     - Polling-based real-time updates (5-10s)
     - Serverless, auto-scaling, free tier available
   - **Railway (Alternative)**: See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
     - Full-stack deployment with WebSocket support
     - Better for true real-time (sub-second updates)
     - Requires paid plan after free credits

## Documentation

- **Deployment Guides**:
  - [Vercel Deployment](VERCEL_DEPLOYMENT.md) - Serverless, polling-based
  - [Railway Deployment](RAILWAY_DEPLOYMENT.md) - Traditional hosting with WebSockets
- **Architecture**: [Design Document](docs/plans/2025-11-01-coffee-ordering-system-design.md)

## License

ISC
