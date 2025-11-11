const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all slider images or filter by section (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    
    let query = 'SELECT * FROM slider_images';
    let params = [];
    
    if (section) {
      query += ' WHERE section = ?';
      params.push(section);
    }
    
    query += ' ORDER BY section ASC, display_order ASC, id ASC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get slider images error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new slider image (protected endpoint)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { image_url, section } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const sectionName = section || 'hero';

    // Get the highest display_order for this section
    const [maxOrder] = await db.query(
      'SELECT MAX(display_order) as max_order FROM slider_images WHERE section = ?',
      [sectionName]
    );
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO slider_images (section, image_url, display_order) VALUES (?, ?, ?)',
      [sectionName, image_url, nextOrder]
    );

    const [newImage] = await db.query(
      'SELECT * FROM slider_images WHERE id = ?',
      [result.insertId]
    );

    res.json({
      success: true,
      message: 'Slider image added successfully',
      image: newImage[0]
    });
  } catch (error) {
    console.error('Add slider image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete slider image (protected endpoint)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM slider_images WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Slider image not found' });
    }

    res.json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('Delete slider image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update display order (protected endpoint)
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { images } = req.body; // Array of { id, display_order }

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    // Update each image's display_order
    for (const img of images) {
      await db.query(
        'UPDATE slider_images SET display_order = ? WHERE id = ?',
        [img.display_order, img.id]
      );
    }

    res.json({
      success: true,
      message: 'Display order updated successfully'
    });
  } catch (error) {
    console.error('Reorder slider images error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
