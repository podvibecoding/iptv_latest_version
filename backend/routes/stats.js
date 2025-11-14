const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all stats (public)
router.get('/', async (req, res) => {
  try {
    const [stats] = await db.query('SELECT * FROM stats ORDER BY display_order ASC, id ASC');
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create stat (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { stat_key, stat_value, stat_label, display_order } = req.body;

    if (!stat_key || !stat_value || !stat_label) {
      return res.status(400).json({ success: false, error: 'Stat key, value, and label are required' });
    }

    const [result] = await db.query(
      'INSERT INTO stats (stat_key, stat_value, stat_label, display_order) VALUES (?, ?, ?, ?)',
      [stat_key, stat_value, stat_label, display_order || 0]
    );

    res.json({ success: true, id: result.insertId, message: 'Stat created successfully' });
  } catch (error) {
    console.error('Create stat error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update stat (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { stat_key, stat_value, stat_label, display_order } = req.body;

    const updateFields = [];
    const values = [];

    if (stat_key !== undefined) {
      updateFields.push('stat_key = ?');
      values.push(stat_key);
    }
    if (stat_value !== undefined) {
      updateFields.push('stat_value = ?');
      values.push(stat_value);
    }
    if (stat_label !== undefined) {
      updateFields.push('stat_label = ?');
      values.push(stat_label);
    }
    if (display_order !== undefined) {
      updateFields.push('display_order = ?');
      values.push(display_order);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await db.query(`UPDATE stats SET ${updateFields.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, message: 'Stat updated successfully' });
  } catch (error) {
    console.error('Update stat error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete stat (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM stats WHERE id = ?', [id]);
    res.json({ success: true, message: 'Stat deleted successfully' });
  } catch (error) {
    console.error('Delete stat error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
