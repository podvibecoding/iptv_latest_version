const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all pricing tabs with plans and features (public)
router.get('/', async (req, res) => {
  try {
    // Get all tabs
    const [tabs] = await db.query('SELECT * FROM pricing_tabs ORDER BY display_order ASC, id ASC');

    // Get all plans with features
    for (const tab of tabs) {
      const [plans] = await db.query(
        'SELECT * FROM plans WHERE tab_id = ? ORDER BY display_order ASC, id ASC',
        [tab.id]
      );

      for (const plan of plans) {
        const [features] = await db.query(
          'SELECT feature_text FROM plan_features WHERE plan_id = ? ORDER BY display_order ASC, id ASC',
          [plan.id]
        );
        plan.features = features.map(f => f.feature_text);
      }

      tab.plans = plans;
    }

    res.json({ success: true, tabs });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create pricing tab (protected)
router.post('/tabs', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Tab name is required' });
    }

    // Get max order
    const [rows] = await db.query('SELECT MAX(display_order) as max_order FROM pricing_tabs');
    const nextOrder = (rows[0].max_order || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO pricing_tabs (name, display_order) VALUES (?, ?)',
      [name, nextOrder]
    );

    res.json({ success: true, id: result.insertId, message: 'Pricing tab created successfully' });
  } catch (error) {
    console.error('Create pricing tab error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update pricing tab (protected)
router.put('/tabs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await db.query('UPDATE pricing_tabs SET name = ? WHERE id = ?', [name, id]);
    res.json({ success: true, message: 'Pricing tab updated successfully' });
  } catch (error) {
    console.error('Update pricing tab error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete pricing tab (protected)
router.delete('/tabs/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  console.log('\n' + '='.repeat(70));
  console.log('🗑️  DELETE REQUEST RECEIVED');
  console.log('='.repeat(70));
  console.log('Request params:', req.params);
  console.log('Tab ID:', id, '(type:', typeof id, ')');
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  
  try {
    // Check if tab exists first
    console.log(`\nQuerying database for tab ID: ${id}`);
    const [existing] = await db.query('SELECT * FROM pricing_tabs WHERE id = ?', [id]);
    console.log(`Query result: Found ${existing.length} tab(s)`);
    
    if (existing.length === 0) {
      console.log(`❌ Tab ID ${id} NOT FOUND in database`);
      console.log('Available tab IDs in database:');
      const [allTabs] = await db.query('SELECT id, name FROM pricing_tabs');
      allTabs.forEach(t => console.log(`  - ID ${t.id}: "${t.name}"`));
      console.log('='.repeat(70) + '\n');
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }
    
    console.log(`✅ Tab found: ID ${existing[0].id}, Name: "${existing[0].name}"`);
    
    // Check for associated plans
    const [plans] = await db.query('SELECT COUNT(*) as count FROM plans WHERE tab_id = ?', [id]);
    console.log(`Associated plans: ${plans[0].count}`);
    
    // Delete the tab (cascade will delete related plans and features)
    console.log(`\nExecuting DELETE query...`);
    const [result] = await db.query('DELETE FROM pricing_tabs WHERE id = ?', [id]);
    console.log(`Delete result - Affected rows: ${result.affectedRows}`);
    
    // Verify deletion
    const [check] = await db.query('SELECT * FROM pricing_tabs WHERE id = ?', [id]);
    
    if (check.length > 0) {
      console.log(`❌ WARNING: Tab still exists after delete attempt!`);
      console.log('='.repeat(70) + '\n');
      return res.status(500).json({ success: false, error: 'Failed to delete tab' });
    }
    
    console.log(`✅ SUCCESS: Tab ID ${id} deleted from database`);
    console.log('='.repeat(70) + '\n');
    res.json({ success: true, message: 'Pricing tab deleted successfully' });
    
  } catch (error) {
    console.error('❌ ERROR during delete:', error.message);
    console.error(error);
    console.log('='.repeat(70) + '\n');
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// Create plan (protected)
router.post('/plans', authMiddleware, async (req, res) => {
  try {
    const { tab_id, title, price, is_popular, use_whatsapp, checkout_link, features } = req.body;

    if (!tab_id || !title || !price) {
      return res.status(400).json({ success: false, error: 'Tab ID, title, and price are required' });
    }

    // Get max order
    const [rows] = await db.query('SELECT MAX(display_order) as max_order FROM plans WHERE tab_id = ?', [tab_id]);
    const nextOrder = (rows[0].max_order || 0) + 1;

    // If is_popular is true, unmark other popular plans in this tab
    if (is_popular) {
      await db.query('UPDATE plans SET is_popular = FALSE WHERE tab_id = ?', [tab_id]);
    }

    const [result] = await db.query(
      'INSERT INTO plans (tab_id, title, price, is_popular, use_whatsapp, checkout_link, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tab_id, title, price, is_popular || false, use_whatsapp || false, checkout_link || null, nextOrder]
    );

    const planId = result.insertId;

    // Add features
    if (features && Array.isArray(features)) {
      for (let i = 0; i < features.length; i++) {
        await db.query(
          'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
          [planId, features[i], i]
        );
      }
    }

    res.json({ success: true, id: planId, message: 'Plan created successfully' });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update plan (protected)
router.put('/plans/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, is_popular, use_whatsapp, checkout_link, features } = req.body;

    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      values.push(title);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      values.push(price);
    }
    if (is_popular !== undefined) {
      updateFields.push('is_popular = ?');
      values.push(is_popular ? 1 : 0);

      // If marking as popular, unmark others in the same tab
      if (is_popular) {
        const [plan] = await db.query('SELECT tab_id FROM plans WHERE id = ?', [id]);
        if (plan.length > 0) {
          await db.query('UPDATE plans SET is_popular = FALSE WHERE tab_id = ? AND id != ?', [plan[0].tab_id, id]);
        }
      }
    }
    if (use_whatsapp !== undefined) {
      updateFields.push('use_whatsapp = ?');
      values.push(use_whatsapp ? 1 : 0);
    }
    if (checkout_link !== undefined) {
      updateFields.push('checkout_link = ?');
      values.push(checkout_link);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await db.query(`UPDATE plans SET ${updateFields.join(', ')} WHERE id = ?`, values);
    }

    // Update features if provided
    if (features && Array.isArray(features)) {
      // Delete existing features
      await db.query('DELETE FROM plan_features WHERE plan_id = ?', [id]);

      // Add new features
      for (let i = 0; i < features.length; i++) {
        await db.query(
          'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
          [id, features[i], i]
        );
      }
    }

    res.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete plan (protected)
router.delete('/plans/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM plans WHERE id = ?', [id]);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
