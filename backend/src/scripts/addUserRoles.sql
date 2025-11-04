-- Add role column to users table for employee/admin authorization
-- Run this migration to add role-based access control

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add constraint to ensure only valid roles
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_user_role
  CHECK (role IN ('customer', 'employee', 'admin'));

-- Update existing users to have customer role (safe default)
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- Example: Promote specific user to admin (replace with actual admin email)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@barrengroundcoffee.com';

COMMENT ON COLUMN users.role IS 'User role: customer (default), employee, or admin';
