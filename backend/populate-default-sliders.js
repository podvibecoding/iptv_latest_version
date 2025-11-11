const db = require('./config/database');

async function populateDefaultSliders() {
  try {
    console.log('🔄 Populating database with default slider images...\n');

    // Check if table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'slider_images'");
    if (tables.length === 0) {
      console.log('❌ slider_images table does not exist');
      console.log('Run: node create-slider-images-table.js first');
      process.exit(1);
    }

    // Default images for each section
    const defaultImages = {
      streaming: [
        '/images/images 1 (20).webp',
        '/images/images 1 (22).webp',
        '/images/images 1 (19).webp',
        '/images/images 1 (16).webp',
        '/images/images 1 (18).webp',
        '/images/images 1 (21).webp',
        '/images/images 1 (14).webp',
        '/images/images 1 (15).webp',
        '/images/images 1 (17).webp',
      ],
      movies: [
        '/images/images 1 (1).jpg',
        '/images/images 1 (2).jpg',
        '/images/images 1 (3).jpg',
        '/images/images 1 (4).jpg',
        '/images/images 1 (5).jpg',
        '/images/images 1 (6).jpg',
      ],
      sports: [
        '/images/images 1 (25).jpg',
        '/images/images 1 (26).jpg',
        '/images/images 1 (27).jpg',
        '/images/images 1 (28).jpg',
        '/images/images 1 (29).jpg',
        '/images/images 1 (1).jpg',
        '/images/images 1 (24).jpg',
        '/images/images 1 (23).jpg',
      ],
      channels: [
        '/Channels-Icons/1.webp',
        '/Channels-Icons/3.webp',
        '/Channels-Icons/4.webp',
        '/Channels-Icons/6.webp',
        '/Channels-Icons/11.webp',
        '/Channels-Icons/17.webp',
        '/Channels-Icons/18.webp',
        '/Channels-Icons/20.webp',
        '/Channels-Icons/26.webp',
        '/Channels-Icons/29.webp',
        '/Channels-Icons/30.webp',
        '/Channels-Icons/32.webp',
        '/Channels-Icons/33.webp',
        '/Channels-Icons/35.webp',
        '/Channels-Icons/40.webp',
        '/Channels-Icons/42.webp',
        '/Channels-Icons/43.webp',
        '/Channels-Icons/44.webp',
        '/Channels-Icons/110.webp',
        '/Channels-Icons/c22.webp',
        '/Channels-Icons/c30.webp',
        '/Channels-Icons/c31.webp',
        '/Channels-Icons/c34.webp',
        '/Channels-Icons/c36.webp',
        '/Channels-Icons/c37.webp',
      ]
    };

    let totalInserted = 0;

    // Insert images for each section
    for (const [section, images] of Object.entries(defaultImages)) {
      console.log(`📂 Processing ${section} section...`);
      
      // Check if section already has images
      const [existing] = await db.query(
        'SELECT COUNT(*) as count FROM slider_images WHERE section = ?',
        [section]
      );

      if (existing[0].count > 0) {
        console.log(`   ⚠️  ${section} already has ${existing[0].count} images - skipping`);
        continue;
      }

      // Insert images
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO slider_images (section, image_url, display_order) VALUES (?, ?, ?)',
          [section, images[i], i + 1]
        );
        totalInserted++;
      }

      console.log(`   ✅ Added ${images.length} images to ${section}`);
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`📊 Total images inserted: ${totalInserted}`);
    console.log(`\n💡 Note: hero section has no default images (admin must upload)`);
    
    // Show final counts
    const [counts] = await db.query(`
      SELECT section, COUNT(*) as count 
      FROM slider_images 
      GROUP BY section 
      ORDER BY section
    `);
    
    console.log('\n📊 Current database state:');
    counts.forEach(row => {
      console.log(`   ${row.section}: ${row.count} images`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populateDefaultSliders();
