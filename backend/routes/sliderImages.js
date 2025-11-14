const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for slider images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `slider-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (file.mimetype.startsWith('image/') || allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, GIF, SVG, WEBP) are allowed'), false);
    }
  }
});

// GET /api/slider-images - Get all slider images (optionally filtered by section)
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    
    let queryStr = 'SELECT * FROM slider_images';
    let params = [];
    
    if (section) {
      queryStr += ' WHERE section = ?';
      params.push(section);
    }
    
    queryStr += ' ORDER BY display_order ASC, id ASC';
    
    const [images] = await db.query(queryStr, params);
    res.json(images);
  } catch (error) {
    console.error('Error fetching slider images:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch slider images' });
  }
});

// POST /api/slider-images - Upload and add a new slider image
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const { section } = req.body;
    
    if (!section) {
      return res.status(400).json({ success: false, error: 'Section is required' });
    }

    // Store relative path so it works in both frontend and backend
    const imageUrl = `/uploads/${req.file.filename}`;

    // Get max display order for this section
    const [[result]] = await db.query(
      'SELECT MAX(display_order) as max_order FROM slider_images WHERE section = ?',
      [section]
    );
    const nextOrder = (result.max_order || 0) + 1;

    // Insert into database
    const [insertResult] = await db.query(
      'INSERT INTO slider_images (section, image_url, display_order) VALUES (?, ?, ?)',
      [section, imageUrl, nextOrder]
    );

    res.json({
      success: true,
      message: 'Slider image uploaded successfully',
      image: {
        id: insertResult.insertId,
        section,
        image_url: imageUrl,
        display_order: nextOrder
      }
    });
  } catch (error) {
    console.error('Error uploading slider image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload slider image' });
  }
});

// PUT /api/slider-images/:id - Update slider image display order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;

    if (display_order === undefined) {
      return res.status(400).json({ success: false, error: 'Display order is required' });
    }

    await db.query(
      'UPDATE slider_images SET display_order = ? WHERE id = ?',
      [display_order, id]
    );

    res.json({
      success: true,
      message: 'Slider image updated successfully'
    });
  } catch (error) {
    console.error('Error updating slider image:', error);
    res.status(500).json({ success: false, error: 'Failed to update slider image' });
  }
});

// DELETE /api/slider-images/:id - Delete a slider image
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get image info to delete file
    const [[image]] = await db.query('SELECT * FROM slider_images WHERE id = ?', [id]);
    
    if (!image) {
      return res.status(404).json({ success: false, error: 'Slider image not found' });
    }

    // Delete from database
    await db.query('DELETE FROM slider_images WHERE id = ?', [id]);

    // Try to delete physical file (ignore errors if file doesn't exist)
    try {
      if (image.image_url && image.image_url.includes('/uploads/')) {
        const filename = image.image_url.split('/uploads/')[1];
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    res.json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slider image:', error);
    res.status(500).json({ success: false, error: 'Failed to delete slider image' });
  }
});

module.exports = router;
