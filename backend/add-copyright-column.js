const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCopyrightColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iptv_database'
  });

  try {
    console.log('Adding copyright_text column to settings table...');
    
    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'settings' 
      AND COLUMN_NAME = 'copyright_text'
    `, [process.env.DB_NAME || 'iptv_database']);

    if (columns.length > 0) {
      console.log('✓ copyright_text column already exists');
    } else {
      await connection.query(`
        ALTER TABLE settings 
        ADD COLUMN copyright_text TEXT DEFAULT '© 2025 IPTV Services. All rights reserved.'
      `);
      console.log('✓ copyright_text column added successfully');
    }

    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addCopyrightColumn();
