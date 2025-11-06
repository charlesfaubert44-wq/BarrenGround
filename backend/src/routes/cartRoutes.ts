import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { cartStorage } from '../services/cartStorage';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Get active carts (employee/admin only)
 * GET /api/carts/active
 */
router.get('/active', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Only allow admin/employee roles
    if (req.user?.role !== 'admin' && req.user?.role !== 'employee') {
      res.status(403).json({ error: 'Access denied. Employee privileges required.' });
      return;
    }

    const carts = cartStorage.getActiveCarts(req.shop.id);
    res.json(carts);
  } catch (error) {
    console.error('Get active carts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update cart (called by customer frontend)
 * POST /api/carts/update
 */
export const updateCartValidation = [
  body('sessionId').isString().trim().isLength({ min: 1 }),
  body('cart').isObject(),
  body('cart.items').isArray(),
  body('cart.total').isNumeric(),
  body('cart.itemCount').isInt({ min: 0 }),
];

router.post('/update', updateCartValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    const { sessionId, cart } = req.body;

    cartStorage.updateCart(sessionId, req.shop.id, {
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Remove cart (on checkout or timeout)
 * DELETE /api/carts/:sessionId
 */
router.delete('/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID required' });
      return;
    }

    cartStorage.removeCart(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get cart count for a shop (quick stat)
 * GET /api/carts/count
 */
router.get('/count', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    const count = cartStorage.getCartCount(req.shop.id);
    res.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
