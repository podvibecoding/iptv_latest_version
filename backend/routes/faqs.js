const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all FAQs (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM faqs ORDER BY display_order ASC, id ASC');
    res.json({ success: true, faqs: rows });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create FAQ (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    // Get max order
    const [rows] = await db.query('SELECT MAX(display_order) as max_order FROM faqs');
    const nextOrder = (rows[0].max_order || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)',
      [question, answer, nextOrder]
    );

    // Return the full FAQ object
    const [newFaq] = await db.query('SELECT * FROM faqs WHERE id = ?', [result.insertId]);
    res.json({ success: true, faq: newFaq[0], message: 'FAQ created successfully' });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update FAQ (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    await db.query(
      'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
      [question, answer, id]
    );

    // Return the updated FAQ object
    const [updatedFaq] = await db.query('SELECT * FROM faqs WHERE id = ?', [id]);
    res.json({ success: true, faq: updatedFaq[0], message: 'FAQ updated successfully' });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete FAQ (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM faqs WHERE id = ?', [id]);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reorder FAQs (protected)
router.put('/reorder/all', authMiddleware, async (req, res) => {
  try {
    const { faqs } = req.body; // Array of {id, display_order}

    for (const faq of faqs) {
      await db.query('UPDATE faqs SET display_order = ? WHERE id = ?', [faq.display_order, faq.id]);
    }

    res.json({ success: true, message: 'FAQs reordered successfully' });
  } catch (error) {
    console.error('Reorder FAQs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
