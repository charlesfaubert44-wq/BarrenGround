import { Router } from 'express';
import * as schedulingController from '../controllers/schedulingController';
import { authenticateToken } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Public routes - no authentication required
router.get('/available-slots', schedulingController.getAvailableSlots);
router.get('/business-hours', schedulingController.getBusinessHours);
router.get('/slot-capacity', schedulingController.getSlotCapacity);

// Employee routes - authentication and employee role required
router.get(
  '/scheduled-orders',
  authenticateToken,
  requireEmployee,
  schedulingController.getScheduledOrdersForDate
);

router.put(
  '/business-hours',
  authenticateToken,
  requireEmployee,
  schedulingController.updateBusinessHours
);

export default router;
