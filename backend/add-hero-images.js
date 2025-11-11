const db = require('./config/database');

// Default hero images - using the same images that appear in the hero right section
const DEFAULT_HERO_IMAGES = [
  '/images/tv-1024x636-1-1.webp',
  '/images/devices.webp'
];

async function addHeroImages() {
  try {
    console.log('🔄 Adding default hero images...\n');

    // Check existing hero images
    const [existingHero] = await db.query(
      'SELECT * FROM slider_images WHERE section = ?',
      ['hero']
    );

    console.log(`📊 Current hero images: ${existingHero.length}`);

    if (existingHero.length > 0) {
      console.log('✅ Hero section already has images. Skipping.');
      console.log('\nExisting hero images:');
      existingHero.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.image_url}`);
      });
      process.exit(0);
    }

    // Add default hero images
    let inserted = 0;
    for (let i = 0; i < DEFAULT_HERO_IMAGES.length; i++) {
      const imageUrl = DEFAULT_HERO_IMAGES[i];
      
      // Check if this specific image already exists
      const [existing] = await db.query(
        'SELECT id FROM slider_images WHERE section = ? AND image_url = ?',
        ['hero', imageUrl]
      );

      if (existing.length === 0) {
        await db.query(
          'INSERT INTO slider_images (section, image_url, display_order) VALUES (?, ?, ?)',
          ['hero', imageUrl, i + 1]
        );
        console.log(`   ✅ Added: ${imageUrl}`);
        inserted++;
      }
    }

    console.log(`\n✅ Added ${inserted} hero images`);
    
    // Show final count
    const [finalHero] = await db.query(
      'SELECT COUNT(*) as count FROM slider_images WHERE section = ?',
      ['hero']
    );
    
    console.log(`📊 Total hero images now: ${finalHero[0].count}`);
    console.log('\n💡 You can now see these images in the admin panel!');
    console.log('   Go to: http://localhost:3000/admin/dashboard → Site Settings → Hero Section Slider');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addHeroImages();
