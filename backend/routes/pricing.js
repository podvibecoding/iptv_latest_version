const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all pricing data (tabs, plans, features)
router.get('/', async (req, res) => {
  try {
    // Set aggressive no-cache headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    const [tabs] = await db.query('SELECT * FROM pricing_tabs ORDER BY display_order ASC, id ASC');

    for (const tab of tabs) {
      const [plans] = await db.query(
        `SELECT * FROM plans 
         WHERE tab_id = ? 
         ORDER BY display_order ASC, id ASC`,
        [tab.id]
      );

      for (const plan of plans) {
        const [features] = await db.query(
          `SELECT feature_text FROM plan_features 
           WHERE plan_id = ? 
           ORDER BY display_order ASC, id ASC`,
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

// ============================================
// PROTECTED ROUTES - TABS MANAGEMENT
// ============================================

// Create new tab
router.post('/tabs', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tab name is required' });
    }

    // Get next display order
    const [rows] = await db.query('SELECT MAX(display_order) as max_order FROM pricing_tabs');
    const nextOrder = (rows[0].max_order || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO pricing_tabs (name, display_order) VALUES (?, ?)',
      [name.trim(), nextOrder]
    );

    res.json({ success: true, message: 'Tab created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create tab error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update tab
router.put('/tabs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tab name is required' });
    }

    const [result] = await db.query(
      'UPDATE pricing_tabs SET name = ? WHERE id = ?',
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    res.json({ success: true, message: 'Tab updated successfully' });
  } catch (error) {
    console.error('Update tab error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete tab (CASCADE deletes plans and features)
router.delete('/tabs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /pricing/tabs/:id - Deleting tab ID:', id);
    
    const [check] = await db.query('SELECT id, name FROM pricing_tabs WHERE id = ?', [id]);
    console.log('   Tab check result:', check.length > 0 ? check[0] : 'NOT FOUND');

    const [result] = await db.query('DELETE FROM pricing_tabs WHERE id = ?', [id]);
    console.log('   Delete result - Affected rows:', result.affectedRows);

    if (result.affectedRows === 0) {
      console.log('   ❌ Tab not found in database');
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    console.log('   ✅ Tab deleted successfully');
    res.json({ success: true, message: 'Tab deleted successfully' });
  } catch (error) {
    console.error('❌ Delete tab error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ============================================
// PROTECTED ROUTES - PLANS MANAGEMENT
// ============================================

// Create new plan
router.post('/plans', authMiddleware, async (req, res) => {
  try {
    const {
      tab_id,
      title,
      price,
      show_badge,
      badge_text,
      checkout_type,
      checkout_link,
      whatsapp_number,
      features
    } = req.body;

    if (!tab_id || !title || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tab ID, title, and price are required' 
      });
    }

    // Verify tab exists
    const [tabCheck] = await db.query('SELECT id FROM pricing_tabs WHERE id = ?', [tab_id]);
    if (tabCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    // Get next display order
    const [rows] = await db.query(
      'SELECT MAX(display_order) as max_order FROM plans WHERE tab_id = ?',
      [tab_id]
    );
    const nextOrder = (rows[0].max_order || 0) + 1;

    // Insert plan
    const [result] = await db.query(
      `INSERT INTO plans 
       (tab_id, title, price, show_badge, badge_text, checkout_type, checkout_link, whatsapp_number, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tab_id,
        title.trim(),
        price.trim(),
        show_badge || 0,
        badge_text?.trim() || 'Popular',
        checkout_type || 'link',
        checkout_link?.trim() || null,
        whatsapp_number?.trim() || null,
        nextOrder
      ]
    );

    const planId = result.insertId;

    // Insert features if provided
    if (features && Array.isArray(features) && features.length > 0) {
      for (let i = 0; i < features.length; i++) {
        if (features[i].trim()) {
          await db.query(
            'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
            [planId, features[i].trim(), i + 1]
          );
        }
      }
    }

    res.json({ success: true, message: 'Plan created successfully', id: planId });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update plan
router.put('/plans/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      price,
      show_badge,
      badge_text,
      checkout_type,
      checkout_link,
      whatsapp_number,
      features
    } = req.body;

    // Update plan details
    const [result] = await db.query(
      `UPDATE plans 
       SET title = ?, price = ?, show_badge = ?, badge_text = ?, 
           checkout_type = ?, checkout_link = ?, whatsapp_number = ?
       WHERE id = ?`,
      [
        title?.trim(),
        price?.trim(),
        show_badge || 0,
        badge_text?.trim() || 'Popular',
        checkout_type || 'link',
        checkout_link?.trim() || null,
        whatsapp_number?.trim() || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Update features if provided
    if (features && Array.isArray(features)) {
      // Delete old features
      await db.query('DELETE FROM plan_features WHERE plan_id = ?', [id]);

      // Insert new features
      for (let i = 0; i < features.length; i++) {
        if (features[i].trim()) {
          await db.query(
            'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
            [id, features[i].trim(), i + 1]
          );
        }
      }
    }

    res.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete plan (CASCADE deletes features)
router.delete('/plans/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM plans WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ============================================
// PROTECTED ROUTES - FEATURES MANAGEMENT
// ============================================

// Add feature to plan
router.post('/plans/:planId/features', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;
    const { feature_text } = req.body;

    if (!feature_text || !feature_text.trim()) {
      return res.status(400).json({ success: false, error: 'Feature text is required' });
    }

    // Get next display order
    const [rows] = await db.query(
      'SELECT MAX(display_order) as max_order FROM plan_features WHERE plan_id = ?',
      [planId]
    );
    const nextOrder = (rows[0].max_order || 0) + 1;

    await db.query(
      'INSERT INTO plan_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
      [planId, feature_text.trim(), nextOrder]
    );

    res.json({ success: true, message: 'Feature added successfully' });
  } catch (error) {
    console.error('Add feature error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update feature
router.put('/features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_text } = req.body;

    if (!feature_text || !feature_text.trim()) {
      return res.status(400).json({ success: false, error: 'Feature text is required' });
    }

    const [result] = await db.query(
      'UPDATE plan_features SET feature_text = ? WHERE id = ?',
      [feature_text.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Feature not found' });
    }

    res.json({ success: true, message: 'Feature updated successfully' });
  } catch (error) {
    console.error('Update feature error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete feature
router.delete('/features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM plan_features WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Feature not found' });
    }

    res.json({ success: true, message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Delete feature error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
