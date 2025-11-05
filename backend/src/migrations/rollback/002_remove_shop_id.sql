-- Rollback: Remove shop_id from all tables (reverses migration 002)
-- WARNING: This will remove all multi-tenant data partitioning!
-- This should only be used in development or emergency rollback scenarios

-- Remove shop_id from payment_methods table
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS fk_payment_methods_shop;
DROP INDEX IF EXISTS idx_payment_methods_shop_id;
ALTER TABLE payment_methods DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from business_hours table
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS fk_business_hours_shop;
DROP INDEX IF EXISTS idx_business_hours_shop_id;
ALTER TABLE business_hours DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from news table
ALTER TABLE news DROP CONSTRAINT IF EXISTS fk_news_shop;
DROP INDEX IF EXISTS idx_news_shop_id;
ALTER TABLE news DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from promos table
ALTER TABLE promos DROP CONSTRAINT IF EXISTS fk_promos_shop;
DROP INDEX IF EXISTS idx_promos_shop_id;
ALTER TABLE promos DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from user_memberships table
ALTER TABLE user_memberships DROP CONSTRAINT IF EXISTS fk_user_memberships_shop;
DROP INDEX IF EXISTS idx_user_memberships_shop_id;
ALTER TABLE user_memberships DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from membership_plans table
ALTER TABLE membership_plans DROP CONSTRAINT IF EXISTS fk_membership_plans_shop;
DROP INDEX IF EXISTS idx_membership_plans_shop_id;
ALTER TABLE membership_plans DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from loyalty_transactions table
ALTER TABLE loyalty_transactions DROP CONSTRAINT IF EXISTS fk_loyalty_transactions_shop;
DROP INDEX IF EXISTS idx_loyalty_transactions_shop_id;
ALTER TABLE loyalty_transactions DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from menu_items table
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS fk_menu_items_shop;
DROP INDEX IF EXISTS idx_menu_items_shop_id;
ALTER TABLE menu_items DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from orders table (including composite index)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_shop;
DROP INDEX IF EXISTS idx_orders_shop_status;
DROP INDEX IF EXISTS idx_orders_shop_id;
ALTER TABLE orders DROP COLUMN IF EXISTS shop_id;

-- Remove shop_id from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_shop;
DROP INDEX IF EXISTS idx_users_shop_id;
ALTER TABLE users DROP COLUMN IF EXISTS shop_id;
