-- Create shops table
CREATE TABLE shops (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'barrenground', 'sunrise-cafe'
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,

  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Location
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Canada',

  -- Domain configuration
  domain VARCHAR(255), -- e.g., 'barrenground.coffee'
  subdomain VARCHAR(100), -- e.g., 'barrenground' for barrenground.platform.com

  -- Payment configuration
  stripe_account_id VARCHAR(255), -- Stripe Connect account
  stripe_publishable_key VARCHAR(255),

  -- Email configuration
  sendgrid_api_key VARCHAR(255),
  email_from VARCHAR(255),
  email_from_name VARCHAR(255),

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7),

  -- Configuration JSON for flexible settings
  config JSONB DEFAULT '{}',

  -- Feature flags
  features JSONB DEFAULT '{
    "membership": true,
    "loyalty": true,
    "scheduling": true,
    "delivery": false,
    "catering": false
  }',

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(domain),
  UNIQUE(subdomain)
);

-- Create index for lookups
CREATE INDEX idx_shops_domain ON shops(domain);
CREATE INDEX idx_shops_subdomain ON shops(subdomain);
CREATE INDEX idx_shops_status ON shops(status);

-- Insert default Barren Ground shop
INSERT INTO shops (
  id, name, display_name, email, phone,
  subdomain, domain,
  email_from, email_from_name
) VALUES (
  'barrenground',
  'barrenground',
  'Barren Ground Coffee',
  'hello@barrengroundcoffee.com',
  '(867) 873-3030',
  'barrenground',
  'barrengroundcoffee.com',
  'noreply@barrengroundcoffee.com',
  'Barren Ground Coffee'
);
