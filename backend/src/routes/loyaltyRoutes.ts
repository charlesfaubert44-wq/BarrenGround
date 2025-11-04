import { Router } from 'express';
import * as loyaltyController from '../controllers/loyaltyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's current points balance
router.get('/balance', loyaltyController.getBalance);

// Get user's transaction history
router.get('/history', loyaltyController.getHistory);

// Redeem points for credit
router.post('/redeem', loyaltyController.redeemPoints);

// Check and claim birthday bonus
router.post('/check-birthday', loyaltyController.checkBirthdayBonus);

// Get maximum redeemable points for an order
router.get('/max-redeemable', loyaltyController.getMaxRedeemable);

export default router;
