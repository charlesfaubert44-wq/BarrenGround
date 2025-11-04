import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Development CORS config - allows localhost and local network access
const isDevelopment = process.env.NODE_ENV === 'development';
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (like mobile apps or curl)
  if (!origin) return callback(null, true);

  // In development, allow localhost and local network IPs
  if (isDevelopment) {
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/172\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    ];

    if (allowedPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
  }

  callback(new Error('Not allowed by CORS'));
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Demo menu items - Beautiful and interactive
app.get('/api/menu', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Latte',
      description: 'Smooth espresso with perfectly steamed milk',
      price: 4.50,
      category: 'coffee',
      image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&h=600&fit=crop',
      available: true,
      created_at: new Date(),
    },
    {
      id: 2,
      name: 'Cappuccino',
      description: 'Rich espresso topped with velvety foam',
      price: 4.25,
      category: 'coffee',
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
      available: true,
      created_at: new Date(),
    },
    {
      id: 3,
      name: 'Cold Brew',
      description: 'Smooth, slow-steeped for 16 hours',
      price: 5.00,
      category: 'cold-drinks',
      image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop',
      available: true,
      created_at: new Date(),
    },
    {
      id: 4,
      name: 'Croissant',
      description: 'Flaky, buttery layers baked fresh daily',
      price: 3.50,
      category: 'pastries',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
      available: true,
      created_at: new Date(),
    },
    {
      id: 5,
      name: 'Breakfast Sandwich',
      description: 'Egg, cheese, and bacon on toasted English muffin',
      price: 6.50,
      category: 'food',
      image_url: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&h=600&fit=crop',
      available: true,
      created_at: new Date(),
    },
  ]);
});

// In-memory storage for orders
let orders: any[] = [];
let orderIdCounter = 1;

// In-memory storage for users (mock authentication)
let users: any[] = [
  {
    id: 1,
    email: 'admin@test.com',
    password: 'admin123', // In production, this would be hashed
    name: 'Admin User',
    phone: '867-873-3030',
  }
];
let userIdCounter = 2;

// In-memory storage for memberships
let membershipPlans = [
  {
    id: 1,
    name: '1 Coffee a Day',
    description: 'Enjoy one delicious coffee every day for just $25/week',
    price: 25.00,
    interval: 'week',
    coffees_per_interval: 7,
    active: true,
  }
];

let userMemberships: any[] = [];
let membershipIdCounter = 1;

let membershipUsage: any[] = [];
let usageIdCounter = 1;

// In-memory storage for active carts
let activeCarts: Map<string, any> = new Map();
const CART_TIMEOUT = 10 * 60 * 1000; // 10 minutes of inactivity
const COMPLETED_ORDER_TIMEOUT = 60 * 60 * 1000; // 1 hour

// Clean up inactive carts periodically
setInterval(() => {
  const now = Date.now();
  const cartsToDelete: string[] = [];

  activeCarts.forEach((cart, sessionId) => {
    if (now - cart.lastUpdated > CART_TIMEOUT) {
      cartsToDelete.push(sessionId);
    }
  });

  cartsToDelete.forEach(sessionId => {
    activeCarts.delete(sessionId);
    const io = app.get('io');
    if (io) {
      io.emit('cart_removed', { sessionId });
    }
  });

  if (cartsToDelete.length > 0) {
    console.log(`✓ Cleaned up ${cartsToDelete.length} inactive cart(s)`);
  }
}, 60 * 1000); // Check every minute

// Clean up old completed orders periodically
setInterval(() => {
  const now = Date.now();
  const initialOrderCount = orders.length;

  // Keep only orders that aren't completed/cancelled, or were completed/cancelled less than 1 hour ago
  orders = orders.filter(order => {
    if (order.status === 'completed' && order.completed_at) {
      const timeSinceCompletion = now - new Date(order.completed_at).getTime();
      return timeSinceCompletion < COMPLETED_ORDER_TIMEOUT;
    }
    if (order.status === 'cancelled' && order.cancelled_at) {
      const timeSinceCancellation = now - new Date(order.cancelled_at).getTime();
      return timeSinceCancellation < COMPLETED_ORDER_TIMEOUT;
    }
    return true; // Keep all other orders (received, preparing, ready)
  });

  const removedCount = initialOrderCount - orders.length;
  if (removedCount > 0) {
    console.log(`✓ Archived ${removedCount} old completed/cancelled order(s)`);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Cart tracking endpoints
app.post('/api/carts/update', (req, res) => {
  const { sessionId, items, total } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const cartData = {
    sessionId,
    items,
    total,
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    lastUpdated: Date.now(),
    createdAt: activeCarts.has(sessionId) ? activeCarts.get(sessionId).createdAt : Date.now(),
  };

  activeCarts.set(sessionId, cartData);

  // Emit to all connected clients (employee dashboards)
  const io = app.get('io');
  if (io) {
    io.emit('cart_updated', cartData);
  }

  res.json({ success: true });
});

app.delete('/api/carts/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (activeCarts.has(sessionId)) {
    activeCarts.delete(sessionId);

    const io = app.get('io');
    if (io) {
      io.emit('cart_removed', { sessionId });
    }
  }

  res.json({ success: true });
});

app.get('/api/carts/active', (req, res) => {
  const carts = Array.from(activeCarts.values());
  res.json(carts);
});

// Mock orders endpoint - GET all orders (with optional status filter)
app.get('/api/orders', (req, res) => {
  const { status } = req.query;

  if (status) {
    const statuses = (status as string).split(',');
    const filteredOrders = orders.filter(o => statuses.includes(o.status));
    return res.json(filteredOrders);
  }

  res.json(orders);
});

// Mock orders endpoint - POST create order
app.post('/api/orders', (req, res) => {
  const { items, total, pickupTime, guestInfo, userId } = req.body;

  // Generate a simple tracking token
  const trackingToken = `BG${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Determine customer info
  const customerName = guestInfo?.name || users.find(u => u.id === userId)?.name || 'Guest';
  const customerEmail = guestInfo?.email || users.find(u => u.id === userId)?.email || '';
  const customerPhone = guestInfo?.phone || users.find(u => u.id === userId)?.phone || '';

  // Create new order
  const newOrder = {
    id: orderIdCounter++,
    trackingToken,
    customer_id: userId || null,
    customer_name: customerName,
    customerEmail,
    customerPhone,
    items,
    total: total,
    pickup_time: pickupTime,
    status: 'received',
    received_at: new Date(),
    preparing_at: null,
    ready_at: null,
    completed_at: null,
    cancelled_at: null,
    cannot_complete_reason: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  orders.push(newOrder);

  // Emit socket event for new order (for employee dashboard)
  const io = app.get('io');
  io.emit('new_order', newOrder);

  console.log(`✓ New order created: #${newOrder.id} - ${customerName} - $${total.toFixed(2)}`);

  res.status(201).json(newOrder);
});

// Mock orders endpoint - PUT update order status
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status, reason } = req.body;

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const previousStatus = order.status;

  // Update order status
  order.status = status;
  order.updated_at = new Date();

  // Track timestamps for each status change
  if (status === 'preparing' && !order.preparing_at) {
    order.preparing_at = new Date();
  } else if (status === 'ready' && !order.ready_at) {
    order.ready_at = new Date();
  } else if (status === 'completed' && !order.completed_at) {
    order.completed_at = new Date();
  } else if (status === 'cancelled') {
    order.cancelled_at = new Date();
    order.cannot_complete_reason = reason || 'Cancelled by staff';
  }

  // Emit socket event for order update
  const io = app.get('io');
  io.emit('order_updated', order);

  console.log(`✓ Order #${orderId} status: ${previousStatus} → ${status}`);

  res.json(order);
});

// Mock orders endpoint - GET single order by ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// Mock orders endpoint - GET order by tracking token
app.get('/api/orders/track/:token', (req, res) => {
  const { token } = req.params;
  const order = orders.find(o => o.trackingToken === token);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// Update customer status by tracking token
app.put('/api/orders/track/:trackingToken/customer-status', (req, res) => {
  const { trackingToken } = req.params;
  const { customerStatus } = req.body;

  const order = orders.find(o => o.trackingToken === trackingToken);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (!['on-my-way', 'delayed', 'wont-make-it'].includes(customerStatus)) {
    return res.status(400).json({ error: 'Invalid customer status' });
  }

  // Update customer status
  order.customer_status = customerStatus;
  order.customer_status_updated_at = new Date();

  console.log(`✓ Customer status updated for order #${order.id}: ${customerStatus}`);

  // Broadcast to WebSocket clients
  io.emit('customer_status_updated', order);

  res.json(order);
});

// Comprehensive analytics endpoint
app.get('/api/analytics/stats', (req, res) => {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Filter today's orders
  const todayOrders = orders.filter(o => {
    const createdAt = new Date(o.created_at);
    return createdAt >= today && createdAt < tomorrow;
  });

  // Calculate today's stats
  const todayStats = {
    orders: todayOrders.length,
    revenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: todayOrders.length > 0 ? todayOrders.reduce((sum, o) => sum + o.total, 0) / todayOrders.length : 0,
  };

  // Peak hours analysis (last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent24HOrders = orders.filter(o => new Date(o.created_at) >= last24Hours);
  const hourlyData = new Array(24).fill(0);
  recent24HOrders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourlyData[hour]++;
  });
  const peakHours = hourlyData
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Popular items (all time)
  const itemCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const itemName = item.name;
      itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
    });
  });
  const popularItems = Object.entries(itemCounts)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Status distribution (active orders only - not completed/cancelled)
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const statusDistribution = {
    received: activeOrders.filter(o => o.status === 'received').length,
    preparing: activeOrders.filter(o => o.status === 'preparing').length,
    ready: activeOrders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Revenue trend (last 7 days)
  const revenueTrend: { date: string, revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(o => {
      const createdAt = new Date(o.created_at);
      return createdAt >= date && createdAt < nextDate;
    });

    const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
    revenueTrend.push({
      date: date.toISOString().split('T')[0],
      revenue,
    });
  }

  // Average preparation time (completed orders only)
  const completedOrders = orders.filter(o => o.status === 'completed' && o.received_at && o.completed_at);
  const avgPrepTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, o) => {
        const prepTime = (new Date(o.completed_at).getTime() - new Date(o.received_at).getTime()) / 1000 / 60; // minutes
        return sum + prepTime;
      }, 0) / completedOrders.length
    : 0;

  // Completion rate
  const totalOrders = orders.length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const completionRate = totalOrders > 0 ? (completed / totalOrders) * 100 : 0;

  res.json({
    today: todayStats,
    peakHours,
    popularItems,
    statusDistribution,
    revenueTrend,
    avgPrepTime: Math.round(avgPrepTime * 10) / 10, // Round to 1 decimal
    completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
  });
});

// Mock authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create new user
  const newUser = {
    id: userIdCounter++,
    email,
    password, // In production, this would be hashed
    name,
    phone: phone || null,
  };

  users.push(newUser);

  // Generate mock token
  const token = `mock_token_${newUser.id}_${Date.now()}`;

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password (simple comparison in mock mode)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate mock token
  const token = `mock_token_${user.id}_${Date.now()}`;

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
  });
});

// Mock membership endpoints
app.get('/api/membership/plans', (req, res) => {
  res.json({ plans: membershipPlans });
});

app.get('/api/membership/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract user ID from token
  const userId = parseInt(authHeader.split('_')[2]);
  const membership = userMemberships.find(m => m.user_id === userId && m.status === 'active');

  if (!membership) {
    return res.json({ membership: null });
  }

  // Get usage history
  const usageHistory = membershipUsage
    .filter(u => u.user_membership_id === membership.id)
    .sort((a: any, b: any) => b.redeemed_at.getTime() - a.redeemed_at.getTime())
    .slice(0, 10);

  // Check today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayUsageCount = membershipUsage.filter(
    u => u.user_membership_id === membership.id &&
    u.redeemed_at >= today &&
    u.redeemed_at < tomorrow
  ).length;

  const plan = membershipPlans.find(p => p.id === membership.plan_id);

  res.json({
    membership: {
      ...membership,
      plan,
      usageHistory,
      todayUsageCount,
      canRedeemToday: todayUsageCount === 0 && membership.coffees_remaining > 0,
    }
  });
});

app.post('/api/membership/subscribe', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract user ID from token
  const userId = parseInt(authHeader.split('_')[2]);
  const { planId } = req.body;

  // Check if user already has an active membership
  const existingMembership = userMemberships.find(m => m.user_id === userId && m.status === 'active');
  if (existingMembership) {
    return res.status(400).json({ error: 'You already have an active membership' });
  }

  const plan = membershipPlans.find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Membership plan not found' });
  }

  // Calculate period dates (1 week from now)
  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7);

  const newMembership = {
    id: membershipIdCounter++,
    user_id: userId,
    plan_id: planId,
    status: 'active',
    stripe_subscription_id: `mock_sub_${Date.now()}`,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    coffees_remaining: plan.coffees_per_interval,
    cancel_at_period_end: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  userMemberships.push(newMembership);

  console.log(`✓ New membership created for user #${userId} - ${plan.name}`);

  res.status(201).json({
    membership: newMembership,
    clientSecret: 'mock_client_secret_' + Date.now(),
  });
});

app.post('/api/membership/cancel', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract user ID from token
  const userId = parseInt(authHeader.split('_')[2]);
  const membership = userMemberships.find(m => m.user_id === userId && m.status === 'active');

  if (!membership) {
    return res.status(404).json({ error: 'No active membership found' });
  }

  membership.cancel_at_period_end = true;
  membership.updated_at = new Date();

  console.log(`✓ Membership #${membership.id} marked for cancellation at period end`);

  res.json({
    message: 'Subscription will be cancelled at the end of the current period',
    membership,
  });
});

app.post('/api/membership/redeem', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract user ID from token
  const userId = parseInt(authHeader.split('_')[2]);
  const { coffeeName } = req.body;

  const membership = userMemberships.find(m => m.user_id === userId && m.status === 'active');

  if (!membership) {
    return res.status(404).json({ error: 'No active membership found' });
  }

  // Check if user already redeemed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayUsageCount = membershipUsage.filter(
    u => u.user_membership_id === membership.id &&
    u.redeemed_at >= today &&
    u.redeemed_at < tomorrow
  ).length;

  if (todayUsageCount > 0) {
    return res.status(400).json({ error: 'You have already redeemed your daily coffee' });
  }

  if (membership.coffees_remaining <= 0) {
    return res.status(400).json({ error: 'No coffees remaining in current period' });
  }

  // Decrement coffees
  membership.coffees_remaining--;
  membership.updated_at = new Date();

  // Record usage
  const usage = {
    id: usageIdCounter++,
    user_membership_id: membership.id,
    redeemed_at: new Date(),
    coffee_name: coffeeName,
  };
  membershipUsage.push(usage);

  console.log(`✓ Membership coffee redeemed by user #${userId} - ${coffeeName}`);

  res.json({
    message: 'Coffee redeemed successfully',
    coffeesRemaining: membership.coffees_remaining,
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

httpServer.listen(PORT, HOST, () => {
  console.log(`✓ Barren Ground Coffee server running on ${HOST}:${PORT}`);
  console.log('✓ Mock database mode (no PostgreSQL needed!)');
  console.log('✓ Northern roasted. Community powered.');
  console.log(`✓ Network access enabled - accessible at http://<your-ip>:${PORT}`);
});
