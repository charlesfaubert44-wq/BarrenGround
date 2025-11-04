# Client Onboarding Template
## Coffee Shop Ordering System

**Client Name:** _______________________________
**Project Start Date:** _______________________
**Target Launch Date:** ________________________
**Project Manager:** ___________________________

---

## Phase 1: Discovery & Information Gathering

### Business Information

#### Basic Details
- [ ] **Legal Business Name:** _______________________________________
- [ ] **Doing Business As (DBA):** ____________________________________
- [ ] **Business Structure:** ☐ Sole Proprietor ☐ LLC ☐ Corporation ☐ Other: _______
- [ ] **Tax ID/EIN:** ________________________________________________
- [ ] **Business License:** __________________________________________

#### Shop Information
- [ ] **Shop Name (Full):** __________________________________________
- [ ] **Shop Name (Short, for mobile):** ______________________________
- [ ] **Tagline/Slogan:** ____________________________________________
- [ ] **Business Description (1-2 sentences):** _______________________
  _________________________________________________________________
- [ ] **Year Established:** __________________________________________
- [ ] **Website URL (if existing):** __________________________________

#### Contact Information
- [ ] **Primary Phone:** ____________________________________________
- [ ] **Primary Email:** _____________________________________________
- [ ] **Support Email:** _____________________________________________
- [ ] **Physical Address(es):**
  - Location 1: ____________________________________________________
  - Location 2: ____________________________________________________
  - Location 3: ____________________________________________________

#### Social Media
- [ ] **Instagram:** @_______________________________________________
- [ ] **Facebook:** _________________________________________________
- [ ] **Twitter/X:** @_______________________________________________
- [ ] **TikTok:** @__________________________________________________
- [ ] **Other:** ____________________________________________________

#### Business Hours
| Location | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday |
|----------|--------|---------|-----------|----------|--------|----------|--------|
| Location 1 | | | | | | | |
| Location 2 | | | | | | | |

---

### Branding & Design

#### Brand Colors
- [ ] **Primary Color (hex):** #_____________________________________
  - Example: #8B4513 (brown)
  - Used for: buttons, headers, main brand elements

- [ ] **Secondary Color (hex):** #___________________________________
  - Example: #2C1810 (dark brown)
  - Used for: text, dark accents

- [ ] **Accent Color (hex):** #______________________________________
  - Example: #D4A574 (cream)
  - Used for: highlights, hover states

#### Brand Assets Needed
- [ ] **Logo**
  - Format: ☐ SVG ☐ PNG (transparent background)
  - Sizes provided: ☐ Desktop (300px wide) ☐ Mobile (200px wide)
  - File location: _______________________________________________

- [ ] **Favicon**
  - Format: ☐ ICO ☐ PNG
  - Sizes: ☐ 32x32 ☐ 64x64 ☐ 128x128 ☐ 256x256
  - File location: _______________________________________________

- [ ] **Open Graph Image** (for social media sharing)
  - Size: 1200x630px
  - Format: ☐ JPG ☐ PNG
  - File location: _______________________________________________

- [ ] **Menu Item Photos** (optional but recommended)
  - Total items: _____
  - Format: ☐ JPG ☐ PNG
  - Folder location: _____________________________________________

#### Typography Preferences
- [ ] **Primary Font:** _____________________________________________
  - Source: ☐ Google Fonts ☐ Custom ☐ System default

- [ ] **Secondary Font:** ___________________________________________
  - Source: ☐ Google Fonts ☐ Custom ☐ System default

---

### Menu & Products

#### Menu Categories
- [ ] **Coffee/Espresso** - ___ items
- [ ] **Tea** - ___ items
- [ ] **Cold Drinks** - ___ items
- [ ] **Pastries** - ___ items
- [ ] **Food** - ___ items
- [ ] **Other:** _________________ - ___ items

#### Menu Items Spreadsheet
☐ Client provided complete menu in spreadsheet format
  - Required columns: Name, Description, Price, Category, Image URL (optional)
  - File location: _______________________________________________

#### Pricing & Modifiers
- [ ] **Size Options:** ☐ Small ☐ Medium ☐ Large ☐ Extra Large
- [ ] **Milk Options:** ☐ Dairy ☐ Oat ☐ Almond ☐ Soy ☐ Coconut
- [ ] **Customizations:** ☐ Extra shots ☐ Flavored syrups ☐ Toppings
- [ ] **Special Dietary Labels:** ☐ Vegan ☐ Gluten-free ☐ Nut-free

---

### Business Settings

#### Regional Settings
- [ ] **Country:** __________________________________________________
- [ ] **Currency:** ☐ USD ☐ CAD ☐ EUR ☐ GBP ☐ Other: _______________
- [ ] **Currency Symbol:** _________________________________________
- [ ] **Sales Tax Rate:** ____________%
  - Tax ID: _____________________________________________________
- [ ] **Time Zone:** ________________________________________________
  - Example: America/New_York, America/Los_Angeles, America/Edmonton

#### Order Configuration
- [ ] **Minimum Order Value:** $___________________________________
- [ ] **Maximum Order Value:** $____________________________________
- [ ] **Default Preparation Time:** ________ minutes
- [ ] **Allow Advance Orders?** ☐ Yes ☐ No
  - If yes, how many days in advance: ________
- [ ] **Allow Guest Checkout?** ☐ Yes ☐ No

#### Pickup Information
- [ ] **Pickup Instructions:** _______________________________________
  _________________________________________________________________
- [ ] **Parking Information:** ________________________________________
- [ ] **Special Notes:** ______________________________________________

---

### Features & Functionality

#### Core Features (Included)
- [x] Online menu browsing
- [x] Shopping cart
- [x] Guest checkout
- [x] Registered user accounts
- [x] Stripe payment processing
- [x] Order tracking
- [x] Employee dashboard
- [x] Real-time order notifications
- [x] Order status management

#### Optional Features
- [ ] **Membership/Subscription Plans** ☐ Enable ☐ Disable
  - If enabled, what plans? ______________________________________

- [ ] **Loyalty/Rewards Program** ☐ Enable ☐ Disable
  - Details: _____________________________________________________

- [ ] **Google OAuth Login** ☐ Enable ☐ Disable

- [ ] **Email Order Notifications** ☐ Enable ☐ Disable
  - Order confirmation: ☐ Yes ☐ No
  - Order ready: ☐ Yes ☐ No
  - Order cancelled: ☐ Yes ☐ No

#### Future Features (Phase 2+)
- [ ] Delivery integration
- [ ] Mobile app (iOS/Android)
- [ ] Gift cards
- [ ] Catering orders
- [ ] Inventory management
- [ ] Advanced analytics

---

## Phase 2: Technical Setup

### Third-Party Accounts

#### Stripe (Payment Processing)
- [ ] **Stripe account created**
  - Account email: _______________________________________________
  - Account owner: _______________________________________________
- [ ] **Bank account connected for payouts**
- [ ] **Test mode keys obtained:**
  - Publishable key: pk_test_... ☐ Received
  - Secret key: sk_test_... ☐ Received
- [ ] **Live mode keys obtained:**
  - Publishable key: pk_live_... ☐ Received
  - Secret key: sk_live_... ☐ Received
- [ ] **Webhook endpoint configured** ☐ Test ☐ Live

#### Hosting & Domain
- [ ] **Domain Name:** ______________________________________________
  - Registrar: ☐ GoDaddy ☐ Namecheap ☐ Google Domains ☐ Other: _____
  - DNS Access: ☐ Client ☐ Us ☐ Shared

- [ ] **Hosting Provider:**
  - Frontend: ☐ Vercel ☐ Netlify ☐ Other: ______________________
  - Backend: ☐ Railway ☐ Render ☐ DigitalOcean ☐ Other: __________

- [ ] **SSL Certificate:** ☐ Automatic ☐ Manual setup required

#### Database
- [ ] **Database Provider:** ☐ Supabase ☐ Railway ☐ Neon ☐ Other: ____
- [ ] **Database created:** ____________________________________________
- [ ] **Connection string obtained:** ☐ Yes
- [ ] **Backup strategy configured:** ☐ Daily ☐ Weekly ☐ Manual

#### Email Service (Optional)
- [ ] **Email Provider:** ☐ SendGrid ☐ Mailgun ☐ Postmark ☐ Other: ____
- [ ] **API key obtained:** ☐ Yes
- [ ] **Sender email verified:** ______________________________________
- [ ] **Email templates customized:** ☐ Yes ☐ No

#### Google OAuth (Optional)
- [ ] **Google Cloud Project created**
- [ ] **OAuth 2.0 credentials obtained:**
  - Client ID: ☐ Received
  - Client Secret: ☐ Received
- [ ] **Authorized redirect URIs configured**

---

### Development Environment Setup

- [ ] **Repository cloned locally**
- [ ] **Dependencies installed** (npm install)
- [ ] **Backend .env configured**
- [ ] **Customer Frontend .env configured**
- [ ] **Employee Dashboard .env configured**
- [ ] **Database schema created** (npm run db:setup)
- [ ] **Sample data loaded** (optional)
- [ ] **Local development servers running**
  - Backend: http://localhost:5000 ☐ Working
  - Customer Frontend: http://localhost:8890 ☐ Working
  - Employee Dashboard: http://localhost:8889 ☐ Working

---

### Customization Checklist

#### Branding Applied
- [ ] Shop name and tagline updated in all three apps
- [ ] Logo files placed in public folders
- [ ] Favicon updated
- [ ] Brand colors applied
- [ ] Typography customized (if custom fonts)
- [ ] Footer information updated (address, hours, social links)
- [ ] Homepage hero section customized
- [ ] About/Contact page content updated

#### Menu Configuration
- [ ] Menu categories defined
- [ ] Menu items imported to database
- [ ] Item descriptions reviewed for accuracy
- [ ] Prices confirmed
- [ ] Images uploaded and linked
- [ ] Customization options configured
- [ ] Default availability set

#### Business Logic
- [ ] Tax rate configured
- [ ] Currency and timezone set
- [ ] Order value limits set
- [ ] Preparation time configured
- [ ] Feature flags set (membership, delivery, etc.)
- [ ] Email notifications configured

---

## Phase 3: Testing

### Functional Testing

#### Customer Frontend
- [ ] Menu loads and displays correctly
- [ ] Menu item images display (if used)
- [ ] Cart functionality works (add, remove, update quantity)
- [ ] Guest checkout flow completes successfully
- [ ] Registered user checkout flow works
- [ ] Payment processing successful (test cards)
- [ ] Order confirmation email received
- [ ] Order tracking page accessible
- [ ] Account registration works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Order history displays for registered users

#### Employee Dashboard
- [ ] Login authentication works
- [ ] Order queue displays correctly
- [ ] New order notification appears (visual and sound)
- [ ] Order status updates work
- [ ] Order details display correctly
- [ ] Menu availability toggle works
- [ ] Daily order history accessible
- [ ] Search functionality works
- [ ] Analytics display correctly (if enabled)

#### Payment Testing
- [ ] **Successful payment:** Card 4242 4242 4242 4242
  - Order created: ☐ Yes
  - Email sent: ☐ Yes
  - Dashboard updated: ☐ Yes

- [ ] **Declined payment:** Card 4000 0000 0000 0002
  - Error message clear: ☐ Yes
  - No order created: ☐ Yes

- [ ] **Webhook processing:**
  - payment_intent.succeeded: ☐ Working
  - payment_intent.payment_failed: ☐ Working

#### Mobile Testing
- [ ] Customer frontend responsive on iPhone
- [ ] Customer frontend responsive on Android
- [ ] Employee dashboard responsive on tablet
- [ ] Touch targets appropriately sized
- [ ] Forms easy to complete on mobile

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

### Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Menu loads quickly
- [ ] Cart updates responsive
- [ ] Payment processing < 5 seconds
- [ ] Real-time notifications < 1 second latency

---

### Security Testing
- [ ] HTTPS enabled on all domains
- [ ] Environment variables not exposed to client
- [ ] API endpoints require authentication where appropriate
- [ ] Input validation working
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CORS configured correctly

---

## Phase 4: Deployment

### Production Deployment

#### Backend
- [ ] **Production database created and configured**
- [ ] **Environment variables set in hosting platform**
- [ ] **Database migrations run on production**
- [ ] **Menu items populated in production database**
- [ ] **Backend deployed successfully**
- [ ] **Health check endpoint responding:** /health
- [ ] **API URL recorded:** ___________________________________________

#### Customer Frontend
- [ ] **Environment variables set in Vercel/Netlify**
- [ ] **Production build successful**
- [ ] **Deployed to production**
- [ ] **Custom domain configured** (if applicable)
- [ ] **SSL certificate active**
- [ ] **Frontend URL:** ______________________________________________

#### Employee Dashboard
- [ ] **Environment variables set in Vercel/Netlify**
- [ ] **Production build successful**
- [ ] **Deployed to production**
- [ ] **Custom domain configured** (if applicable)
- [ ] **Dashboard URL:** _____________________________________________

#### Stripe Production Setup
- [ ] **Switched to live API keys**
- [ ] **Live webhook endpoint configured**
  - URL: https://api.client.com/api/webhooks/stripe
  - Events: payment_intent.succeeded, payment_intent.payment_failed
- [ ] **Webhook secret added to backend environment**
- [ ] **Test live payment processed successfully**

---

## Phase 5: Training & Handoff

### Employee Training

#### Training Session 1: Dashboard Basics
- [ ] **Date:** ________________ **Duration:** _______ **Attendees:** _______
- [ ] Login and authentication
- [ ] Dashboard navigation
- [ ] Understanding the order queue
- [ ] Order status workflow
- [ ] Sound notifications and settings

#### Training Session 2: Order Management
- [ ] **Date:** ________________ **Duration:** _______ **Attendees:** _______
- [ ] Processing new orders
- [ ] Updating order status
- [ ] Handling special requests
- [ ] Communicating with customers
- [ ] Cancelling/refunding orders

#### Training Session 3: Menu & Settings
- [ ] **Date:** ________________ **Duration:** _______ **Attendees:** _______
- [ ] Toggling menu item availability
- [ ] Viewing order history
- [ ] Understanding analytics
- [ ] Troubleshooting common issues

### Training Materials Provided
- [ ] Written user guide (employee dashboard)
- [ ] Written user guide (for customers, if needed)
- [ ] Video tutorials (if created)
- [ ] FAQ document
- [ ] Emergency contact information
- [ ] Troubleshooting guide

### Account Credentials

#### Admin/Manager Account
- [ ] **Email:** ____________________________________________________
- [ ] **Temporary Password:** ________________________________________
- [ ] **Password reset required:** ☐ Yes

#### Employee Accounts (if pre-created)
| Name | Email | Role | Password Sent |
|------|-------|------|---------------|
| | | | ☐ |
| | | | ☐ |
| | | | ☐ |

---

## Phase 6: Launch

### Pre-Launch Checklist
- [ ] All testing complete and issues resolved
- [ ] Training completed for all staff
- [ ] Marketing materials prepared (social media, email, signage)
- [ ] Soft launch date confirmed: ____________________________________
- [ ] Full launch date confirmed: ____________________________________
- [ ] Support plan in place for launch week

### Launch Day
- [ ] **Launch Date:** ______________________________________________
- [ ] Monitor system for first orders
- [ ] Staff available to assist customers
- [ ] Project manager monitoring for issues
- [ ] Quick response plan ready for any bugs

### Post-Launch (First Week)
- [ ] **Day 1:** Monitor all orders, collect feedback
- [ ] **Day 3:** Check-in call with client
  - Notes: _____________________________________________________
- [ ] **Day 7:** Review analytics and address any issues
  - Total orders: _____
  - Issues encountered: __________________________________________
  - Feedback summary: ___________________________________________

---

## Phase 7: Ongoing Support

### Support Plan
- [ ] **Support Period:** ____________________________________________
  - ☐ 30 days ☐ 60 days ☐ 90 days ☐ Ongoing

- [ ] **Support Channels:**
  - ☐ Email: ___________________________________________________
  - ☐ Phone: ___________________________________________________
  - ☐ Chat/Slack: _______________________________________________

- [ ] **Response Time SLA:** ________________________________________
  - Critical issues: ☐ 1 hour ☐ 4 hours ☐ 24 hours
  - Non-critical: ☐ 24 hours ☐ 48 hours ☐ 1 week

### Maintenance Plan
- [ ] **Regular Updates:** ☐ Monthly ☐ Quarterly ☐ As needed
- [ ] **Database Backups:** ☐ Daily ☐ Weekly ☐ Manual
- [ ] **Security Patches:** ☐ Immediate ☐ Monthly
- [ ] **Feature Enhancements:** ☐ Included ☐ Separate contract

---

## Success Metrics (30 Days Post-Launch)

### Adoption
- [ ] Total online orders: _______
- [ ] % of total orders via online system: _______%
- [ ] New user registrations: _______
- [ ] Guest checkout vs. registered: ______% vs ______%

### Quality
- [ ] Order accuracy rate: _______%
- [ ] Average customer rating: _______/5
- [ ] System uptime: _______%
- [ ] Average order processing time: _______ minutes

### Technical
- [ ] Payment success rate: _______%
- [ ] Average page load time: _______ seconds
- [ ] API response time (P95): _______ ms
- [ ] Real-time notification latency: _______ ms

### Business
- [ ] Average order value: $_______
- [ ] Total revenue via online orders: $_______
- [ ] Customer support tickets: _______
- [ ] Employee satisfaction: ☐ High ☐ Medium ☐ Low

---

## Notes & Special Requirements

_Use this section for any client-specific requirements, special requests, or important notes:_

___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

---

## Sign-Off

### Client Approval

**I confirm that the system meets our requirements and approve the launch:**

- **Name:** _________________________________________________________
- **Title:** ________________________________________________________
- **Signature:** ____________________________________________________
- **Date:** _________________________________________________________

### Project Manager Sign-Off

**I confirm that all deliverables have been completed and training provided:**

- **Name:** _________________________________________________________
- **Signature:** ____________________________________________________
- **Date:** _________________________________________________________

---

**Project Status:** ☐ In Progress ☐ Ready for Launch ☐ Launched ☐ Complete

**Final Notes:**
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
