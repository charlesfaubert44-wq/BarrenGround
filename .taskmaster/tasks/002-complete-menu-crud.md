# Complete Menu Item CRUD Operations

**Priority:** 🔴 CRITICAL
**Phase:** 1 - Critical Fixes
**Estimated Time:** 2-3 hours
**Status:** ✅ COMPLETED

## Description
Currently, the employee dashboard can only toggle menu item availability. It cannot create, edit, or delete menu items. The frontend UI exists but backend endpoints are missing.

## Current State
- ✅ `GET /api/menu` - Get all items (exists)
- ✅ `PUT /api/menu/:id/availability` - Toggle availability (exists)
- ✅ `POST /api/menu` - Create item (IMPLEMENTED)
- ✅ `PUT /api/menu/:id` - Update item (IMPLEMENTED)
- ✅ `DELETE /api/menu/:id` - Delete item (IMPLEMENTED)

## Tasks

### 1. Update Menu Model
- [x] Edit `backend/src/models/MenuItem.ts`
- [x] Add `create(data)` method
  ```typescript
  static async create(data: {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    available?: boolean;
  }): Promise<MenuItem>
  ```
- [x] Add `update(id, data)` method
  ```typescript
  static async update(id: number, data: Partial<MenuItem>): Promise<MenuItem>
  ```
- [x] Add `delete(id)` method
  ```typescript
  static async delete(id: number): Promise<boolean>
  ```
- [x] Add input validation (price > 0, name not empty, valid category)

### 2. Update Menu Controller
- [x] Edit `backend/src/controllers/menuController.ts`
- [x] Add `createMenuItem` handler
  ```typescript
  export const createMenuItem = async (req: Request, res: Response) => {
    // Validate input (express-validator)
    // Check employee authorization
    // Create menu item
    // Return created item
  };
  ```
- [x] Add `updateMenuItem` handler
  ```typescript
  export const updateMenuItem = async (req: Request, res: Response) => {
    // Validate input
    // Check employee authorization
    // Check item exists
    // Update menu item
    // Return updated item
  };
  ```
- [x] Add `deleteMenuItem` handler
  ```typescript
  export const deleteMenuItem = async (req: Request, res: Response) => {
    // Check employee authorization
    // Check item exists
    // Soft delete (set available=false) OR hard delete
    // Return success
  };
  ```

### 3. Add Input Validation
- [x] Create validation rules in controller
  ```typescript
  import { body, param } from 'express-validator';

  export const createMenuItemValidation = [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('description').optional().trim(),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be positive'),
    body('category').isIn(['coffee', 'drip-coffee', 'cold-drinks', 'pastries', 'specialty', 'food']),
    body('image_url').optional().isURL(),
    body('available').optional().isBoolean(),
  ];

  export const updateMenuItemValidation = [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0.01 }),
    body('category').optional().isIn([...]),
    // ... etc
  ];
  ```

### 4. Update Routes
- [x] Edit `backend/src/routes/menuRoutes.ts`
- [x] Add create route
  ```typescript
  router.post(
    '/',
    authenticateToken,
    createMenuItemValidation,
    menuController.createMenuItem
  );
  ```
- [x] Add update route
  ```typescript
  router.put(
    '/:id',
    authenticateToken,
    updateMenuItemValidation,
    menuController.updateMenuItem
  );
  ```
- [x] Add delete route
  ```typescript
  router.delete(
    '/:id',
    authenticateToken,
    menuController.deleteMenuItem
  );
  ```

### 5. Add Authorization Middleware
- [x] ~~Create `backend/src/middleware/roleAuth.ts`~~ (Not needed - using existing `authenticateToken` middleware)
- [x] Apply to all menu modification routes

### 6. Update Frontend
- [x] Verify `employee-dashboard/src/pages/MenuManagementPage.tsx`
- [x] Ensure create/edit modals make correct API calls
- [x] Add error handling
- [x] Add success notifications
- [x] Add loading states

### 7. Database Considerations
- [x] Decide: Soft delete (set available=false) vs Hard delete?
  - Decision: Using hard delete is acceptable because order history is preserved through denormalization
  - `order_items.menu_item_name` and `order_items.price_snapshot` preserve historical data
  - `order_items.menu_item_id` can be NULL if item is deleted (no cascade)

### 8. Testing
- [x] Test creating new menu item
- [x] Test updating existing item
- [x] Test deleting item
- [x] Test validation errors (empty name, negative price, invalid category)
- [x] Test authorization (only employees can modify)
- [x] Test that deleted items don't appear in customer menu
- [x] Test that order history still shows deleted items

## Success Criteria
- [x] Can create menu items from employee dashboard
- [x] Can edit menu items (name, description, price, category, image)
- [x] Can delete menu items
- [x] Validation prevents invalid data
- [x] Only employees can modify menu
- [x] Customer frontend not affected by changes

## Files to Create
- `backend/src/middleware/roleAuth.ts` (optional, if detailed authorization needed)

## Files to Modify
- `backend/src/models/MenuItem.ts`
- `backend/src/controllers/menuController.ts`
- `backend/src/routes/menuRoutes.ts`
- `employee-dashboard/src/pages/MenuManagementPage.tsx` (verify)

## Dependencies
- None (can be done immediately)

## Notes
- Consider adding image upload functionality (future enhancement)
- Consider adding menu item categories management (future)
- Consider adding bulk operations (bulk delete, bulk price update)
- Recommendation: Use soft delete to preserve order history integrity
