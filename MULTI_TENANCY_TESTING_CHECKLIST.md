# 🧪 Multi-Tenancy Testing Checklist

**Purpose:** Verify data isolation and multi-shop functionality
**Status:** Ready to test
**Estimated Time:** 1-2 hours

---

## 📋 Pre-Test Setup

### ✅ Prerequisites

- [ ] **Production deployment is live**
- [ ] **Database migrations completed**
- [ ] **Shops table exists**
- [ ] **At least one shop created**
- [ ] **You have database access** (psql or Supabase dashboard)

---

## 🏪 STEP 1: Create Test Shops (15 min)

### 1.1 Create Two Test Shops

**Connect to database:**
```bash
psql $DATABASE_URL
```

**Create Shop 1: Barren Ground Coffee**
```sql
INSERT INTO shops (
  id, name, display_name, email, phone, subdomain,
  features, status
) VALUES (
  'barrenground',
  'barrenground',
  'Barren Ground Coffee',
  'hello@barrenground.com',
  '555-0100',
  'barrenground',
  '{"membership": true, "loyalty": true, "scheduling": true, "delivery": false, "catering": true}',
  'active'
);
```

**Create Shop 2: Test Cafe**
```sql
INSERT INTO shops (
  id, name, display_name, email, phone, subdomain,
  features, status
) VALUES (
  'testcafe',
  'testcafe',
  'Test Cafe',
  'hello@testcafe.com',
  '555-0200',
  'testcafe',
  '{"membership": false, "loyalty": true, "scheduling": false, "delivery": false, "catering": false}',
  'active'
);
```

**Verify shops created:**
```sql
SELECT id, display_name, subdomain, status FROM shops;
```

**Expected output:**
```
id           | display_name           | subdomain    | status
-------------|------------------------|--------------|--------
barrenground | Barren Ground Coffee   | barrenground | active
testcafe     | Test Cafe              | testcafe     | active
```

**Status:** [ ] Shops created and verified

---

## 👥 STEP 2: Test User Isolation (15 min)

### 2.1 Create Users for Each Shop

**Get your backend URL:**
```
https://your-backend-api.vercel.app
```

**Register User 1 (Shop 1):**
```bash
curl -X POST https://your-backend-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456",
    "name": "Alice Shop1"
  }'
```

**Expected:** Success response with user ID

**Register User 2 (Shop 2):**
```bash
curl -X POST https://your-backend-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456",
    "name": "Bob Shop2"
  }'
```

**Expected:** Success response with user ID

**Status:** [ ] Users created for both shops

---

### 2.2 Verify Users in Database

```sql
SELECT id, email, name, shop_id FROM users WHERE email LIKE '%@shop%';
```

**Expected output:**
```
id | email              | name         | shop_id
---|--------------------|--------------|--------------
 1 | alice@shop1.com    | Alice Shop1  | barrenground
 2 | bob@shop2.com      | Bob Shop2    | testcafe
```

**Status:** [ ] Users are in correct shops

---

### 2.3 Test Cross-Shop Login (Should FAIL)

**Try to login Alice with Shop 2 context:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }'
```

**Expected:** `401 Unauthorized` or "Invalid credentials"

✅ **CRITICAL:** This MUST fail. If it succeeds, data isolation is broken!

**Status:** [ ] Cross-shop login correctly blocked

---

### 2.4 Test Same-Shop Login (Should SUCCEED)

**Login Alice with correct shop context:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }'
```

**Expected:** Success with JWT token

**Save the token:**
```
TOKEN_SHOP1="<paste-token-here>"
```

**Login Bob with correct shop context:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456"
  }'
```

**Expected:** Success with JWT token

**Save the token:**
```
TOKEN_SHOP2="<paste-token-here>"
```

**Status:** [ ] Same-shop logins work correctly

---

## 🍔 STEP 3: Test Menu Isolation (15 min)

### 3.1 Create Menu Items for Each Shop

**Create menu item for Shop 1:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/menu \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -H "Authorization: Bearer $TOKEN_SHOP1" \
  -d '{
    "name": "Barren Ground Special",
    "description": "Our signature coffee",
    "price": 5.99,
    "category": "coffee",
    "available": true
  }'
```

**Create menu item for Shop 2:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/menu \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -H "Authorization: Bearer $TOKEN_SHOP2" \
  -d '{
    "name": "Test Cafe Latte",
    "description": "Test cafe specialty",
    "price": 4.50,
    "category": "coffee",
    "available": true
  }'
```

**Status:** [ ] Menu items created for both shops

---

### 3.2 Verify Menu Isolation

**Get Shop 1 menu:**
```bash
curl https://your-backend-api.vercel.app/api/menu \
  -H "X-Shop-ID: barrenground"
```

**Expected:** Only "Barren Ground Special" appears

**Get Shop 2 menu:**
```bash
curl https://your-backend-api.vercel.app/api/menu \
  -H "X-Shop-ID: testcafe"
```

**Expected:** Only "Test Cafe Latte" appears

✅ **CRITICAL:** Each shop should only see its own menu items!

**Verify in database:**
```sql
SELECT id, name, shop_id FROM menu_items WHERE name LIKE '%Special%' OR name LIKE '%Test%';
```

**Expected:**
```
id | name                    | shop_id
---|-------------------------|-------------
 1 | Barren Ground Special   | barrenground
 2 | Test Cafe Latte         | testcafe
```

**Status:** [ ] Menu items are isolated by shop

---

## 📦 STEP 4: Test Order Isolation (15 min)

### 4.1 Place Orders for Each Shop

**Place order for Shop 1:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -H "Authorization: Bearer $TOKEN_SHOP1" \
  -d '{
    "items": [{"menu_item_id": 1, "quantity": 2}],
    "customer_email": "alice@shop1.com",
    "customer_name": "Alice Shop1",
    "total": 11.98,
    "payment_method": "card"
  }'
```

**Place order for Shop 2:**
```bash
curl -X POST https://your-backend-api.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -H "Authorization: Bearer $TOKEN_SHOP2" \
  -d '{
    "items": [{"menu_item_id": 2, "quantity": 1}],
    "customer_email": "bob@shop2.com",
    "customer_name": "Bob Shop2",
    "total": 4.50,
    "payment_method": "card"
  }'
```

**Status:** [ ] Orders placed for both shops

---

### 4.2 Verify Order Isolation

**Get Shop 1 orders:**
```bash
curl https://your-backend-api.vercel.app/api/orders \
  -H "X-Shop-ID: barrenground" \
  -H "Authorization: Bearer $TOKEN_SHOP1"
```

**Expected:** Only Alice's order appears

**Get Shop 2 orders:**
```bash
curl https://your-backend-api.vercel.app/api/orders \
  -H "X-Shop-ID: testcafe" \
  -H "Authorization: Bearer $TOKEN_SHOP2"
```

**Expected:** Only Bob's order appears

**Verify in database:**
```sql
SELECT id, customer_name, total, shop_id FROM orders WHERE customer_name LIKE '%Shop%';
```

**Expected:**
```
id | customer_name | total  | shop_id
---|---------------|--------|-------------
 1 | Alice Shop1   | 11.98  | barrenground
 2 | Bob Shop2     | 4.50   | testcafe
```

**Status:** [ ] Orders are isolated by shop

---

## 🔒 STEP 5: Test Security (10 min)

### 5.1 Test Suspended Shop

**Suspend Shop 2:**
```sql
UPDATE shops SET status = 'suspended' WHERE id = 'testcafe';
```

**Try to access suspended shop:**
```bash
curl https://your-backend-api.vercel.app/api/menu \
  -H "X-Shop-ID: testcafe"
```

**Expected:** `403 Forbidden` - "Shop suspended"

**Reactivate Shop 2:**
```sql
UPDATE shops SET status = 'active' WHERE id = 'testcafe';
```

**Status:** [ ] Suspended shop correctly blocked

---

### 5.2 Test Invalid Shop

**Try to access non-existent shop:**
```bash
curl https://your-backend-api.vercel.app/api/menu \
  -H "X-Shop-ID: fakeshop"
```

**Expected:** `404 Not Found` - "Shop not found"

**Status:** [ ] Invalid shop correctly rejected

---

### 5.3 Test Without Shop Context

**Try to access without X-Shop-ID header:**
```bash
curl https://your-backend-api.vercel.app/api/menu
```

**Expected:**
- Production: `404 Not Found` (no shop found)
- Development: May work with default shop

**Status:** [ ] Missing shop context handled correctly

---

## 🧹 STEP 6: Data Leakage Tests (15 min)

### 6.1 Cross-Shop Data Access Test

**Critical Security Test:**

Try to access Shop 1's users from Shop 2 context:

```sql
-- This should NOT be possible via API
-- The middleware should prevent this
-- But verify in database that data exists separately

SELECT
  u.email,
  u.shop_id,
  s.display_name
FROM users u
JOIN shops s ON u.shop_id = s.id
WHERE u.email LIKE '%@shop%';
```

**Expected:** See users in their respective shops

**Status:** [ ] Users are correctly separated

---

### 6.2 Order History Leakage Test

**Verify orders can't leak between shops:**

```sql
-- Check that orders are tied to correct shop
SELECT
  o.id,
  o.customer_name,
  o.shop_id,
  s.display_name
FROM orders o
JOIN shops s ON o.shop_id = s.id
WHERE o.customer_name LIKE '%Shop%';
```

**Expected:** Each order shows correct shop

**Status:** [ ] Orders are correctly separated

---

## 🌐 STEP 7: Subdomain Testing (Optional, 10 min)

### 7.1 Configure DNS (If You Have a Domain)

**Add DNS records:**
```
barrenground.yourdomain.com → CNAME → your-backend.vercel.app
testcafe.yourdomain.com     → CNAME → your-backend.vercel.app
```

**Test subdomain access:**
```bash
curl https://barrenground.yourdomain.com/api/menu
# Should show Shop 1 menu

curl https://testcafe.yourdomain.com/api/menu
# Should show Shop 2 menu
```

**Status:** [ ] Subdomain routing works (or N/A)

---

## ✅ STEP 8: Verification Summary

### Critical Tests (MUST PASS)

- [ ] ✅ **Users isolated by shop** - Cross-shop login fails
- [ ] ✅ **Menu items isolated** - Each shop sees only its menu
- [ ] ✅ **Orders isolated** - Each shop sees only its orders
- [ ] ✅ **Suspended shop blocked** - 403 error returned
- [ ] ✅ **Invalid shop blocked** - 404 error returned
- [ ] ✅ **Database verification** - All data has correct shop_id

### Optional Tests

- [ ] Subdomain routing works
- [ ] Custom domain routing works
- [ ] Feature toggles work per shop

---

## 🚨 If Any Test Fails

### Cross-Shop Data Access Working (BAD!)

**Symptoms:** Alice can login to Shop 2
**Fix:** Check tenant context middleware is applied to routes

### Menu/Orders Showing for Wrong Shop

**Symptoms:** Shop 1 sees Shop 2's menu
**Fix:** Verify queries include `shop_id` filter in models

### Database Shows NULL shop_id

**Symptoms:** Data exists with shop_id = NULL
**Fix:** Run migration to assign default shop_id

---

## 📊 Expected Final State

After all tests pass, you should have:

```
Shops:
- barrenground (active)
- testcafe (active)

Users:
- alice@shop1.com (shop: barrenground)
- bob@shop2.com (shop: testcafe)

Menu Items:
- Barren Ground Special (shop: barrenground)
- Test Cafe Latte (shop: testcafe)

Orders:
- Alice's order (shop: barrenground)
- Bob's order (shop: testcafe)
```

---

## 🧹 Cleanup (Optional)

**To remove test data:**

```sql
-- Delete test orders
DELETE FROM orders WHERE customer_name LIKE '%Shop%';

-- Delete test menu items
DELETE FROM menu_items WHERE name LIKE '%Special%' OR name LIKE '%Test%';

-- Delete test users
DELETE FROM users WHERE email LIKE '%@shop%';

-- Delete test shop
DELETE FROM shops WHERE id = 'testcafe';

-- Keep barrenground shop if it's your main shop
```

---

## 📝 Test Results

**Date Tested:** _______________
**Tested By:** _______________
**Environment:** Production / Staging / Development

**Results:**
- [ ] All critical tests passed
- [ ] Some tests failed (document issues below)
- [ ] Need to fix and retest

**Issues Found:**
_______________________________________________
_______________________________________________
_______________________________________________

**Next Steps:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Success!

If all tests pass, your multi-tenancy is working correctly! You can now:

1. **Deploy additional shops** for real locations
2. **Configure custom domains** per shop
3. **Set up independent Stripe accounts** per shop
4. **Enable/disable features** per shop
5. **Scale to multiple locations**

---

**Related Docs:**
- [Multi-Tenancy Implementation Guide](docs/features/MULTI_TENANCY_IMPLEMENTATION.md)
- [API Reference](backend/API_REFERENCE.md)
