# Barren Ground Coffee - Online Ordering System Design

**Date:** November 1, 2025
**Status:** Approved
**Architecture:** Separated Frontend + Backend

## Overview

An online ordering system for Barren Ground Coffee enabling customers to place pickup orders with full payment processing, and employees to manage orders in real-time.

### Core Requirements
- Customer ordering with menu browsing and cart
- Support for both registered users and guest checkout
- Full payment processing via Stripe
- Pickup-focused (delivery planned for future)
- Real-time order notifications for employees
- Order status tracking for customers

## System Architecture

### Three-Application Design

#### 1. Customer Frontend (React + Vite)
**Purpose:** Public-facing ordering interface

**Key Features:**
- Menu browsing with categories (coffee, pastries, etc.)
- Shopping cart with item customization
- Dual checkout flow: registered users and guests
- Stripe payment integration
- Order confirmation and status tracking
- User account management (order history, saved preferences)

**Tech Stack:**
- React 18 + Vite
- React Router for navigation
- TanStack Query for API state management
- Stripe React library (@stripe/react-stripe-js)
- Tailwind CSS for styling
- Zustand for cart state management

#### 2. Employee Dashboard (React + Vite)
**Purpose:** Internal order management interface

**Key Features:**
- Real-time order queue with notifications (sound + visual)
- Order management with status updates
- Order status workflow: received → preparing → ready → completed
- Daily order history with search
- Menu item availability toggle
- Basic analytics (orders per day, popular items)

**Tech Stack:**
- React 18 + Vite
- Socket.io-client for WebSocket connection
- TanStack Query for API calls
- Recharts for analytics visualization
- Tailwind CSS

#### 3. Backend API (Node.js + Express)
**Purpose:** Business logic, data persistence, payment processing

**Key Features:**
- RESTful API endpoints
- JWT authentication for registered users
- Guest checkout with email tracking
- Stripe payment processing
- WebSocket server for real-time updates
- PostgreSQL database integration

**Tech Stack:**
- Node.js 20+ with Express
- PostgreSQL 15+ with node-postgres (pg)
- Stripe SDK (stripe)
- Socket.io for WebSocket server
- bcrypt for password hashing
- jsonwebtoken for JWT tokens
- express-validator for input validation

## Database Schema

### Tables

```sql
-- Users (registered customers)
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Menu items
menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Orders
orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255) NOT NULL,
  tracking_token UUID,
  pickup_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  )
)

-- Order items (line items)
order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL,
  customizations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Indexes
- `users.email` (unique)
- `orders.user_id`
- `orders.tracking_token` (unique, for guest order lookup)
- `orders.status`
- `orders.created_at`
- `order_items.order_id`

## Data Flow

### Customer Order Flow

1. **Browse Menu**
   - GET `/api/menu` → Returns all available menu items
   - Frontend displays by category
   - Cart managed in client state (Zustand)

2. **Checkout Process**
   - Customer fills checkout form (name, email, phone, pickup time)
   - For registered users: pre-filled from account
   - For guests: manual entry required

3. **Payment Processing**
   ```
   Frontend                Backend                 Stripe
      |                       |                       |
      |--POST /api/orders---->|                       |
      |  (cart, customer)     |                       |
      |                       |--Create PaymentIntent->|
      |                       |<--client_secret-------|
      |<--client_secret-------|                       |
      |                       |                       |
      |--confirmPayment()----------------------------->|
      |<--payment confirmed---------------------------|
      |                       |                       |
      |                       |<--webhook: paid-------|
      |                       | (update order status) |
      |                       |--WebSocket broadcast->|
      |<--order confirmed-----|                       |
   ```

4. **Order Confirmation**
   - Frontend shows success page with order number
   - Backend sends confirmation email
   - Registered users: order saved to history
   - Guests: receive tracking link via email

### Employee Order Management Flow

1. **Dashboard Connection**
   - Employee logs in (JWT authentication)
   - WebSocket connection established
   - Loads current order queue (GET `/api/orders?status=received,preparing`)

2. **New Order Notification**
   - WebSocket event: `new_order`
   - Sound notification plays
   - Visual badge updates
   - Order appears in queue

3. **Order Processing**
   - Employee views order details
   - Updates status: received → preparing
   - PUT `/api/orders/:id/status`
   - WebSocket broadcasts update
   - When ready: preparing → ready
   - Customer can see status update on tracking page

4. **Order Completion**
   - Customer picks up order
   - Employee marks: ready → completed
   - Order moves to history

## Security Design

### Authentication Strategy

**Registered Users:**
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens stored in HTTP-only cookies
- Token expiration: 7 days
- Refresh token mechanism for extended sessions

**Guest Checkout:**
- No authentication required for order placement
- Unique tracking token (UUID) generated per order
- Token sent via email for order status lookup
- Token valid for 30 days

**Employee Dashboard:**
- Required authentication (JWT)
- Role-based access: `employee` or `admin`
- Admin can manage menu items
- Employee can only view/update orders

### Payment Security

**Stripe Integration:**
- Never store credit card numbers
- Use Stripe Elements for PCI-compliant card collection
- Payment processing happens client-side (Stripe.js)
- Backend creates PaymentIntent with order metadata
- Webhook validates payment completion before fulfilling order
- Store only `payment_intent_id` for refund capability

**Webhook Security:**
- Verify Stripe webhook signatures
- Use environment-specific webhook secrets
- Idempotent webhook handlers (handle duplicate events)

### API Security

- **CORS:** Whitelist only customer/employee frontend domains
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Input Validation:** express-validator on all endpoints
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Prevention:** Sanitize user inputs, proper Content-Type headers
- **HTTPS:** Required in production (enforced at reverse proxy)

## Real-Time Communication

### WebSocket Architecture (Socket.io)

**Events:**
- `new_order` - New order placed (broadcast to all employees)
- `order_updated` - Status changed (broadcast to all employees)
- `order_cancelled` - Order cancelled/refunded

**Connection Management:**
- Employees authenticate via JWT before connection
- Heartbeat/ping every 30s to detect disconnects
- Automatic reconnection with exponential backoff
- Fallback: polling every 30s if WebSocket fails

**Scalability Consideration:**
- For single-location coffee shop: single server sufficient
- Future: Redis adapter for Socket.io for multi-server scaling

## Order Status Workflow

```
pending → received → preparing → ready → completed
           ↓
        cancelled (any stage before completed)
```

**Status Definitions:**
- `pending` - Payment processing (temporary state)
- `received` - Payment confirmed, awaiting preparation
- `preparing` - Order being made
- `ready` - Ready for customer pickup
- `completed` - Customer picked up
- `cancelled` - Refunded or cancelled

## Error Handling

### Payment Failures
- Display clear error message to customer
- Do not create order record if payment fails
- Log error for investigation
- Suggest retry or alternative payment method

### Database Errors
- Return 500 Internal Server Error
- Log full error details server-side
- Show generic error to customer (don't expose internals)
- Implement transaction rollback for multi-step operations

### Out-of-Stock Handling
- Check item availability before creating order
- If unavailable: return 400 with item details
- Frontend removes unavailable items from cart
- Employee can toggle availability in dashboard

### Network/WebSocket Failures
- Frontend: Retry with exponential backoff
- WebSocket disconnect: Attempt reconnection
- Fallback to HTTP polling for order updates
- Show connection status indicator to employees

### Stripe Webhook Failures
- Stripe automatically retries failed webhooks
- Implement idempotent handlers (check if order already updated)
- Log all webhook events for debugging
- Manual reconciliation script for missed events

## Deployment Architecture

### Hosting Strategy

**Frontend Applications (Static):**
- Deploy to Vercel or Netlify
- Automatic HTTPS
- CDN distribution
- Environment-specific builds

**Backend API:**
- Deploy to Railway, Render, or DigitalOcean App Platform
- Auto-scaling based on load
- Health check endpoint: GET `/health`
- Rolling deployments (zero downtime)

**Database:**
- Managed PostgreSQL (Supabase, Railway, or AWS RDS)
- Automated backups (daily)
- Connection pooling enabled
- SSL connections required

### Environment Variables

**Backend:**
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=random_secure_string
FRONTEND_URL=https://barrengroundcoffee.com
EMPLOYEE_DASHBOARD_URL=https://admin.barrengroundcoffee.com
NODE_ENV=production
```

**Customer Frontend:**
```
VITE_API_URL=https://api.barrengroundcoffee.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

**Employee Dashboard:**
```
VITE_API_URL=https://api.barrengroundcoffee.com
VITE_WS_URL=wss://api.barrengroundcoffee.com
```

## Future Enhancements

### Phase 2 (Delivery Integration)
- Address validation and geocoding
- Delivery radius calculation
- Delivery fee calculation
- Driver assignment system
- Real-time delivery tracking

### Phase 3 (Advanced Features)
- Loyalty/rewards program
- Order scheduling (advance orders)
- Menu item customization builder
- Mobile apps (React Native)
- SMS notifications
- Email marketing integration
- Inventory management
- Sales reporting and analytics
- Multi-location support

## Testing Strategy

### Unit Tests
- Backend API endpoints (Jest + Supertest)
- Payment processing logic
- Authentication middleware
- Order status state machine

### Integration Tests
- End-to-end order flow
- Stripe webhook handling
- Database operations

### Manual Testing Checklist
- Guest checkout flow
- Registered user checkout flow
- Payment success/failure scenarios
- Real-time order notifications
- Order status updates
- Menu availability toggle
- Mobile responsiveness

## Success Criteria

**Must Have (MVP):**
- ✓ Customers can browse menu and add items to cart
- ✓ Guest and registered user checkout works
- ✓ Stripe payment processing completes successfully
- ✓ Employees receive real-time order notifications
- ✓ Order status can be updated by employees
- ✓ Customers can track their order status
- ✓ System is mobile-responsive

**Performance Targets:**
- Page load time: < 2 seconds
- Order placement: < 5 seconds (including payment)
- Real-time notification latency: < 1 second
- API response time: < 200ms (95th percentile)

**Security Requirements:**
- PCI DSS compliance (via Stripe)
- HTTPS only in production
- No sensitive data logged
- Input validation on all endpoints
- Authentication required for employee dashboard

---

## Implementation Priority

1. **Foundation** (Week 1)
   - Project setup and database schema
   - Basic API structure with authentication
   - Menu CRUD endpoints

2. **Customer Ordering** (Week 2)
   - Customer frontend with menu display
   - Cart functionality
   - Checkout flow (guest + user)
   - Stripe integration

3. **Employee Dashboard** (Week 3)
   - Dashboard frontend
   - Order queue display
   - Status update functionality
   - WebSocket real-time updates

4. **Polish & Testing** (Week 4)
   - Error handling improvements
   - Email notifications
   - Mobile responsive adjustments
   - End-to-end testing
   - Deployment setup
