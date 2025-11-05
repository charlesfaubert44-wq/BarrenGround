import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import webhookRoutes from './routes/webhookRoutes';
import pollingRoutes from './routes/pollingRoutes';
import promoRoutes from './routes/promoRoutes';
import newsRoutes from './routes/newsRoutes';
import schedulingRoutes from './routes/schedulingRoutes';
import loyaltyRoutes from './routes/loyaltyRoutes';
import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimiter';
import { enforceHTTPS } from './middleware/httpsRedirect';
import { sanitizeInput } from './middleware/sanitize';
import { requestLogger } from './middleware/requestLogger';
import { extractTenantContext } from './middleware/tenantContext';
import { startBirthdayBonusJob } from './jobs/birthdayBonus';
import { startOrderReminderJob } from './jobs/orderReminders';
import { createOnboardingLink } from './controllers/stripeConnectController';
import { authenticateToken } from './middleware/auth';

const app = express();

// Trust proxy for Vercel/serverless environments
// This is required for rate limiters to work correctly
app.set('trust proxy', true);

// HTTPS enforcement in production
if (env.NODE_ENV === 'production') {
  app.use(enforceHTTPS);
}

// Security headers with Helmet
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

// Request logging
app.use(requestLogger);

// Compression middleware - compress all responses
app.use(compression({
  level: 6, // Balance between compression ratio and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if no-transform directive is present
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression for compressible types
    return compression.filter(req, res);
  }
}));

// Webhook routes (before body parsing and sanitization middleware)
app.use('/webhooks', webhookRoutes);

// Middleware
app.use(cors({
  origin: true, // Temporarily allow all origins for testing - will fix with proper env vars
  credentials: true,
}));
app.use(express.json());

// Extract tenant context for ALL requests (after CORS, before routes)
app.use(extractTenantContext);

// Input sanitization (after body parsing, except webhooks)
app.use('/api', sanitizeInput);

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes with specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/polling', pollingRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.post('/api/stripe-connect/onboarding', authenticateToken, createOnboardingLink);

// Start scheduled jobs in non-production environments
if (env.NODE_ENV !== 'production') {
  startBirthdayBonusJob();
  startOrderReminderJob();
}

// For local development
if (env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

// Export for Vercel serverless
export default app;
