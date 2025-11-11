require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Robust CORS to support localhost and LAN access from Next.js dev server
const isProd = (process.env.NODE_ENV || 'development') === 'production';
const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';

let corsOptions;
if (!isProd) {
  // In development, allow specific localhost ports with credentials
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  };
} else {
  const allowedOrigins = [
    defaultFrontend,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  };
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Lightweight request logger (helps diagnose CORS/preflight issues in dev)
app.use((req, res, next) => {
  logger.http(req.method, req.path);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const plansRoutes = require('./routes/plans');
const uploadRoutes = require('./routes/upload');
const faqsRoutes = require('./routes/faqs');
const accountRoutes = require('./routes/account');
const analyticsRoutes = require('./routes/analytics');
const blogsRoutes = require('./routes/blogs');
const sliderImagesRoutes = require('./routes/sliderImages');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/slider-images', sliderImagesRoutes);
app.use('/api', blogsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IPTV Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.success(`
╔════════════════════════════════════════╗
║   IPTV Backend Server                  ║
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
║   Status: Running ✓                    ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
