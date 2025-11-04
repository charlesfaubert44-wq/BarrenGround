-- Advanced Order Scheduling System
-- Add scheduling columns to orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_orders_scheduled ON orders(scheduled_time) WHERE is_scheduled = true;
CREATE INDEX IF NOT EXISTS idx_orders_reminder ON orders(reminder_sent, scheduled_time) WHERE is_scheduled = true;

-- Business hours configuration table
CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  max_orders_per_slot INTEGER DEFAULT 20,
  slot_duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_day_of_week UNIQUE (day_of_week)
);

-- Insert default business hours (Mon-Sat, 7 AM - 6 PM, Sunday closed)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed, max_orders_per_slot, slot_duration_minutes) VALUES
  (0, '00:00', '00:00', true, 20, 15),  -- Sunday closed
  (1, '07:00', '18:00', false, 20, 15), -- Monday
  (2, '07:00', '18:00', false, 20, 15), -- Tuesday
  (3, '07:00', '18:00', false, 20, 15), -- Wednesday
  (4, '07:00', '18:00', false, 20, 15), -- Thursday
  (5, '07:00', '18:00', false, 20, 15), -- Friday
  (6, '07:00', '18:00', false, 20, 15)  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Create index for business hours lookup
CREATE INDEX IF NOT EXISTS idx_business_hours_day ON business_hours(day_of_week);
