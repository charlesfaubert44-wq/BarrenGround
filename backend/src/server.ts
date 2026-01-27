/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
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
import cartRoutes from './routes/cartRoutes';
import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimiter';
import { enforceHTTPS } from './middleware/httpsRedirect';
import { sanitizeInput } from './middleware/sanitize';
import { requestLogger } from './middleware/requestLogger';
import { extractTenantContext } from './middleware/tenantContext';
import { startBirthdayBonusJob } from './jobs/birthdayBonus';
import { startOrderReminderJob } from './jobs/orderReminders';
import { createOnboardingLink } from './controllers/stripeConnectController';
import { authenticateToken } from './middleware/auth';
import pool from './config/database';

const app = express();
const httpServer = createServer(app);

// Parse allowed origins from environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [env.FRONTEND_URL, env.EMPLOYEE_DASHBOARD_URL];

// Initialize Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle authentication
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify token and join user-specific room if needed
    socket.join('authenticated');
  }

  // Join shop-specific room based on shop ID from query
  const shopId = socket.handshake.query.shopId as string;
  if (shopId) {
    socket.join(`shop:${shopId}`);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Trust proxy for reverse proxy environments (Nginx, Traefik, etc.)
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
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Request logging (disable verbose logging in production)
if (env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Compression middleware - compress all responses
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Webhook routes (before body parsing and sanitization middleware)
app.use('/webhooks', webhookRoutes);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    // Check if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Extract tenant context for ALL requests (after CORS, before routes)
app.use(extractTenantContext);

// Input sanitization (after body parsing, except webhooks)
app.use('/api', sanitizeInput);

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint with database connectivity check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
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
app.use('/api/carts', cartRoutes);
app.post('/api/stripe-connect/onboarding', authenticateToken, createOnboardingLink);

// Start scheduled jobs (run in all environments)
startBirthdayBonusJob();
startOrderReminderJob();

// Start server for both development and production
// For serverless deployment (Vercel), use the exported app directly
const PORT = env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Export for serverless environments and testing
export { app, io, httpServer };
export default app;
