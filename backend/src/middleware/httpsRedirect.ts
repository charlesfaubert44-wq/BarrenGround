import { Request, Response, NextFunction } from 'express';

export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Skip HTTPS redirect for health checks (used by Docker/Kubernetes)
  if (req.path === '/health') {
    return next();
  }

  // Only redirect if x-forwarded-proto is explicitly 'http'
  // If the header is missing, the request is likely internal (Docker, health checks)
  // and should not be redirected
  const forwardedProto = req.header('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && forwardedProto === 'http') {
    res.redirect(`https://${req.header('host')}${req.url}`);
    return;
  }
  next();
};
