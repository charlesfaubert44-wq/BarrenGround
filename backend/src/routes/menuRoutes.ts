import { Router } from 'express';
import {
  getAllMenuItems,
  getMenuItem,
  updateMenuItemAvailability,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailabilityValidation,
  createMenuItemValidation,
  updateMenuItemValidation,
} from '../controllers/menuController';
import { authenticateToken } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);

// Protected routes (employees only)
router.put('/:id/availability', authenticateToken, requireEmployee, updateAvailabilityValidation, updateMenuItemAvailability);
router.post('/', authenticateToken, requireEmployee, createMenuItemValidation, createMenuItem);
router.put('/:id', authenticateToken, requireEmployee, updateMenuItemValidation, updateMenuItem);
router.delete('/:id', authenticateToken, requireEmployee, deleteMenuItem);

export default router;
