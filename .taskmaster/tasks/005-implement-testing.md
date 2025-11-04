# Implement Comprehensive Testing

**Priority:** 🔴 CRITICAL
**Phase:** 1 - Critical Fixes
**Estimated Time:** 8-12 hours
**Status:** pending

## Description
Add comprehensive test coverage for backend API, frontend components, and end-to-end workflows. Current coverage is 0%.

## Current State
- No test files exist
- No testing framework configured
- No CI/CD testing pipeline

## Testing Goals
- Backend: 70% code coverage
- Frontend: 60% component coverage
- E2E: Critical user flows covered

## Tasks

### 1. Backend Testing Setup
- [ ] Install testing dependencies
  ```bash
  cd backend
  npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
  ```

- [ ] Create `backend/jest.config.js`
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/scripts/**',
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  };
  ```

- [ ] Update `backend/package.json`
  ```json
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage"
    }
  }
  ```

### 2. Backend Unit Tests - Models

- [ ] Create `backend/src/__tests__/models/User.test.ts`
  ```typescript
  import { User } from '../../models/User';
  import { pool } from '../../config/database';

  describe('User Model', () => {
    beforeAll(async () => {
      // Setup test database
    });

    afterAll(async () => {
      await pool.end();
    });

    afterEach(async () => {
      // Clean up test data
      await pool.query('DELETE FROM users WHERE email LIKE \'%@test.com\'');
    });

    describe('create', () => {
      it('should create a new user with hashed password', async () => {
        const userData = {
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
        };

        const user = await User.create(userData);

        expect(user.email).toBe(userData.email);
        expect(user.name).toBe(userData.name);
        expect(user.password_hash).not.toBe(userData.password);
        expect(user.id).toBeDefined();
      });

      it('should throw error for duplicate email', async () => {
        // Test duplicate email handling
      });
    });

    describe('findByEmail', () => {
      it('should find user by email', async () => {
        // Test
      });

      it('should return null for non-existent email', async () => {
        // Test
      });
    });

    describe('validatePassword', () => {
      it('should return true for correct password', async () => {
        // Test
      });

      it('should return false for incorrect password', async () => {
        // Test
      });
    });
  });
  ```

- [ ] Create tests for other models:
  - `backend/src/__tests__/models/Order.test.ts`
  - `backend/src/__tests__/models/MenuItem.test.ts`
  - `backend/src/__tests__/models/MembershipPlan.test.ts`

### 3. Backend Integration Tests - API Endpoints

- [ ] Create `backend/src/__tests__/integration/auth.test.ts`
  ```typescript
  import request from 'supertest';
  import app from '../../server';
  import { pool } from '../../config/database';

  describe('Auth API', () => {
    afterAll(async () => {
      await pool.end();
    });

    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newuser@test.com',
            password: 'password123',
            name: 'New User',
          });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe('newuser@test.com');
        expect(response.body.token).toBeDefined();
      });

      it('should return 400 for invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: 'password123',
            name: 'Test',
          });

        expect(response.status).toBe(400);
      });

      it('should return 409 for duplicate email', async () => {
        // Test
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        // Test
      });

      it('should return 401 for invalid credentials', async () => {
        // Test
      });

      it('should respect rate limiting', async () => {
        // Make 6 failed login attempts, expect 429
      });
    });
  });
  ```

- [ ] Create `backend/src/__tests__/integration/orders.test.ts`
  ```typescript
  describe('Orders API', () => {
    describe('POST /api/orders', () => {
      it('should create order for authenticated user', async () => {
        // Test
      });

      it('should create order for guest', async () => {
        // Test
      });

      it('should apply membership discount', async () => {
        // Test
      });

      it('should validate menu item availability', async () => {
        // Test
      });

      it('should return 400 for invalid pickup time', async () => {
        // Test
      });
    });

    describe('GET /api/orders/track/:token', () => {
      it('should return order for valid tracking token', async () => {
        // Test
      });

      it('should return 404 for invalid token', async () => {
        // Test
      });
    });
  });
  ```

- [ ] Create tests for other endpoints:
  - `menu.test.ts`
  - `membership.test.ts`
  - `paymentMethods.test.ts`
  - `promos.test.ts`
  - `news.test.ts`

### 4. Backend E2E Tests

- [ ] Create `backend/src/__tests__/e2e/orderFlow.test.ts`
  ```typescript
  describe('Complete Order Flow', () => {
    it('should complete full guest checkout flow', async () => {
      // 1. Get menu items
      const menuResponse = await request(app).get('/api/menu');
      expect(menuResponse.status).toBe(200);

      // 2. Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [{ menu_item_id: menuResponse.body[0].id, quantity: 1 }],
          customer: {
            name: 'Guest Customer',
            email: 'guest@test.com',
          },
        });
      expect(orderResponse.status).toBe(201);

      // 3. Track order
      const trackResponse = await request(app)
        .get(`/api/orders/track/${orderResponse.body.tracking_token}`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.status).toBe('pending');

      // 4. Simulate webhook (payment confirmed)
      // 5. Verify order status updated
      // 6. Employee updates status
      // 7. Verify status progression
    });

    it('should complete full member checkout with redemption', async () => {
      // Similar flow but with authentication and membership
    });
  });
  ```

### 5. Frontend Testing Setup

- [ ] Install testing dependencies
  ```bash
  cd customer-frontend
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
  ```

- [ ] Create `customer-frontend/vitest.config.ts`
  ```typescript
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
  });
  ```

- [ ] Create `customer-frontend/src/test/setup.ts`
  ```typescript
  import '@testing-library/jest-dom';
  import { cleanup } from '@testing-library/react';
  import { afterEach } from 'vitest';

  afterEach(() => {
    cleanup();
  });
  ```

### 6. Frontend Component Tests

- [ ] Create `customer-frontend/src/__tests__/components/CartItem.test.tsx`
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';
  import { CartItem } from '../../components/CartItem';

  describe('CartItem', () => {
    const mockItem = {
      id: '1',
      menu_item_id: 1,
      name: 'Latte',
      price: 4.50,
      quantity: 2,
      customizations: { size: 'Large', milk: 'Oat' },
    };

    const mockOnRemove = vi.fn();
    const mockOnUpdateQuantity = vi.fn();

    it('should render item details correctly', () => {
      render(
        <CartItem
          item={mockItem}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByText('Latte')).toBeInTheDocument();
      expect(screen.getByText('$4.50')).toBeInTheDocument();
      expect(screen.getByText('Size: Large')).toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', () => {
      render(<CartItem item={mockItem} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith(mockItem.id);
    });

    it('should update quantity when + button clicked', () => {
      // Test
    });
  });
  ```

- [ ] Create tests for key components:
  - `MenuItemCard.test.tsx`
  - `CheckoutForm.test.tsx`
  - `OrderTracker.test.tsx`

### 7. Frontend Store Tests

- [ ] Create `customer-frontend/src/__tests__/stores/cartStore.test.ts`
  ```typescript
  import { renderHook, act } from '@testing-library/react';
  import { useCartStore } from '../../stores/cartStore';

  describe('Cart Store', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useCartStore());
      act(() => {
        result.current.clearCart();
      });
    });

    it('should add item to cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({
          menu_item_id: 1,
          name: 'Latte',
          price: 4.50,
          quantity: 1,
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe('Latte');
    });

    it('should calculate total correctly', () => {
      // Test
    });

    it('should handle customizations', () => {
      // Test
    });
  });
  ```

### 8. E2E Tests with Playwright

- [ ] Install Playwright
  ```bash
  npm init playwright@latest
  ```

- [ ] Create `e2e/tests/checkout.spec.ts`
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Guest Checkout Flow', () => {
    test('should complete order as guest', async ({ page }) => {
      // 1. Navigate to menu
      await page.goto('http://localhost:8890/menu');

      // 2. Add item to cart
      await page.click('[data-testid="menu-item-1"] button:has-text("Add to Cart")');

      // 3. Verify cart badge
      await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');

      // 4. Go to checkout
      await page.click('[data-testid="cart-button"]');
      await page.click('button:has-text("Checkout")');

      // 5. Fill checkout form
      await page.fill('input[name="name"]', 'Test Customer');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '555-0100');

      // 6. Enter payment details (test card)
      await page.fill('iframe[name="stripe-frame"] input[name="cardnumber"]', '4242424242424242');
      await page.fill('iframe[name="stripe-frame"] input[name="exp-date"]', '12/25');
      await page.fill('iframe[name="stripe-frame"] input[name="cvc"]', '123');

      // 7. Place order
      await page.click('button:has-text("Place Order")');

      // 8. Verify success page
      await expect(page).toHaveURL(/\/order-success/);
      await expect(page.locator('h1')).toContainText('Order Confirmed');
    });
  });
  ```

- [ ] Create more E2E tests:
  - `auth.spec.ts` - Login/register flow
  - `membership.spec.ts` - Membership purchase and redemption
  - `employee-dashboard.spec.ts` - Order management

### 9. Test Database Setup

- [ ] Create `backend/src/config/testDatabase.ts`
  ```typescript
  import { Pool } from 'pg';

  export const setupTestDatabase = async () => {
    const testPool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
    });

    // Run schema
    // Insert seed data

    return testPool;
  };

  export const teardownTestDatabase = async (pool: Pool) => {
    await pool.query('TRUNCATE users, orders, order_items, menu_items CASCADE');
    await pool.end();
  };
  ```

- [ ] Add test database to `.env.test`
  ```
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barrenground_test
  NODE_ENV=test
  ```

### 10. CI/CD Integration

- [ ] Create `.github/workflows/test.yml`
  ```yaml
  name: Tests

  on: [push, pull_request]

  jobs:
    test:
      runs-on: ubuntu-latest

      services:
        postgres:
          image: postgres:15
          env:
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: barrenground_test
          options: >-
            --health-cmd pg_isready
            --health-interval 10s
            --health-timeout 5s
            --health-retries 5
          ports:
            - 5432:5432

      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '20'

        - name: Install dependencies
          run: npm run install:all

        - name: Run backend tests
          run: cd backend && npm test
          env:
            DATABASE_URL: postgresql://postgres:postgres@localhost:5432/barrenground_test

        - name: Run frontend tests
          run: cd customer-frontend && npm test

        - name: Upload coverage
          uses: codecov/codecov-action@v3
  ```

## Success Criteria
- [x] Backend test coverage > 70%
- [x] Frontend test coverage > 60%
- [x] All critical flows covered by E2E tests
- [x] Tests run in CI/CD pipeline
- [x] All tests passing

## Key Test Scenarios to Cover

**Backend:**
- User registration and login
- Order creation (guest and authenticated)
- Membership redemption
- Order status updates
- Payment webhook handling
- Menu availability checks
- Promo code validation
- Rate limiting

**Frontend:**
- Cart management
- Checkout form validation
- Payment form integration
- Order tracking
- Authentication flows
- Membership subscription

**E2E:**
- Complete guest checkout
- Complete member checkout with redemption
- Order tracking
- Employee order management
- Menu management

## Files to Create
- `backend/jest.config.js`
- `backend/src/__tests__/**/*.test.ts` (multiple test files)
- `customer-frontend/vitest.config.ts`
- `customer-frontend/src/__tests__/**/*.test.tsx`
- `employee-dashboard/vitest.config.ts`
- `e2e/tests/**/*.spec.ts`
- `.github/workflows/test.yml`

## Dependencies
- Backend: jest, ts-jest, supertest
- Frontend: vitest, @testing-library/react
- E2E: @playwright/test

## Notes
- Start with unit tests, then integration, then E2E
- Use test database separate from development
- Mock Stripe API in tests
- Keep tests fast (< 1ms for unit, < 100ms for integration)
- Run E2E tests in headless mode in CI
