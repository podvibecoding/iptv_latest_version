const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iptv_database',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Reconnection settings
  connectTimeout: 10000,
  // Handle connection errors
  timezone: '+00:00'
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('📡 Attempting to reconnect to database...');
  }
});

// Test initial connection
let connectionAttempts = 0;
const maxAttempts = 3;

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🔗 Connection pool size: ${dbConfig.connectionLimit}`);
    connection.release();
    return true;
  } catch (err) {
    connectionAttempts++;
    console.error(`❌ MySQL Database connection failed (Attempt ${connectionAttempts}/${maxAttempts}):`, err.message);
    
    if (connectionAttempts < maxAttempts) {
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return testConnection();
    } else {
      console.error('❌ Failed to connect to database after maximum attempts');
      console.error('💡 Please check your database configuration in .env file');
      return false;
    }
  }
};

// Test connection on startup
testConnection();

module.exports = pool;
