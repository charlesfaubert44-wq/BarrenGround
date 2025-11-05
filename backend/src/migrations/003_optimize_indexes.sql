-- Performance Optimization: Add composite indexes for multi-tenant queries
-- These indexes improve query performance for common filtering patterns

-- Orders: Optimize queries filtering by shop, status, and ordering by created_at
-- Common query: SELECT * FROM orders WHERE shop_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_shop_status_created ON orders(shop_id, status, created_at DESC);

-- Users: Optimize lookups by shop and email (login, user search)
-- Common query: SELECT * FROM users WHERE shop_id = ? AND email = ?
CREATE INDEX IF NOT EXISTS idx_users_shop_email ON users(shop_id, email);

-- Menu Items: Optimize queries filtering by shop and category
-- Common query: SELECT * FROM menu_items WHERE shop_id = ? AND category = ?
CREATE INDEX IF NOT EXISTS idx_menu_items_shop_category ON menu_items(shop_id, category);

-- Loyalty Transactions: Optimize queries for user loyalty history per shop
-- Common query: SELECT * FROM loyalty_transactions WHERE shop_id = ? AND user_id = ?
CREATE INDEX IF NOT EXISTS idx_loyalty_shop_user ON loyalty_transactions(shop_id, user_id);
