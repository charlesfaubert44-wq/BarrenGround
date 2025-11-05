# Multi-Tenant Coffee Shop Platform Guide

## Onboarding a New Shop

### 1. Create Shop Record

```sql
INSERT INTO shops (
  id, name, display_name, email, subdomain
) VALUES (
  'newshop',
  'New Coffee Shop',
  'New Coffee Shop',
  'hello@newshop.com',
  'newshop'
);
```

### 2. Configure Domain/Subdomain

**Option A: Subdomain** (e.g., `newshop.platform.com`)
- Set DNS CNAME: `newshop.platform.com` → `platform.com`
- Update shop record: `subdomain = 'newshop'`

**Option B: Custom Domain** (e.g., `newshop.coffee`)
- Set DNS A/CNAME to point to platform
- Update shop record: `domain = 'newshop.coffee'`

### 3. Configure Stripe Connect

1. Shop admin visits: `/settings/payments`
2. Click "Connect Stripe Account"
3. Complete Stripe onboarding
4. Shop's `stripe_account_id` is automatically saved

### 4. Configure Email (Optional)

**Option A: Use SendGrid sub-accounts**
```sql
UPDATE shops SET
  sendgrid_api_key = 'SG.xxx',
  email_from = 'noreply@newshop.com',
  email_from_name = 'New Coffee Shop'
WHERE id = 'newshop';
```

**Option B: Use platform SendGrid** (default)
- Emails sent from platform account
- Reply-to set to shop email

### 5. Seed Initial Data

```sql
-- Create shop menu items
INSERT INTO menu_items (name, price, category, shop_id)
VALUES ('House Coffee', 4.50, 'beverages', 'newshop');

-- Create default business hours
INSERT INTO business_hours (day_of_week, open_time, close_time, shop_id)
VALUES (1, '07:00', '18:00', 'newshop'); -- Monday
```

### 6. Test Isolation

```bash
# Test 1: Access shop1 menu
curl -H "X-Shop-ID: shop1" http://localhost:3000/api/menu

# Test 2: Access shop2 menu (should be different)
curl -H "X-Shop-ID: shop2" http://localhost:3000/api/menu

# Test 3: Create user in shop1
curl -X POST http://localhost:3000/api/auth/register \
  -H "X-Shop-ID: shop1" \
  -d '{"email":"test@test.com","password":"pass","name":"Test"}'

# Test 4: Same email in shop2 should work
curl -X POST http://localhost:3000/api/auth/register \
  -H "X-Shop-ID: shop2" \
  -d '{"email":"test@test.com","password":"pass","name":"Test"}'
```

## Architecture Overview

```
Request → Tenant Context Middleware → Shop Resolution (domain/subdomain/header)
       → Attach req.shop → Controllers → Models (filtered by shop_id)
```

## Data Isolation

- All tables have `shop_id` foreign key to `shops` table
- All queries filtered by `shop_id`
- JWT tokens include `shopId` claim
- Middleware verifies user's `shopId` matches `req.shop.id`

## Payment Isolation

- Each shop has Stripe Connect account (`shops.stripe_account_id`)
- Payments go directly to shop's bank account
- Platform takes fee via Stripe Connect application fee

## Security Considerations

1. **Row-Level Security**: All queries must include `WHERE shop_id = $X`
2. **JWT Claims**: Include `shopId` in token to prevent cross-shop access
3. **Authorization**: Verify user belongs to shop before any data access
4. **Admin Access**: Platform admins can access all shops via special role

## Environment Variables (Per Shop)

Shops can override platform defaults via `shops.config` JSONB:

```sql
UPDATE shops SET config = jsonb_set(
  config,
  '{features,delivery}',
  'true'
) WHERE id = 'newshop';
```
