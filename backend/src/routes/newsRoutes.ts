import { Router } from 'express';
import {
  getAllNews,
  getNewsItem,
  getActiveNews,
  createNews,
  updateNews,
  updateNewsActive,
  deleteNews,
  createNewsValidation,
  updateNewsValidation,
  updateNewsActiveValidation,
} from '../controllers/newsController';
import { authenticateToken } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Public routes - no authentication required
router.get('/active', getActiveNews);

// Protected routes - employees only
router.get('/', authenticateToken, requireEmployee, getAllNews);
router.get('/:id', authenticateToken, requireEmployee, getNewsItem);
router.post('/', authenticateToken, requireEmployee, createNewsValidation, createNews);
router.put('/:id', authenticateToken, requireEmployee, updateNewsValidation, updateNews);
router.put('/:id/active', authenticateToken, requireEmployee, updateNewsActiveValidation, updateNewsActive);
router.delete('/:id', authenticateToken, requireEmployee, deleteNews);

export default router;
