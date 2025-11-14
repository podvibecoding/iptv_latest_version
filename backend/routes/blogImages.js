const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all blog images (optionally filter by blog_id)
router.get('/', async (req, res) => {
  try {
    const { blog_id } = req.query;
    
    let query = 'SELECT * FROM blog_images ORDER BY created_at DESC';
    let params = [];
    
    if (blog_id) {
      query = 'SELECT * FROM blog_images WHERE blog_id = ? ORDER BY created_at DESC';
      params = [blog_id];
    }
    
    const [images] = await db.query(query, params);
    res.json({ success: true, images });
  } catch (error) {
    console.error('Get blog images error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get single blog image
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [images] = await db.query('SELECT * FROM blog_images WHERE id = ?', [id]);
    
    if (images.length === 0) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }
    
    res.json({ success: true, image: images[0] });
  } catch (error) {
    console.error('Get blog image error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update blog image metadata (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { blog_id } = req.body;
    
    if (blog_id === undefined) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }
    
    await db.query(
      'UPDATE blog_images SET blog_id = ? WHERE id = ?',
      [blog_id, id]
    );
    
    res.json({ success: true, message: 'Blog image updated successfully' });
  } catch (error) {
    console.error('Update blog image error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete blog image (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image info before deleting
    const [images] = await db.query('SELECT image_url FROM blog_images WHERE id = ?', [id]);
    
    if (images.length === 0) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }
    
    // Delete from database
    await db.query('DELETE FROM blog_images WHERE id = ?', [id]);
    
    // Delete file from disk
    const imageUrl = images[0].image_url;
    const filename = imageUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true, message: 'Blog image deleted successfully' });
  } catch (error) {
    console.error('Delete blog image error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
