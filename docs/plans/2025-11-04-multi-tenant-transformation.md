# Multi-Tenant Coffee Shop Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform single-tenant BarrenGround coffee ordering system into multi-tenant platform supporting multiple independent coffee shop clients with isolated data, payments, and branding.

**Architecture:** Add `shop_id` column to all database tables, implement tenant context middleware that extracts shop identity from subdomain/domain, filter all queries by tenant, support per-tenant Stripe accounts via Stripe Connect, enable per-tenant configuration via environment variables or database config table.

**Tech Stack:** Node.js/Express, PostgreSQL, TypeScript, Stripe Connect, JWT with tenant claims

**Estimated Timeline:** 5-7 weeks full implementation

---

## Phase 1: Database Schema & Tenant Isolation (Week 1-2)

### Task 1: Create Tenant Management System

**Goal:** Add shops table to manage multiple coffee shop tenants

**Files:**
- Create: `backend/src/migrations/001_create_shops_table.sql`
- Create: `backend/src/models/Shop.ts`
- Create: `backend/src/controllers/shopController.ts`

**Step 1: Write the migration for shops table**

Create `backend/src/migrations/001_create_shops_table.sql`:

```sql
-- Create shops table
CREATE TABLE shops (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'barrenground', 'sunrise-cafe'
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,

  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Location
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Canada',

  -- Domain configuration
  domain VARCHAR(255), -- e.g., 'barrenground.coffee'
  subdomain VARCHAR(100), -- e.g., 'barrenground' for barrenground.platform.com

  -- Payment configuration
  stripe_account_id VARCHAR(255), -- Stripe Connect account
  stripe_publishable_key VARCHAR(255),

  -- Email configuration
  sendgrid_api_key VARCHAR(255),
  email_from VARCHAR(255),
  email_from_name VARCHAR(255),

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7),

  -- Configuration JSON for flexible settings
  config JSONB DEFAULT '{}',

  -- Feature flags
  features JSONB DEFAULT '{
    "membership": true,
    "loyalty": true,
    "scheduling": true,
    "delivery": false,
    "catering": false
  }',

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(domain),
  UNIQUE(subdomain)
);

-- Create index for lookups
CREATE INDEX idx_shops_domain ON shops(domain);
CREATE INDEX idx_shops_subdomain ON shops(subdomain);
CREATE INDEX idx_shops_status ON shops(status);

-- Insert default Barren Ground shop
INSERT INTO shops (
  id, name, display_name, email, phone,
  subdomain, domain,
  email_from, email_from_name
) VALUES (
  'barrenground',
  'barrenground',
  'Barren Ground Coffee',
  'hello@barrengroundcoffee.com',
  '(867) 873-3030',
  'barrenground',
  'barrengroundcoffee.com',
  'noreply@barrengroundcoffee.com',
  'Barren Ground Coffee'
);
```

**Step 2: Run the migration**

Run: `psql $DATABASE_URL -f backend/src/migrations/001_create_shops_table.sql`

Expected: `CREATE TABLE` and `INSERT 1` output

**Step 3: Create Shop model**

Create `backend/src/models/Shop.ts`:

```typescript
import pool from '../config/database';

export interface Shop {
  id: string;
  name: string;
  display_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  domain?: string;
  subdomain?: string;
  stripe_account_id?: string;
  stripe_publishable_key?: string;
  sendgrid_api_key?: string;
  email_from?: string;
  email_from_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  config: Record<string, any>;
  features: {
    membership: boolean;
    loyalty: boolean;
    scheduling: boolean;
    delivery: boolean;
    catering: boolean;
  };
  status: 'active' | 'suspended' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export class ShopModel {
  static async findById(id: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByDomain(domain: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE domain = $1 AND status = $2',
      [domain, 'active']
    );
    return result.rows[0] || null;
  }

  static async findBySubdomain(subdomain: string): Promise<Shop | null> {
    const result = await pool.query(
      'SELECT * FROM shops WHERE subdomain = $1 AND status = $2',
      [subdomain, 'active']
    );
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Shop[]> {
    const result = await pool.query(
      'SELECT * FROM shops ORDER BY display_name ASC'
    );
    return result.rows;
  }

  static async create(shopData: Partial<Shop>): Promise<Shop> {
    const result = await pool.query(
      `INSERT INTO shops (
        id, name, display_name, email, phone,
        subdomain, domain, email_from, email_from_name,
        config, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        shopData.id,
        shopData.name,
        shopData.display_name,
        shopData.email,
        shopData.phone,
        shopData.subdomain,
        shopData.domain,
        shopData.email_from,
        shopData.email_from_name,
        JSON.stringify(shopData.config || {}),
        JSON.stringify(shopData.features || {}),
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Shop>): Promise<Shop | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE shops SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }
}
```

**Step 4: Commit tenant management system**

```bash
git add backend/src/migrations/001_create_shops_table.sql backend/src/models/Shop.ts
git commit -m "feat: add shops table and Shop model for multi-tenancy"
```

---

### Task 2: Add shop_id to All Tables

**Goal:** Add shop_id foreign key to all data tables and create indexes

**Files:**
- Create: `backend/src/migrations/002_add_shop_id_to_tables.sql`

**Step 1: Write migration to add shop_id columns**

Create `backend/src/migrations/002_add_shop_id_to_tables.sql`:

```sql
-- Add shop_id to users table
ALTER TABLE users ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE users ADD CONSTRAINT fk_users_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_users_shop_id ON users(shop_id);

-- Update existing users to barrenground
UPDATE users SET shop_id = 'barrenground' WHERE shop_id IS NULL;

-- Make shop_id NOT NULL after backfilling
ALTER TABLE users ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to orders table
ALTER TABLE orders ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE orders ADD CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_shop_status ON orders(shop_id, status);
UPDATE orders SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE orders ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to menu_items table
ALTER TABLE menu_items ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_menu_items_shop_id ON menu_items(shop_id);
UPDATE menu_items SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE menu_items ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to loyalty_transactions table
ALTER TABLE loyalty_transactions ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE loyalty_transactions ADD CONSTRAINT fk_loyalty_transactions_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_loyalty_transactions_shop_id ON loyalty_transactions(shop_id);
UPDATE loyalty_transactions SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE loyalty_transactions ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to membership_plans table
ALTER TABLE membership_plans ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE membership_plans ADD CONSTRAINT fk_membership_plans_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_membership_plans_shop_id ON membership_plans(shop_id);
UPDATE membership_plans SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE membership_plans ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to user_memberships table
ALTER TABLE user_memberships ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE user_memberships ADD CONSTRAINT fk_user_memberships_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_user_memberships_shop_id ON user_memberships(shop_id);
UPDATE user_memberships SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE user_memberships ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to promos table
ALTER TABLE promos ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE promos ADD CONSTRAINT fk_promos_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_promos_shop_id ON promos(shop_id);
UPDATE promos SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE promos ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to news table
ALTER TABLE news ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE news ADD CONSTRAINT fk_news_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_news_shop_id ON news(shop_id);
UPDATE news SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE news ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to business_hours table
ALTER TABLE business_hours ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE business_hours ADD CONSTRAINT fk_business_hours_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_business_hours_shop_id ON business_hours(shop_id);
UPDATE business_hours SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE business_hours ALTER COLUMN shop_id SET NOT NULL;

-- Add shop_id to payment_methods table
ALTER TABLE payment_methods ADD COLUMN shop_id VARCHAR(50);
ALTER TABLE payment_methods ADD CONSTRAINT fk_payment_methods_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX idx_payment_methods_shop_id ON payment_methods(shop_id);
UPDATE payment_methods SET shop_id = 'barrenground' WHERE shop_id IS NULL;
ALTER TABLE payment_methods ALTER COLUMN shop_id SET NOT NULL;
```

**Step 2: Run the migration**

Run: `psql $DATABASE_URL -f backend/src/migrations/002_add_shop_id_to_tables.sql`

Expected: Multiple `ALTER TABLE` and `UPDATE` outputs with no errors

**Step 3: Verify schema changes**

Run: `psql $DATABASE_URL -c "\d users" | grep shop_id`

Expected: Line showing `shop_id | character varying(50) | not null`

**Step 4: Commit database schema changes**

```bash
git add backend/src/migrations/002_add_shop_id_to_tables.sql
git commit -m "feat: add shop_id foreign key to all data tables"
```

---

### Task 3: Create Tenant Context Middleware

**Goal:** Extract shop identity from request and attach to req.shop

**Files:**
- Create: `backend/src/middleware/tenantContext.ts`
- Modify: `backend/src/middleware/auth.ts:20`
- Modify: `backend/src/types/express.d.ts:1-15`

**Step 1: Create tenant context middleware**

Create `backend/src/middleware/tenantContext.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ShopModel } from '../models/Shop';

export async function extractTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Method 1: Extract from subdomain (e.g., barrenground.platform.com)
    const host = req.hostname;
    const parts = host.split('.');

    let shop = null;

    // Check if it's a subdomain pattern (subdomain.platform.com)
    if (parts.length >= 3) {
      const subdomain = parts[0];
      shop = await ShopModel.findBySubdomain(subdomain);
    }

    // Method 2: Extract from custom domain (e.g., barrengroundcoffee.com)
    if (!shop) {
      shop = await ShopModel.findByDomain(host);
    }

    // Method 3: Extract from X-Shop-ID header (for testing/admin)
    if (!shop && req.headers['x-shop-id']) {
      const shopId = req.headers['x-shop-id'] as string;
      shop = await ShopModel.findById(shopId);
    }

    // Method 4: Fall back to default shop (development only)
    if (!shop && process.env.NODE_ENV === 'development') {
      shop = await ShopModel.findById('barrenground');
    }

    if (!shop) {
      res.status(404).json({
        error: 'Shop not found',
        message: 'No shop configured for this domain/subdomain',
        hostname: host
      });
      return;
    }

    if (shop.status !== 'active') {
      res.status(403).json({
        error: 'Shop suspended',
        message: 'This shop is currently unavailable'
      });
      return;
    }

    // Attach shop to request
    req.shop = shop;
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    res.status(500).json({ error: 'Failed to determine shop context' });
  }
}
```

**Step 2: Update TypeScript definitions**

Create/modify `backend/src/types/express.d.ts`:

```typescript
import { Shop } from '../models/Shop';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role?: string;
        shopId: string; // Add shop to user payload
        id: number;
      };
      shop?: Shop; // Add shop context to request
    }
  }
}

export {};
```

**Step 3: Update auth middleware to include shopId in JWT**

Modify `backend/src/middleware/auth.ts` line 20:

```typescript
// Old line 20:
req.user = { ...payload, id: payload.userId };

// New line 20:
req.user = { ...payload, id: payload.userId, shopId: payload.shopId || req.shop?.id };
```

**Step 4: Test tenant context extraction**

Run: `npm test -- tenant-context`

Expected: Tests pass showing subdomain/domain extraction works

**Step 5: Commit middleware**

```bash
git add backend/src/middleware/tenantContext.ts backend/src/types/express.d.ts backend/src/middleware/auth.ts
git commit -m "feat: add tenant context middleware for shop isolation"
```

---

## Phase 2: Update Models to Filter by shop_id (Week 2-3)

### Task 4: Update User Model for Multi-Tenancy

**Goal:** Add shop_id filtering to all User model methods

**Files:**
- Modify: `backend/src/models/User.ts:31-36`
- Modify: `backend/src/models/User.ts:39-44`
- Modify: `backend/src/models/User.ts:47-52`
- Modify: `backend/src/models/User.ts:104-117`

**Step 1: Update User.create to require shop_id**

In `backend/src/models/User.ts`, modify the `create` method (around line 27):

```typescript
// Update interface first
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  shop_id: string; // Add this
}

// Update create method (line 27-36)
static async create(userData: CreateUserData): Promise<Omit<User, 'password_hash'>> {
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(userData.password, saltRounds);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone, shop_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, shop_id, created_at`,
    [userData.email, password_hash, userData.name, userData.phone, userData.shop_id]
  );
  return result.rows[0];
}
```

**Step 2: Update User.findByEmail to filter by shop_id**

Modify `findByEmail` method (line 39-44):

```typescript
static async findByEmail(email: string, shopId: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND shop_id = $2',
    [email, shopId]
  );
  return result.rows[0] || null;
}
```

**Step 3: Update User.findById to verify shop_id**

Modify `findById` method (line 47-52):

```typescript
static async findById(id: number, shopId?: string): Promise<Omit<User, 'password_hash'> | null> {
  const query = shopId
    ? 'SELECT id, email, name, phone, role, shop_id, created_at FROM users WHERE id = $1 AND shop_id = $2'
    : 'SELECT id, email, name, phone, role, shop_id, created_at FROM users WHERE id = $1';

  const params = shopId ? [id, shopId] : [id];
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}
```

**Step 4: Update OAuth methods to include shop_id**

Modify `createOAuthUser` and related methods (lines 104-149):

```typescript
static async createOAuthUser(data: {
  email: string;
  name: string;
  oauth_provider: string;
  oauth_provider_id: string;
  shop_id: string; // Add this
}): Promise<Omit<User, 'password_hash'>> {
  const result = await pool.query(
    `INSERT INTO users (email, name, oauth_provider, oauth_provider_id, shop_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, phone, oauth_provider, oauth_provider_id, shop_id, stripe_customer_id, last_order_id, created_at, updated_at`,
    [data.email, data.name, data.oauth_provider, data.oauth_provider_id, data.shop_id]
  );
  return result.rows[0];
}

static async findByOAuthProvider(provider: string, providerId: string, shopId: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2 AND shop_id = $3',
    [provider, providerId, shopId]
  );
  return result.rows[0] || null;
}

static async findOrCreateOAuthUser(data: {
  email: string;
  name: string;
  oauth_provider: string;
  oauth_provider_id: string;
  shop_id: string; // Add this
}): Promise<Omit<User, 'password_hash'>> {
  // First, try to find by OAuth provider ID within shop
  let user = await this.findByOAuthProvider(data.oauth_provider, data.oauth_provider_id, data.shop_id);

  if (user) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // If not found by provider ID, check if email exists in this shop
  user = await this.findByEmail(data.email, data.shop_id);

  if (user) {
    // Link OAuth to existing account
    const result = await pool.query(
      `UPDATE users SET oauth_provider = $1, oauth_provider_id = $2, updated_at = NOW()
       WHERE id = $3 AND shop_id = $4
       RETURNING id, email, name, phone, oauth_provider, oauth_provider_id, shop_id, stripe_customer_id, last_order_id, created_at, updated_at`,
      [data.oauth_provider, data.oauth_provider_id, user.id, data.shop_id]
    );
    return result.rows[0];
  }

  // Create new OAuth user
  return this.createOAuthUser(data);
}
```

**Step 5: Update User interface**

Add `shop_id` to User interface at the top of the file:

```typescript
export interface User {
  id: number;
  email: string;
  password_hash?: string;
  name: string;
  phone?: string;
  oauth_provider?: string;
  oauth_provider_id?: string;
  stripe_customer_id?: string;
  last_order_id?: number;
  role?: string;
  shop_id: string; // Add this
  created_at: Date;
  updated_at: Date;
}
```

**Step 6: Commit User model changes**

```bash
git add backend/src/models/User.ts
git commit -m "feat: add shop_id filtering to User model"
```

---

### Task 5: Update Order Model for Multi-Tenancy

**Goal:** Add shop_id to all Order queries and creation

**Files:**
- Modify: `backend/src/models/Order.ts:5-21`
- Modify: `backend/src/models/Order.ts:40-57`
- Modify: `backend/src/models/Order.ts:60-121`
- Modify: `backend/src/models/Order.ts:123-229`

**Step 1: Add shop_id to Order interface**

Modify Order interface (line 5):

```typescript
export interface Order {
  id: number;
  user_id?: number;
  shop_id: string; // Add this
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'cancelled';
  payment_intent_id: string;
  tracking_token?: string;
  pickup_time?: Date;
  scheduled_time?: Date;
  is_scheduled?: boolean;
  reminder_sent?: boolean;
  ready_at?: Date;
  created_at: Date;
}
```

**Step 2: Add shop_id to CreateOrderData**

Modify CreateOrderData interface (line 40):

```typescript
export interface CreateOrderData {
  user_id?: number;
  shop_id: string; // Add this
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  total: number;
  payment_intent_id: string;
  pickup_time?: Date;
  scheduled_time?: Date;
  is_scheduled?: boolean;
  items: Array<{
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price_snapshot: number;
    customizations?: Record<string, string>;
  }>;
}
```

**Step 3: Update Order.create to include shop_id**

Modify `create` method (line 60-121):

```typescript
static async create(orderData: CreateOrderData): Promise<OrderWithItems> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tracking token for guest orders
    const tracking_token = orderData.user_id ? null : randomUUID();

    // Insert order WITH shop_id
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, shop_id, guest_email, guest_name, guest_phone, total, status, payment_intent_id, tracking_token, pickup_time, scheduled_time, is_scheduled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        orderData.user_id,
        orderData.shop_id, // Add this parameter
        orderData.guest_email,
        orderData.guest_name,
        orderData.guest_phone,
        orderData.total,
        'pending',
        orderData.payment_intent_id,
        tracking_token,
        orderData.pickup_time,
        orderData.scheduled_time,
        orderData.is_scheduled || false,
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items (no change needed, order_id links to order with shop_id)
    const items: OrderItem[] = [];
    for (const item of orderData.items) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price_snapshot, customizations)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          order.id,
          item.menu_item_id,
          item.menu_item_name,
          item.quantity,
          item.price_snapshot,
          item.customizations ? JSON.stringify(item.customizations) : null,
        ]
      );
      items.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      ...order,
      items,
      customer_name: order.guest_name || 'Registered User',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Step 4: Update all query methods to filter by shop_id**

Update `getById`, `getByUserId`, `getByStatus`, `getRecentOrders` (lines 123-282):

```typescript
static async getById(id: number, shopId?: string): Promise<OrderWithItems | null> {
  const query = shopId
    ? `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.shop_id = $2`
    : `SELECT o.*, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`;

  const params = shopId ? [id, shopId] : [id];
  const orderResult = await pool.query(query, params);

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [id]
  );

  return {
    ...order,
    items: itemsResult.rows,
    customer_name: order.guest_name || 'Registered User',
  };
}

static async getByUserId(userId: number, shopId: string): Promise<OrderWithItems[]> {
  const orderResult = await pool.query(
    `SELECT o.*, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.user_id = $1 AND o.shop_id = $2
     ORDER BY o.created_at DESC`,
    [userId, shopId]
  );

  const orders: OrderWithItems[] = [];

  for (const order of orderResult.rows) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    orders.push({
      ...order,
      items: itemsResult.rows,
      customer_name: 'Registered User',
    });
  }

  return orders;
}

static async getByStatus(statuses: string[], shopId: string): Promise<OrderWithItems[]> {
  const placeholders = statuses.map((_, i) => `$${i + 1}`).join(', ');

  const orderResult = await pool.query(
    `SELECT o.*, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.status IN (${placeholders}) AND o.shop_id = $${statuses.length + 1}
     ORDER BY o.created_at ASC`,
    [...statuses, shopId]
  );

  const orders: OrderWithItems[] = [];

  for (const order of orderResult.rows) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    orders.push({
      ...order,
      items: itemsResult.rows,
      customer_name: order.guest_name || 'Registered User',
    });
  }

  return orders;
}

static async getRecentOrders(limit: number = 50, shopId: string): Promise<OrderWithItems[]> {
  const orderResult = await pool.query(
    `SELECT o.*, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.shop_id = $1
     ORDER BY o.created_at DESC
     LIMIT $2`,
    [shopId, limit]
  );

  const orders: OrderWithItems[] = [];

  for (const order of orderResult.rows) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    orders.push({
      ...order,
      items: itemsResult.rows,
      customer_name: order.guest_name || 'Registered User',
    });
  }

  return orders;
}

static async getScheduledOrders(date: Date, shopId: string): Promise<OrderWithItems[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const orderResult = await pool.query(
    `SELECT * FROM orders
     WHERE is_scheduled = true
       AND scheduled_time >= $1
       AND scheduled_time <= $2
       AND status != 'cancelled'
       AND shop_id = $3
     ORDER BY scheduled_time ASC`,
    [startOfDay, endOfDay, shopId]
  );

  const orders: OrderWithItems[] = [];

  for (const order of orderResult.rows) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    orders.push({
      ...order,
      items: itemsResult.rows,
      customer_name: order.guest_name || 'Registered User',
    });
  }

  return orders;
}
```

**Step 5: Update getByTrackingToken (guest orders still global)**

Note: Tracking tokens should work across shops for guest convenience, but verify shop on updates:

```typescript
static async getByTrackingToken(token: string): Promise<OrderWithItems | null> {
  // Guest tracking tokens are globally unique, no shop filter needed
  const orderResult = await pool.query(
    `SELECT o.*, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.tracking_token = $1`,
    [token]
  );

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [order.id]
  );

  return {
    ...order,
    items: itemsResult.rows,
    customer_name: order.guest_name || 'Registered User',
  };
}
```

**Step 6: Commit Order model changes**

```bash
git add backend/src/models/Order.ts
git commit -m "feat: add shop_id filtering to Order model"
```

---

### Task 6: Update MenuItem Model for Multi-Tenancy

**Goal:** Filter menu items by shop_id

**Files:**
- Modify: `backend/src/models/MenuItem.ts` (all methods)

**Step 1: Update all MenuItem methods**

Add `shopId: string` parameter to all methods:

```typescript
static async getAll(shopId: string): Promise<MenuItem[]> {
  const result = await pool.query(
    'SELECT * FROM menu_items WHERE shop_id = $1 ORDER BY category, name',
    [shopId]
  );
  return result.rows;
}

static async getAvailable(shopId: string): Promise<MenuItem[]> {
  const result = await pool.query(
    'SELECT * FROM menu_items WHERE is_available = true AND shop_id = $1 ORDER BY category, name',
    [shopId]
  );
  return result.rows;
}

static async getById(id: number, shopId: string): Promise<MenuItem | null> {
  const result = await pool.query(
    'SELECT * FROM menu_items WHERE id = $1 AND shop_id = $2',
    [id, shopId]
  );
  return result.rows[0] || null;
}

static async create(data: CreateMenuItemData, shopId: string): Promise<MenuItem> {
  const result = await pool.query(
    `INSERT INTO menu_items (name, description, price, category, image_url, is_available, customization_options, shop_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.name, data.description, data.price, data.category, data.image_url, data.is_available ?? true, JSON.stringify(data.customization_options || []), shopId]
  );
  return result.rows[0];
}

static async update(id: number, updates: Partial<MenuItem>, shopId: string): Promise<MenuItem | null> {
  // Build dynamic update query with shop_id verification
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'shop_id' && value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(key === 'customization_options' ? JSON.stringify(value) : value);
    }
  });

  if (fields.length === 0) return null;

  values.push(id, shopId);

  const result = await pool.query(
    `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramCount++} AND shop_id = $${paramCount++} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

static async delete(id: number, shopId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM menu_items WHERE id = $1 AND shop_id = $2',
    [id, shopId]
  );
  return result.rowCount ? result.rowCount > 0 : false;
}

static async updateAvailability(id: number, isAvailable: boolean, shopId: string): Promise<MenuItem | null> {
  const result = await pool.query(
    'UPDATE menu_items SET is_available = $1 WHERE id = $2 AND shop_id = $3 RETURNING *',
    [isAvailable, id, shopId]
  );
  return result.rows[0] || null;
}
```

**Step 2: Commit MenuItem changes**

```bash
git add backend/src/models/MenuItem.ts
git commit -m "feat: add shop_id filtering to MenuItem model"
```

---

### Task 7: Update Remaining Models

**Goal:** Add shop_id filtering to LoyaltyTransaction, UserMembership, MembershipPlan, Promo, News, BusinessHours, PaymentMethod models

**Files:**
- Modify: `backend/src/models/LoyaltyTransaction.ts`
- Modify: `backend/src/models/UserMembership.ts`
- Modify: `backend/src/models/MembershipPlan.ts`
- Modify: `backend/src/models/Promo.ts`
- Modify: `backend/src/models/News.ts`
- Modify: `backend/src/models/BusinessHours.ts`
- Modify: `backend/src/models/PaymentMethod.ts`

**Step 1: Update each model file**

For each model, add `shopId: string` parameter to all query methods and add `WHERE shop_id = $X` to all queries. Pattern:

```typescript
// Before:
static async getAll(): Promise<Model[]> {
  const result = await pool.query('SELECT * FROM table_name ORDER BY ...');
  return result.rows;
}

// After:
static async getAll(shopId: string): Promise<Model[]> {
  const result = await pool.query(
    'SELECT * FROM table_name WHERE shop_id = $1 ORDER BY ...',
    [shopId]
  );
  return result.rows;
}
```

**Step 2: Special attention to loyalty points**

In `LoyaltyTransaction.ts`, ensure points are scoped to shop:

```typescript
static async getUserBalance(userId: number, shopId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(points), 0) as balance
     FROM loyalty_transactions
     WHERE user_id = $1 AND shop_id = $2`,
    [userId, shopId]
  );
  return parseInt(result.rows[0].balance);
}

static async earnPoints(userId: number, orderId: number, amount: number, description: string, shopId: string): Promise<void> {
  const points = Math.floor(amount); // 1 point per dollar
  await pool.query(
    `INSERT INTO loyalty_transactions (user_id, order_id, points, transaction_type, description, shop_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, orderId, points, 'earn', description, shopId]
  );
}
```

**Step 3: Update interface definitions**

Add `shop_id: string` to all model interfaces.

**Step 4: Commit all model updates**

```bash
git add backend/src/models/*.ts
git commit -m "feat: add shop_id filtering to all remaining models"
```

---

## Phase 3: Update Controllers (Week 3-4)

### Task 8: Update Auth Controller

**Goal:** Pass shop_id from req.shop to User model methods

**Files:**
- Modify: `backend/src/controllers/authController.ts`

**Step 1: Update register endpoint**

Modify `register` function to include shop_id:

```typescript
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, phone } = req.body;

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Check if user exists in THIS shop
    const existingUser = await UserModel.findByEmail(email, req.shop.id);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const user = await UserModel.create({
      email,
      password,
      name,
      phone,
      shop_id: req.shop.id // Add shop_id
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      shopId: req.shop.id // Add to JWT
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 2: Update login endpoint**

```typescript
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Find user in THIS shop only
    const user = await UserModel.findByEmail(email, req.shop.id);
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: req.shop.id // Add to JWT
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 3: Update getProfile**

```typescript
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user belongs to current shop
    const user = await UserModel.findById(req.user.userId, req.shop?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 4: Update OAuth callbacks**

Update `googleAuthCallback` and `findOrCreateOAuthUser` to include shop_id.

**Step 5: Commit auth controller changes**

```bash
git add backend/src/controllers/authController.ts
git commit -m "feat: add shop isolation to auth controller"
```

---

### Task 9: Update Order Controller

**Goal:** Pass req.shop.id to all Order model calls

**Files:**
- Modify: `backend/src/controllers/orderController.ts`

**Step 1: Update createOrder**

Add `shop_id: req.shop.id` to `OrderModel.create()` call (around line 166):

```typescript
// Create order in database
const order = await OrderModel.create({
  user_id,
  shop_id: req.shop!.id, // Add this
  guest_email,
  guest_name,
  guest_phone,
  total,
  payment_intent_id: paymentIntent?.id || 'membership-free',
  pickup_time: pickup_time ? new Date(pickup_time) : undefined,
  scheduled_time: validatedScheduledTime,
  is_scheduled: isScheduled,
  items,
});
```

**Step 2: Update all query methods**

Pass `req.shop.id` to all model calls:

```typescript
export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const order = await OrderModel.getById(id, req.shop!.id); // Add shop filter

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Authorization check: user can see own orders or if employee
    if (order.user_id && req.user?.userId !== order.user_id && req.user?.role !== 'employee') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserOrders(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await OrderModel.getByUserId(req.user.userId, req.shop!.id); // Add shop filter

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getOrdersByStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;

    if (!status) {
      res.status(400).json({ error: 'Status query parameter is required' });
      return;
    }

    const statuses = typeof status === 'string' ? status.split(',') : [];

    const orders = await OrderModel.getByStatus(statuses, req.shop!.id); // Add shop filter

    res.json(orders);
  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRecentOrders(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const orders = await OrderModel.getRecentOrders(limit, req.shop!.id); // Add shop filter

    res.json(orders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 3: Update loyalty/membership integration**

Pass shop_id to loyalty and membership calls within createOrder:

```typescript
// Award loyalty points (line ~207)
if (user_id && originalTotal > 0) {
  try {
    await LoyaltyTransactionModel.earnPoints(
      user_id,
      order.id,
      originalTotal,
      `Purchase - Order #${order.id}`,
      req.shop!.id // Add this
    );
  } catch (error) {
    console.error('Failed to award loyalty points:', error);
  }
}
```

**Step 4: Commit order controller changes**

```bash
git add backend/src/controllers/orderController.ts
git commit -m "feat: add shop isolation to order controller"
```

---

### Task 10: Update Remaining Controllers

**Goal:** Add shop_id parameter to all controller methods

**Files:**
- Modify: `backend/src/controllers/menuController.ts`
- Modify: `backend/src/controllers/loyaltyController.ts`
- Modify: `backend/src/controllers/membershipController.ts`
- Modify: `backend/src/controllers/promoController.ts`
- Modify: `backend/src/controllers/newsController.ts`
- Modify: `backend/src/controllers/schedulingController.ts`
- Modify: `backend/src/controllers/pollingController.ts`

**Step 1: Update each controller**

For each controller method, add `req.shop!.id` to model calls:

```typescript
// Pattern for all controllers:
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const items = await Model.getAll(req.shop!.id); // Add shop filter
    res.json(items);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 2: Commit all controller updates**

```bash
git add backend/src/controllers/*.ts
git commit -m "feat: add shop isolation to all controllers"
```

---

## Phase 4: Update Routes & Apply Middleware (Week 4)

### Task 11: Apply Tenant Middleware to Routes

**Goal:** Add tenant context middleware to all API routes

**Files:**
- Modify: `backend/src/server.ts` or `backend/src/app.ts`

**Step 1: Import and apply tenant middleware globally**

In main server file, add tenant middleware after CORS but before routes:

```typescript
import { extractTenantContext } from './middleware/tenantContext';

// After CORS setup
app.use(cors(corsOptions));

// Extract tenant context for ALL requests
app.use(extractTenantContext);

// Then define routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
// ... rest of routes
```

**Step 2: Test tenant isolation**

Create test script to verify shop isolation:

```bash
# Test 1: Request with X-Shop-ID header
curl -H "X-Shop-ID: barrenground" http://localhost:3000/api/menu

# Test 2: Request with different shop (should get different data)
curl -H "X-Shop-ID: othershop" http://localhost:3000/api/menu
```

**Step 3: Commit middleware integration**

```bash
git add backend/src/server.ts
git commit -m "feat: apply tenant context middleware to all routes"
```

---

## Phase 5: Stripe Connect Integration (Week 5)

### Task 12: Implement Stripe Connect for Multi-Tenant Payments

**Goal:** Support per-shop Stripe accounts using Stripe Connect

**Files:**
- Create: `backend/src/services/stripeConnect.ts`
- Modify: `backend/src/controllers/orderController.ts:144-163`
- Create: `backend/src/controllers/stripeConnectController.ts`

**Step 1: Create Stripe Connect service**

Create `backend/src/services/stripeConnect.ts`:

```typescript
import Stripe from 'stripe';
import { Shop } from '../models/Shop';

// Platform Stripe instance (uses platform secret key)
const platformStripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

/**
 * Get Stripe instance for a specific shop
 * If shop has Connect account, use that. Otherwise use platform account.
 */
export function getStripeForShop(shop: Shop): Stripe | null {
  if (!platformStripe) return null;

  // If shop has their own Stripe Connect account, use it
  if (shop.stripe_account_id) {
    return platformStripe; // Same instance, different account via options
  }

  // Otherwise use platform account
  return platformStripe;
}

/**
 * Create payment intent with shop-specific account
 */
export async function createPaymentIntent(
  shop: Shop,
  amount: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripeForShop(shop);
  if (!stripe) return null;

  const options: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(amount * 100), // Cents
    currency: 'usd',
    metadata,
  };

  // If using Connect account, specify it
  if (shop.stripe_account_id) {
    return await stripe.paymentIntents.create(options, {
      stripeAccount: shop.stripe_account_id,
    });
  }

  // Otherwise create on platform account
  return await stripe.paymentIntents.create(options);
}

/**
 * Create Stripe Connect onboarding link for shop
 */
export async function createConnectAccountLink(shop: Shop): Promise<string | null> {
  if (!platformStripe) return null;

  // Create Connect account if doesn't exist
  let accountId = shop.stripe_account_id;

  if (!accountId) {
    const account = await platformStripe.accounts.create({
      type: 'standard',
      email: shop.email,
      business_profile: {
        name: shop.display_name,
      },
    });
    accountId = account.id;

    // Update shop with account ID
    const { ShopModel } = await import('../models/Shop');
    await ShopModel.update(shop.id, { stripe_account_id: accountId });
  }

  // Create account link for onboarding
  const accountLink = await platformStripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/settings/payments/refresh`,
    return_url: `${process.env.FRONTEND_URL}/settings/payments/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}
```

**Step 2: Update order controller to use Stripe Connect**

Modify `createOrder` in `orderController.ts` (around line 144):

```typescript
// Create Stripe PaymentIntent using shop-specific account
let paymentIntent: Stripe.PaymentIntent | null = null;
if (total > 0) {
  if (req.shop) {
    paymentIntent = await createPaymentIntent(req.shop, total, {
      user_id: user_id?.toString() || 'guest',
      guest_email: guest_email || '',
      shop_id: req.shop.id,
      membership_used: membershipUsed.toString(),
    });
  }

  if (!paymentIntent) {
    // Fallback to mock if Stripe not configured
    paymentIntent = {
      id: `mock_pi_${Date.now()}`,
      client_secret: `mock_secret_${Date.now()}`,
    } as Stripe.PaymentIntent;
    console.log('⚠️  Using mock payment (Stripe not configured for shop)');
  }
}
```

**Step 3: Create Connect controller for onboarding**

Create `backend/src/controllers/stripeConnectController.ts`:

```typescript
import { Request, Response } from 'express';
import { createConnectAccountLink } from '../services/stripeConnect';

export async function createOnboardingLink(req: Request, res: Response): Promise<void> {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Only admins can access
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const url = await createConnectAccountLink(req.shop);

    if (!url) {
      res.status(500).json({ error: 'Failed to create onboarding link' });
      return;
    }

    res.json({ url });
  } catch (error) {
    console.error('Create onboarding link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 4: Add Stripe Connect routes**

Add to routes:

```typescript
import { createOnboardingLink } from './controllers/stripeConnectController';

router.post('/api/stripe-connect/onboarding', authenticateToken, createOnboardingLink);
```

**Step 5: Test Stripe Connect**

Test: Create second shop and verify separate payment accounts

**Step 6: Commit Stripe Connect integration**

```bash
git add backend/src/services/stripeConnect.ts backend/src/controllers/orderController.ts backend/src/controllers/stripeConnectController.ts
git commit -m "feat: implement Stripe Connect for multi-tenant payments"
```

---

## Phase 6: Per-Tenant Email Configuration (Week 5)

### Task 13: Support Per-Shop Email Configuration

**Goal:** Allow each shop to use their own SendGrid API key and from address

**Files:**
- Modify: `backend/src/services/emailService.ts`

**Step 1: Update email service to use shop config**

Modify `EmailService` class:

```typescript
import sgMail from '@sendgrid/mail';
import { Shop } from '../models/Shop';

export class EmailService {
  /**
   * Get SendGrid client for shop
   */
  private static getSendGridForShop(shop: Shop): typeof sgMail | null {
    const apiKey = shop.sendgrid_api_key || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      console.warn(`No SendGrid API key for shop ${shop.id}`);
      return null;
    }

    // Create new instance per shop
    const client = require('@sendgrid/mail');
    client.setApiKey(apiKey);
    return client;
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(order: OrderWithItems, shop: Shop): Promise<void> {
    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log('📧 [Mock Email] Order confirmation for', order.user_email || order.guest_email);
      return;
    }

    const fromEmail = shop.email_from || process.env.EMAIL_FROM || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    const msg = {
      to: order.user_email || order.guest_email,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: `Order Confirmation #${order.id} - ${shop.display_name}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order #${order.id} has been received.</p>
        <p>Total: $${order.total.toFixed(2)}</p>
        ${order.tracking_token ? `<p>Track your order: ${process.env.FRONTEND_URL}/track/${order.tracking_token}</p>` : ''}
      `,
    };

    try {
      await client.send(msg);
      console.log(`📧 Order confirmation sent to ${msg.to} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }

  // Update all other email methods similarly...
  static async sendOrderReady(order: OrderWithItems, shop: Shop): Promise<void> {
    // Similar pattern
  }

  static async sendPasswordReset(email: string, resetToken: string, shop: Shop): Promise<void> {
    // Similar pattern
  }
}
```

**Step 2: Update all email calls in controllers**

Pass `req.shop` to email service:

```typescript
// In orderController.ts
await EmailService.sendOrderConfirmation(order, req.shop!);

// In authController.ts
await EmailService.sendPasswordReset(email, token, req.shop!);
```

**Step 3: Commit email service changes**

```bash
git add backend/src/services/emailService.ts backend/src/controllers/*.ts
git commit -m "feat: support per-shop email configuration"
```

---

## Phase 7: Frontend Updates (Week 6)

### Task 14: Update Frontend API Clients

**Goal:** Ensure frontend passes shop context (if needed) and works with multi-tenant backend

**Files:**
- Modify: `customer-frontend/src/api/*.ts`
- Modify: `employee-dashboard/src/api/*.ts`

**Step 1: Update API base URL configuration**

Most frontend changes are minimal since shop context comes from domain/subdomain. Update axios instances if needed:

```typescript
// customer-frontend/src/api/client.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include shop ID if in dev/testing
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    const shopId = import.meta.env.VITE_SHOP_ID || 'barrenground';
    config.headers['X-Shop-ID'] = shopId;
    return config;
  });
}
```

**Step 2: Test frontend with different shops**

Test: Load frontend with `X-Shop-ID` header pointing to different shops

**Step 3: Commit frontend changes**

```bash
git add customer-frontend/src/api/*.ts employee-dashboard/src/api/*.ts
git commit -m "feat: update frontend for multi-tenant support"
```

---

## Phase 8: Testing & Documentation (Week 6-7)

### Task 15: Create Multi-Tenant Test Suite

**Goal:** Verify data isolation between shops

**Files:**
- Create: `backend/tests/multi-tenant.test.ts`

**Step 1: Write isolation tests**

Create `backend/tests/multi-tenant.test.ts`:

```typescript
import { ShopModel } from '../src/models/Shop';
import { UserModel } from '../src/models/User';
import { OrderModel } from '../src/models/Order';
import { MenuItemModel } from '../src/models/MenuItem';

describe('Multi-Tenant Isolation', () => {
  const shop1 = 'testshop1';
  const shop2 = 'testshop2';

  beforeAll(async () => {
    // Create two test shops
    await ShopModel.create({
      id: shop1,
      name: 'Test Shop 1',
      display_name: 'Test Shop 1',
      email: 'shop1@test.com',
      subdomain: 'shop1',
    });

    await ShopModel.create({
      id: shop2,
      name: 'Test Shop 2',
      display_name: 'Test Shop 2',
      email: 'shop2@test.com',
      subdomain: 'shop2',
    });
  });

  test('Users are isolated by shop', async () => {
    // Create user in shop1
    const user1 = await UserModel.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      shop_id: shop1,
    });

    // Same email in shop2 should be allowed
    const user2 = await UserModel.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      shop_id: shop2,
    });

    // Should be different users
    expect(user1.id).not.toBe(user2.id);

    // Query should only return user from specific shop
    const foundUser1 = await UserModel.findByEmail('user@test.com', shop1);
    const foundUser2 = await UserModel.findByEmail('user@test.com', shop2);

    expect(foundUser1?.id).toBe(user1.id);
    expect(foundUser2?.id).toBe(user2.id);
  });

  test('Orders are isolated by shop', async () => {
    // Create orders for each shop
    const order1 = await OrderModel.create({
      shop_id: shop1,
      guest_email: 'guest@test.com',
      guest_name: 'Guest',
      total: 10,
      payment_intent_id: 'test_pi_1',
      items: [{
        menu_item_id: 1,
        menu_item_name: 'Coffee',
        quantity: 1,
        price_snapshot: 10,
      }],
    });

    const order2 = await OrderModel.create({
      shop_id: shop2,
      guest_email: 'guest@test.com',
      guest_name: 'Guest',
      total: 15,
      payment_intent_id: 'test_pi_2',
      items: [{
        menu_item_id: 1,
        menu_item_name: 'Coffee',
        quantity: 1,
        price_snapshot: 15,
      }],
    });

    // Get orders by status should only return shop-specific orders
    const shop1Orders = await OrderModel.getByStatus(['pending'], shop1);
    const shop2Orders = await OrderModel.getByStatus(['pending'], shop2);

    expect(shop1Orders.find(o => o.id === order1.id)).toBeDefined();
    expect(shop1Orders.find(o => o.id === order2.id)).toBeUndefined();

    expect(shop2Orders.find(o => o.id === order2.id)).toBeDefined();
    expect(shop2Orders.find(o => o.id === order1.id)).toBeUndefined();
  });

  test('Menu items are isolated by shop', async () => {
    const item1 = await MenuItemModel.create({
      name: 'Shop 1 Coffee',
      price: 5,
      category: 'beverages',
    }, shop1);

    const item2 = await MenuItemModel.create({
      name: 'Shop 2 Coffee',
      price: 6,
      category: 'beverages',
    }, shop2);

    // Get all items should only return shop-specific items
    const shop1Items = await MenuItemModel.getAll(shop1);
    const shop2Items = await MenuItemModel.getAll(shop2);

    expect(shop1Items.find(i => i.id === item1.id)).toBeDefined();
    expect(shop1Items.find(i => i.id === item2.id)).toBeUndefined();

    expect(shop2Items.find(i => i.id === item2.id)).toBeDefined();
    expect(shop2Items.find(i => i.id === item1.id)).toBeUndefined();
  });
});
```

**Step 2: Run tests**

Run: `npm test -- multi-tenant`

Expected: All tests pass, proving data isolation

**Step 3: Commit tests**

```bash
git add backend/tests/multi-tenant.test.ts
git commit -m "test: add multi-tenant isolation tests"
```

---

### Task 16: Create Multi-Tenant Documentation

**Goal:** Document how to onboard new shops

**Files:**
- Create: `docs/MULTI_TENANT_GUIDE.md`

**Step 1: Write onboarding guide**

Create `docs/MULTI_TENANT_GUIDE.md`:

```markdown
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
```

**Step 2: Commit documentation**

```bash
git add docs/MULTI_TENANT_GUIDE.md
git commit -m "docs: add multi-tenant onboarding guide"
```

---

## Final Tasks

### Task 17: Create Migration Rollback Scripts

**Files:**
- Create: `backend/src/migrations/rollback/002_remove_shop_id.sql`
- Create: `backend/src/migrations/rollback/001_drop_shops_table.sql`

**Step 1: Write rollback scripts**

Create rollback SQL files in case migration needs to be reversed.

**Step 2: Commit rollback scripts**

```bash
git add backend/src/migrations/rollback/*.sql
git commit -m "chore: add migration rollback scripts"
```

---

### Task 18: Performance Optimization

**Goal:** Ensure queries with shop_id are performant

**Files:**
- Create: `backend/src/migrations/003_optimize_indexes.sql`

**Step 1: Add composite indexes**

```sql
-- Composite indexes for common queries
CREATE INDEX idx_orders_shop_status_created ON orders(shop_id, status, created_at DESC);
CREATE INDEX idx_users_shop_email ON users(shop_id, email);
CREATE INDEX idx_menu_items_shop_category ON menu_items(shop_id, category);
CREATE INDEX idx_loyalty_shop_user ON loyalty_transactions(shop_id, user_id);
```

**Step 2: Run EXPLAIN ANALYZE on common queries**

Run: `EXPLAIN ANALYZE SELECT * FROM orders WHERE shop_id = 'barrenground' AND status = 'pending';`

Expected: Query uses index scan, not sequential scan

**Step 3: Commit optimizations**

```bash
git add backend/src/migrations/003_optimize_indexes.sql
git commit -m "perf: add composite indexes for multi-tenant queries"
```

---

## Plan Complete

**Total Implementation Steps**: 18 major tasks, ~150 individual steps

**Deliverables:**
- ✅ Shops table with multi-tenant configuration
- ✅ `shop_id` on all data tables with foreign keys
- ✅ Tenant context middleware
- ✅ All models updated with shop filtering
- ✅ All controllers passing shop context
- ✅ Stripe Connect integration
- ✅ Per-shop email configuration
- ✅ Frontend compatibility
- ✅ Comprehensive test suite
- ✅ Multi-tenant documentation
- ✅ Performance optimization

**Security Verification Checklist:**
- [ ] No query accesses data without `shop_id` filter
- [ ] JWT includes `shopId` claim
- [ ] Middleware verifies user's shop matches request shop
- [ ] Staff endpoints check role AND shop ownership
- [ ] Stripe payments go to correct shop account
- [ ] Emails sent from correct shop address

**Next Steps After Implementation:**
1. Run full test suite: `npm test`
2. Load test with multiple shops
3. Security audit of all endpoints
4. Performance testing with 10+ shops
5. Deploy to staging with 2 test shops
6. Production deployment with migration plan
