import { Router } from 'express';
import {
  getPlans,
  getMembershipStatus,
  createSubscription,
  cancelSubscription,
  redeemCoffee,
} from '../controllers/membershipController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.get('/status', authenticateToken, getMembershipStatus);
router.post(
  '/subscribe',
  authenticateToken,
  [
    body('planId').isInt(),
    body('paymentMethodId').notEmpty(),
  ],
  createSubscription
);
router.post('/cancel', authenticateToken, cancelSubscription);
router.post(
  '/redeem',
  authenticateToken,
  [body('coffeeName').notEmpty()],
  redeemCoffee
);

export default router;
