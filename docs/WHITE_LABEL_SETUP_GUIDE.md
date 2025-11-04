# White-Label Coffee Shop Ordering System
## Setup Guide for New Clients

**Version:** 1.0
**Last Updated:** November 4, 2025

---

## Overview

This system is a fully customizable, white-label online ordering platform for coffee shops. It includes:

- **Customer Frontend** - Public-facing ordering interface
- **Employee Dashboard** - Internal order management system
- **Backend API** - Business logic, database, and payment processing

This guide will walk you through setting up the system for a new coffee shop client.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration Guide](#configuration-guide)
4. [Branding Customization](#branding-customization)
5. [Database Setup](#database-setup)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Client Onboarding Checklist](#client-onboarding-checklist)

---

## Prerequisites

### Required Accounts & Services

- [ ] **Stripe Account** - For payment processing
  - Sign up at [stripe.com](https://stripe.com)
  - Get API keys (test and live)
  - Set up webhook endpoints

- [ ] **PostgreSQL Database** - Data storage
  - Managed option: [Supabase](https://supabase.com), [Railway](https://railway.app), or [Neon](https://neon.tech)
  - Self-hosted: PostgreSQL 15+

- [ ] **Hosting Services**
  - Frontend: [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (recommended)
  - Backend: [Railway](https://railway.app), [Render](https://render.com), or [DigitalOcean](https://digitalocean.com)

- [ ] **Domain Name** (optional but recommended)
  - Custom domain for professional branding
  - SSL certificate (usually included with hosting)

- [ ] **Email Service** (for order confirmations)
  - [SendGrid](https://sendgrid.com), [Mailgun](https://mailgun.com), or [Postmark](https://postmarkapp.com)

### Development Tools

- Node.js 20+ and npm
- Git
- Code editor (VS Code recommended)
- PostgreSQL client (optional, for database management)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd BarrenGround
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, backend, and both frontends)
npm install

# Or install individually
cd backend && npm install
cd ../customer-frontend && npm install
cd ../employee-dashboard && npm install
```

### 3. Configure Environment Variables

Copy the example environment files and customize:

```bash
# Backend
cp backend/.env.example backend/.env

# Customer Frontend
cp customer-frontend/.env.example customer-frontend/.env

# Employee Dashboard
cp employee-dashboard/.env.example employee-dashboard/.env
```

### 4. Set Up Database

```bash
cd backend
npm run db:setup
```

### 5. Start Development Servers

```bash
# From project root
npm run dev

# Or start individually
cd backend && npm run dev
cd customer-frontend && npm run dev
cd employee-dashboard && npm run dev
```

Access the applications:
- Customer Frontend: http://localhost:8890
- Employee Dashboard: http://localhost:8889
- Backend API: http://localhost:5000

---

## Configuration Guide

### Backend Configuration

Edit `backend/.env` with client-specific values:

#### Basic Shop Information

```env
SHOP_NAME="Your Coffee Shop Name"
SHOP_NAME_SHORT="Short Name"
SHOP_ID=yourshopid
SHOP_EMAIL=hello@yourcoffeeshop.com
SHOP_SUPPORT_EMAIL=support@yourcoffeeshop.com
SHOP_PHONE="(123) 456-7890"
```

#### Business Settings

```env
# Currency
CURRENCY=USD
CURRENCY_SYMBOL=$

# Tax rate (e.g., 0.0875 for 8.75%)
TAX_RATE=0.0875

# Timezone (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
TIMEZONE=America/New_York
```

#### Order Configuration

```env
# Minimum and maximum order values
MIN_ORDER_VALUE=0
MAX_ORDER_VALUE=500

# Default preparation time (minutes)
DEFAULT_PREP_TIME=15

# How many days in advance customers can schedule orders
SCHEDULING_MAX_DAYS=1

# Allow checkout without creating an account
ALLOW_GUEST_CHECKOUT=true
```

#### Stripe Payment

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Important:** Use test keys during development. Switch to live keys for production.

#### Feature Flags

Enable/disable features per client:

```env
FEATURE_MEMBERSHIP=true      # Subscription coffee plans
FEATURE_DELIVERY=false       # Delivery orders (future)
FEATURE_REWARDS=false        # Loyalty program (future)
FEATURE_GIFTCARDS=false      # Gift cards (future)
FEATURE_CATERING=false       # Catering orders (future)
FEATURE_OAUTH=true           # Google login
```

### Customer Frontend Configuration

Edit `customer-frontend/.env`:

#### Basic Branding

```env
VITE_SHOP_NAME="Your Coffee Shop Name"
VITE_SHOP_NAME_SHORT="Short Name"
VITE_SHOP_TAGLINE="Your unique tagline here"
VITE_SHOP_DESCRIPTION="Brief description of your shop"
VITE_SHOP_ESTABLISHED="2025"
```

#### Contact Information

```env
VITE_SHOP_PHONE="(123) 456-7890"
VITE_SHOP_EMAIL=hello@yourcoffeeshop.com
VITE_SHOP_SUPPORT_EMAIL=support@yourcoffeeshop.com
```

#### Social Media

```env
VITE_SOCIAL_INSTAGRAM=@yourshop
VITE_SOCIAL_FACEBOOK=yourshop
VITE_SOCIAL_TWITTER=@yourshop
VITE_SOCIAL_TIKTOK=@yourshop
```

#### Brand Colors

```env
# Use hex color codes
VITE_BRAND_PRIMARY_COLOR=#8B4513     # Main brand color
VITE_BRAND_SECONDARY_COLOR=#2C1810   # Accent/secondary
VITE_BRAND_ACCENT_COLOR=#D4A574      # Highlights
```

**Color Selection Tips:**
- Primary: Main brand color (buttons, headers)
- Secondary: Dark shade for contrast
- Accent: Light shade for highlights

#### Brand Assets

```env
# URLs or paths to logo and favicon
VITE_BRAND_LOGO_URL=/images/logo.png
VITE_BRAND_FAVICON_URL=/images/favicon.ico
```

#### SEO & Metadata

```env
VITE_META_TITLE="Your Shop - Online Ordering"
VITE_META_DESCRIPTION="Order fresh coffee from Your Shop. Browse menu and schedule pickup."
VITE_META_KEYWORDS="coffee,espresso,your city,online ordering"
VITE_META_OG_IMAGE=/images/og-image.jpg
```

### Employee Dashboard Configuration

Edit `employee-dashboard/.env`:

```env
# Same branding as customer frontend
VITE_SHOP_NAME="Your Coffee Shop Name"
VITE_SHOP_NAME_SHORT="Short Name"

# Dashboard-specific settings
VITE_DASHBOARD_SOUND_NOTIFICATIONS=true
VITE_DASHBOARD_NOTIFICATION_VOLUME=0.7
VITE_DASHBOARD_ORDERS_PER_PAGE=20
VITE_DASHBOARD_AUTO_REFRESH=30
```

---

## Branding Customization

### 1. Logo & Images

**Required Assets:**

- Logo (SVG or PNG, transparent background recommended)
  - Desktop: 200-300px wide
  - Mobile: 150-200px wide

- Favicon (ICO or PNG)
  - 32x32px minimum
  - Multiple sizes recommended (16, 32, 64, 128, 256)

- Open Graph Image (for social media sharing)
  - 1200x630px
  - JPG or PNG format

**Placement:**

```bash
# Customer Frontend
customer-frontend/public/images/
  ├── logo.svg
  ├── logo-mobile.svg
  ├── favicon.ico
  └── og-image.jpg

# Employee Dashboard
employee-dashboard/public/images/
  ├── logo.svg
  └── favicon.ico
```

### 2. Colors & Theme

The system uses Tailwind CSS for styling. Colors are configured via environment variables and applied dynamically.

**Testing Colors:**

1. Update `.env` with new color codes
2. Restart development server
3. Check contrast and readability
4. Test on mobile devices

**Recommended Color Combinations:**

- **Traditional Coffee Shop:** Browns, creams, warm tones
- **Modern Minimalist:** Black, white, single accent color
- **Vibrant/Youth:** Bold colors, high contrast

### 3. Typography

Default fonts are system-safe. To customize:

**Option 1: Google Fonts** (recommended)

Edit `customer-frontend/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Update `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Your Font', 'sans-serif'],
      },
    },
  },
};
```

### 4. Location Information

Locations are hardcoded in `customer-frontend/src/config/shopConfig.ts`.

**To customize locations:**

1. Open `customer-frontend/src/config/shopConfig.ts`
2. Edit the `locations` array:

```typescript
locations: [
  {
    id: "main-location",
    name: "Main Café",
    address: "123 Main Street",
    city: "Your City",
    province: "ST",
    postalCode: "12345",
    phone: "(123) 456-7890",
    coordinates: {
      lat: 40.7128,
      lng: -74.0060,
    },
    hours: {
      monday: "7:00 AM - 6:00 PM",
      tuesday: "7:00 AM - 6:00 PM",
      // ... etc
    },
  },
  // Add more locations as needed
]
```

---

## Database Setup

### 1. Create Database

**Option A: Managed Service (Recommended)**

Using Railway, Supabase, or similar:
1. Create new PostgreSQL database
2. Copy connection string
3. Add to `backend/.env` as `DATABASE_URL`

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
createdb yourcoffeeshop

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/yourcoffeeshop
```

### 2. Run Migrations

```bash
cd backend
npm run db:setup
```

This will:
- Create all tables
- Set up indexes
- Insert sample menu items (optional)

### 3. Customize Menu Items

**Option 1: Admin Dashboard** (after setup)
- Log in to employee dashboard
- Navigate to Menu Management
- Add/edit items through UI

**Option 2: Direct Database**

Edit `backend/src/config/schema.sql` and customize menu items:

```sql
INSERT INTO menu_items (name, description, price, category, image_url, available)
VALUES
  ('Espresso', 'Rich, bold espresso shot', 3.50, 'coffee', '/images/espresso.jpg', true),
  ('Cappuccino', 'Espresso with steamed milk', 4.50, 'coffee', '/images/cappuccino.jpg', true);
  -- Add your menu items here
```

Then re-run: `npm run db:setup`

### 4. Backup & Restore

**Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup.sql
```

---

## Deployment

### Customer Frontend (Vercel)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Configure build settings:
   - Framework: Vite
   - Root directory: `customer-frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables (all `VITE_*` variables)
5. Deploy

### Employee Dashboard (Vercel)

Same process as Customer Frontend:
- Root directory: `employee-dashboard`
- Add dashboard environment variables

### Backend API (Railway)

1. Push code to GitHub
2. Create new project in Railway
3. Add PostgreSQL service
4. Add Node.js service:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Add environment variables (all backend variables)
6. Configure domain
7. Deploy

### Stripe Webhook Setup

After backend deployment:

1. Get your backend URL (e.g., `https://api.yourcoffeeshop.com`)
2. In Stripe Dashboard → Webhooks → Add endpoint
3. Endpoint URL: `https://api.yourcoffeeshop.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook secret
6. Add to backend environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Testing

### Pre-Launch Checklist

#### Customer Frontend
- [ ] Menu loads correctly
- [ ] Cart adds/removes items
- [ ] Guest checkout works
- [ ] Registered user checkout works
- [ ] Stripe payment processes successfully
- [ ] Order confirmation email received
- [ ] Order tracking page accessible
- [ ] Mobile responsive on iPhone and Android
- [ ] Brand colors and logo display correctly
- [ ] Contact information is accurate
- [ ] Social media links work

#### Employee Dashboard
- [ ] Login works with employee credentials
- [ ] New orders appear in real-time
- [ ] Sound notification plays
- [ ] Order status updates work
- [ ] Menu availability toggle works
- [ ] Order details show correctly
- [ ] Mobile/tablet responsive

#### Backend API
- [ ] All endpoints respond < 200ms
- [ ] Database connections stable
- [ ] Stripe webhooks processing
- [ ] Email notifications sending
- [ ] Error logging functional
- [ ] CORS configured correctly

### Test Scenarios

**Test Order Flow:**
1. Browse menu as customer
2. Add multiple items to cart
3. Proceed to checkout
4. Enter customer info
5. Pay with Stripe test card: `4242 4242 4242 4242`
6. Verify order confirmation email
7. Check order appears in employee dashboard
8. Update order status
9. Verify customer sees status update

**Test Payment Failures:**
- Use Stripe test card: `4000 0000 0000 0002` (decline)
- Verify error message is clear
- Confirm no order created

---

## Client Onboarding Checklist

### Information Gathering

- [ ] **Business Details**
  - Shop name and tagline
  - Established year
  - Business hours
  - Location(s) and addresses
  - Phone number and email
  - Social media handles

- [ ] **Branding Assets**
  - Logo (SVG preferred)
  - Brand colors (hex codes)
  - Favicon
  - Photos for menu items (optional)

- [ ] **Menu Items**
  - Complete menu with prices
  - Item descriptions
  - Categories
  - Dietary info (vegan, gluten-free, etc.)

- [ ] **Business Requirements**
  - Tax rate
  - Currency
  - Time zone
  - Minimum/maximum order values
  - Default prep time
  - Scheduling preferences

- [ ] **Payment Information**
  - Stripe account setup
  - Bank account for payouts
  - Refund policy

- [ ] **Feature Preferences**
  - Membership/subscription plans?
  - Guest checkout allowed?
  - OAuth login (Google)?
  - Email notifications?

### Technical Setup

- [ ] Repository cloned and configured
- [ ] Environment variables set
- [ ] Database created and migrated
- [ ] Menu items populated
- [ ] Branding applied (colors, logo, text)
- [ ] Locations configured
- [ ] Email templates customized
- [ ] Stripe connected and tested
- [ ] Deployments completed (frontend + backend)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### Training & Handoff

- [ ] Employee training session scheduled
- [ ] Demo account credentials provided
- [ ] User guides shared
- [ ] Support contact information provided
- [ ] Feedback mechanism established
- [ ] Launch date confirmed

### Post-Launch

- [ ] Monitor first day of orders
- [ ] Address any issues immediately
- [ ] Collect employee feedback
- [ ] Collect customer feedback
- [ ] Plan for analytics review (1 week, 1 month)

---

## Troubleshooting

### Common Issues

**Issue: Payment not processing**
- Verify Stripe keys are correct (test vs. live)
- Check webhook is configured and receiving events
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

**Issue: Orders not appearing in dashboard**
- Check WebSocket connection (browser console)
- Verify backend URL is correct in dashboard `.env`
- Ensure CORS allows dashboard domain

**Issue: Email notifications not sending**
- Verify email service configured
- Check spam folder
- Review backend logs for errors
- Ensure `EMAIL_FROM` is verified with email provider

**Issue: Database connection errors**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure IP is whitelisted (managed databases)
- Test connection with `npm run db:test`

---

## Support & Resources

### Documentation
- [Technical Design Document](../plans/2025-11-01-coffee-ordering-system-design.md)
- [Product Requirements Document](../plans/2025-11-01-coffee-ordering-system-prd.md)
- [API Documentation](#) (coming soon)

### External Resources
- [Stripe Documentation](https://stripe.com/docs)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Getting Help
- GitHub Issues: [Report a bug or request a feature]
- Email Support: [your-support-email]
- Video Tutorials: [link to tutorials]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 4, 2025 | Initial white-label documentation |

---

## License

[Add your license information here]
