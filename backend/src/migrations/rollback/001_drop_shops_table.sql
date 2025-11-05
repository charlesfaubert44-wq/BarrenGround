-- Rollback: Drop shops table (reverses migration 001)
-- WARNING: This will delete all shop configuration data!
-- This should only be used in development or emergency rollback scenarios
-- IMPORTANT: Run 002_remove_shop_id.sql BEFORE running this script

-- Drop indexes first
DROP INDEX IF EXISTS idx_shops_status;
DROP INDEX IF EXISTS idx_shops_subdomain;
DROP INDEX IF EXISTS idx_shops_domain;

-- Drop the shops table
DROP TABLE IF EXISTS shops CASCADE;
