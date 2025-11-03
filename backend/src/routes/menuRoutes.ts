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
} from '../controllers/menuController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);

// Protected routes (employees only)
router.put('/:id/availability', authenticateToken, updateAvailabilityValidation, updateMenuItemAvailability);
router.post('/', authenticateToken, createMenuItemValidation, createMenuItem);
router.put('/:id', authenticateToken, updateMenuItem);
router.delete('/:id', authenticateToken, deleteMenuItem);

export default router;
