import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { EmailService } from '../services/emailService';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
];

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, phone } = req.body;

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Check if user exists in THIS shop
    const existingUser = await UserModel.findByEmail(email, req.shop.id);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const user = await UserModel.create({
      email,
      password,
      name,
      phone,
      shop_id: req.shop.id // Add shop_id
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      shopId: req.shop.id // Add to JWT
    });

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Find user in THIS shop only
    const user = await UserModel.findByEmail(email, req.shop.id);
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: req.shop.id // Add to JWT
    });

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user belongs to current shop
    const user = await UserModel.findById(req.user.userId, req.shop?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Google OAuth handlers
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user: Express.User | false, _info?: unknown) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    if (!req.shop) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=shop_context_missing`);
    }

    // Generate JWT token - user is guaranteed to have id and email here
    const token = generateToken({
      userId: user.id,
      email: user.email,
      shopId: req.shop.id // Add to JWT
    });

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// Password reset validation
export const requestPasswordResetValidation = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
];

/**
 * Request password reset - sends reset email
 */
export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    const user = await UserModel.findByEmail(email, req.shop.id);

    // Don't reveal if user exists for security reasons
    if (!user) {
      res.json({ message: 'If that email is registered, a reset link has been sent' });
      return;
    }

    // Don't allow password reset for OAuth-only users
    if (!user.password_hash) {
      res.json({ message: 'If that email is registered, a reset link has been sent' });
      return;
    }

    // Generate reset token (JWT with 1 hour expiry)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset', shopId: req.shop.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    try {
      await EmailService.sendPasswordReset(user, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Still return success message to avoid revealing if email exists
    }

    res.json({ message: 'If that email is registered, a reset link has been sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Reset password using token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token, newPassword } = req.body;

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      );
    } catch (error) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Check token type
    if (decoded.type !== 'password-reset') {
      res.status(400).json({ error: 'Invalid token type' });
      return;
    }

    // Update password
    const success = await UserModel.updatePassword(decoded.userId, newPassword);

    if (!success) {
      res.status(400).json({ error: 'Failed to reset password' });
      return;
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
