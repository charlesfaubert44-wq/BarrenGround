# White-Label Coffee Shop Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

A fully customizable, production-ready online ordering platform designed specifically for coffee shops. This white-label solution can be quickly configured and deployed for any coffee shop client with minimal code changes.

---

## Features

### Customer-Facing
- Browse menu with categories and search
- Add items to cart with customizations
- Guest checkout or registered user accounts
- Secure payment processing via Stripe
- Real-time order tracking
- Order history and reordering
- Mobile-responsive design
- Google OAuth login (optional)

### Employee Dashboard
- Real-time order queue with notifications
- Order status management workflow
- Menu availability toggle
- Daily order history and search
- Basic analytics and reporting
- Tablet-optimized interface

### Backend & Infrastructure
- RESTful API with Express.js
- PostgreSQL database
- WebSocket for real-time updates
- JWT authentication
- Stripe payment processing
- Email notifications
- Easy deployment to Vercel, Railway, or similar

---

## White-Label Advantages

### Quick Deployment
- Setup wizard for automated configuration
- Environment-based settings (no code changes needed)
- Pre-configured deployment setups
- Comprehensive documentation

### Fully Customizable
- Shop branding (name, logo, colors, tagline)
- Location information
- Contact details and social media
- Business rules (tax rates, prep times, order limits)
- Feature flags (enable/disable functionality per client)

### Scalable Architecture
- Separated frontend and backend
- Database per client or multi-tenant capable
- Easy to add new locations
- Feature toggles for gradual rollout

### Professional Support
- Detailed setup guides
- Client onboarding templates
- Training materials
- Troubleshooting documentation

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **State Management:** Zustand (cart), TanStack Query (API)
- **Payments:** Stripe React library

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.io
- **Payments:** Stripe SDK

### Deployment
- **Frontend:** Vercel or Netlify
- **Backend:** Railway, Render, or DigitalOcean
- **Database:** Supabase, Railway, or AWS RDS

---

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+ (or managed database service)
- Stripe account for payment processing
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BarrenGround
   ```

2. **Run the setup wizard**
   ```bash
   node setup-wizard.js
   ```

   The wizard will prompt for:
   - Shop name and branding
   - Contact information
   - Location details
   - Social media handles
   - Brand colors
   - Business settings (tax rate, currency, timezone)
   - Feature preferences

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:setup
   ```

5. **Start development servers**
   ```bash
   # From project root
   npm run dev
   ```

   Access the applications:
   - **Customer Frontend:** http://localhost:8890
   - **Employee Dashboard:** http://localhost:8889
   - **Backend API:** http://localhost:5000

---

## Manual Configuration

If you prefer to configure manually instead of using the setup wizard:

### 1. Copy Environment Files

```bash
cp backend/.env.example backend/.env
cp customer-frontend/.env.example customer-frontend/.env
cp employee-dashboard/.env.example employee-dashboard/.env
```

### 2. Edit Configuration Files

**Backend (`backend/.env`):**
- Shop information (name, email, phone)
- Database connection string
- Stripe API keys
- Business settings (tax rate, currency, timezone)
- Feature flags

**Customer Frontend (`customer-frontend/.env`):**
- API URL
- Stripe publishable key
- Shop branding (name, tagline, colors)
- Contact information
- Social media handles
- SEO metadata

**Employee Dashboard (`employee-dashboard/.env`):**
- API and WebSocket URLs
- Shop branding
- Dashboard settings (notifications, display preferences)

See [`.env.example`](backend/.env.example) files for detailed documentation of each variable.

---

## Documentation

### For Developers
- [White-Label Setup Guide](docs/WHITE_LABEL_SETUP_GUIDE.md) - Comprehensive setup instructions
- [Technical Design Document](docs/plans/2025-11-01-coffee-ordering-system-design.md) - Architecture and technical details
- [Product Requirements Document](docs/plans/2025-11-01-coffee-ordering-system-prd.md) - Features and specifications

### For Client Onboarding
- [Client Onboarding Template](docs/CLIENT_ONBOARDING_TEMPLATE.md) - Checklist for new client setup
- User Guides - Coming soon

### Configuration
- [Shop Configuration](customer-frontend/src/config/shopConfig.ts) - Frontend branding config
- [Dashboard Configuration](employee-dashboard/src/config/shopConfig.ts) - Dashboard settings
- [Backend Configuration](backend/src/config/shopConfig.ts) - Business logic config

---

## Customization Guide

### Branding

#### Colors
Set brand colors via environment variables:
```env
VITE_BRAND_PRIMARY_COLOR=#8B4513    # Main brand color
VITE_BRAND_SECONDARY_COLOR=#2C1810  # Dark accent
VITE_BRAND_ACCENT_COLOR=#D4A574     # Light accent
```

#### Logo & Assets
1. Place your logo files in `customer-frontend/public/images/`
2. Update environment variables:
   ```env
   VITE_BRAND_LOGO_URL=/images/logo.svg
   VITE_BRAND_FAVICON_URL=/images/favicon.ico
   ```

#### Shop Information
All shop details are configured via environment variables:
- Shop name (full and short)
- Tagline/slogan
- Description
- Contact info (phone, email)
- Social media handles
- Location address(es)

### Menu Items

#### Option 1: Admin Dashboard (Recommended)
1. Log in to employee dashboard
2. Navigate to Menu Management
3. Add/edit items through the UI

#### Option 2: Database
1. Edit `backend/src/config/schema.sql`
2. Add menu items to the INSERT statements
3. Run: `npm run db:setup`

### Feature Flags

Enable or disable features per client:

```env
# Backend .env
FEATURE_MEMBERSHIP=true      # Subscription plans
FEATURE_DELIVERY=false       # Delivery orders
FEATURE_REWARDS=false        # Loyalty program
FEATURE_GIFTCARDS=false      # Gift cards
FEATURE_OAUTH=true           # Google login
```

---

## Deployment

### Quick Deploy

#### Customer Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory: `customer-frontend`
3. Add environment variables
4. Deploy

#### Employee Dashboard (Vercel)
1. Create new project in Vercel
2. Set root directory: `employee-dashboard`
3. Add environment variables
4. Deploy

#### Backend (Railway)
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Add Node.js service with root directory: `backend`
4. Add environment variables
5. Deploy

### Detailed Instructions

See [White-Label Setup Guide](docs/WHITE_LABEL_SETUP_GUIDE.md#deployment) for step-by-step deployment instructions.

---

## Project Structure

```
BarrenGround/
├── backend/                      # Node.js API server
│   ├── src/
│   │   ├── config/              # Database & shop configuration
│   │   ├── models/              # Data models
│   │   ├── routes/              # API endpoints
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Auth & validation
│   │   └── server.ts            # Express app
│   └── .env.example             # Environment template
│
├── customer-frontend/           # Customer-facing React app
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── config/              # Shop configuration
│   │   ├── api/                 # API client
│   │   └── store/               # State management
│   └── .env.example
│
├── employee-dashboard/          # Employee React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── config/
│   │   └── api/
│   └── .env.example
│
├── docs/                        # Documentation
│   ├── WHITE_LABEL_SETUP_GUIDE.md
│   ├── CLIENT_ONBOARDING_TEMPLATE.md
│   └── plans/
│
├── setup-wizard.js              # Interactive setup script
└── README.md                    # This file
```

---

## Common Tasks

### Add a New Client

1. Run setup wizard: `node setup-wizard.js`
2. Review generated `.env` files
3. Add Stripe API keys
4. Set up database: `cd backend && npm run db:setup`
5. Add menu items
6. Test locally
7. Deploy to production

### Update Branding

1. Edit environment variables in `.env` files
2. Replace logo/favicon files
3. Restart development servers or redeploy

### Add Menu Items

1. Log in to employee dashboard as admin
2. Navigate to Menu Management
3. Click "Add Item"
4. Fill in details and save

### Enable a Feature

1. Edit backend `.env`: `FEATURE_NAME=true`
2. Edit frontend `.env`: `VITE_FEATURE_NAME=true`
3. Restart servers or redeploy

---

## Testing

### Test Payment Processing

Use Stripe test cards:

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### End-to-End Order Flow

1. Browse menu as customer
2. Add items to cart
3. Checkout (guest or registered)
4. Pay with test card
5. Verify order appears in employee dashboard
6. Update order status
7. Check customer tracking page

---

## Support & Maintenance

### Getting Help

- **Setup Issues:** See [Troubleshooting](docs/WHITE_LABEL_SETUP_GUIDE.md#troubleshooting)
- **Bug Reports:** Open a GitHub issue
- **Feature Requests:** Contact project maintainer
- **Client Support:** See client onboarding documentation

### Updating the System

```bash
git pull origin main
npm install
cd backend && npm install
cd ../customer-frontend && npm install
cd ../employee-dashboard && npm install
```

### Database Backups

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20250101.sql
```

---

## Pricing Model Suggestions

### For Your Business

Consider these pricing models when approaching clients:

1. **One-Time Setup Fee**
   - Initial configuration and deployment
   - Custom branding
   - Menu setup
   - Employee training
   - Typical range: $2,000 - $5,000

2. **Monthly Subscription**
   - Hosting and maintenance
   - Support and updates
   - Typical range: $99 - $299/month

3. **Transaction Fee**
   - Small percentage per order (e.g., 2-3%)
   - In addition to or instead of monthly fee

4. **Tiered Plans**
   - **Basic:** $99/mo - Standard features
   - **Professional:** $199/mo - All features + priority support
   - **Enterprise:** $299/mo - Multi-location + custom features

---

## Roadmap

### Current Version (v1.0)
- ✅ Customer ordering
- ✅ Employee dashboard
- ✅ Payment processing
- ✅ Real-time notifications
- ✅ White-label configuration

### Upcoming Features
- [ ] Advanced analytics
- [ ] Delivery integration
- [ ] Loyalty/rewards program
- [ ] Gift cards
- [ ] Mobile apps (iOS/Android)
- [ ] SMS notifications
- [ ] Multi-location management
- [ ] Inventory tracking
- [ ] Email marketing integration

---

## License

[Add your license information]

---

## Credits

Built with:
- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)

---

## Contact

**Project Maintainer:** [Your Name]
**Email:** [your.email@example.com]
**Website:** [yourwebsite.com]

---

## Getting Started with Your First Client

Ready to onboard your first coffee shop? Follow these steps:

1. **Initial Consultation**
   - Use [Client Onboarding Template](docs/CLIENT_ONBOARDING_TEMPLATE.md)
   - Gather all necessary information
   - Collect branding assets

2. **Configuration**
   - Run `node setup-wizard.js`
   - Review and test locally

3. **Menu Setup**
   - Import client's menu items
   - Add photos and descriptions

4. **Deployment**
   - Deploy to production
   - Configure custom domain
   - Set up Stripe webhooks

5. **Training**
   - Train employees on dashboard
   - Provide user guides
   - Offer ongoing support

6. **Launch**
   - Soft launch for testing
   - Gather feedback
   - Full launch

See [White-Label Setup Guide](docs/WHITE_LABEL_SETUP_GUIDE.md) for detailed instructions!
