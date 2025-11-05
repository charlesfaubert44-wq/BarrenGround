# 📅 Today's Plan - November 4, 2025

**Goal:** Test Multi-Tenancy (Morning) → Start OAuth Implementation (Afternoon)

---

## ☀️ MORNING: Multi-Tenancy Testing (2 hours)

**Time:** 9:00 AM - 11:00 AM
**Document:** [MULTI_TENANCY_TESTING_CHECKLIST.md](MULTI_TENANCY_TESTING_CHECKLIST.md)

### Session 1: Setup (30 min) - 9:00-9:30 AM

#### Task 1: Connect to Database (5 min)
```bash
# Get your database URL from Vercel or .env
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Or if using local:
psql $DATABASE_URL
```

**Status:** [ ] Connected

---

#### Task 2: Create Two Test Shops (10 min)

**Shop 1: Barren Ground Coffee**
```sql
INSERT INTO shops (
  id, name, display_name, email, phone, subdomain,
  features, status
) VALUES (
  'barrenground',
  'barrenground',
  'Barren Ground Coffee',
  'hello@barrenground.com',
  '555-0100',
  'barrenground',
  '{"membership": true, "loyalty": true, "scheduling": true, "delivery": false, "catering": true}',
  'active'
);
```

**Shop 2: Test Cafe**
```sql
INSERT INTO shops (
  id, name, display_name, email, phone, subdomain,
  features, status
) VALUES (
  'testcafe',
  'testcafe',
  'Test Cafe',
  'hello@testcafe.com',
  '555-0200',
  'testcafe',
  '{"membership": false, "loyalty": true, "scheduling": false, "delivery": false, "catering": false}',
  'active'
);
```

**Verify:**
```sql
SELECT id, display_name, subdomain, status FROM shops;
```

**Status:** [ ] Shops created

---

#### Task 3: Get Your Backend URL (5 min)

Find your production backend URL:
```
https://[YOUR-PROJECT]-api.vercel.app
```

Save it here: ___________________________________________

**Status:** [ ] Backend URL saved

---

#### Task 4: Set Up Test Environment (10 min)

Create a test file:
```bash
# Create test directory
mkdir -p test-results
cd test-results

# Create test log file
touch multi-tenancy-test.log
```

**Status:** [ ] Test environment ready

---

### Session 2: User Isolation Tests (30 min) - 9:30-10:00 AM

#### Test 1: Create Users for Each Shop (10 min)

**Register User 1 (Shop 1):**
```bash
curl -X POST https://[YOUR-BACKEND]/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456",
    "name": "Alice Shop1"
  }' | jq
```

**Expected:** Success with user object

**Register User 2 (Shop 2):**
```bash
curl -X POST https://[YOUR-BACKEND]/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456",
    "name": "Bob Shop2"
  }' | jq
```

**Status:** [ ] Users created

---

#### Test 2: CRITICAL - Cross-Shop Login (Should FAIL!) (10 min)

**Try to login Alice with Shop 2 context:**
```bash
curl -X POST https://[YOUR-BACKEND]/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }' | jq
```

**Expected:** ❌ 401 Unauthorized

✅ **CRITICAL:** If this succeeds, DATA ISOLATION IS BROKEN!

**Status:** [ ] PASS (login blocked) / [ ] FAIL (login succeeded - CRITICAL!)

---

#### Test 3: Same-Shop Login (Should SUCCEED) (10 min)

**Login Alice with correct shop:**
```bash
curl -X POST https://[YOUR-BACKEND]/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }' | jq
```

**Expected:** ✅ Success with JWT token

**Save token:**
```bash
export TOKEN_SHOP1="<paste-token-here>"
```

**Login Bob with correct shop:**
```bash
curl -X POST https://[YOUR-BACKEND]/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456"
  }' | jq
```

**Save token:**
```bash
export TOKEN_SHOP2="<paste-token-here>"
```

**Status:** [ ] Same-shop logins work

---

### Session 3: Data Isolation Verification (30 min) - 10:00-10:30 AM

#### Test 4: Verify in Database (10 min)

```sql
-- Check users are in correct shops
SELECT id, email, name, shop_id FROM users
WHERE email LIKE '%@shop%.com'
ORDER BY shop_id;
```

**Expected:**
```
alice@shop1.com → shop_id: barrenground
bob@shop2.com   → shop_id: testcafe
```

**Status:** [ ] Users correctly isolated

---

#### Test 5: Menu Isolation (10 min)

**Get Shop 1 menu:**
```bash
curl https://[YOUR-BACKEND]/api/menu \
  -H "X-Shop-ID: barrenground" | jq
```

**Get Shop 2 menu:**
```bash
curl https://[YOUR-BACKEND]/api/menu \
  -H "X-Shop-ID: testcafe" | jq
```

**Expected:** Different menus for each shop (or empty if no items yet)

**Status:** [ ] Menu isolation verified

---

#### Test 6: Order Isolation (10 min)

**Get Shop 1 orders:**
```bash
curl https://[YOUR-BACKEND]/api/orders \
  -H "X-Shop-ID: barrenground" \
  -H "Authorization: Bearer $TOKEN_SHOP1" | jq
```

**Get Shop 2 orders:**
```bash
curl https://[YOUR-BACKEND]/api/orders \
  -H "X-Shop-ID: testcafe" \
  -H "Authorization: Bearer $TOKEN_SHOP2" | jq
```

**Expected:** Each shop sees only its own orders

**Status:** [ ] Order isolation verified

---

### Session 4: Security Tests (30 min) - 10:30-11:00 AM

#### Test 7: Suspended Shop (10 min)

**Suspend Shop 2:**
```sql
UPDATE shops SET status = 'suspended' WHERE id = 'testcafe';
```

**Try to access:**
```bash
curl https://[YOUR-BACKEND]/api/menu \
  -H "X-Shop-ID: testcafe"
```

**Expected:** 403 Forbidden

**Reactivate:**
```sql
UPDATE shops SET status = 'active' WHERE id = 'testcafe';
```

**Status:** [ ] Suspended shop correctly blocked

---

#### Test 8: Invalid Shop (5 min)

```bash
curl https://[YOUR-BACKEND]/api/menu \
  -H "X-Shop-ID: fakeshop"
```

**Expected:** 404 Not Found

**Status:** [ ] Invalid shop rejected

---

#### Test 9: Document Results (15 min)

Create summary:
```bash
echo "Multi-Tenancy Test Results - $(date)" > test-results/summary.txt
echo "================================" >> test-results/summary.txt
echo "" >> test-results/summary.txt
echo "Critical Tests:" >> test-results/summary.txt
echo "[ ] Cross-shop login blocked" >> test-results/summary.txt
echo "[ ] User isolation verified" >> test-results/summary.txt
echo "[ ] Menu isolation verified" >> test-results/summary.txt
echo "[ ] Order isolation verified" >> test-results/summary.txt
echo "[ ] Security tests passed" >> test-results/summary.txt
echo "" >> test-results/summary.txt
echo "Issues Found:" >> test-results/summary.txt
echo "____________________________________________" >> test-results/summary.txt
```

**Status:** [ ] Test results documented

---

## 🌅 MORNING CHECKPOINT (11:00 AM)

Before moving to OAuth, verify:

- [ ] All critical tests passed
- [ ] No data leakage between shops
- [ ] Cross-shop login is blocked
- [ ] Database shows correct shop_id assignments

**If any test failed:** Document the issue and we'll fix it before OAuth.

**Time for coffee break!** ☕ (15 min)

---

## 🌤️ AFTERNOON: OAuth Implementation (4 hours)

**Time:** 11:15 AM - 3:15 PM (with breaks)
**Document:** [docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md](docs/features/OAUTH_PAYMENTS_FEATURE_GUIDE.md)

### Session 5: OAuth Setup (45 min) - 11:15 AM-12:00 PM

#### Task 1: Install Dependencies (10 min)

```bash
cd customer-frontend

# Install Google OAuth package
npm install @react-oauth/google

# Verify installation
npm list @react-oauth/google
```

**Status:** [ ] Dependencies installed

---

#### Task 2: Get Google OAuth Credentials (20 min)

1. **Go to:** https://console.cloud.google.com/
2. **Create/Select Project:** "Barren Ground Coffee"
3. **Enable Google+ API:**
   - APIs & Services → Enable APIs
   - Search "Google+ API" → Enable

4. **Create OAuth Credentials:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: "Barren Ground Customer Frontend"

5. **Add Authorized Origins:**
   ```
   http://localhost:5173
   https://[your-customer-frontend].vercel.app
   ```

6. **Add Authorized Redirect URIs:**
   ```
   http://localhost:5173/auth/callback
   https://[your-customer-frontend].vercel.app/auth/callback
   ```

7. **Copy Client ID:**
   ```
   Client ID: [paste-here]______________________________________
   ```

**Status:** [ ] Google OAuth credentials obtained

---

#### Task 3: Configure Environment (15 min)

**Local development:**
```bash
cd customer-frontend

# Create .env.local if it doesn't exist
echo "VITE_GOOGLE_CLIENT_ID=[your-client-id]" >> .env.local
```

**Vercel production:**
1. Go to Vercel Dashboard
2. Select customer-frontend project
3. Settings → Environment Variables
4. Add: `VITE_GOOGLE_CLIENT_ID` = `[your-client-id]`
5. Redeploy

**Status:** [ ] Environment configured

---

### 🍽️ LUNCH BREAK (12:00-1:00 PM)

---

### Session 6: Build OAuth Components (2 hours) - 1:00-3:00 PM

#### Task 1: Create GoogleSignInButton Component (30 min)

**File:** `customer-frontend/src/components/auth/GoogleSignInButton.tsx`

```typescript
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Send credential to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error('OAuth authentication failed');
      }

      const data = await response.json();

      // Update auth store
      login(data.token, data.user);

      // Callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (onError) {
        onError();
      }
    }
  };

  const handleError = () => {
    console.error('Google sign-in failed');
    if (onError) {
      onError();
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
      theme="filled_blue"
      size="large"
      text="continue_with"
      shape="rectangular"
    />
  );
}
```

**Status:** [ ] GoogleSignInButton created

---

#### Task 2: Wrap App with GoogleOAuthProvider (15 min)

**File:** `customer-frontend/src/main.tsx` (or `App.tsx`)

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

// ... other imports

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

**Status:** [ ] App wrapped with provider

---

#### Task 3: Update LoginPage (30 min)

**File:** `customer-frontend/src/pages/LoginPage.tsx`

Add Google button:

```typescript
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

// Inside your LoginPage component, add after the login form:

<div className="mt-6">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">Or continue with</span>
    </div>
  </div>

  <div className="mt-6">
    <GoogleSignInButton />
  </div>
</div>
```

**Status:** [ ] LoginPage updated

---

#### Task 4: Update RegisterPage (20 min)

**File:** `customer-frontend/src/pages/RegisterPage.tsx`

Same pattern as LoginPage - add Google button after registration form.

**Status:** [ ] RegisterPage updated

---

#### Task 5: Test OAuth Flow (25 min)

**Local testing:**
```bash
cd customer-frontend
npm run dev
```

1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Select Google account
4. Should redirect and be logged in

**Test checklist:**
- [ ] Google button appears
- [ ] Click opens Google sign-in
- [ ] After selection, redirects back
- [ ] User is logged in
- [ ] Token is stored
- [ ] Can access authenticated pages

**Status:** [ ] OAuth flow tested and working

---

## 🌆 END OF DAY CHECKPOINT (3:15 PM)

### Morning Achievements:
- [ ] Multi-tenancy tested
- [ ] Data isolation verified
- [ ] Security tests passed
- [ ] Test results documented

### Afternoon Achievements:
- [ ] Google OAuth dependencies installed
- [ ] OAuth credentials obtained
- [ ] GoogleSignInButton component created
- [ ] Login/Register pages updated
- [ ] OAuth flow tested and working

---

## 📝 Notes & Issues

**Morning Issues:**
_____________________________________________
_____________________________________________
_____________________________________________

**Afternoon Issues:**
_____________________________________________
_____________________________________________
_____________________________________________

**Questions for Tomorrow:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🎯 Tomorrow's Plan Preview

### Day 2: Payment Methods (8 hours)

**Morning:**
- Create payment methods API client
- Build PaymentMethodsTab component
- Add to AccountPage with tabs

**Afternoon:**
- Implement Stripe SetupIntent flow
- Add card management UI
- Test saved cards functionality

**Estimated Completion:** End of Day 2

---

## 🆘 If You Get Stuck

### Multi-Tenancy Issues
- Check [MULTI_TENANCY_TESTING_CHECKLIST.md](MULTI_TENANCY_TESTING_CHECKLIST.md)
- Review [docs/features/MULTI_TENANCY_IMPLEMENTATION.md](docs/features/MULTI_TENANCY_IMPLEMENTATION.md)
- Verify shop_id in database: `SELECT * FROM users WHERE email LIKE '%@shop%';`

### OAuth Issues
- Verify Google Client ID in .env.local
- Check redirect URIs match exactly
- Review backend logs for errors
- Check browser console for errors

**I'm here to help!** Just share the error message or issue.

---

**Good luck! Let's build something awesome today! 🚀**
