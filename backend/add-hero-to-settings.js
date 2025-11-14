require('dotenv').config();
const mysql = require('mysql2/promise');

async function addHeroToSettings() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Adding hero fields to settings table...\n');

    // Add hero columns to settings table
    await connection.query(`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS hero_heading VARCHAR(255),
      ADD COLUMN IF NOT EXISTS hero_paragraph TEXT,
      ADD COLUMN IF NOT EXISTS supported_devices_paragraph TEXT
    `);

    console.log('✅ Hero columns added to settings table');

    // Update the first row with default hero values if empty
    await connection.query(`
      UPDATE settings 
      SET 
        hero_heading = COALESCE(hero_heading, 'Premium IPTV Service'),
        hero_paragraph = COALESCE(hero_paragraph, 'Enjoy premium TV with POD IPTV. Access a wide range of channels and exclusive content, with over 40,000 channels and more than 54,000 VOD.'),
        supported_devices_paragraph = COALESCE(supported_devices_paragraph, 'Watch your favorite content on any device, anywhere. Our IPTV service is compatible with all major platforms including Smart TVs, Android, iOS, Windows, Mac, Fire TV Stick, and more.')
      WHERE id = 1
    `);

    console.log('✅ Default values set\n');

    // Show updated settings
    const [rows] = await connection.query('SELECT id, hero_heading, hero_paragraph FROM settings WHERE id = 1');
    console.log('Current hero settings:');
    console.table(rows);

    await connection.end();
    console.log('\n✅ Done! Hero settings are now in the settings table.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addHeroToSettings();
