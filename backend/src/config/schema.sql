-- Users (registered customers)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable for OAuth users
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  oauth_provider VARCHAR(50), -- 'google', 'apple', etc.
  oauth_provider_id VARCHAR(255), -- ID from OAuth provider
  stripe_customer_id VARCHAR(255), -- For saved payment methods
  last_order_id INTEGER, -- Track last order for repeat functionality
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT password_or_oauth CHECK (
    (password_hash IS NOT NULL AND oauth_provider IS NULL) OR
    (password_hash IS NULL AND oauth_provider IS NOT NULL) OR
    (password_hash IS NOT NULL AND oauth_provider IS NOT NULL)
  )
);

-- Saved payment methods for users
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'card', 'apple_pay', etc.
  last4 VARCHAR(4), -- Last 4 digits for cards
  brand VARCHAR(50), -- 'visa', 'mastercard', etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255) NOT NULL,
  tracking_token UUID,
  pickup_time TIMESTAMP,
  customer_status VARCHAR(50), -- 'on-my-way', 'delayed', 'wont-make-it'
  customer_status_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  )
);

-- Order items (line items)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL,
  customizations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth_provider_id ON users(oauth_provider_id);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_payment_method_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Membership plans
CREATE TABLE membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval VARCHAR(50) NOT NULL, -- 'week', 'month', 'year'
  coffees_per_interval INTEGER NOT NULL,
  stripe_price_id VARCHAR(255), -- Stripe price ID for subscriptions
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User memberships (active subscriptions)
CREATE TABLE user_memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES membership_plans(id),
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'expired'
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  coffees_remaining INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership usage tracking
CREATE TABLE membership_usage (
  id SERIAL PRIMARY KEY,
  user_membership_id INTEGER REFERENCES user_memberships(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  coffee_name VARCHAR(255)
);

-- Indexes for memberships
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_user_memberships_stripe_subscription_id ON user_memberships(stripe_subscription_id);
CREATE INDEX idx_membership_usage_user_membership_id ON membership_usage(user_membership_id);
CREATE INDEX idx_membership_usage_redeemed_at ON membership_usage(redeemed_at);

-- Sample membership plan: "1 coffee a day" for $25/week
INSERT INTO membership_plans (name, description, price, interval, coffees_per_interval, active) VALUES
  ('1 Coffee a Day', 'Enjoy one delicious coffee every day for just $25/week', 25.00, 'week', 7, true);

-- Sample menu data

-- Hot Coffee
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Espresso', 'Rich and bold double shot of premium espresso', 3.50, 'coffee', true),
  ('Cappuccino', 'Classic espresso with velvety steamed milk and foam', 4.50, 'coffee', true),
  ('Latte', 'Smooth espresso with perfectly steamed milk', 4.75, 'coffee', true),
  ('Americano', 'Bold espresso diluted with hot water', 3.75, 'coffee', true),
  ('Mocha', 'Rich chocolate and espresso with steamed milk', 5.25, 'coffee', true),
  ('Flat White', 'Double ristretto shots with microfoam milk', 4.75, 'coffee', true),
  ('Cortado', 'Equal parts espresso and steamed milk', 4.25, 'coffee', true),
  ('Macchiato', 'Espresso marked with a dollop of foam', 3.75, 'coffee', true);

-- Drip Coffee
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('House Drip Coffee', 'Our signature medium roast, smooth and balanced', 2.50, 'drip-coffee', true),
  ('Dark Roast', 'Bold and robust dark roast for the adventurous', 2.75, 'drip-coffee', true),
  ('Blonde Roast', 'Light and bright with subtle citrus notes', 2.50, 'drip-coffee', true),
  ('Pour Over', 'Single-origin coffee brewed to perfection', 4.50, 'drip-coffee', true),
  ('French Press', 'Full-bodied and aromatic coffee experience', 4.00, 'drip-coffee', true);

-- Cold Drinks
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Iced Latte', 'Espresso and cold milk over ice', 5.25, 'cold-drinks', true),
  ('Iced Americano', 'Espresso and cold water over ice', 4.25, 'cold-drinks', true),
  ('Cold Brew', 'Smooth, naturally sweet cold-steeped coffee', 4.75, 'cold-drinks', true),
  ('Nitro Cold Brew', 'Creamy cold brew infused with nitrogen', 5.50, 'cold-drinks', true),
  ('Iced Mocha', 'Chocolate, espresso, and milk over ice', 5.75, 'cold-drinks', true),
  ('Iced Caramel Latte', 'Espresso, milk, and caramel over ice', 5.75, 'cold-drinks', true),
  ('Vanilla Iced Coffee', 'House coffee with vanilla and cream over ice', 4.50, 'cold-drinks', true),
  ('Frappe', 'Blended iced coffee drink with whipped cream', 6.00, 'cold-drinks', true);

-- Specialty Drinks
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Chai Latte', 'Spiced tea with steamed milk and honey', 4.75, 'specialty', true),
  ('Matcha Latte', 'Premium Japanese green tea with steamed milk', 5.50, 'specialty', true),
  ('Hot Chocolate', 'Rich Belgian chocolate with steamed milk', 4.25, 'specialty', true),
  ('White Mocha', 'Espresso with white chocolate and steamed milk', 5.50, 'specialty', true),
  ('Caramel Macchiato', 'Vanilla, espresso, milk, and caramel drizzle', 5.50, 'specialty', true),
  ('Honey Lavender Latte', 'Espresso with honey, lavender, and milk', 5.75, 'specialty', true),
  ('Pumpkin Spice Latte', 'Seasonal favorite with pumpkin and spices', 5.75, 'specialty', true),
  ('London Fog', 'Earl Grey tea with vanilla and steamed milk', 4.50, 'specialty', true);

-- Pastries
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Butter Croissant', 'Buttery, flaky French pastry baked fresh daily', 3.50, 'pastries', true),
  ('Chocolate Croissant', 'Flaky croissant filled with rich dark chocolate', 4.25, 'pastries', true),
  ('Almond Croissant', 'Croissant with almond cream and sliced almonds', 4.50, 'pastries', true),
  ('Blueberry Muffin', 'Fresh blueberries in a moist vanilla muffin', 3.75, 'pastries', true),
  ('Chocolate Chip Muffin', 'Double chocolate muffin with chocolate chips', 3.75, 'pastries', true),
  ('Banana Nut Muffin', 'Moist banana muffin with walnuts', 3.75, 'pastries', true),
  ('Cinnamon Roll', 'Warm cinnamon roll with cream cheese frosting', 4.50, 'pastries', true),
  ('Scone', 'Buttery scone with your choice of flavor', 3.50, 'pastries', true),
  ('Danish', 'Flaky pastry with fruit or cheese filling', 4.00, 'pastries', true),
  ('Donut', 'Fresh daily donuts in various flavors', 2.75, 'pastries', true),
  ('Biscotti', 'Crunchy twice-baked Italian cookie', 2.50, 'pastries', true),
  ('Cookie', 'Fresh-baked cookies - chocolate chip or oatmeal', 2.75, 'pastries', true);

-- Food
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Bagel with Cream Cheese', 'Toasted bagel with your choice of cream cheese', 4.50, 'food', true),
  ('Breakfast Sandwich', 'Egg, cheese, and your choice of meat on a bagel', 6.50, 'food', true),
  ('Avocado Toast', 'Smashed avocado on artisan bread with toppings', 7.50, 'food', true),
  ('Granola Bowl', 'House-made granola with yogurt and fresh fruit', 6.75, 'food', true),
  ('Oatmeal', 'Steel-cut oats with brown sugar and toppings', 5.50, 'food', true),
  ('Turkey & Swiss Sandwich', 'Fresh turkey, swiss cheese, lettuce, and tomato', 8.50, 'food', true),
  ('Caprese Sandwich', 'Fresh mozzarella, tomato, basil, and balsamic', 8.00, 'food', true),
  ('Grilled Cheese', 'Classic grilled cheese on sourdough bread', 6.50, 'food', true),
  ('Veggie Wrap', 'Hummus, fresh veggies, and greens in a wrap', 7.50, 'food', true),
  ('Chicken Caesar Wrap', 'Grilled chicken, romaine, parmesan, and caesar', 8.50, 'food', true),
  ('Fruit Cup', 'Fresh seasonal fruit selection', 4.50, 'food', true),
  ('Yogurt Parfait', 'Greek yogurt layered with granola and berries', 5.50, 'food', true);
