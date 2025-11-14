const mysql = require('mysql2/promise');

async function updateBlogsTable() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'iptv_database'
    });

    console.log('Connected to database');

    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'blogs'");
    
    if (tables.length === 0) {
      console.log('Creating blogs table...');
      await db.query(`
        CREATE TABLE blogs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content LONGTEXT NOT NULL,
          excerpt TEXT,
          featured_image VARCHAR(255),
          author VARCHAR(100) DEFAULT 'Admin',
          status VARCHAR(20) DEFAULT 'draft',
          published BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_slug (slug),
          INDEX idx_status (status),
          INDEX idx_published (published)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Blogs table created successfully');
    } else {
      console.log('Blogs table exists, checking for missing columns...');
      
      // Get existing columns
      const [columns] = await db.query('SHOW COLUMNS FROM blogs');
      const columnNames = columns.map(col => col.Field);
      
      // Add missing columns
      if (!columnNames.includes('excerpt')) {
        console.log('Adding excerpt column...');
        await db.query('ALTER TABLE blogs ADD COLUMN excerpt TEXT AFTER content');
        console.log('✅ Added excerpt column');
      }
      
      if (!columnNames.includes('author')) {
        console.log('Adding author column...');
        await db.query("ALTER TABLE blogs ADD COLUMN author VARCHAR(100) DEFAULT 'Admin' AFTER featured_image");
        console.log('✅ Added author column');
      }
      
      if (!columnNames.includes('status')) {
        console.log('Adding status column...');
        await db.query("ALTER TABLE blogs ADD COLUMN status VARCHAR(20) DEFAULT 'draft' AFTER author");
        console.log('✅ Added status column');
      }
      
      console.log('✅ All required columns present');
    }

    // Show final structure
    const [finalColumns] = await db.query('SHOW COLUMNS FROM blogs');
    console.log('\nFinal table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    await db.end();
    console.log('\n✅ Database update complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateBlogsTable();
