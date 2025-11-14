const { initDatabase, query } = require('./config/database');

// Fallback pricing data from frontend
const FALLBACK_PRICING = {
  '1 Device': [
    { 
      title: '1 Month', 
      price: '$10.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '3 Months', 
      price: '$24.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '6 Months', 
      price: '$39.99', 
      is_popular: true,
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '12 Months', 
      price: '$59.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
  ],
  '2 Devices': [
    { 
      title: '1 Month', 
      price: '$18.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '3 Months', 
      price: '$44.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '6 Months', 
      price: '$69.99', 
      is_popular: true,
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '12 Months', 
      price: '$109.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
  ],
  '3 Devices': [
    { 
      title: '1 Month', 
      price: '$24.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '3 Months', 
      price: '$64.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '6 Months', 
      price: '$109.99', 
      is_popular: true,
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '12 Months', 
      price: '$179.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
  ],
  '6 Devices': [
    { 
      title: '1 Month', 
      price: '$59.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '3 Months', 
      price: '$129.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '6 Months', 
      price: '$219.99', 
      is_popular: true,
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
    { 
      title: '12 Months', 
      price: '$349.99', 
      features: [
        'SD / HD / FHD / 4K Streams',
        '40,000+ Live Channels',
        '54,000+ VOD',
        'VIP & Premium Channels',
        'Anti-buffering Technology',
        '24/7 Support'
      ]
    },
  ],
};

async function migrateFallbackData() {
  try {
    await initDatabase();
    
    console.log('\n🚀 Starting fallback data migration...\n');
    
    // Get all existing tabs
    const [tabs] = await query('SELECT * FROM pricing_tabs ORDER BY name');
    
    if (tabs.length === 0) {
      console.log('❌ No pricing tabs found. Please create tabs first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${tabs.length} pricing tabs\n`);
    
    let totalPlansCreated = 0;
    
    for (const tab of tabs) {
      console.log(`📦 Processing tab: "${tab.name}"`);
      
      const fallbackPlans = FALLBACK_PRICING[tab.name];
      
      if (!fallbackPlans) {
        console.log(`   ⚠️  No fallback data for "${tab.name}", skipping...\n`);
        continue;
      }
      
      // Check if this tab already has plans
      const [existingPlans] = await query('SELECT COUNT(*) as count FROM plans WHERE tab_id = ?', [tab.id]);
      
      if (existingPlans[0].count > 0) {
        console.log(`   ⚠️  Tab already has ${existingPlans[0].count} plans, skipping...\n`);
        continue;
      }
      
      // Insert plans for this tab
      for (let i = 0; i < fallbackPlans.length; i++) {
        const plan = fallbackPlans[i];
        
        // Insert plan
        const [result] = await query(
          'INSERT INTO plans (tab_id, title, price, is_popular, display_order) VALUES (?, ?, ?, ?, ?)',
          [tab.id, plan.title, plan.price, plan.is_popular || false, i + 1]
        );
        
        const planId = result.insertId;
        
        // Insert features
        if (plan.features && plan.features.length > 0) {
          for (let j = 0; j < plan.features.length; j++) {
            await query(
              'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
              [planId, plan.features[j], j + 1]
            );
          }
        }
        
        console.log(`   ✅ Created plan: ${plan.title} - ${plan.price}${plan.is_popular ? ' (POPULAR)' : ''}`);
        totalPlansCreated++;
      }
      
      console.log('');
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total plans created: ${totalPlansCreated}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Refresh your admin dashboard`);
    console.log(`   2. You can now edit/delete these plans`);
    console.log(`   3. Frontend will now show real database data instead of fallback\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateFallbackData();
