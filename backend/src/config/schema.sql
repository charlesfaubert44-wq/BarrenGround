-- Users (registered customers)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
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
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Sample menu data
INSERT INTO menu_items (name, description, price, category, available) VALUES
  ('Espresso', 'Rich and bold espresso shot', 3.50, 'coffee', true),
  ('Cappuccino', 'Espresso with steamed milk and foam', 4.50, 'coffee', true),
  ('Latte', 'Smooth espresso with steamed milk', 4.75, 'coffee', true),
  ('Americano', 'Espresso with hot water', 3.75, 'coffee', true),
  ('Croissant', 'Buttery, flaky French pastry', 3.00, 'pastries', true),
  ('Blueberry Muffin', 'Fresh blueberries in a moist muffin', 3.50, 'pastries', true),
  ('Bagel with Cream Cheese', 'Toasted bagel with plain cream cheese', 4.00, 'pastries', true);
