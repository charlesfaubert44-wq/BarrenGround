# Security Hardening Verification Checklist

Use this checklist to verify that all security measures have been properly implemented and are functioning correctly.

## 1. Environment Variable Validation ✓

**Files:**
- `backend/src/config/env.ts`
- `backend/.env.example` (updated)

**Verification Steps:**
```bash
# Test 1: Invalid JWT_SECRET (too short)
cd backend
JWT_SECRET="short" npm start
# Expected: Error "JWT_SECRET must be at least 32 characters"

# Test 2: Default JWT_SECRET
JWT_SECRET="your-secret-key-change-in-production" npm start
# Expected: Error "JWT_SECRET must be changed from default value"

# Test 3: Missing required variable
unset DATABASE_URL && npm start
# Expected: Error "Missing required environment variables: DATABASE_URL"

# Test 4: Valid configuration
# Create .env with valid values and run
npm start
# Expected: Server starts successfully
```

## 2. Rate Limiting ✓

**Files:**
- `backend/src/middleware/rateLimiter.ts`
- Applied in `backend/src/server.ts`

**Verification Steps:**
```bash
# Test 1: Auth rate limiter (5 attempts per 15 min)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
# Expected: First 5 fail with 401, 6th returns 429 "Too many login attempts"

# Test 2: API rate limiter (100 requests per 15 min)
for i in {1..101}; do
  curl http://localhost:3000/api/menu
done
# Expected: First 100 succeed, 101st returns 429

# Test 3: Order rate limiter (10 orders per 5 min)
# Make 11 order attempts
# Expected: First 10 succeed, 11th returns 429
```

## 3. Role-Based Authorization ✓

**Files:**
- `backend/src/middleware/roleAuth.ts`
- `backend/src/scripts/addUserRoles.sql`
- Updated: `backend/src/models/User.ts`
- Applied to: menuRoutes, promoRoutes, newsRoutes, orderRoutes, pollingRoutes, schedulingRoutes

**Verification Steps:**
```bash
# Step 1: Run the migration
psql -U your_user -d barrenground -f backend/src/scripts/addUserRoles.sql

# Step 2: Create test users with different roles
psql -U your_user -d barrenground -c "UPDATE users SET role = 'customer' WHERE email = 'customer@test.com';"
psql -U your_user -d barrenground -c "UPDATE users SET role = 'employee' WHERE email = 'employee@test.com';"
psql -U your_user -d barrenground -c "UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"

# Step 3: Test customer cannot access employee endpoint
curl -X POST http://localhost:3000/api/menu \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":5}'
# Expected: 403 "Employee access required"

# Step 4: Test employee can access employee endpoint
curl -X POST http://localhost:3000/api/menu \
  -H "Authorization: Bearer <employee_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":5}'
# Expected: 201 Created

# Step 5: Test admin can access employee endpoint
curl -X POST http://localhost:3000/api/menu \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":5}'
# Expected: 201 Created
```

## 4. HTTPS Enforcement ✓

**Files:**
- `backend/src/middleware/httpsRedirect.ts`
- Applied in `backend/src/server.ts`

**Verification Steps:**
```bash
# In production environment (NODE_ENV=production)
curl -I http://your-production-site.com
# Expected: 301 or 302 redirect to https://

# Check HSTS header
curl -I https://your-production-site.com
# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# In development (NODE_ENV=development)
curl -I http://localhost:3000
# Expected: No redirect, normal response
```

## 5. Input Sanitization ✓

**Files:**
- `backend/src/middleware/sanitize.ts`
- Applied in `backend/src/server.ts`

**Verification Steps:**
```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password","name":"<script>alert(\"xss\")</script>"}'
# Expected: Script tags should be sanitized/escaped

# Test nested object sanitization
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"<img src=x onerror=alert(1)>"}]}'
# Expected: XSS payload sanitized
```

## 6. Secure Headers (Helmet) ✓

**Files:**
- `backend/src/server.ts` (helmet configuration)

**Verification Steps:**
```bash
# Check security headers
curl -I http://localhost:3000/api/menu

# Expected headers:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Strict-Transport-Security: ... (in production)

# Online verification
# Visit: https://securityheaders.com
# Enter your production URL
# Expected: Grade A or higher
```

## 7. Secure Cookies ✓

**Files:**
- `backend/src/controllers/authController.ts`

**Verification Steps:**
```bash
# Login and inspect Set-Cookie header
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -v 2>&1 | grep Set-Cookie

# Expected in development:
# Set-Cookie: token=...; HttpOnly; SameSite=Strict

# Expected in production:
# Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
```

## 8. Request Logging ✓

**Files:**
- `backend/src/middleware/requestLogger.ts`
- Applied in `backend/src/server.ts`

**Verification Steps:**
```bash
# Make auth request and check server logs
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Check server console output
# Expected: Log entry with timestamp, method, path, status, duration, IP, userAgent
```

## 9. SQL Injection Protection ✓

**Verification Steps:**
```bash
# Audit completed - verified all queries use parameterized statements
grep -r "pool.query" backend/src/models/ | head -10
# Expected: All use $1, $2 parameterized format

# No dangerous string interpolation
grep -r "\`SELECT.*\${" backend/src/
grep -r "\`INSERT.*\${" backend/src/
grep -r "\`UPDATE.*\${" backend/src/
grep -r "\`DELETE.*\${" backend/src/
# Expected: No results (all should use parameterized queries)
```

## 10. Dependencies Installed ✓

**Verification Steps:**
```bash
cd backend
npm list express-rate-limit helmet xss

# Expected output:
# ├── express-rate-limit@8.2.1
# ├── helmet@8.1.0
# └── xss@1.0.15
```

## Pre-Deployment Checklist

Before deploying to production:

### Critical Security
- [ ] JWT_SECRET is strong (32+ characters) and unique
- [ ] JWT_SECRET is NOT the default value
- [ ] DATABASE_URL uses production database with strong password
- [ ] NODE_ENV is set to "production"
- [ ] All environment variables from .env.example are set
- [ ] FRONTEND_URL uses HTTPS
- [ ] EMPLOYEE_DASHBOARD_URL uses HTTPS

### Database
- [ ] User role migration has been applied (`addUserRoles.sql`)
- [ ] At least one admin user exists
- [ ] Database uses SSL/TLS connection
- [ ] Database password is strong (16+ characters)
- [ ] Database is firewalled to allow only application server
- [ ] Database backups are automated and encrypted

### SSL/TLS
- [ ] Valid SSL certificate installed
- [ ] Certificate auto-renewal configured (Let's Encrypt recommended)
- [ ] HTTPS redirect working (test HTTP -> HTTPS)
- [ ] HSTS header present in responses
- [ ] SSL Labs test shows grade A or higher

### Application
- [ ] npm audit shows 0 vulnerabilities
- [ ] npm run build completes successfully
- [ ] Rate limiting tested and working
- [ ] Role authorization tested for all user types
- [ ] Security headers verified (securityheaders.com)
- [ ] CORS restricted to production domains only
- [ ] Error messages don't leak sensitive information

### Monitoring
- [ ] Logging is configured and working
- [ ] Failed login attempts are logged
- [ ] Rate limit violations are tracked
- [ ] Alerting configured for security events

### Documentation
- [ ] SECURITY.md reviewed by team
- [ ] Security contact information updated
- [ ] Team trained on security incident response
- [ ] Runbook created for common security scenarios

## Post-Deployment Verification

After deploying to production:

1. **Test HTTPS enforcement:**
   ```bash
   curl -I http://your-site.com
   # Should redirect to https://
   ```

2. **Test rate limiting:**
   ```bash
   # Make 6 rapid login attempts
   # Should be rate limited
   ```

3. **Test role authorization:**
   ```bash
   # Customer should not access employee endpoints
   ```

4. **Verify security headers:**
   ```bash
   curl -I https://your-site.com
   # Check for Helmet headers
   ```

5. **SSL Labs test:**
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter your domain
   - Verify grade A or higher

6. **Security Headers test:**
   - Visit: https://securityheaders.com
   - Enter your domain
   - Verify grade A or higher

## Remaining Security Enhancements (Future)

Consider implementing in future phases:

- [ ] Two-factor authentication (2FA) for employees/admins
- [ ] Token refresh rotation for enhanced session security
- [ ] Permanent account lockout after repeated failed attempts
- [ ] API request signing for webhook validation
- [ ] Web Application Firewall (WAF)
- [ ] Intrusion Detection System (IDS)
- [ ] Automated security scanning in CI/CD
- [ ] Regular penetration testing

## Security Contacts

- **Security Issues:** security@barrengroundcoffee.com
- **Response Time:** 48 hours for security issues
- **Escalation:** Contact dev team lead immediately for critical issues

---

**Last Updated:** 2025-11-04
**Next Review:** 2025-12-04 (monthly review recommended)
