# Testing Quick Start Guide

## Prerequisites

1. **Node.js 20+** installed
2. **PostgreSQL 15+** installed and running
3. Dependencies installed in both backend and frontend

## Frontend Tests (Ready to Run)

### Run All Tests
```bash
cd customer-frontend
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Interactive UI Mode
```bash
npm run test:ui
```

### Watch Mode (for development)
```bash
npm test -- --watch
```

**Current Status:** ✅ All 39 tests passing

## Backend Tests (Requires Database Setup)

### One-Time Setup

1. **Create test database:**
```bash
createdb barrenground_test
```

2. **Setup database schema:**
```bash
cd backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground_test npm run db:setup
```

3. **Create .env.test file** (copy from .env.test.example):
```bash
cp .env.test.example .env.test
```

Edit `.env.test` and set:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground_test
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground_test
NODE_ENV=test
JWT_SECRET=test-secret-key-for-testing
```

### Run Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Continuous Integration

Tests run automatically on:
- Push to `master`, `main`, or `develop` branches
- Pull requests to these branches

View results in GitHub Actions tab.

## Test Coverage Reports

### Frontend
After running `npm run test:coverage`, open:
```
customer-frontend/coverage/index.html
```

### Backend
After running `npm run test:coverage`, open:
```
backend/coverage/index.html
```

## Quick Troubleshooting

### Frontend Issues

**Issue:** `localStorage is not defined`
- **Fix:** Already handled in `src/test/setup.ts`

**Issue:** Tests fail with React warnings
- **Fix:** Make sure you have latest dependencies installed

### Backend Issues

**Issue:** `Cannot connect to database`
- **Fix:** Ensure PostgreSQL is running and test database exists
```bash
psql -l | grep barrenground_test
```

**Issue:** `Table does not exist`
- **Fix:** Run database setup again
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground_test npm run db:setup
```

**Issue:** `JWT_SECRET is not defined`
- **Fix:** Create `.env.test` file with proper configuration

## Test Structure

### Frontend Tests
```
customer-frontend/src/__tests__/
├── components/          # React component tests
│   ├── PointsDisplay.test.tsx
│   └── MembershipCard.test.tsx
└── stores/             # Zustand store tests
    └── cartStore.test.ts
```

### Backend Tests
```
backend/src/__tests__/
├── models/             # Model/ORM tests
│   ├── User.test.ts
│   ├── Order.test.ts
│   └── MenuItem.test.ts
├── integration/        # API endpoint tests
│   ├── auth.test.ts
│   ├── orders.test.ts
│   └── menu.test.ts
└── e2e/               # End-to-end flow tests
    └── orderFlow.test.ts
```

## Writing New Tests

### Frontend Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend API Test Template
```typescript
import request from 'supertest';
import express from 'express';
import myRoutes from '../../routes/myRoutes';
import { getTestPool, cleanupTestData } from '../../config/testDatabase';

const app = express();
app.use(express.json());
app.use('/api/my-route', myRoutes);

describe('My API Tests', () => {
  let testPool;

  beforeAll(async () => {
    testPool = getTestPool();
  });

  afterAll(async () => {
    await cleanupTestData(testPool);
    await testPool.end();
  });

  it('should respond successfully', async () => {
    const response = await request(app)
      .get('/api/my-route')
      .expect(200);

    expect(response.body).toBeDefined();
  });
});
```

## Coverage Thresholds

### Backend: 70%
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

### Frontend: 60%
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

Tests will fail in CI if coverage drops below these thresholds.

## Additional Resources

- **Full Documentation:** See `TESTING_IMPLEMENTATION_SUMMARY.md`
- **Jest Docs:** https://jestjs.io/
- **Vitest Docs:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **Supertest:** https://github.com/ladjs/supertest

---

**Quick Help:**
- Frontend tests failing? Check `customer-frontend/src/test/setup.ts`
- Backend tests failing? Check database connection and `.env.test`
- Need to add new tests? Follow the templates above
- Coverage too low? Write more tests for uncovered code paths
