import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
  googleAuth,
  googleAuthCallback,
  requestPasswordReset,
  resetPassword,
  requestPasswordResetValidation,
  resetPasswordValidation
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

// Traditional auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);

// Password reset routes (with rate limiting)
router.post('/request-password-reset', passwordResetLimiter, requestPasswordResetValidation, requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
