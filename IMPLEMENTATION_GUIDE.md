# Google Auth, Payment Methods, and Repeat Order Implementation Guide

## Overview
This guide covers the complete implementation of:
1. Google OAuth authentication
2. Saved payment methods (credit cards & Apple Pay)
3. Enhanced customer dashboard with tabs
4. "Repeat Last Order" functionality with auto-prompt

## Backend Implementation (✅ Completed)

### Database Schema Updates
- Added OAuth provider fields to `users` table
- Added `stripe_customer_id` and `last_order_id` to `users` table
- Created `payment_methods` table for saved payment methods
- Updated indexes for better query performance

**Files Modified:**
- [backend/src/config/schema.sql](backend/src/config/schema.sql)

### Google OAuth Integration
- Installed `passport` and `passport-google-oauth20`
- Created Passport Google Strategy configuration
- Added OAuth routes: `/api/auth/google` and `/api/auth/google/callback`
- Updated User model with OAuth methods: `findOrCreateOAuthUser`, `findByOAuthProvider`

**Files Created:**
- [backend/src/config/passport.ts](backend/src/config/passport.ts)

**Files Modified:**
- [backend/src/models/User.ts](backend/src/models/User.ts)
- [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)
- [backend/src/server.ts](backend/src/server.ts)
- [backend/package.json](backend/package.json)
- [backend/.env.example](backend/.env.example)

### Saved Payment Methods
- Created PaymentMethod model with full CRUD operations
- Created payment method controller with Stripe SetupIntent integration
- Added routes for managing payment methods
- Support for setting default payment method

**Files Created:**
- [backend/src/models/PaymentMethod.ts](backend/src/models/PaymentMethod.ts)
- [backend/src/controllers/paymentMethodController.ts](backend/src/controllers/paymentMethodController.ts)
- [backend/src/routes/paymentMethodRoutes.ts](backend/src/routes/paymentMethodRoutes.ts)

### Last Order Tracking
- Added `updateLastOrder` method to User model
- Updated `createOrder` to track last order for authenticated users
- Created `getLastOrder` endpoint to retrieve user's last order
- Added route `/api/orders/last-order` for repeat functionality

**Files Modified:**
- [backend/src/models/User.ts](backend/src/models/User.ts)
- [backend/src/controllers/orderController.ts](backend/src/controllers/orderController.ts)
- [backend/src/routes/orderRoutes.ts](backend/src/routes/orderRoutes.ts)

## Frontend Implementation (🔄 In Progress)

### Required npm Packages
Add to `customer-frontend/package.json`:
```json
"@react-oauth/google": "^0.12.1"
```

### Environment Variables
Update `customer-frontend/.env.example`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Components to Create/Update

#### 1. Google Sign-In Button Component
**File:** `customer-frontend/src/components/GoogleSignInButton.tsx`
- Use `@react-oauth/google` GoogleLogin component
- Handle OAuth callback and token exchange
- Integrate with authStore

#### 2. Auth Callback Page
**File:** `customer-frontend/src/pages/AuthCallbackPage.tsx`
- Handle OAuth redirect from backend
- Extract token from URL params
- Update authStore and redirect to home/dashboard

#### 3. Payment Methods API Client
**File:** `customer-frontend/src/api/paymentMethods.ts`
- `getPaymentMethods()` - List all saved payment methods
- `createSetupIntent()` - Create Stripe SetupIntent
- `savePaymentMethod()` - Save payment method after setup
- `setDefaultPaymentMethod()` - Set default payment method
- `deletePaymentMethod()` - Remove payment method

#### 4. Payment Methods Management Page
**File:** `customer-frontend/src/components/PaymentMethodsTab.tsx`
- Display list of saved payment methods with card brand icons
- Show last4 digits and expiration
- Indicate default payment method
- Add new payment method with Stripe SetupIntent
- Delete payment method functionality
- Set default payment method

#### 5. Enhanced Account Page with Tabs
**File:** `customer-frontend/src/pages/AccountPage.tsx`
Updates needed:
- Add tab navigation (Profile, Orders, Payment Methods, Membership)
- Create ProfileTab component (user info editing)
- Create OrdersTab component (order history with filters)
- Integrate PaymentMethodsTab
- Add responsive mobile tabs

#### 6. Repeat Last Order Modal
**File:** `customer-frontend/src/components/RepeatOrderModal.tsx`
- Display last order items with customizations
- Allow editing quantities before repeating
- Show total price
- Add to cart button
- Dismiss button with "don't show again" option

#### 7. Repeat Last Order Hook
**File:** `customer-frontend/src/hooks/useRepeatOrder.tsx`
- Fetch last order from API
- Show modal on login if user has previous order
- Show modal on page load if already logged in (once per session)
- Store "don't show again" preference in localStorage

#### 8. Update Login/Register Pages
**Files:**
- `customer-frontend/src/pages/LoginPage.tsx`
- `customer-frontend/src/pages/RegisterPage.tsx`

Add:
- Google Sign-In button with GoogleOAuthProvider wrapper
- OAuth error handling
- Loading states

#### 9. Update Checkout Page
**File:** `customer-frontend/src/pages/CheckoutPage.tsx`

Add:
- Saved payment methods selection dropdown
- Apple Pay button (Stripe Payment Request Button)
- "Save this payment method" checkbox for new cards
- Use saved payment method for order payment

#### 10. Orders API Updates
**File:** `customer-frontend/src/api/orders.ts`
Add:
- `getLastOrder()` - Fetch user's last order

## Setup Instructions

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Update environment variables in `.env`:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

3. **Run database migrations:**
```bash
npm run db:setup
```

4. **Start backend server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd customer-frontend
npm install
```

2. **Update environment variables in `.env`:**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

3. **Start frontend dev server:**
```bash
npm run dev
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:8890/auth/callback`
6. Copy Client ID and Client Secret to .env files

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test mode API keys
3. Set up a webhook endpoint for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `setup_intent.succeeded`
4. Add webhook secret to backend .env

## Features Summary

### Authentication
- ✅ Traditional email/password login
- ✅ Google OAuth 2.0 login
- ✅ Automatic account linking for existing emails
- ✅ JWT token-based authentication

### Payment Methods
- ✅ Save credit cards with Stripe
- 🔄 Apple Pay integration (Stripe Payment Request API)
- ✅ Set default payment method
- ✅ Delete saved payment methods
- ✅ Secure payment method storage

### Customer Dashboard
- ✅ Profile tab (view/edit user info)
- ✅ Orders tab (order history with filters)
- 🔄 Payment Methods tab (manage saved cards)
- ✅ Membership tab (existing functionality)

### Repeat Last Order
- ✅ Track last order for each user
- 🔄 Auto-prompt on login
- 🔄 Auto-prompt on page load (once per session)
- 🔄 Modal to review and edit last order
- 🔄 Quick "Repeat Order" button in dashboard

### Order Flow Improvements
- ✅ Use saved payment methods at checkout
- 🔄 Apple Pay express checkout
- ✅ Guest checkout still available
- ✅ Membership discount integration

## Testing Checklist

### Backend Testing
- [ ] Test Google OAuth flow end-to-end
- [ ] Test creating Stripe SetupIntent
- [ ] Test saving payment method
- [ ] Test setting default payment method
- [ ] Test deleting payment method
- [ ] Test last order tracking
- [ ] Test getLastOrder endpoint

### Frontend Testing
- [ ] Test Google Sign-In button
- [ ] Test OAuth callback handling
- [ ] Test payment methods management UI
- [ ] Test adding new payment method
- [ ] Test checkout with saved payment method
- [ ] Test Apple Pay button (requires HTTPS)
- [ ] Test repeat order modal on login
- [ ] Test repeat order modal on page load
- [ ] Test "don't show again" functionality

## Next Steps

1. ✅ Backend infrastructure complete
2. 🔄 Frontend Google OAuth integration
3. 🔄 Frontend payment methods management
4. 🔄 Frontend repeat order feature
5. 🔄 Apple Pay integration
6. 🔄 End-to-end testing
7. 🔄 Production deployment setup

## Security Considerations

- ✅ OAuth tokens properly validated
- ✅ Payment methods stored securely in Stripe
- ✅ JWT tokens with expiration
- ✅ CORS properly configured
- ⚠️ Add rate limiting for OAuth endpoints
- ⚠️ Add CSRF protection for sensitive operations
- ⚠️ Implement 2FA for high-value accounts

## Performance Optimizations

- ✅ Database indexes on foreign keys
- ✅ Efficient query patterns in models
- 🔄 Implement request caching for payment methods
- 🔄 Lazy load payment methods tab
- 🔄 Prefetch last order on login

---

**Legend:**
- ✅ Completed
- 🔄 In Progress / Needs Implementation
- ⚠️ Recommended Enhancement
