# ⚡ Quick Start - Today's Tasks

**Goal:** Test Multi-Tenancy (Morning) → OAuth Implementation (Afternoon)

---

## ☀️ MORNING (2 hours): Test Multi-Tenancy

### Quick Commands

**1. Connect to Database:**
```bash
psql $DATABASE_URL
```

**2. Create Test Shops:**
```sql
-- Shop 1
INSERT INTO shops (id, name, display_name, email, subdomain, features, status)
VALUES ('barrenground', 'barrenground', 'Barren Ground Coffee', 'hello@barrenground.com', 'barrenground', '{"membership": true, "loyalty": true, "scheduling": true, "delivery": false, "catering": true}', 'active');

-- Shop 2
INSERT INTO shops (id, name, display_name, email, subdomain, features, status)
VALUES ('testcafe', 'testcafe', 'Test Cafe', 'hello@testcafe.com', 'testcafe', '{"membership": false, "loyalty": true, "scheduling": false, "delivery": false, "catering": false}', 'active');
```

**3. Test User Isolation (CRITICAL):**
```bash
# Replace [YOUR-BACKEND] with your actual backend URL

# Create user in Shop 1
curl -X POST https://[YOUR-BACKEND]/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{"email": "alice@shop1.com", "password": "test123456", "name": "Alice Shop1"}'

# Try to login with Shop 2 (SHOULD FAIL!)
curl -X POST https://[YOUR-BACKEND]/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{"email": "alice@shop1.com", "password": "test123456"}'
```

**Expected:** Second command should return 401 Unauthorized

**Full Checklist:** [MULTI_TENANCY_TESTING_CHECKLIST.md](MULTI_TENANCY_TESTING_CHECKLIST.md)

---

## 🌤️ AFTERNOON (4 hours): OAuth Implementation

### Part 1: Setup (45 min)

**1. Install Dependencies:**
```bash
cd customer-frontend
npm install @react-oauth/google
```

**2. Get Google OAuth Credentials:**
- Go to: https://console.cloud.google.com/
- Create OAuth 2.0 Client ID
- Add redirect URI: `http://localhost:5173/auth/callback`
- Copy Client ID

**3. Add to Environment:**
```bash
echo "VITE_GOOGLE_CLIENT_ID=[your-client-id]" >> .env.local
```

### Part 2: Build Components (2 hours)

**1. Create GoogleSignInButton:**
```bash
mkdir -p src/components/auth
# Then create the component (code in TODAY_PLAN.md)
```

**2. Wrap App:**
```typescript
// In main.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

**3. Update LoginPage:**
Add `<GoogleSignInButton />` component

**4. Test:**
```bash
npm run dev
# Go to http://localhost:5173/login
# Click Google button
```

**Full Guide:** [docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md](docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md)

---

## 📋 Checklist

### Morning
- [ ] Database connected
- [ ] Test shops created
- [ ] Cross-shop login blocked (CRITICAL!)
- [ ] User isolation verified
- [ ] Test results documented

### Afternoon
- [ ] @react-oauth/google installed
- [ ] Google OAuth credentials obtained
- [ ] Environment configured
- [ ] GoogleSignInButton created
- [ ] Login/Register pages updated
- [ ] OAuth flow working

---

## 🆘 Quick Help

**Multi-Tenancy Not Working?**
- Check: `SELECT * FROM shops;`
- Verify: shop_id in users table
- Test with: X-Shop-ID header

**OAuth Not Working?**
- Check: VITE_GOOGLE_CLIENT_ID in .env.local
- Verify: Redirect URI matches exactly
- Look at: Browser console for errors

**Backend URL:**
Find it in Vercel dashboard or `.vercel/project.json`

---

## 📚 Full Documentation

- **Today's Detailed Plan:** [TODAY_PLAN.md](TODAY_PLAN.md)
- **Multi-Tenancy Testing:** [MULTI_TENANCY_TESTING_CHECKLIST.md](MULTI_TENANCY_TESTING_CHECKLIST.md)
- **Multi-Tenancy Docs:** [docs/features/MULTI_TENANCY_IMPLEMENTATION.md](docs/features/MULTI_TENANCY_IMPLEMENTATION.md)
- **OAuth Guide:** [docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md](docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md)

---

**Let's do this! 🚀**
