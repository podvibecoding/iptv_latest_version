const { initDatabase, query } = require('./config/database');
const path = require('path');

// Extract hardcoded images from components
const SPORTS_IMAGES = [
  { section: 'sports', title: 'Sport 1', filename: 'images 1 (25).jpg' },
  { section: 'sports', title: 'Sport 2', filename: 'images 1 (26).jpg' },
  { section: 'sports', title: 'Sport 3', filename: 'images 1 (27).jpg' },
  { section: 'sports', title: 'Sport 4', filename: 'images 1 (28).jpg' },
  { section: 'sports', title: 'Sport 5', filename: 'images 1 (29).jpg' },
  { section: 'sports', title: 'Sport 6', filename: 'images 1 (1).jpg' },
  { section: 'sports', title: 'Sport 8', filename: 'images 1 (24).jpg' },
  { section: 'sports', title: 'Sport 9', filename: 'images 1 (23).jpg' },
  { section: 'sports', title: 'Sport 11', filename: 'images 1 (25).jpg' },
  { section: 'sports', title: 'Sport 12', filename: 'images 1 (26).jpg' },
  { section: 'sports', title: 'Sport 13', filename: 'images 1 (27).jpg' },
  { section: 'sports', title: 'Sport 14', filename: 'images 1 (28).jpg' },
  { section: 'sports', title: 'Sport 15', filename: 'images 1 (29).jpg' },
  { section: 'sports', title: 'Sport 16', filename: 'images 1 (1).jpg' },
  { section: 'sports', title: 'Sport 17', filename: 'images 1 (23).jpg' },
  { section: 'sports', title: 'Sport 18', filename: 'images 1 (24).jpg' }
];

const MOVIES_IMAGES = [
  { section: 'movies', title: 'Movie 1', filename: 'images 1 (1).jpg' },
  { section: 'movies', title: 'Movie 2', filename: 'images 1 (2).jpg' },
  { section: 'movies', title: 'Movie 3', filename: 'images 1 (3).jpg' },
  { section: 'movies', title: 'Movie 4', filename: 'images 1 (4).jpg' },
  { section: 'movies', title: 'Movie 5', filename: 'images 1 (5).jpg' },
  { section: 'movies', title: 'Movie 6', filename: 'images 1 (6).jpg' }
];

async function migrateSliderImages() {
  try {
    await initDatabase();
    console.log('\n🎬 Migrating Slider Images to Database\n');
    console.log('=' .repeat(50));

    // Check existing images
    const existing = await query('SELECT COUNT(*) as count FROM slider_images');
    
    if (existing[0].count > 0) {
      console.log(`\n⚠️  Found ${existing[0].count} existing slider images in database`);
      console.log('Skipping migration to avoid duplicates.');
      console.log('\nTo force migration, run: DELETE FROM slider_images;');
      process.exit(0);
    }

    // Combine all images
    const ALL_IMAGES = [...SPORTS_IMAGES, ...MOVIES_IMAGES];
    
    let imported = 0;
    
    for (const img of ALL_IMAGES) {
      const imageUrl = `/images/${img.filename}`;
      
      await query(
        'INSERT INTO slider_images (section, image_url, display_order) VALUES (?, ?, ?)',
        [img.section, imageUrl, imported + 1]
      );
      
      console.log(`   ✅ ${img.section.toUpperCase()}: ${img.title} → ${imageUrl}`);
      imported++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n🎉 Migration Summary:`);
    console.log(`   ✅ Sports Images: ${SPORTS_IMAGES.length}`);
    console.log(`   ✅ Movies Images: ${MOVIES_IMAGES.length}`);
    console.log(`   📊 Total Imported: ${imported}`);
    console.log('\n✨ All slider images migrated successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateSliderImages();
