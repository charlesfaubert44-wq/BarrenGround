-- Multi-Tenant Schema Migration
-- This schema adds shop_id to support multiple coffee shops

-- Shops table (tenants)
CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Canada',
  domain VARCHAR(255) UNIQUE,
  subdomain VARCHAR(100) UNIQUE,
  stripe_account_id VARCHAR(255),
  stripe_publishable_key VARCHAR(255),
  sendgrid_api_key VARCHAR(255),
  email_from VARCHAR(255),
  email_from_name VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#8B4513',
  secondary_color VARCHAR(7) DEFAULT '#D2691E',
  config JSONB DEFAULT '{}',
  features JSONB DEFAULT '{"membership": true, "loyalty": true, "scheduling": true, "delivery": false, "catering": false}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for shops
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(domain);
CREATE INDEX IF NOT EXISTS idx_shops_subdomain ON shops(subdomain);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

-- Add shop_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_users_shop ON users(shop_id);

-- Add shop_id to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_menu_items_shop ON menu_items(shop_id);

-- Add shop_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);

-- Add shop_id to membership_plans table
ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_shop ON membership_plans(shop_id);

-- Add shop_id to user_memberships table
ALTER TABLE user_memberships ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_shop ON user_memberships(shop_id);

-- Add shop_id to loyalty_transactions table
ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_shop ON loyalty_transactions(shop_id);

-- Add shop_id to business_hours table
ALTER TABLE business_hours ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
DROP INDEX IF EXISTS idx_business_hours_day;
CREATE INDEX IF NOT EXISTS idx_business_hours_shop_day ON business_hours(shop_id, day_of_week);

-- Drop and recreate unique constraint for business_hours to include shop_id
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS unique_day_of_week;
ALTER TABLE business_hours ADD CONSTRAINT unique_shop_day_of_week UNIQUE (shop_id, day_of_week);

-- Add shop_id to promos table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promos') THEN
    ALTER TABLE promos ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
    CREATE INDEX IF NOT EXISTS idx_promos_shop ON promos(shop_id);
  END IF;
END $$;

-- Add shop_id to news table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'news') THEN
    ALTER TABLE news ADD COLUMN IF NOT EXISTS shop_id VARCHAR(50) REFERENCES shops(id);
    CREATE INDEX IF NOT EXISTS idx_news_shop ON news(shop_id);
  END IF;
END $$;

-- Insert default shop (Barren Ground Coffee)
INSERT INTO shops (
  id, name, display_name, email, phone, city, province, country, subdomain,
  features, status
) VALUES (
  'barrenground',
  'Barren Ground Coffee',
  'Barren Ground Coffee',
  'hello@barrengroundcoffee.com',
  '(867) 873-3030',
  'Yellowknife',
  'Northwest Territories',
  'Canada',
  'barrenground',
  '{"membership": true, "loyalty": true, "scheduling": true, "delivery": false, "catering": false}',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Update existing records to belong to barrenground shop if they don't have a shop_id
UPDATE users SET shop_id = 'barrenground' WHERE shop_id IS NULL;
UPDATE menu_items SET shop_id = 'barrenground' WHERE shop_id IS NULL;
UPDATE orders SET shop_id = 'barrenground' WHERE shop_id IS NULL;
UPDATE membership_plans SET shop_id = 'barrenground' WHERE shop_id IS NULL;
UPDATE user_memberships SET shop_id = 'barrenground' WHERE shop_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loyalty_transactions' AND column_name = 'shop_id') THEN
    UPDATE loyalty_transactions SET shop_id = 'barrenground' WHERE shop_id IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'business_hours' AND column_name = 'shop_id') THEN
    UPDATE business_hours SET shop_id = 'barrenground' WHERE shop_id IS NULL;
  END IF;
END $$;

-- Create employees table for staff management
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'barista' CHECK (role IN ('owner', 'manager', 'barista', 'cashier')),
  pin VARCHAR(6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

CREATE INDEX IF NOT EXISTS idx_employees_shop ON employees(shop_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);

COMMENT ON TABLE shops IS 'Multi-tenant shops/coffee house configurations';
COMMENT ON TABLE employees IS 'Staff members assigned to shops with roles';
