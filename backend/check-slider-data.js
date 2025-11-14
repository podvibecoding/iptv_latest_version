const { initDatabase, query } = require('./config/database');

async function check() {
  await initDatabase();
  const [images] = await query('SELECT * FROM slider_images LIMIT 5');
  console.log(JSON.stringify(images, null, 2));
  process.exit(0);
}

check();
