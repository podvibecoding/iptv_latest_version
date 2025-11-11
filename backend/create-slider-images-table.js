const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSliderImagesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iptv_database'
  });

  try {
    console.log('Creating slider_images table...');
    
    // Check if table already exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'slider_images'
    `, [process.env.DB_NAME || 'iptv_database']);

    if (tables.length > 0) {
      console.log('✓ slider_images table already exists');
      
      // Check if section column exists
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'slider_images' 
        AND COLUMN_NAME = 'section'
      `, [process.env.DB_NAME || 'iptv_database']);

      if (columns.length === 0) {
        console.log('Adding section column...');
        await connection.query(`
          ALTER TABLE slider_images 
          ADD COLUMN section VARCHAR(50) NOT NULL DEFAULT 'hero' AFTER id,
          ADD INDEX idx_section (section)
        `);
        console.log('✓ section column added successfully');
      }
    } else {
      await connection.query(`
        CREATE TABLE slider_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          section VARCHAR(50) NOT NULL DEFAULT 'hero',
          image_url VARCHAR(255) NOT NULL,
          display_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_section (section),
          INDEX idx_display_order (display_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✓ slider_images table created successfully');
    }

    // Migrate existing slider images from settings table if any
    console.log('\nMigrating existing slider images from settings...');
    const [settings] = await connection.query('SELECT slider_image_1, slider_image_2, slider_image_3 FROM settings WHERE id = 1');
    
    if (settings.length > 0) {
      const { slider_image_1, slider_image_2, slider_image_3 } = settings[0];
      const images = [slider_image_1, slider_image_2, slider_image_3].filter(Boolean);
      
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const [existing] = await connection.query('SELECT id FROM slider_images WHERE image_url = ?', [images[i]]);
          if (existing.length === 0) {
            await connection.query(
              'INSERT INTO slider_images (image_url, display_order) VALUES (?, ?)',
              [images[i], i + 1]
            );
            console.log(`✓ Migrated slider image ${i + 1}: ${images[i]}`);
          }
        }
      } else {
        console.log('No existing slider images to migrate');
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

createSliderImagesTable();
