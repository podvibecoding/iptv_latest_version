const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'iptv_database'
};

async function createBlogImagesTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Create blog_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        blog_id INT DEFAULT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255) DEFAULT NULL,
        caption TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        INDEX idx_blog_id (blog_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Created blog_images table');

    // Check if table exists and show structure
    const [columns] = await connection.query('DESCRIBE blog_images');
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    console.log('\n✨ Blog images table is ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createBlogImagesTable();
