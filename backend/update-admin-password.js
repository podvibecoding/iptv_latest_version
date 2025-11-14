const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updatePassword() {
  try {
    // Create database connection
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'iptv_database'
    });

    console.log('Connected to database');

    // Generate new hash for 'admin123'
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hash);

    // Update the admin password
    const [result] = await db.query(
      'UPDATE admins SET password_hash = ? WHERE email = ?',
      [hash, 'admin@site.com']
    );

    console.log('Update result:', result);
    console.log('Rows affected:', result.affectedRows);

    // Verify the update
    const [rows] = await db.query(
      'SELECT email, password_hash FROM admins WHERE email = ?',
      ['admin@site.com']
    );

    console.log('\nVerifying stored hash:');
    console.log('Email:', rows[0].email);
    console.log('Hash length:', rows[0].password_hash.length);
    console.log('Hash:', rows[0].password_hash);

    // Test the password
    const isValid = await bcrypt.compare(password, rows[0].password_hash);
    console.log('\nPassword validation:', isValid ? '✅ SUCCESS' : '❌ FAILED');

    await db.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePassword();
