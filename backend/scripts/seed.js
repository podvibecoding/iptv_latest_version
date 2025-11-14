require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase, closeDatabase } = require('../config/database');

const seedAdmin = async () => {
  let db;
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Initialize database connection
    db = await initDatabase();
    
    // Check if default admin exists
    const [existingAdmins] = await db.query('SELECT * FROM admins WHERE email = ?', ['admin@site.com']);
    
    if (existingAdmins.length > 0) {
      console.log('ℹ️  Default admin already exists');
      console.log('   Email: admin@site.com');
      console.log('   You can login with existing credentials\n');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert default admin
    await db.query(
      'INSERT INTO admins (email, password, is_default_account) VALUES (?, ?, ?)',
      ['admin@site.com', hashedPassword, true]
    );
    
    console.log('✅ Default admin created successfully!\n');
    console.log('📧 Email: admin@site.com');
    console.log('🔐 Password: admin123');
    console.log('\n⚠️  Please change these credentials after first login!\n');
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    if (db) {
      await closeDatabase();
    }
  }
};

// Run seed if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin;
