import { Router } from 'express';
import {
  getAllPromos,
  getPromo,
  getActivePromos,
  createPromo,
  updatePromo,
  updatePromoActive,
  deletePromo,
  createPromoValidation,
  updatePromoValidation,
  updatePromoActiveValidation,
} from '../controllers/promoController';
import { authenticateToken } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Public routes - no authentication required
router.get('/active', getActivePromos);

// Protected routes - employees only
router.get('/', authenticateToken, requireEmployee, getAllPromos);
router.get('/:id', authenticateToken, requireEmployee, getPromo);
router.post('/', authenticateToken, requireEmployee, createPromoValidation, createPromo);
router.put('/:id', authenticateToken, requireEmployee, updatePromoValidation, updatePromo);
router.put('/:id/active', authenticateToken, requireEmployee, updatePromoActiveValidation, updatePromoActive);
router.delete('/:id', authenticateToken, requireEmployee, deletePromo);

export default router;
