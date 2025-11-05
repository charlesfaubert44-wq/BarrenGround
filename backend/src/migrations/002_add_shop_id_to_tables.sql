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
