# Security Hardening

**Priority:** 🔴 CRITICAL
**Phase:** 1 - Critical Fixes
**Estimated Time:** 3-4 hours
**Status:** pending

## Description
Fix critical security issues before production deployment, including environment validation, rate limiting, proper authorization, and removing hardcoded secrets.

## Current Security Issues
- JWT_SECRET hardcoded to "your-secret-key-change-in-production"
- No rate limiting on authentication endpoints
- Employee authorization checks incomplete (comment: "In a real app...")
- No environment variable validation
- No HTTPS enforcement
- Limited input sanitization

## Tasks

### 1. Environment Variable Validation
- [ ] Create `backend/src/config/env.ts`
  ```typescript
  import dotenv from 'dotenv';
  dotenv.config();

  interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    FRONTEND_URL: string;
    EMPLOYEE_DASHBOARD_URL: string;
  }

  const validateEnv = (): EnvConfig => {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'FRONTEND_URL',
      'EMPLOYEE_DASHBOARD_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT_SECRET is not default
    if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      throw new Error('JWT_SECRET must be changed from default value');
    }

    // Validate JWT_SECRET length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }

    return {
      PORT: parseInt(process.env.PORT || '5000'),
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL!,
      JWT_SECRET: process.env.JWT_SECRET!,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      FRONTEND_URL: process.env.FRONTEND_URL!,
      EMPLOYEE_DASHBOARD_URL: process.env.EMPLOYEE_DASHBOARD_URL!,
    };
  };

  export const env = validateEnv();
  ```

- [ ] Update `backend/src/server.ts` to use validated env
  ```typescript
  import { env } from './config/env';

  // Will throw error if env vars invalid
  const app = express();
  // ... rest of server setup
  ```

### 2. Implement Rate Limiting
- [ ] Install dependencies
  ```bash
  cd backend
  npm install express-rate-limit
  ```

- [ ] Create `backend/src/middleware/rateLimiter.ts`
  ```typescript
  import rateLimit from 'express-rate-limit';

  // General API rate limiter
  export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limiter for authentication
  export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful logins
  });

  // Stricter rate limiter for password reset
  export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many password reset attempts, please try again later.',
  });

  // Order creation rate limiter (prevent spam orders)
  export const orderLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 orders per 5 minutes
    message: 'Too many orders, please slow down.',
  });
  ```

- [ ] Apply rate limiters in `backend/src/server.ts`
  ```typescript
  import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimiter';

  // Apply to all API routes
  app.use('/api', apiLimiter);

  // Apply stricter limits to auth routes
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Apply to order creation
  app.use('/api/orders', orderLimiter);
  ```

### 3. Add Employee Authorization
- [ ] Add role field to users table
  ```sql
  ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer';
  -- Possible values: 'customer', 'employee', 'admin'

  CREATE INDEX idx_users_role ON users(role);
  ```

- [ ] Create `backend/src/middleware/roleAuth.ts`
  ```typescript
  import { Request, Response, NextFunction } from 'express';

  export const requireEmployee = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check role from database or token
    if (user.role !== 'employee' && user.role !== 'admin') {
      res.status(403).json({ error: 'Employee access required' });
      return;
    }

    next();
  };

  export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  };
  ```

- [ ] Apply to employee-only routes
  ```typescript
  // In menuRoutes, promoRoutes, newsRoutes, etc.
  import { requireEmployee } from '../middleware/roleAuth';

  router.post('/', requireEmployee, controller.create);
  router.put('/:id', requireEmployee, controller.update);
  router.delete('/:id', requireEmployee, controller.delete);
  ```

### 4. HTTPS Enforcement
- [ ] Create `backend/src/middleware/httpsRedirect.ts`
  ```typescript
  import { Request, Response, NextFunction } from 'express';

  export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
      return;
    }
    next();
  };
  ```

- [ ] Apply in production
  ```typescript
  if (env.NODE_ENV === 'production') {
    app.use(enforceHTTPS);
  }
  ```

### 5. Input Sanitization
- [ ] Install sanitization library
  ```bash
  npm install xss validator
  ```

- [ ] Create `backend/src/middleware/sanitize.ts`
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  import xss from 'xss';

  // Sanitize all string inputs to prevent XSS
  export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    next();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return xss(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  ```

- [ ] Apply globally (except webhook routes)
  ```typescript
  app.use('/api', sanitizeInput);
  ```

### 6. Secure Headers
- [ ] Install helmet
  ```bash
  npm install helmet
  ```

- [ ] Add to `backend/src/server.ts`
  ```typescript
  import helmet from 'helmet';

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
  ```

### 7. Secure Cookie Settings
- [ ] Update JWT cookie settings in auth controller
  ```typescript
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  ```

### 8. Add Request Logging
- [ ] Create `backend/src/middleware/requestLogger.ts`
  ```typescript
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
          userId: req.user?.id,
        });
      }
    });

    next();
  };
  ```

### 9. SQL Injection Protection Audit
- [ ] Review all database queries
- [ ] Verify using parameterized queries (pg library)
- [ ] Example of safe query:
  ```typescript
  // SAFE ✅
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // UNSAFE ❌ (don't do this)
  const result = await pool.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
  ```
- [ ] Search for string interpolation in queries: `grep -r "\`SELECT" backend/src`

### 10. Add Security Documentation
- [ ] Create `SECURITY.md` in root
  ```markdown
  # Security Policy

  ## Reporting a Vulnerability

  Please report security vulnerabilities to: security@barrengroundcoffee.com

  ## Security Measures

  - HTTPS only in production
  - Rate limiting on all endpoints
  - JWT authentication with HTTP-only cookies
  - Input sanitization and validation
  - Parameterized database queries
  - Helmet for secure headers
  - Regular dependency updates

  ## Security Checklist for Deployment

  - [ ] JWT_SECRET is strong and unique
  - [ ] Database credentials are secure
  - [ ] CORS origins are restricted
  - [ ] HTTPS is enforced
  - [ ] Environment variables are set correctly
  - [ ] Rate limiting is active
  - [ ] Error messages don't leak sensitive info
  ```

## Success Criteria
- [x] Environment variables validated on startup
- [x] JWT_SECRET cannot be default value
- [x] Rate limiting active on all endpoints
- [x] Employee authorization properly enforced
- [x] HTTPS enforced in production
- [x] Input sanitization prevents XSS
- [x] Secure headers set via Helmet
- [x] All queries use parameterized statements
- [x] Security documentation complete

## Files to Create
- `backend/src/config/env.ts`
- `backend/src/middleware/rateLimiter.ts`
- `backend/src/middleware/roleAuth.ts`
- `backend/src/middleware/httpsRedirect.ts`
- `backend/src/middleware/sanitize.ts`
- `backend/src/middleware/requestLogger.ts`
- `SECURITY.md`

## Files to Modify
- `backend/src/server.ts` (apply all middleware)
- `backend/src/routes/*.ts` (add authorization)
- `backend/src/controllers/authController.ts` (secure cookies)
- `backend/.env.example` (document requirements)

## Dependencies
- express-rate-limit
- helmet
- xss
- validator

## Notes
- Test thoroughly after implementing
- Monitor rate limiting in production (adjust limits if needed)
- Consider adding fail2ban for additional protection
- Regular security audits recommended
- Keep dependencies updated (npm audit)
