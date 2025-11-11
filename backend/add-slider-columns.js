const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSliderColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iptv_database'
  });

  try {
    console.log('Adding slider image columns to settings table...');
    
    const columns = ['slider_image_1', 'slider_image_2', 'slider_image_3'];
    
    for (const column of columns) {
      // Check if column already exists
      const [existing] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'settings' 
        AND COLUMN_NAME = ?
      `, [process.env.DB_NAME || 'iptv_database', column]);

      if (existing.length > 0) {
        console.log(`✓ ${column} column already exists`);
      } else {
        await connection.query(`
          ALTER TABLE settings 
          ADD COLUMN ${column} VARCHAR(255) DEFAULT NULL
        `);
        console.log(`✓ ${column} column added successfully`);
      }
    }

    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addSliderColumns();
