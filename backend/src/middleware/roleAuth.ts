import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';

export const requireEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // Fetch user from database to get current role
    const userId = (user as any).userId;
    const dbUser = await UserModel.findById(userId);

    if (!dbUser) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check role from database
    if (dbUser.role !== 'employee' && dbUser.role !== 'admin') {
      res.status(403).json({ error: 'Employee access required' });
      return;
    }

    // Attach role to request for downstream use
    if (req.user) {
      (req.user as any).role = dbUser.role;
    }
    next();
  } catch (error) {
    console.error('Role authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // Fetch user from database to get current role
    const userId = (user as any).userId;
    const dbUser = await UserModel.findById(userId);

    if (!dbUser) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (dbUser.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // Attach role to request for downstream use
    if (req.user) {
      (req.user as any).role = dbUser.role;
    }
    next();
  } catch (error) {
    console.error('Role authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
