import { Router } from 'express';
import { getOrdersUpdatedSince, getOrderStatusCounts } from '../controllers/pollingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Polling endpoints for employee dashboard
router.get('/orders/updated-since', authenticateToken, getOrdersUpdatedSince);
router.get('/orders/status-counts', authenticateToken, getOrderStatusCounts);

export default router;
