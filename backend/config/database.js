const mysql = require('mysql2/promise');

let pool = null;
let retryCount = 0;
const maxRetries = 3;

const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iptv_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
};

const initDatabase = async () => {
  try {
    if (!pool) {
      pool = createPool();
    }

    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'iptv_database'}`);
    console.log(`🔗 Connection pool size: ${pool.pool.config.connectionLimit}`);
    
    connection.release();
    retryCount = 0;
    return pool;
  } catch (error) {
    retryCount++;
    console.error(`❌ MySQL Database connection failed (Attempt ${retryCount}/${maxRetries}):`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return initDatabase();
    } else {
      console.error('❌ Max retry attempts reached. Database connection failed.');
      throw error;
    }
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
    pool = null;
  }
};

module.exports = {
  initDatabase,
  getPool,
  closeDatabase,
  query: (...args) => getPool().query(...args)
};
