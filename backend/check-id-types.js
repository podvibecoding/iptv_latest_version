const db = require('./config/database');

async function checkIDTypes() {
  try {
    await db.initDatabase();
    console.log('✅ Database connected\n');
    
    const [tabs] = await db.query('SELECT id, name FROM pricing_tabs ORDER BY id');
    console.log('=== TAB IDS AND TYPES ===\n');
    
    tabs.forEach(tab => {
      console.log(`Tab: "${tab.name}"`);
      console.log(`  ID value: ${tab.id}`);
      console.log(`  ID type: ${typeof tab.id}`);
      console.log(`  ID === 1: ${tab.id === 1}`);
      console.log(`  ID === '1': ${tab.id === '1'}`);
      console.log('');
    });
    
    // Test query with string vs number
    console.log('=== QUERY TESTS ===\n');
    
    console.log('Query with number 1:');
    const [test1] = await db.query('SELECT * FROM pricing_tabs WHERE id = ?', [1]);
    console.log(`  Found: ${test1.length} tabs`);
    
    console.log('\nQuery with string "1":');
    const [test2] = await db.query('SELECT * FROM pricing_tabs WHERE id = ?', ['1']);
    console.log(`  Found: ${test2.length} tabs`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIDTypes();
