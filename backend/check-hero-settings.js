require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkHeroSettings() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n📊 HERO_SETTINGS TABLE DATA:\n');
    
    const [rows] = await connection.query('SELECT * FROM hero_settings');
    
    if (rows.length === 0) {
      console.log('❌ No data found in hero_settings table!');
      console.log('\nTo insert default data, run:');
      console.log('INSERT INTO hero_settings (id, heading, description, focused_word) VALUES (1, "Premium IPTV Service", "Stream unlimited channels and content", "Premium");');
    } else {
      console.table(rows);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkHeroSettings();
