# Membership Feature Implementation

## Overview
This document describes the implementation of the membership feature for Barren Ground Coffee, specifically the "1 Coffee a Day" plan for $25/week.

## Database Schema

### New Tables

#### `membership_plans`
Stores available membership plans.
- `id`: Primary key
- `name`: Plan name (e.g., "1 Coffee a Day")
- `description`: Plan description
- `price`: Price in dollars
- `interval`: Billing interval ('week', 'month', 'year')
- `coffees_per_interval`: Number of coffees included per billing period
- `stripe_price_id`: Stripe price ID for subscriptions
- `active`: Whether the plan is currently available
- `created_at`: Timestamp

#### `user_memberships`
Tracks active user subscriptions.
- `id`: Primary key
- `user_id`: Foreign key to users table
- `plan_id`: Foreign key to membership_plans table
- `status`: Subscription status ('active', 'canceled', 'past_due', 'expired')
- `stripe_subscription_id`: Stripe subscription ID
- `stripe_customer_id`: Stripe customer ID
- `current_period_start`: Start of current billing period
- `current_period_end`: End of current billing period
- `coffees_remaining`: Number of coffees left in current period
- `cancel_at_period_end`: Whether subscription will cancel at period end
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### `membership_usage`
Tracks individual coffee redemptions.
- `id`: Primary key
- `user_membership_id`: Foreign key to user_memberships table
- `order_id`: Optional foreign key to orders table
- `redeemed_at`: Timestamp of redemption
- `coffee_name`: Name of coffee redeemed

## API Endpoints

All membership endpoints are under `/api/membership/`:

### GET `/api/membership/plans`
Returns all active membership plans.
- **Auth**: Not required
- **Response**: `{ plans: MembershipPlan[] }`

### GET `/api/membership/status`
Returns the user's current membership status.
- **Auth**: Required
- **Response**:
```json
{
  "membership": {
    "id": 1,
    "user_id": 1,
    "plan_id": 1,
    "status": "active",
    "coffees_remaining": 5,
    "current_period_end": "2025-11-09",
    "plan": { ... },
    "usageHistory": [ ... ],
    "todayUsageCount": 0,
    "canRedeemToday": true
  }
}
```

### POST `/api/membership/subscribe`
Creates a new membership subscription.
- **Auth**: Required
- **Body**:
```json
{
  "planId": 1,
  "paymentMethodId": "pm_xxx"
}
```
- **Response**:
```json
{
  "membership": { ... },
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### POST `/api/membership/cancel`
Cancels the subscription at the end of the current period.
- **Auth**: Required
- **Response**:
```json
{
  "message": "Subscription will be cancelled at the end of the current period",
  "membership": { ... }
}
```

### POST `/api/membership/redeem`
Redeems the daily coffee.
- **Auth**: Required
- **Body**:
```json
{
  "coffeeName": "Latte"
}
```
- **Response**:
```json
{
  "message": "Coffee redeemed successfully",
  "coffeesRemaining": 4
}
```

## Order Integration

The order creation endpoint has been updated to support membership redemption:

### POST `/api/orders`
- **New field**: `useMembership` (boolean)
- **Behavior**:
  - If `useMembership` is true and user has an active membership
  - If user hasn't redeemed today
  - If there are coffees remaining
  - Then: The first coffee item in the order is automatically discounted
  - The membership usage is recorded
  - Coffees remaining is decremented

## Stripe Integration

### Webhook Events Handled

The webhook handler ([webhookController.ts](backend/src/controllers/webhookController.ts)) now handles:

1. **`customer.subscription.created`** / **`customer.subscription.updated`**
   - Updates membership status based on subscription status
   - Resets coffees for new billing period

2. **`customer.subscription.deleted`**
   - Marks membership as canceled

3. **`invoice.payment_succeeded`**
   - Reactivates membership if it was past_due

4. **`invoice.payment_failed`**
   - Marks membership as past_due

### Subscription Flow

1. User selects a membership plan
2. Frontend creates payment method via Stripe.js
3. Backend creates Stripe customer (if needed)
4. Backend creates Stripe subscription with weekly recurring billing
5. Backend creates `user_memberships` record
6. Stripe sends webhook events to keep membership status in sync

## Models

### MembershipPlanModel
Located at [backend/src/models/MembershipPlan.ts](backend/src/models/MembershipPlan.ts)
- `findAll()`: Get all active plans
- `findById(id)`: Get plan by ID
- `findByStripePriceId(stripePriceId)`: Get plan by Stripe price ID
- `create(planData)`: Create new plan
- `updateStripePriceId(id, stripePriceId)`: Update Stripe price ID

### UserMembershipModel
Located at [backend/src/models/UserMembership.ts](backend/src/models/UserMembership.ts)
- `create(membershipData)`: Create new membership
- `findActiveByUserId(userId)`: Get user's active membership
- `findByStripeSubscriptionId(subscriptionId)`: Find by Stripe subscription
- `findById(id)`: Get by ID
- `updateStatus(id, status)`: Update status
- `decrementCoffees(id)`: Decrement coffees remaining
- `resetCoffees(id, count, periodStart, periodEnd)`: Reset for new period
- `cancelAtPeriodEnd(id)`: Mark for cancellation
- `updateSubscriptionPeriod(...)`: Update period dates

### MembershipUsageModel
Located at [backend/src/models/MembershipUsage.ts](backend/src/models/MembershipUsage.ts)
- `create(usageData)`: Record a coffee redemption
- `findByMembershipId(membershipId, limit?)`: Get usage history
- `countByMembershipIdInPeriod(...)`: Count usage in date range
- `getTodayUsageByMembershipId(membershipId)`: Check if redeemed today

## Mock Mode Support

The mock server ([server-no-db.ts](backend/src/server-no-db.ts)) includes full membership support:
- In-memory storage for plans, memberships, and usage
- All API endpoints work without database
- Mock Stripe integration for testing

## Business Rules

1. **One coffee per day**: Users can only redeem one coffee per calendar day (00:00 - 23:59)
2. **Weekly reset**: Coffees reset at the start of each billing period (weekly)
3. **7 coffees per week**: The $25/week plan includes 7 coffees
4. **Unused coffees**: Coffees don't roll over to the next period
5. **Cancellation**: Users can cancel but keep access until period end
6. **Past due**: If payment fails, membership is marked past_due but not immediately canceled

## Frontend Integration (To-Do)

The following frontend work is still needed:

1. **Membership Page**
   - Display available plans
   - Show current membership status
   - Subscription form with Stripe Elements
   - Usage history display
   - Cancel subscription button

2. **Checkout Integration**
   - Add "Use Membership" checkbox during checkout
   - Show discount when membership is applied
   - Display remaining coffees

3. **User Profile**
   - Show membership badge/status
   - Link to membership management page

## Testing

To test the membership features:

1. **Start the mock server**:
   ```bash
   cd backend
   npm run dev:no-db
   ```

2. **Create a user account**:
   ```bash
   POST /api/auth/register
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```

3. **Subscribe to membership**:
   ```bash
   POST /api/membership/subscribe
   Authorization: Bearer [token]
   {
     "planId": 1,
     "paymentMethodId": "mock_pm_123"
   }
   ```

4. **Check status**:
   ```bash
   GET /api/membership/status
   Authorization: Bearer [token]
   ```

5. **Redeem coffee**:
   ```bash
   POST /api/membership/redeem
   Authorization: Bearer [token]
   {
     "coffeeName": "Latte"
   }
   ```

## Environment Variables

Add to your `.env` file:
```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Next Steps

1. Implement frontend UI for membership management
2. Add admin panel to manage membership plans
3. Add email notifications for subscription events
4. Implement membership analytics/reporting
5. Add promotional codes/discounts
6. Consider additional plan tiers (e.g., "2 coffees a day")
