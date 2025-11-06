# Live Carts Implementation Plan

## Overview
The Live Carts feature allows employees to see real-time customer shopping carts in the dashboard. This helps staff prepare for incoming orders and understand customer behavior.

## Current Status
- ❌ Backend API endpoint `/api/carts/active` doesn't exist (returns 404)
- ❌ WebSocket server not configured
- ✅ Frontend LiveCartsPage exists but crashes without backend
- ✅ Fixed: Frontend now handles 404 gracefully

## Architecture

### Option 1: Simple Polling (Recommended for MVP)
- Store active carts in memory (Redis in production)
- Frontend polls every 5 seconds
- No WebSocket complexity
- Works in serverless (Vercel)

### Option 2: WebSocket (Better UX, More Complex)
- Requires persistent WebSocket server
- Doesn't work well with Vercel serverless
- Would need separate WebSocket service

**Recommendation: Start with Option 1 (Polling)**

## Implementation Steps

### Step 1: Backend - Cart Storage Service

Create `backend/src/services/cartStorage.ts`:

```typescript
// In-memory cart storage (use Redis in production)
interface StoredCart {
  sessionId: string;
  items: any[];
  total: number;
  itemCount: number;
  lastUpdated: number;
  createdAt: number;
  shopId: string;
}

class CartStorageService {
  private carts: Map<string, StoredCart> = new Map();
  private CART_EXPIRY = 30 * 60 * 1000; // 30 minutes

  updateCart(sessionId: string, shopId: string, cart: any) {
    this.carts.set(sessionId, {
      sessionId,
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
      lastUpdated: Date.now(),
      createdAt: this.carts.get(sessionId)?.createdAt || Date.now(),
      shopId,
    });
    this.cleanup();
  }

  getActiveCarts(shopId: string): StoredCart[] {
    this.cleanup();
    return Array.from(this.carts.values())
      .filter(cart => cart.shopId === shopId);
  }

  removeCart(sessionId: string) {
    this.carts.delete(sessionId);
  }

  private cleanup() {
    const now = Date.now();
    for (const [sessionId, cart] of this.carts.entries()) {
      if (now - cart.lastUpdated > this.CART_EXPIRY) {
        this.carts.delete(sessionId);
      }
    }
  }
}

export const cartStorage = new CartStorageService();
```

### Step 2: Backend - API Endpoint

Create `backend/src/routes/cartRoutes.ts`:

```typescript
import { Router } from 'express';
import { Request, Response } from 'express';
import { cartStorage } from '../services/cartStorage';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get active carts (employee only)
router.get('/active', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    const carts = cartStorage.getActiveCarts(req.shop.id);
    res.json(carts);
  } catch (error) {
    console.error('Get active carts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart (called by customer frontend)
router.post('/update', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    const { sessionId, cart } = req.body;

    if (!sessionId || !cart) {
      res.status(400).json({ error: 'Missing sessionId or cart data' });
      return;
    }

    cartStorage.updateCart(sessionId, req.shop.id, cart);
    res.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove cart (on checkout or timeout)
router.delete('/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    cartStorage.removeCart(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Step 3: Register Routes in server.ts

Add to `backend/src/server.ts`:

```typescript
import cartRoutes from './routes/cartRoutes';

// ... existing code ...

app.use('/api/carts', cartRoutes);
```

### Step 4: Customer Frontend - Send Cart Updates

Update `customer-frontend/src/store/cartStore.ts` to send cart updates:

Add this function:
```typescript
const syncCartWithBackend = async (cart: any) => {
  try {
    const sessionId = localStorage.getItem('cart-session-id') ||
                     `session-${Date.now()}-${Math.random().toString(36)}`;
    localStorage.setItem('cart-session-id', sessionId);

    await apiRequest('/api/carts/update', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        cart: {
          items: cart.items,
          total: getTotalPrice(),
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        }
      })
    });
  } catch (error) {
    console.error('Failed to sync cart:', error);
    // Don't block user if sync fails
  }
};
```

Call this function in `addItem`, `removeItem`, `updateQuantity`, and `clearCart`.

### Step 5: Employee Dashboard - Poll for Updates

Update `employee-dashboard/src/pages/LiveCartsPage.tsx`:

```typescript
useEffect(() => {
  const fetchCarts = async () => {
    try {
      const data = await apiRequest<ActiveCart[]>('/api/carts/active');
      setCarts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch active carts:', error);
      setCarts([]);
    }
  };

  fetchCarts();

  // Poll every 5 seconds
  const interval = setInterval(fetchCarts, 5000);

  return () => clearInterval(interval);
}, []);
```

## Testing

1. **Test cart tracking:**
   ```powershell
   # Add items to cart in customer frontend
   # Check employee dashboard Live Carts page
   # Verify cart appears
   ```

2. **Test cart updates:**
   ```powershell
   # Modify cart in customer frontend
   # Verify updates appear in employee dashboard within 5 seconds
   ```

3. **Test cart removal:**
   ```powershell
   # Complete checkout
   # Verify cart disappears from employee dashboard
   ```

## Future Enhancements

1. **Redis Storage**: Replace in-memory storage with Redis for multi-instance support
2. **WebSocket**: Add real-time updates instead of polling
3. **Cart Analytics**: Track abandonment rates, average cart value
4. **Cart Recovery**: Send reminders for abandoned carts
5. **Customer Info**: Show customer name/email if logged in

## Estimated Time
- Backend API: 30 minutes
- Customer frontend integration: 20 minutes
- Employee dashboard polling: 10 minutes
- Testing: 15 minutes
- **Total: ~75 minutes**

## Dependencies
- None (uses existing infrastructure)

## Notes
- In-memory storage is fine for single Vercel instance
- For production with multiple instances, migrate to Redis
- Cart expiry prevents memory leaks
- Polling is simple and works with serverless
