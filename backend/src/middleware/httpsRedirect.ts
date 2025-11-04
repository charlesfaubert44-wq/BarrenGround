import { Request, Response, NextFunction } from 'express';

export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
    return;
  }
  next();
};
