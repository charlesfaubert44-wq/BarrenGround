import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.EMPLOYEE_DASHBOARD_URL || 'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.EMPLOYEE_DASHBOARD_URL || 'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Real Barren Ground Coffee menu data
// Based on actual business from Yellowknife, NT
// "Northern roasted. Community powered."
app.get('/api/menu', (req, res) => {
  res.json([
    // Espresso Drinks
    {
      id: 1,
      name: 'Espresso',
      description: 'Single shot of our Northern roasted espresso',
      price: 3.50,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 2,
      name: 'Double Espresso',
      description: 'Two shots of rich, bold espresso',
      price: 4.50,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 3,
      name: 'Americano',
      description: 'Espresso with hot water - smooth and bold',
      price: 4.25,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 4,
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and velvety foam',
      price: 5.25,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 5,
      name: 'Latte',
      description: 'Smooth espresso with steamed milk',
      price: 5.50,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 6,
      name: 'Cortado',
      description: 'Espresso cut with equal parts steamed milk',
      price: 4.75,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 7,
      name: 'Flat White',
      description: 'Ristretto shots with microfoam milk',
      price: 5.50,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 8,
      name: 'Mocha',
      description: 'Espresso with chocolate and steamed milk',
      price: 6.00,
      category: 'coffee',
      available: true,
      created_at: new Date(),
    },

    // Drip Coffee - Real Barren Ground origins
    {
      id: 9,
      name: 'Ethiopia - Light Roast',
      description: 'Bright, floral notes - our lightest roast',
      price: 3.75,
      category: 'drip-coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 10,
      name: 'Guatemala - Medium Roast',
      description: 'Balanced with chocolate notes',
      price: 3.75,
      category: 'drip-coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 11,
      name: 'Brazil - Medium Dark',
      description: 'Smooth, nutty, and rich',
      price: 3.75,
      category: 'drip-coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 12,
      name: 'Honduras - Dark Roast',
      description: 'Bold and full-bodied',
      price: 3.75,
      category: 'drip-coffee',
      available: true,
      created_at: new Date(),
    },
    {
      id: 13,
      name: 'Indonesia - Very Dark',
      description: 'Our darkest roast - intense and smoky',
      price: 3.75,
      category: 'drip-coffee',
      available: true,
      created_at: new Date(),
    },

    // Cold Drinks
    {
      id: 14,
      name: 'Cold Brew',
      description: 'Smooth, slow-steeped for 16 hours',
      price: 5.00,
      category: 'cold-drinks',
      available: true,
      created_at: new Date(),
    },
    {
      id: 15,
      name: 'Iced Latte',
      description: 'Espresso over ice with cold milk',
      price: 5.75,
      category: 'cold-drinks',
      available: true,
      created_at: new Date(),
    },
    {
      id: 16,
      name: 'Iced Americano',
      description: 'Espresso over ice with cold water',
      price: 4.50,
      category: 'cold-drinks',
      available: true,
      created_at: new Date(),
    },
    {
      id: 17,
      name: 'Iced Mocha',
      description: 'Chocolate, espresso, and milk over ice',
      price: 6.25,
      category: 'cold-drinks',
      available: true,
      created_at: new Date(),
    },

    // Pastries & Baked Goods
    {
      id: 18,
      name: 'Butter Croissant',
      description: 'Flaky, buttery layers - made fresh daily',
      price: 4.50,
      category: 'pastries',
      available: true,
      created_at: new Date(),
    },
    {
      id: 19,
      name: 'Chocolate Croissant',
      description: 'Buttery croissant with dark chocolate',
      price: 5.00,
      category: 'pastries',
      available: true,
      created_at: new Date(),
    },
    {
      id: 20,
      name: 'House-Made Muffin',
      description: 'Daily selection - ask your barista',
      price: 4.25,
      category: 'pastries',
      available: true,
      created_at: new Date(),
    },
    {
      id: 21,
      name: 'Cinnamon Bun',
      description: 'Warm, gooey, and generously sized',
      price: 5.50,
      category: 'pastries',
      available: true,
      created_at: new Date(),
    },
    {
      id: 22,
      name: 'Scone',
      description: 'Fresh baked with local ingredients',
      price: 4.00,
      category: 'pastries',
      available: true,
      created_at: new Date(),
    },

    // Food
    {
      id: 23,
      name: 'Bagel with Cream Cheese',
      description: 'Toasted bagel with cream cheese',
      price: 4.75,
      category: 'food',
      available: true,
      created_at: new Date(),
    },
    {
      id: 24,
      name: 'Breakfast Sandwich',
      description: 'Egg, cheese, and your choice of protein',
      price: 8.50,
      category: 'food',
      available: true,
      created_at: new Date(),
    },
    {
      id: 25,
      name: 'Avocado Toast',
      description: 'Smashed avocado on fresh sourdough',
      price: 9.00,
      category: 'food',
      available: true,
      created_at: new Date(),
    },

    // Specialty & Non-Coffee
    {
      id: 26,
      name: 'Hot Chocolate',
      description: 'Rich, creamy hot chocolate',
      price: 4.50,
      category: 'specialty',
      available: true,
      created_at: new Date(),
    },
    {
      id: 27,
      name: 'Chai Latte',
      description: 'Spiced chai tea with steamed milk',
      price: 5.25,
      category: 'specialty',
      available: true,
      created_at: new Date(),
    },
    {
      id: 28,
      name: 'Matcha Latte',
      description: 'Premium Japanese matcha with steamed milk',
      price: 5.75,
      category: 'specialty',
      available: true,
      created_at: new Date(),
    },
    {
      id: 29,
      name: 'Herbal Tea',
      description: 'Selection of premium loose leaf teas',
      price: 3.50,
      category: 'specialty',
      available: true,
      created_at: new Date(),
    },
    {
      id: 30,
      name: 'London Fog',
      description: 'Earl Grey tea with vanilla and steamed milk',
      price: 5.00,
      category: 'specialty',
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

// Mock orders endpoint - GET all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Mock orders endpoint - POST create order
app.post('/api/orders', (req, res) => {
  const { customer_id, items, pickup_location, total_amount, special_instructions } = req.body;

  // Create new order
  const newOrder = {
    id: orderIdCounter++,
    customer_id,
    items,
    pickup_location,
    total_amount,
    special_instructions: special_instructions || null,
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
  };

  orders.push(newOrder);

  // Emit socket event for new order (for employee dashboard)
  const io = app.get('io');
  io.emit('newOrder', newOrder);

  res.status(201).json(newOrder);
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

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`✓ Barren Ground Coffee server running on port ${PORT}`);
  console.log('✓ Mock database mode (no PostgreSQL needed!)');
  console.log('✓ Northern roasted. Community powered.');
});
