const { initDatabase, query } = require('./config/database');

async function checkTable() {
  await initDatabase();
  const columns = await query('DESCRIBE slider_images');
  console.log('\nSlider Images Table Structure:');
  console.log('================================');
  console.log(JSON.stringify(columns, null, 2));
  
  const count = await query('SELECT COUNT(*) as count FROM slider_images');
  console.log(`\nTotal images: ${count[0].count}\n`);
  
  process.exit(0);
}

checkTable();
