const { initDatabase, query } = require('./config/database');

const SECTIONS = [
  {
    section_key: 'streaming',
    heading: 'Streaming Services',
    description: 'Experience seamless IPTV streaming with crystal-clear quality and zero buffering.'
  },
  {
    section_key: 'movies',
    heading: 'Movies & TV Shows',
    description: 'Unlimited access to the latest movies and TV series.'
  },
  {
    section_key: 'sports',
    heading: 'Watch All Major Sport Events',
    description: 'Never miss your favorite sports events and matches.'
  },
  {
    section_key: 'pricing',
    heading: 'Choose Your IPTV Plan',
    description: 'Select the perfect plan that fits your entertainment needs.'
  },
  {
    section_key: 'features',
    heading: 'Why Customers Choosing Us?',
    description: 'Discover what makes us the best IPTV service provider.'
  },
  {
    section_key: 'channels',
    heading: 'Channels From Every Around the World',
    description: 'Access thousands of channels from across the globe.'
  },
  {
    section_key: 'faq',
    heading: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our IPTV service.'
  },
  {
    section_key: 'devices',
    heading: 'Supported Devices',
    description: 'Watch on any device - Smart TV, Android, iOS, PC, and more.'
  }
];

async function migrateSections() {
  try {
    await initDatabase();
    console.log('\n📋 Migrating Section Headings & Descriptions\n');
    console.log('='.repeat(60));

    for (const section of SECTIONS) {
      // Check if section exists
      const [existing] = await query(
        'SELECT * FROM sections WHERE section_key = ?',
        [section.section_key]
      );

      if (existing.length > 0) {
        // Update existing section
        await query(
          'UPDATE sections SET heading = ?, description = ? WHERE section_key = ?',
          [section.heading, section.description, section.section_key]
        );
        console.log(`   ✅ Updated: ${section.section_key}`);
      } else {
        // Insert new section
        await query(
          'INSERT INTO sections (section_key, heading, description) VALUES (?, ?, ?)',
          [section.section_key, section.heading, section.description]
        );
        console.log(`   ✅ Created: ${section.section_key}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Total sections: ${SECTIONS.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateSections();
