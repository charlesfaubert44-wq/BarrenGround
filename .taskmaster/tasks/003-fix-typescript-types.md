# Fix TypeScript Type Safety Issues

**Priority:** 🔴 CRITICAL
**Phase:** 1 - Critical Fixes
**Estimated Time:** 4-6 hours
**Status:** pending

## Description
Remove 20+ instances of `any` type and `@ts-ignore` comments throughout the codebase. Improve TypeScript strictness for better IDE support and runtime error prevention.

## Current Issues
- `(req as any).user` - No proper Request typing
- Multiple `@ts-ignore` comments
- Utility functions with `any` parameters
- Missing interface definitions
- Loose type assertions

## Tasks

### 1. Create Proper Type Definitions
- [ ] Create `backend/src/types/express.d.ts`
  ```typescript
  import { User } from '../models/User';

  declare global {
    namespace Express {
      interface Request {
        user?: {
          id: number;
          email: string;
          name: string;
          role?: string;
        };
        employee?: {
          id: number;
          email: string;
          name: string;
        };
      }
    }
  }

  export {};
  ```

- [ ] Create `backend/src/types/api.ts`
  ```typescript
  // Request types
  export interface CreateOrderRequest {
    items: Array<{
      menu_item_id: number;
      quantity: number;
      customizations?: Record<string, any>;
    }>;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
    pickup_time?: string;
    payment_method_id?: string;
    use_membership?: boolean;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }

  // Response types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }

  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  ```

### 2. Fix Auth Middleware Types
- [ ] Update `backend/src/middleware/auth.ts`
  ```typescript
  import { Request, Response, NextFunction } from 'express';

  // Remove: const user = (req as any).user;
  // Use: const user = req.user;

  export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
  ```

### 3. Fix Controller Types
- [ ] Update `backend/src/controllers/orderController.ts`
  - Replace `(req as any).user` with `req.user`
  - Add proper request body typing
  - Add return types to all functions
  ```typescript
  import { Request, Response } from 'express';
  import { CreateOrderRequest, ApiResponse } from '../types/api';

  export const createOrder = async (
    req: Request<{}, {}, CreateOrderRequest>,
    res: Response<ApiResponse>
  ): Promise<void> => {
    try {
      const user = req.user; // Properly typed now
      const orderData = req.body; // Properly typed

      // ... implementation

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
      });
    }
  };
  ```

- [ ] Update `backend/src/controllers/authController.ts`
- [ ] Update `backend/src/controllers/membershipController.ts`
- [ ] Update `backend/src/controllers/menuController.ts`
- [ ] Update `backend/src/controllers/paymentMethodController.ts`

### 4. Fix Model Types
- [ ] Update `backend/src/models/Order.ts`
  - Remove `any` types in method signatures
  - Add proper return types
  - Define interfaces for complex objects
  ```typescript
  export interface OrderItem {
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price_snapshot: number;
    customizations?: Record<string, any>;
  }

  export interface CreateOrderData {
    user_id?: number;
    guest_email?: string;
    guest_name?: string;
    guest_phone?: string;
    total: number;
    status: string;
    payment_intent_id: string;
    tracking_token?: string;
    pickup_time?: Date;
    items: OrderItem[];
  }

  export class Order {
    static async create(data: CreateOrderData): Promise<Order> {
      // Implementation with proper types
    }

    static async findById(id: number): Promise<Order | null> {
      // Implementation
    }
  }
  ```

- [ ] Update other models similarly

### 5. Fix Utility Function Types
- [ ] Update `backend/src/utils/jwt.ts`
  ```typescript
  export interface JwtPayload {
    userId: number;
    email: string;
    name: string;
  }

  export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  };

  export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  };
  ```

### 6. Update Frontend Types
- [ ] Create `customer-frontend/src/types/api.ts`
  ```typescript
  export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    available: boolean;
  }

  export interface CartItem {
    id: string; // unique ID for cart (not menu_item_id)
    menu_item_id: number;
    name: string;
    price: number;
    quantity: number;
    customizations?: {
      size?: string;
      milk?: string;
      temperature?: string;
      extras?: string[];
      specialInstructions?: string;
    };
  }

  export interface Order {
    id: number;
    total: number;
    status: string;
    tracking_token?: string;
    pickup_time?: string;
    created_at: string;
    items: OrderItem[];
  }

  // ... more types
  ```

- [ ] Create `employee-dashboard/src/types/api.ts` (similar)

- [ ] Update component props with proper types
  ```typescript
  // Instead of:
  interface Props {
    order: any;
  }

  // Use:
  interface OrderCardProps {
    order: Order;
    onStatusUpdate: (orderId: number, newStatus: string) => Promise<void>;
  }
  ```

### 7. Remove @ts-ignore Comments
- [ ] Search for all `@ts-ignore` comments
  ```bash
  grep -r "@ts-ignore" backend/src
  grep -r "@ts-ignore" customer-frontend/src
  grep -r "@ts-ignore" employee-dashboard/src
  ```
- [ ] Fix underlying type issues instead of ignoring
- [ ] Document why if absolutely necessary (very rare)

### 8. Update tsconfig.json
- [ ] Enable stricter type checking in `backend/tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "alwaysStrict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true
    }
  }
  ```
- [ ] Fix all new errors that appear
- [ ] Apply similar settings to frontend tsconfig files

### 9. Add Type Guards
- [ ] Create `backend/src/utils/typeGuards.ts`
  ```typescript
  export const isAuthenticatedRequest = (req: Request): req is Request & { user: NonNullable<Request['user']> } => {
    return req.user !== undefined;
  };

  export const isValidOrderStatus = (status: string): status is OrderStatus => {
    return ['pending', 'received', 'preparing', 'ready', 'completed', 'cancelled'].includes(status);
  };
  ```

### 10. Testing
- [ ] Run TypeScript compiler: `npm run build` in all projects
- [ ] Fix all compilation errors
- [ ] Verify IDE autocomplete works properly
- [ ] Test runtime behavior unchanged

## Success Criteria
- [x] Zero `any` types in codebase (or < 5 with documented reasons)
- [x] Zero `@ts-ignore` comments (or < 3 with documented reasons)
- [x] All Request objects properly typed
- [x] All API responses properly typed
- [x] TypeScript strict mode enabled
- [x] No compilation errors
- [x] Full IDE autocomplete support

## Files to Create
- `backend/src/types/express.d.ts`
- `backend/src/types/api.ts`
- `backend/src/utils/typeGuards.ts`
- `customer-frontend/src/types/api.ts`
- `employee-dashboard/src/types/api.ts`

## Files to Modify
- All controllers (orderController, authController, etc.)
- All models (Order, User, MenuItem, etc.)
- `backend/src/middleware/auth.ts`
- `backend/src/utils/jwt.ts`
- `backend/tsconfig.json`
- `customer-frontend/tsconfig.json`
- `employee-dashboard/tsconfig.json`

## Dependencies
- None (can be done immediately)

## Notes
- This is tedious but critical for code quality
- Do incrementally to avoid breaking everything
- Test after each major file conversion
- Consider using `ts-migrate` tool for bulk conversion
- Pair with linting rules (ESLint with TypeScript plugin)
