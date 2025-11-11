const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for blog images
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico|tiff|tif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp|x-icon|tiff)/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp, ico, tiff)'));
    }
  }
});

const uploadBlogImage = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for blog images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp)/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp)'));
    }
  }
});

// Upload logo (protected endpoint)
router.post('/logo', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Return just the path, not the full URL
    // The frontend will prepend the API URL when displaying
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('Logo uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Upload blog image (protected endpoint)
router.post('/blog-image', authMiddleware, uploadBlogImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Get the base URL - use localhost:5000 for backend
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    
    // Construct the full absolute URL that points to backend
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    console.log('Blog image uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'Blog image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Configure multer for favicon upload
const faviconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'favicon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadFavicon = multer({
  storage: faviconStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for favicon
  },
  fileFilter: (req, file, cb) => {
    // Accept any image type
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico|tiff|tif|avif|apng/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');

    if (mimetype && extname) {
      return cb(null, true);
    } else if (mimetype) {
      // Accept any image mimetype even if extension doesn't match
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for favicon'));
    }
  }
});

// Upload favicon (protected endpoint)
router.post('/favicon', authMiddleware, uploadFavicon.single('favicon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Return just the path, not the full URL
    // The frontend will prepend the API URL when displaying
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('Favicon uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'Favicon uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Favicon upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Configure multer for slider images
const sliderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadSlider = multer({
  storage: sliderStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for slider images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp)/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp)'));
    }
  }
});

// Upload slider image (protected endpoint)
router.post('/slider', authMiddleware, uploadSlider.single('slider'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Return just the path, not the full URL
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('Slider image uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      message: 'Slider image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Slider upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

module.exports = router;
