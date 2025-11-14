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

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = req.body.type || 'image';
    cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter - accept all image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
  if (file.mimetype.startsWith('image/') || allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPG, GIF, SVG, WEBP) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Generic upload endpoint
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const apiBase = process.env.FRONTEND_URL?.replace('/api', '') || 'http://localhost:5000';
    const fileUrl = `${apiBase}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed', message: error.message });
  }
});

// Upload logo
router.post('/logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Store relative path
    const logoUrl = `/uploads/${req.file.filename}`;

    // Update database
    await db.query('UPDATE settings SET logo_url = ? WHERE id = 1', [logoUrl]);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      url: logoUrl
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Upload favicon
router.post('/favicon', authMiddleware, upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Store relative path
    const faviconUrl = `/uploads/${req.file.filename}`;

    // Update database
    await db.query('UPDATE settings SET favicon_url = ? WHERE id = 1', [faviconUrl]);

    res.json({
      success: true,
      message: 'Favicon uploaded successfully',
      url: faviconUrl
    });
  } catch (error) {
    console.error('Favicon upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Upload blog image
router.post('/blog-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { blog_id } = req.body;

    // Store FULL URL in database (different strategy)
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Save to database with full URL
    const [result] = await db.query(
      'INSERT INTO blog_images (blog_id, image_url) VALUES (?, ?)',
      [blog_id || null, imageUrl]
    );

    res.json({
      success: true,
      message: 'Blog image uploaded successfully',
      url: imageUrl,
      id: result.insertId
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Upload section image
router.post('/section-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { section_key } = req.body;
    if (!section_key) {
      return res.status(400).json({ success: false, error: 'Section key is required' });
    }

    // Store relative path
    const imageUrl = `/uploads/${req.file.filename}`;

    // Get max order
    const [rows] = await db.query(
      'SELECT MAX(display_order) as max_order FROM section_images WHERE section_key = ?',
      [section_key]
    );
    const nextOrder = (rows[0].max_order || 0) + 1;

    // Insert into database
    await db.query(
      'INSERT INTO section_images (section_key, image_url, display_order) VALUES (?, ?, ?)',
      [section_key, imageUrl, nextOrder]
    );

    res.json({
      success: true,
      message: 'Section image uploaded successfully',
      url: imageUrl
    });
  } catch (error) {
    console.error('Section image upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File is too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ success: false, error: error.message });
  }
  next(error);
});

module.exports = router;
