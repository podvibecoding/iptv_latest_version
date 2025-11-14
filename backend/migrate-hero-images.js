const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'iptv_database'
};

// Default hero image used in Hero.jsx component
const heroImages = [
  'tv-1024x636-1-1.webp'
];

async function migrateHeroImages() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Paths
    const sourceDir = path.join(__dirname, '../next-app/public/images');
    const uploadDir = path.join(__dirname, 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created uploads directory\n');
    }
    
    console.log(`📋 Found ${heroImages.length} hero image to migrate\n`);

    let copied = 0;
    let existing = 0;
    let inserted = 0;
    let alreadyInDb = 0;

    for (const imageName of heroImages) {
      const sourcePath = path.join(sourceDir, imageName);
      const destPath = path.join(uploadDir, imageName);

      // Copy image file if it doesn't exist in uploads
      if (fs.existsSync(sourcePath)) {
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Copied: ${imageName}`);
          copied++;
        } else {
          console.log(`ℹ️  Already exists: ${imageName}`);
          existing++;
        }

        // Check if image is already in database
        const imageUrl = `/uploads/${imageName}`;
        const [rows] = await connection.execute(
          'SELECT id FROM slider_images WHERE image_url = ? AND section = ?',
          [imageUrl, 'hero']
        );

        if (rows.length === 0) {
          // Insert into database
          await connection.execute(
            'INSERT INTO slider_images (section, image_url) VALUES (?, ?)',
            ['hero', imageUrl]
          );
          console.log(`   ➕ Added to database: ${imageName}`);
          inserted++;
        } else {
          console.log(`   ℹ️  Already in database: ${imageName}`);
          alreadyInDb++;
        }
      } else {
        console.log(`❌ Not found: ${imageName}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Files copied: ${copied}`);
    console.log(`   Files already existed: ${existing}`);
    console.log(`   Database records inserted: ${inserted}`);
    console.log(`   Database records already existed: ${alreadyInDb}`);
    console.log(`   Total images: ${heroImages.length}`);

    // Show current count
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM slider_images WHERE section = ?',
      ['hero']
    );
    console.log(`\n✨ Total hero images in database: ${countResult[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateHeroImages();
