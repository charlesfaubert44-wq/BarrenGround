import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
  googleAuth,
  googleAuthCallback
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Traditional auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
