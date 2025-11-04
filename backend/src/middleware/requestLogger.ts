import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log security-relevant requests
    if (req.path.includes('/auth') || req.path.includes('/admin')) {
      console.log({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: (req.user as any)?.userId,
      });
    }
  });

  next();
};
