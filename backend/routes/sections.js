const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// GET /api/sections - Get all sections
router.get('/', async (req, res) => {
  try {
    const [sections] = await db.query('SELECT * FROM sections ORDER BY id ASC');
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sections' });
  }
});

// GET /api/sections/:key - Get a specific section by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const [[section]] = await db.query('SELECT * FROM sections WHERE section_key = ?', [key]);
    
    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch section' });
  }
});

// PUT /api/sections/:key - Update a section
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { heading, description } = req.body;

    if (!heading) {
      return res.status(400).json({ success: false, error: 'Heading is required' });
    }

    await db.query(
      'UPDATE sections SET heading = ?, description = ? WHERE section_key = ?',
      [heading, description || '', key]
    );

    res.json({
      success: true,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, error: 'Failed to update section' });
  }
});

module.exports = router;
