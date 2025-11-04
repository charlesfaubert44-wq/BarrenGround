-- Loyalty Points System Schema
-- Tracks loyalty points earned and redeemed by customers

-- Loyalty transactions table - tracks all points movements
CREATE TABLE loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0,
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'bonus', 'adjustment'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id, created_at DESC);
CREATE INDEX idx_loyalty_order ON loyalty_transactions(order_id);

-- Add points balance to users table for quick access
ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0;
CREATE INDEX idx_users_points ON users(loyalty_points);

-- Track birthday for bonus points
ALTER TABLE users ADD COLUMN date_of_birth DATE;

-- Add tracking for last birthday bonus year
ALTER TABLE users ADD COLUMN last_birthday_bonus_year INTEGER;

COMMENT ON TABLE loyalty_transactions IS 'Tracks all loyalty point transactions - earning, spending, and bonuses';
COMMENT ON COLUMN loyalty_transactions.transaction_type IS 'Type of transaction: earn (purchases), redeem (used points), bonus (birthday/referral), adjustment (admin correction)';
COMMENT ON COLUMN users.loyalty_points IS 'Current loyalty points balance for quick access';
COMMENT ON COLUMN users.date_of_birth IS 'User birthday for birthday bonus points (50 points annually)';
COMMENT ON COLUMN users.last_birthday_bonus_year IS 'Year of last birthday bonus to prevent duplicate awards';
