# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Barren Ground Coffee system, please report it responsibly:

**Email:** security@barrengroundcoffee.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

We will respond within 48 hours and work with you to address the issue.

## Security Measures

The Barren Ground Coffee system implements comprehensive security measures to protect customer data and ensure safe operations:

### 1. Environment Variable Validation

- **Mandatory validation** on startup for all critical environment variables
- **JWT_SECRET enforcement**: Must be at least 32 characters and cannot be default value
- **Automated checks** prevent deployment with insecure configurations
- Implementation: `backend/src/config/env.ts`

### 2. Rate Limiting

Protection against brute force attacks and abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 login attempts per 15 minutes
- **Password reset**: 3 attempts per hour
- **Order creation**: 10 orders per 5 minutes
- Implementation: `backend/src/middleware/rateLimiter.ts`

### 3. Role-Based Access Control (RBAC)

Three-tier authorization system:

- **Customer**: Default role, access to orders and profile
- **Employee**: Access to menu management, order processing, dashboard
- **Admin**: Full system access

All employee-only routes are protected with `requireEmployee` middleware that validates role from database on each request.

Implementation: `backend/src/middleware/roleAuth.ts`

### 4. HTTPS Enforcement

- **Production-only**: Automatic HTTP to HTTPS redirect
- **HSTS headers**: 1-year max-age with includeSubDomains and preload
- **Secure cookies**: HTTPS-only in production
- Implementation: `backend/src/middleware/httpsRedirect.ts`

### 5. Input Sanitization

- **XSS prevention**: All string inputs sanitized using xss library
- **Recursive sanitization**: Handles nested objects and arrays
- **Applied globally**: Except webhook endpoints (Stripe signature verification)
- Implementation: `backend/src/middleware/sanitize.ts`

### 6. Secure Headers (Helmet)

Comprehensive HTTP security headers:

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **HSTS**: Forces HTTPS connections
- **X-XSS-Protection**: Additional XSS protection

### 7. SQL Injection Protection

- **100% parameterized queries**: All database queries use PostgreSQL parameterized statements ($1, $2, etc.)
- **No string interpolation**: Zero instances of string concatenation in SQL queries
- **Transaction safety**: Critical operations use database transactions
- **Audit verified**: Full codebase scan completed

### 8. Authentication Security

**JWT Token Management:**
- Tokens signed with validated JWT_SECRET (minimum 32 characters)
- 7-day expiration
- Secure cookie storage:
  - `httpOnly: true` (prevents XSS access)
  - `secure: true` in production (HTTPS only)
  - `sameSite: 'strict'` (CSRF protection)

**Password Security:**
- bcrypt hashing with salt rounds of 10
- Password requirements enforced client-side
- No password storage in logs or tokens

### 9. Request Logging

Security-relevant requests are logged:
- All authentication attempts
- Admin endpoint access
- Includes: timestamp, method, path, status, duration, IP, user agent, user ID
- Implementation: `backend/src/middleware/requestLogger.ts`

### 10. CORS Configuration

Strict CORS policy:
- Only whitelisted origins (frontend and employee dashboard)
- Credentials enabled for cookie-based auth
- Configured using validated environment variables

## Security Checklist for Deployment

Before deploying to production, verify:

### Required Environment Variables

- [ ] `JWT_SECRET` is set to a strong, unique value (minimum 32 characters)
- [ ] `DATABASE_URL` points to production database with strong credentials
- [ ] `FRONTEND_URL` is set to production frontend domain (HTTPS)
- [ ] `EMPLOYEE_DASHBOARD_URL` is set to employee dashboard domain (HTTPS)
- [ ] `STRIPE_SECRET_KEY` is production key (not test key)
- [ ] `STRIPE_WEBHOOK_SECRET` is configured for production webhooks
- [ ] `NODE_ENV` is set to `production`

### Database Security

- [ ] Database uses strong passwords (minimum 16 characters, mixed case, numbers, symbols)
- [ ] Database access is restricted by IP/firewall
- [ ] Database backups are encrypted and automated
- [ ] Database connection uses SSL/TLS
- [ ] User role migration has been run (`backend/src/scripts/addUserRoles.sql`)
- [ ] At least one admin user has been created

### Application Security

- [ ] All security middleware is enabled in `server.ts`
- [ ] HTTPS is enforced (verified in production environment)
- [ ] Rate limiting is active and configured appropriately
- [ ] Security headers are set (verify with securityheaders.com)
- [ ] CORS origins are restricted to production domains only
- [ ] Error messages don't leak sensitive information
- [ ] Logging is configured and monitored

### SSL/TLS

- [ ] Valid SSL certificate installed
- [ ] Certificate auto-renewal configured
- [ ] HSTS header enabled (verify in browser)
- [ ] SSL Labs score is A or higher (ssllabs.com/ssltest)

### Monitoring

- [ ] Security logs are being collected
- [ ] Failed login attempts are monitored
- [ ] Rate limit violations are tracked
- [ ] Unusual access patterns trigger alerts

### Regular Maintenance

- [ ] Dependencies are up to date (`npm audit` shows no vulnerabilities)
- [ ] Security patches are applied promptly
- [ ] Access logs are reviewed regularly
- [ ] User roles are audited periodically

## Security Features by File

### Middleware

- `backend/src/config/env.ts` - Environment variable validation
- `backend/src/middleware/rateLimiter.ts` - Rate limiting
- `backend/src/middleware/roleAuth.ts` - Role-based authorization
- `backend/src/middleware/httpsRedirect.ts` - HTTPS enforcement
- `backend/src/middleware/sanitize.ts` - Input sanitization
- `backend/src/middleware/requestLogger.ts` - Security logging
- `backend/src/middleware/auth.ts` - JWT authentication

### Models

All models use parameterized queries:
- `backend/src/models/User.ts` - User management with bcrypt
- `backend/src/models/Order.ts` - Order processing
- `backend/src/models/MenuItem.ts` - Menu management
- And all other model files

### Routes

Employee-only routes protected:
- `backend/src/routes/menuRoutes.ts` - Menu management
- `backend/src/routes/promoRoutes.ts` - Promotion management
- `backend/src/routes/newsRoutes.ts` - News management
- `backend/src/routes/pollingRoutes.ts` - Dashboard polling
- `backend/src/routes/orderRoutes.ts` - Order management
- `backend/src/routes/schedulingRoutes.ts` - Schedule management

## Dependencies

Security-critical packages:

- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `xss` - XSS sanitization
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `express-validator` - Input validation
- `pg` - PostgreSQL client with parameterized query support

## Compliance Notes

- **PCI DSS**: Payment processing handled entirely by Stripe (no card data stored)
- **GDPR**: User data can be deleted on request (implement user deletion endpoint if needed)
- **PIPEDA**: Canadian privacy law compliance for personal data protection

## Known Limitations

1. **Session Management**: Currently using stateless JWT tokens. For enhanced security, consider implementing token refresh rotation or server-side session tracking.

2. **MFA**: Multi-factor authentication is not currently implemented. Consider adding for admin accounts.

3. **Account Lockout**: While rate limiting is in place, permanent account lockout after repeated failed attempts is not implemented.

4. **Password Reset**: Password reset functionality should be implemented with secure tokens and email verification.

5. **API Versioning**: Not currently implemented. Consider adding for production API stability.

## Future Security Enhancements

Consider implementing:

- Two-factor authentication (2FA) for employee and admin accounts
- Account lockout after repeated failed login attempts
- Password reset functionality with email verification
- API request signing for webhook validation
- Intrusion detection system (IDS)
- Web Application Firewall (WAF)
- Regular penetration testing
- Security information and event management (SIEM)
- Automated security scanning in CI/CD pipeline

## Security Update Policy

- **Critical vulnerabilities**: Patched within 24 hours
- **High severity**: Patched within 1 week
- **Medium severity**: Patched within 1 month
- **Low severity**: Patched in next regular update

## Contact

For security concerns or questions:
- Email: security@barrengroundcoffee.com
- Response time: 48 hours for security issues

---

Last updated: 2025-11-04
Security policy version: 1.0
