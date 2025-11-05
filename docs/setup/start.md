# Start Instructions

## Quick Start (Copy & Paste)

Open 3 terminals and run these commands:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Wait for: `Server running on port 3000` and `Database connected`

### Terminal 2 - Customer Frontend
```bash
cd customer-frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

Then open: **http://localhost:5173**

### Terminal 3 - Employee Dashboard
```bash
cd employee-dashboard
npm run dev
```

Wait for: `Local: http://localhost:5174/`

Then open: **http://localhost:5174**

## If Backend Fails to Start

### Error: "connect ECONNREFUSED" or "database does not exist"

Run this to set up the database:

```bash
# Create database
createdb -U postgres barrenground

# Load schema
psql -U postgres -d barrenground -f backend/src/config/schema.sql

# Verify
psql -U postgres -d barrenground -c "SELECT COUNT(*) FROM menu_items;"
```

You should see: `count | 7`

### Error: "password authentication failed"

Update `backend/.env` line 2:
```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/barrenground
```

Replace `YOUR_ACTUAL_PASSWORD` with your PostgreSQL password.

## Test It Works

1. Open http://localhost:5173
2. Click "Menu"
3. You should see 7 items (Espresso, Cappuccino, etc.)
4. Click "Add to Cart" - cart badge should update

## Create Employee Account

In a 4th terminal:

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"name\":\"Admin\"}"
```

Then login at http://localhost:5174 with:
- Email: `admin@test.com`
- Password: `admin123`

## Troubleshooting

**Still not working?** Tell me:
1. Which URL you're trying to access
2. What error you see (screenshot helps!)
3. What's in the terminal where backend is running
