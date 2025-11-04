#!/usr/bin/env node

/**
 * White-Label Coffee Shop Setup Wizard
 *
 * This interactive script helps configure the system for a new coffee shop client.
 * It will prompt for all necessary information and generate configured .env files.
 *
 * Usage: node setup-wizard.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration object to store all answers
const config = {};

/**
 * Promisified question function
 */
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function printSection(title) {
  console.log('');
  print('═'.repeat(70), 'blue');
  print(` ${title}`, 'bright');
  print('═'.repeat(70), 'blue');
  console.log('');
}

/**
 * Ask with default value
 */
async function askWithDefault(question, defaultValue) {
  const answer = await ask(`${question} ${colors.cyan}[${defaultValue}]${colors.reset}: `);
  return answer.trim() || defaultValue;
}

/**
 * Ask yes/no question
 */
async function askYesNo(question, defaultValue = true) {
  const defaultStr = defaultValue ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} ${colors.cyan}[${defaultStr}]${colors.reset}: `);
  const normalized = answer.trim().toLowerCase();

  if (!normalized) return defaultValue;
  return normalized === 'y' || normalized === 'yes';
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 */
function isValidPhone(phone) {
  return /^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone) || /^\d{10}$/.test(phone);
}

/**
 * Format phone number
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Validate hex color
 */
function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Main setup wizard
 */
async function runSetupWizard() {
  print('╔════════════════════════════════════════════════════════════════════╗', 'green');
  print('║                                                                    ║', 'green');
  print('║        White-Label Coffee Shop Ordering System                    ║', 'bright');
  print('║                 Setup Wizard v1.0                                  ║', 'green');
  print('║                                                                    ║', 'green');
  print('╚════════════════════════════════════════════════════════════════════╝', 'green');
  console.log('');
  print('This wizard will help you configure the system for a new client.', 'cyan');
  print('Press Ctrl+C at any time to cancel.', 'yellow');
  console.log('');

  try {
    // === BASIC INFORMATION ===
    printSection('1. Basic Shop Information');

    config.shopName = await askWithDefault('Shop name (full)', 'My Coffee Shop');
    config.shopNameShort = await askWithDefault('Shop name (short, for mobile)', config.shopName.split(' ')[0]);
    config.shopTagline = await askWithDefault('Tagline/slogan', 'Fresh coffee, made with love');
    config.shopDescription = await askWithDefault('Brief description', 'Locally roasted coffee and fresh pastries');
    config.shopEstablished = await askWithDefault('Year established', new Date().getFullYear().toString());

    // Generate shop ID from name
    const defaultShopId = config.shopName.toLowerCase().replace(/[^a-z0-9]/g, '');
    config.shopId = await askWithDefault('Shop ID (used in URLs and database)', defaultShopId);

    // === CONTACT INFORMATION ===
    printSection('2. Contact Information');

    let validEmail = false;
    while (!validEmail) {
      config.shopEmail = await askWithDefault('Primary email', `hello@${defaultShopId}.com`);
      if (isValidEmail(config.shopEmail)) {
        validEmail = true;
      } else {
        print('Invalid email format. Please try again.', 'red');
      }
    }

    config.shopSupportEmail = await askWithDefault('Support email', `support@${defaultShopId}.com`);

    let validPhone = false;
    while (!validPhone) {
      const phoneInput = await askWithDefault('Primary phone', '(555) 123-4567');
      config.shopPhone = formatPhone(phoneInput);
      validPhone = true; // Accept any format after formatting attempt
    }

    // === LOCATION ===
    printSection('3. Location Information');

    config.locationName = await askWithDefault('Location name', 'Main Café');
    config.locationAddress = await ask('Street address: ');
    config.locationCity = await ask('City: ');
    config.locationProvince = await askWithDefault('Province/State (2-letter code)', 'CA');
    config.locationPostalCode = await ask('Postal/ZIP code: ');

    // === SOCIAL MEDIA ===
    printSection('4. Social Media (optional, press Enter to skip)');

    config.instagram = await ask('Instagram handle (without @): ');
    config.facebook = await ask('Facebook page name: ');
    config.twitter = await ask('Twitter/X handle (without @): ');
    config.tiktok = await ask('TikTok handle (without @): ');

    // === BRANDING ===
    printSection('5. Brand Colors');

    print('Enter colors in hex format (e.g., #8B4513)', 'yellow');

    let validPrimary = false;
    while (!validPrimary) {
      config.brandPrimary = await askWithDefault('Primary color', '#8B4513');
      if (isValidHexColor(config.brandPrimary)) {
        validPrimary = true;
      } else {
        print('Invalid hex color. Use format: #RRGGBB', 'red');
      }
    }

    config.brandSecondary = await askWithDefault('Secondary color', '#2C1810');
    config.brandAccent = await askWithDefault('Accent color', '#D4A574');

    // === BUSINESS SETTINGS ===
    printSection('6. Business Settings');

    config.currency = await askWithDefault('Currency code', 'USD');
    config.currencySymbol = await askWithDefault('Currency symbol', '$');

    let validTaxRate = false;
    while (!validTaxRate) {
      const taxInput = await askWithDefault('Sales tax rate (e.g., 0.05 for 5%)', '0.05');
      const taxFloat = parseFloat(taxInput);
      if (!isNaN(taxFloat) && taxFloat >= 0 && taxFloat <= 1) {
        config.taxRate = taxInput;
        validTaxRate = true;
      } else {
        print('Invalid tax rate. Enter a decimal between 0 and 1.', 'red');
      }
    }

    config.timezone = await askWithDefault('Timezone', 'America/New_York');
    print('  See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones', 'cyan');

    // === ORDER SETTINGS ===
    printSection('7. Order Configuration');

    config.minOrderValue = await askWithDefault('Minimum order value', '0');
    config.maxOrderValue = await askWithDefault('Maximum order value', '500');
    config.defaultPrepTime = await askWithDefault('Default preparation time (minutes)', '15');
    config.schedulingMaxDays = await askWithDefault('Max days in advance for scheduling', '1');
    config.allowGuestCheckout = await askYesNo('Allow guest checkout?', true);

    // === FEATURES ===
    printSection('8. Feature Flags');

    print('Enable or disable features for this client:', 'cyan');
    config.featureMembership = await askYesNo('Enable membership/subscription plans?', true);
    config.featureDelivery = await askYesNo('Enable delivery orders?', false);
    config.featureRewards = await askYesNo('Enable rewards program?', false);
    config.featureGiftCards = await askYesNo('Enable gift cards?', false);
    config.featureCatering = await askYesNo('Enable catering orders?', false);
    config.featureOAuth = await askYesNo('Enable Google OAuth login?', true);

    // === STRIPE ===
    printSection('9. Stripe Configuration (optional for now)');

    print('You can add Stripe keys later by editing .env files', 'yellow');
    config.stripePublishable = await ask('Stripe publishable key (or press Enter to skip): ');
    config.stripeSecret = await ask('Stripe secret key (or press Enter to skip): ');

    // === CONFIRMATION ===
    printSection('Configuration Summary');

    console.log('');
    print('Shop Information:', 'bright');
    console.log(`  Name: ${config.shopName}`);
    console.log(`  Tagline: ${config.shopTagline}`);
    console.log(`  ID: ${config.shopId}`);
    console.log(`  Email: ${config.shopEmail}`);
    console.log(`  Phone: ${config.shopPhone}`);
    console.log('');
    print('Location:', 'bright');
    console.log(`  ${config.locationName}`);
    console.log(`  ${config.locationAddress}`);
    console.log(`  ${config.locationCity}, ${config.locationProvince} ${config.locationPostalCode}`);
    console.log('');
    print('Business Settings:', 'bright');
    console.log(`  Currency: ${config.currencySymbol} (${config.currency})`);
    console.log(`  Tax Rate: ${(parseFloat(config.taxRate) * 100).toFixed(2)}%`);
    console.log(`  Timezone: ${config.timezone}`);
    console.log('');

    const confirmWrite = await askYesNo('\nGenerate configuration files?', true);

    if (!confirmWrite) {
      print('\nSetup cancelled.', 'yellow');
      process.exit(0);
    }

    // === GENERATE CONFIG FILES ===
    await generateConfigFiles();

    print('\n✓ Configuration complete!', 'green');
    print('\nNext steps:', 'bright');
    print('  1. Review and edit the generated .env files if needed', 'cyan');
    print('  2. Add your Stripe API keys to backend/.env', 'cyan');
    print('  3. Set up your database connection in backend/.env', 'cyan');
    print('  4. Run: npm install', 'cyan');
    print('  5. Run: cd backend && npm run db:setup', 'cyan');
    print('  6. Run: npm run dev', 'cyan');
    print('\n  See docs/WHITE_LABEL_SETUP_GUIDE.md for detailed instructions.\n', 'yellow');

  } catch (error) {
    print(`\nError: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Generate .env files from configuration
 */
async function generateConfigFiles() {
  print('\nGenerating configuration files...', 'cyan');

  // Backend .env
  const backendEnv = `# ====================
# SERVER CONFIGURATION
# ====================
PORT=5000
NODE_ENV=development

# ====================
# SHOP CONFIGURATION
# ====================
SHOP_NAME="${config.shopName}"
SHOP_NAME_SHORT="${config.shopNameShort}"
SHOP_ID=${config.shopId}
SHOP_EMAIL=${config.shopEmail}
SHOP_SUPPORT_EMAIL=${config.shopSupportEmail}
SHOP_PHONE="${config.shopPhone}"

# Business Settings
CURRENCY=${config.currency}
CURRENCY_SYMBOL=${config.currencySymbol}
TAX_RATE=${config.taxRate}
TIMEZONE=${config.timezone}

# Order Configuration
MIN_ORDER_VALUE=${config.minOrderValue}
MAX_ORDER_VALUE=${config.maxOrderValue}
DEFAULT_PREP_TIME=${config.defaultPrepTime}
SCHEDULING_MAX_DAYS=${config.schedulingMaxDays}
ALLOW_GUEST_CHECKOUT=${config.allowGuestCheckout}

# Payment Configuration
PAYMENT_CAPTURE_METHOD=automatic
ALLOW_SAVED_PAYMENT_METHODS=true

# ====================
# DATABASE
# ====================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${config.shopId}
DB_NAME=${config.shopId}
DB_SCHEMA=public
DB_POOL_SIZE=20

# ====================
# STRIPE PAYMENT
# ====================
STRIPE_SECRET_KEY=${config.stripeSecret || 'sk_test_your_key_here'}
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=${config.stripePublishable || 'pk_test_your_key_here'}

# ====================
# AUTHENTICATION
# ====================
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRATION_DAYS=7
REFRESH_TOKEN_EXPIRATION_DAYS=30
MAX_LOGIN_ATTEMPTS=5
REQUIRE_EMAIL_VERIFICATION=false

# ====================
# GOOGLE OAUTH 2.0
# ====================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ====================
# FRONTEND URLs
# ====================
FRONTEND_URL=http://localhost:8890
EMPLOYEE_DASHBOARD_URL=http://localhost:8889
ALLOWED_ORIGINS=http://localhost:8890,http://localhost:8889

# ====================
# EMAIL CONFIGURATION
# ====================
EMAIL_FROM_NAME="${config.shopName}"
EMAIL_FROM=noreply@${config.shopId}.com
EMAIL_REPLY_TO=${config.shopEmail}

EMAIL_ORDER_CONFIRMATION=true
EMAIL_ORDER_READY=true
EMAIL_ORDER_CANCELLED=true
EMAIL_WELCOME=false
EMAIL_PASSWORD_RESET=true

# ====================
# FEATURE FLAGS
# ====================
FEATURE_MEMBERSHIP=${config.featureMembership}
FEATURE_DELIVERY=${config.featureDelivery}
FEATURE_REWARDS=${config.featureRewards}
FEATURE_GIFTCARDS=${config.featureGiftCards}
FEATURE_CATERING=${config.featureCatering}
FEATURE_OAUTH=${config.featureOAuth}
`;

  // Customer Frontend .env
  const customerEnv = `# ====================
# API CONFIGURATION
# ====================
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# ====================
# PAYMENT
# ====================
VITE_STRIPE_PUBLISHABLE_KEY=${config.stripePublishable || 'pk_test_your_key_here'}

# ====================
# OAUTH
# ====================
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# ====================
# SHOP BRANDING
# ====================
VITE_SHOP_NAME="${config.shopName}"
VITE_SHOP_NAME_SHORT="${config.shopNameShort}"
VITE_SHOP_TAGLINE="${config.shopTagline}"
VITE_SHOP_DESCRIPTION="${config.shopDescription}"
VITE_SHOP_ESTABLISHED="${config.shopEstablished}"

# Contact Information
VITE_SHOP_PHONE="${config.shopPhone}"
VITE_SHOP_EMAIL=${config.shopEmail}
VITE_SHOP_SUPPORT_EMAIL=${config.shopSupportEmail}

# Social Media
VITE_SOCIAL_INSTAGRAM=${config.instagram ? '@' + config.instagram : ''}
VITE_SOCIAL_FACEBOOK=${config.facebook || ''}
VITE_SOCIAL_TWITTER=${config.twitter ? '@' + config.twitter : ''}
VITE_SOCIAL_TIKTOK=${config.tiktok ? '@' + config.tiktok : ''}

# Brand Colors
VITE_BRAND_PRIMARY_COLOR=${config.brandPrimary}
VITE_BRAND_SECONDARY_COLOR=${config.brandSecondary}
VITE_BRAND_ACCENT_COLOR=${config.brandAccent}

# Brand Assets
VITE_BRAND_LOGO_URL=
VITE_BRAND_FAVICON_URL=

# ====================
# BUSINESS SETTINGS
# ====================
VITE_CURRENCY=${config.currency}
VITE_CURRENCY_SYMBOL=${config.currencySymbol}
VITE_TAX_RATE=${config.taxRate}
VITE_TIMEZONE=${config.timezone}

VITE_MIN_ORDER_VALUE=${config.minOrderValue}
VITE_MAX_ORDER_VALUE=${config.maxOrderValue}
VITE_DEFAULT_PREP_TIME=${config.defaultPrepTime}
VITE_ALLOW_SCHEDULING=true
VITE_SCHEDULING_MAX_DAYS=${config.schedulingMaxDays}
VITE_ALLOW_GUEST_CHECKOUT=${config.allowGuestCheckout}

# ====================
# FEATURE FLAGS
# ====================
VITE_FEATURE_MEMBERSHIP=${config.featureMembership}
VITE_FEATURE_DELIVERY=${config.featureDelivery}
VITE_FEATURE_REWARDS=${config.featureRewards}
VITE_FEATURE_GIFTCARDS=${config.featureGiftCards}
VITE_FEATURE_CATERING=${config.featureCatering}

# ====================
# SEO & METADATA
# ====================
VITE_META_TITLE="${config.shopName} - Online Ordering"
VITE_META_DESCRIPTION="Order fresh coffee from ${config.shopName}. Browse our menu and schedule pickup."
VITE_META_KEYWORDS="coffee,espresso,${config.locationCity.toLowerCase()},online ordering,coffee shop"
VITE_META_OG_IMAGE=
`;

  // Employee Dashboard .env
  const dashboardEnv = `# ====================
# API CONFIGURATION
# ====================
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# ====================
# SHOP BRANDING
# ====================
VITE_SHOP_NAME="${config.shopName}"
VITE_SHOP_NAME_SHORT="${config.shopNameShort}"
VITE_SHOP_TAGLINE="${config.shopTagline}"
VITE_SHOP_ESTABLISHED="${config.shopEstablished}"

# Brand Colors
VITE_BRAND_PRIMARY_COLOR=${config.brandPrimary}
VITE_BRAND_SECONDARY_COLOR=${config.brandSecondary}
VITE_BRAND_ACCENT_COLOR=${config.brandAccent}
VITE_BRAND_LOGO_URL=

# ====================
# BUSINESS SETTINGS
# ====================
VITE_CURRENCY=${config.currency}
VITE_CURRENCY_SYMBOL=${config.currencySymbol}
VITE_TIMEZONE=${config.timezone}

# ====================
# DASHBOARD SETTINGS
# ====================
VITE_DASHBOARD_SOUND_NOTIFICATIONS=true
VITE_DASHBOARD_NOTIFICATION_VOLUME=0.7
VITE_DASHBOARD_NOTIFICATION_SOUND=

VITE_DASHBOARD_ORDERS_PER_PAGE=20
VITE_DASHBOARD_AUTO_REFRESH=30
VITE_DASHBOARD_SHOW_PHONE=true
VITE_DASHBOARD_SHOW_EMAIL=true

VITE_DASHBOARD_QUICK_ACTIONS=true
VITE_DASHBOARD_REQUIRE_CONFIRMATION=true
VITE_DASHBOARD_ALLOW_CANCELLATION=true

# ====================
# FEATURE ACCESS
# ====================
VITE_FEATURE_MENU_MANAGEMENT=true
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_CUSTOMER_MANAGEMENT=true
VITE_FEATURE_MEMBERSHIP_MANAGEMENT=${config.featureMembership}
VITE_FEATURE_INVENTORY_TRACKING=false
`;

  // Write files
  try {
    fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
    print('  ✓ backend/.env', 'green');

    fs.writeFileSync(path.join(__dirname, 'customer-frontend', '.env'), customerEnv);
    print('  ✓ customer-frontend/.env', 'green');

    fs.writeFileSync(path.join(__dirname, 'employee-dashboard', '.env'), dashboardEnv);
    print('  ✓ employee-dashboard/.env', 'green');

    // Also save configuration as JSON for reference
    const configJson = JSON.stringify(config, null, 2);
    fs.writeFileSync(path.join(__dirname, 'client-config.json'), configJson);
    print('  ✓ client-config.json (reference)', 'green');

  } catch (error) {
    throw new Error(`Failed to write config files: ${error.message}`);
  }
}

// Run the wizard
runSetupWizard().catch((error) => {
  print(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
