# Quick Start Guide - Barren Ground Coffee

This guide will help you get the system running in under 5 minutes.

## Step 1: Database Setup (Required)

```bash
# Create the database
createdb barrenground

# OR if you need to specify user:
createdb -U postgres barrenground

# Load the schema
psql -U postgres -d barrenground -f backend/src/config/schema.sql

# Verify it worked - you should see 7 menu items
psql -U postgres -d barrenground -c "SELECT COUNT(*) FROM menu_items;"
```

**Troubleshooting Database:**
- If `createdb` command not found, make sure PostgreSQL is installed and in your PATH
- Windows: Add `C:\Program Files\PostgreSQL\15\bin` to PATH
- Mac: `brew install postgresql@15`
- Linux: `sudo apt-get install postgresql-15`

## Step 2: Update Backend .env (Important!)

Edit `backend/.env`:

```env
# Update this line with your PostgreSQL password:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barrenground

# For testing WITHOUT Stripe (pages will load):
# Leave these as-is - Stripe only needed for actual checkout

# For testing WITH Stripe payments:
# Get keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
```

## Step 3: Update Customer Frontend .env

Edit `customer-frontend/.env`:

```env
VITE_API_URL=http://localhost:3000

# Only needed if testing Stripe checkout:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY
```

## Step 4: Start Everything (3 Terminals)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected
```

**If you see errors:**
- `ECONNREFUSED`: Database not running or wrong password in .env
- `relation does not exist`: Schema not loaded, run the SQL file again
- Port already in use: Change PORT in backend/.env to 3001

### Terminal 2 - Customer Frontend
```bash
cd customer-frontend
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

**Open in browser:** http://localhost:5173

### Terminal 3 - Employee Dashboard
```bash
cd employee-dashboard
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5174/
```

**Open in browser:** http://localhost:5174

## Step 5: Test the System

### Test Customer Frontend (http://localhost:5173)
1. Click "Menu" in navigation
2. You should see coffee and pastries (7 items)
3. Click "Add to Cart" on any item
4. Click "Cart" - you should see your item

### Test Employee Dashboard (http://localhost:5174)
1. First, create an employee account (in Terminal 4):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"name\":\"Admin User\"}"
```

2. Login with:
   - Email: admin@test.com
   - Password: admin123

3. You should see the Order Queue page

## Common Issues & Solutions

### "Cannot GET /" or Blank Page
**Cause:** Frontend not running or wrong port

**Solution:**
```bash
# Check what's running on the ports
netstat -ano | findstr "5173"  # Windows
lsof -i :5173                   # Mac/Linux

# Make sure you're in the right directory
cd customer-frontend
npm run dev
```

### "Network Error" or API Errors
**Cause:** Backend not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# Should return: {"status":"ok"}

# If not, start backend:
cd backend
npm run dev
```

### "Failed to fetch menu"
**Cause:** Database not set up or backend can't connect

**Solution:**
```bash
# Test database connection
psql -U postgres -d barrenground -c "SELECT * FROM menu_items LIMIT 1;"

# If this fails, recreate database:
dropdb barrenground
createdb barrenground
psql -U postgres -d barrenground -f backend/src/config/schema.sql
```

### Cart is empty after adding items
**Cause:** Browser localStorage issue

**Solution:**
- Open DevTools (F12)
- Go to Application → Local Storage
- Clear site data
- Refresh page

### Checkout button doesn't work
**This is OK!** You need Stripe keys for checkout to work. You can:
1. Test everything else without Stripe
2. Get free test keys from https://dashboard.stripe.com/test/apikeys

## Quick Test Checklist

✅ Can load customer frontend (http://localhost:5173)
✅ Can see menu items
✅ Can add items to cart
✅ Can view cart
✅ Can register/login
✅ Backend health check works (http://localhost:3000/health)
✅ Can load employee dashboard (http://localhost:5174)
✅ Can login to employee dashboard

## Next: Testing the Full Order Flow

See [SETUP.md](SETUP.md) for complete testing instructions including:
- Stripe test card numbers
- WebSocket testing
- Order status workflow

## Still Having Issues?

**Check these logs:**

1. Backend terminal - any red error messages?
2. Browser DevTools Console (F12) - any errors?
3. Browser DevTools Network tab - are API calls failing?

**Get detailed help:**
Share the error messages from:
- Terminal where backend is running
- Browser console (F12 → Console tab)
- What page you're trying to load
