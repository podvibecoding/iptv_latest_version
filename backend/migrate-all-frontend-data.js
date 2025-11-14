const { initDatabase, query } = require('./config/database');

// Data extracted from frontend components
const FRONTEND_DATA = {
  // From Stats.jsx
  stats: [
    { stat_key: 'happy_customers', stat_value: '7', stat_label: 'Happy Customers', display_order: 1 },
    { stat_key: 'channels', stat_value: '40', stat_label: 'Channels', display_order: 2 },
    { stat_key: 'sport_channels', stat_value: '15', stat_label: 'Sport Channels', display_order: 3 },
    { stat_key: 'movies_shows', stat_value: '54', stat_label: 'Movies & TV Shows', display_order: 4 }
  ],
  
  // From FAQ.jsx
  faqs: [
    {
      question: 'What is TITAN IPTV?',
      answer: 'TITAN IPTV is a premium IPTV service offering access to over 40,000 live channels and 54,000+ VOD titles from around the world. Compatible with Smart TV, Android, iOS, Windows, and more.'
    },
    {
      question: 'How do I install TITAN IPTV?',
      answer: 'Simply choose your plan, complete the payment, and you\'ll receive login credentials via email within 5-7 minutes. Then install our app or use a compatible IPTV player on your device.'
    },
    {
      question: 'What devices are supported?',
      answer: 'TITAN IPTV works on Smart TVs (Samsung, LG, Android TV), Android & iOS devices, Amazon Fire Stick, MAG boxes, Apple TV, Windows & Mac computers, and more.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 24-hour free trial so you can test our service quality before committing to a subscription. Contact us to request your trial.'
    },
    {
      question: 'What channels are included?',
      answer: 'We offer 40,000+ live channels including sports, movies, news, entertainment, kids content, and international channels from USA, UK, Canada, Europe, Asia, Middle East, and more.'
    },
    {
      question: 'Do you have VOD (Video on Demand)?',
      answer: 'Yes! We provide access to over 54,000 movies and TV shows on demand, updated regularly with the latest releases.'
    },
    {
      question: 'Will I experience buffering?',
      answer: 'Our premium servers use anti-buffering technology and adaptive streaming to ensure smooth playback. We recommend a minimum internet speed of 10 Mbps for HD and 25 Mbps for 4K.'
    },
    {
      question: 'How many devices can I use simultaneously?',
      answer: 'It depends on your plan. We offer 1, 2, 3, and 6 device plans. Choose the one that fits your household needs.'
    },
    {
      question: 'Is TITAN IPTV legal?',
      answer: 'TITAN IPTV provides streaming technology. Users are responsible for ensuring content access complies with local laws and regulations in their region.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, PayPal, cryptocurrency, and other secure payment methods. All transactions are encrypted and secure.'
    },
    {
      question: 'Can I cancel or refund my subscription?',
      answer: 'We offer a satisfaction guarantee. If you experience technical issues within the first 7 days, contact our support team for assistance or refund consideration.'
    },
    {
      question: 'Do you provide customer support?',
      answer: 'Yes! Our support team is available 24/7 via email, WhatsApp, and live chat to help with installation, troubleshooting, and any questions.'
    }
  ]
};

async function createStatsTable() {
  try {
    console.log('📊 Creating stats table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stat_key VARCHAR(50) UNIQUE NOT NULL,
        stat_value VARCHAR(20) NOT NULL,
        stat_label VARCHAR(100) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Stats table created\n');
  } catch (error) {
    console.error('❌ Error creating stats table:', error.message);
    throw error;
  }
}

async function migrateStats() {
  try {
    console.log('📊 Migrating stats data...\n');
    
    const [existing] = await query('SELECT COUNT(*) as count FROM stats');
    
    if (existing[0].count > 0) {
      console.log(`⚠️  Stats table already has ${existing[0].count} entries, skipping...\n`);
      return;
    }
    
    for (const stat of FRONTEND_DATA.stats) {
      await query(
        'INSERT INTO stats (stat_key, stat_value, stat_label, display_order) VALUES (?, ?, ?, ?)',
        [stat.stat_key, stat.stat_value, stat.stat_label, stat.display_order]
      );
      console.log(`   ✅ Created stat: ${stat.stat_label} = ${stat.stat_value}K`);
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error migrating stats:', error.message);
    throw error;
  }
}

async function migrateFAQs() {
  try {
    console.log('❓ Migrating FAQs data...\n');
    
    const [existing] = await query('SELECT COUNT(*) as count FROM faqs');
    
    if (existing[0].count > 0) {
      console.log(`⚠️  FAQs table already has ${existing[0].count} entries, skipping...\n`);
      return;
    }
    
    for (let i = 0; i < FRONTEND_DATA.faqs.length; i++) {
      const faq = FRONTEND_DATA.faqs[i];
      await query(
        'INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)',
        [faq.question, faq.answer, i + 1]
      );
      console.log(`   ✅ Created FAQ: ${faq.question.substring(0, 50)}...`);
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error migrating FAQs:', error.message);
    throw error;
  }
}

async function updateSettings() {
  try {
    console.log('⚙️  Updating default settings...\n');
    
    const [existing] = await query('SELECT * FROM settings LIMIT 1');
    
    if (!existing[0]) {
      console.log('   ℹ️  No settings row found, creating defaults...');
      await query(`
        INSERT INTO settings (
          site_title,
          site_description,
          copyright_text,
          contact_email,
          logo_text
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        'TITAN IPTV - Premium IPTV Service Provider',
        'Stream 40,000+ channels and 54,000+ VOD content worldwide. Premium IPTV service with anti-buffering technology.',
        '© 2025 TITAN IPTV. All rights reserved.',
        'support@titaniptv.com',
        'TITAN IPTV'
      ]);
      console.log('   ✅ Default settings created');
    } else {
      console.log('   ℹ️  Settings already exist, keeping current values');
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error updating settings:', error.message);
    throw error;
  }
}

async function checkHeroSettings() {
  try {
    console.log('🎬 Checking hero settings...\n');
    
    const [existing] = await query('SELECT * FROM hero_settings LIMIT 1');
    
    if (!existing[0]) {
      console.log('   ℹ️  No hero settings found, creating defaults...');
      await query(`
        INSERT INTO hero_settings (
          heading,
          paragraph
        ) VALUES (?, ?)
      `, [
        'Welcome to Premium IPTV Experience',
        'Enjoy premium TV with TITAN IPTV. Access a wide range of channels and exclusive content, with over 40,000 channels and more than 54,000 VOD.'
      ]);
      console.log('   ✅ Default hero settings created');
    } else {
      console.log('   ℹ️  Hero settings already exist');
      console.log(`   📝 Heading: ${existing[0].heading}`);
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error checking hero settings:', error.message);
    throw error;
  }
}

async function runMigration() {
  try {
    await initDatabase();
    
    console.log('\n🚀 Starting comprehensive frontend data migration...\n');
    console.log('=' .repeat(60));
    console.log('');
    
    // Create stats table
    await createStatsTable();
    
    // Migrate data
    await migrateStats();
    await migrateFAQs();
    await updateSettings();
    await checkHeroSettings();
    
    console.log('=' .repeat(60));
    console.log('\n🎉 Migration completed successfully!\n');
    
    console.log('📊 Migration Summary:');
    const [statsCount] = await query('SELECT COUNT(*) as count FROM stats');
    const [faqsCount] = await query('SELECT COUNT(*) as count FROM faqs');
    const [plansCount] = await query('SELECT COUNT(*) as count FROM plans');
    const [tabsCount] = await query('SELECT COUNT(*) as count FROM pricing_tabs');
    
    console.log(`   ✅ Stats: ${statsCount[0].count} entries`);
    console.log(`   ✅ FAQs: ${faqsCount[0].count} entries`);
    console.log(`   ✅ Pricing Plans: ${plansCount[0].count} plans`);
    console.log(`   ✅ Pricing Tabs: ${tabsCount[0].count} tabs`);
    
    console.log('\n💡 What you can now control from Admin Dashboard:');
    console.log('   📊 Statistics (Happy Customers, Channels, Sports, Movies)');
    console.log('   ❓ FAQs (Questions & Answers)');
    console.log('   💰 Pricing Plans & Tabs');
    console.log('   ⚙️  Site Settings (Logo, Title, Description, Contact)');
    console.log('   🎬 Hero Section (Heading, Paragraph)');
    console.log('   🖼️  Slider Images (Hero, Streaming, Movies, Sports, Channels)');
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Refresh your admin dashboard');
    console.log('   2. Go to each section and customize the data');
    console.log('   3. Frontend will automatically use database data');
    console.log('   4. No more hardcoded fallback content!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
