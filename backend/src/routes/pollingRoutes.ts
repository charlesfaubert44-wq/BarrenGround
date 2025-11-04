import { Router } from 'express';
import { getOrdersUpdatedSince, getOrderStatusCounts } from '../controllers/pollingController';
import { authenticateToken } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Polling endpoints for employee dashboard
router.get('/orders/updated-since', authenticateToken, requireEmployee, getOrdersUpdatedSince);
router.get('/orders/status-counts', authenticateToken, requireEmployee, getOrderStatusCounts);

export default router;
