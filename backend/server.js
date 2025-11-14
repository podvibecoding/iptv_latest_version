require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDatabase } = require('./config/database');
const { verifyEmailConfig } = require('./config/email');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Allow all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Length'],
  optionsSuccessStatus: 200
}));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/blog-images', require('./routes/blogImages'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/slider-images', require('./routes/sliderImages'));
app.use('/api/sections', require('./routes/sections'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    console.log('\n🚀 Starting IPTV Backend Server...\n');
    await initDatabase();

    // Verify email configuration (optional)
    await verifyEmailConfig();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   IPTV Backend Server                  ║
║   Port: ${PORT.toString().padEnd(28)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(21)}║
║   Status: Running ✓                    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  SIGTERM received. Shutting down gracefully...');
  const { closeDatabase } = require('./config/database');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⏹️  SIGINT received. Shutting down gracefully...');
  const { closeDatabase } = require('./config/database');
  await closeDatabase();
  process.exit(0);
});

startServer();
