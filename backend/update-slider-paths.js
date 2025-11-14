const { initDatabase, query } = require('./config/database');

async function updatePaths() {
  await initDatabase();
  
  console.log('\n🔄 Updating slider image paths...\n');
  
  // Update all paths from /images/ to /uploads/
  await query("UPDATE slider_images SET image_url = REPLACE(image_url, '/images/', '/uploads/')");
  
  // Show results
  const images = await query('SELECT id, section, image_url FROM slider_images ORDER BY section, display_order');
  
  console.log('Updated image paths:');
  console.log('='.repeat(80));
  
  let currentSection = '';
  images.forEach(img => {
    if (img.section && img.section !== currentSection) {
      currentSection = img.section;
      console.log(`\n${currentSection.toUpperCase()}:`);
    }
    console.log(`  ✅ ${img.image_url}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✨ Total: ${images.length} images updated\n`);
  
  process.exit(0);
}

updatePaths().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
