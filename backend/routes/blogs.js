const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get all blogs with pagination (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [blogs] = await db.query(
      'SELECT * FROM blogs WHERE published = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM blogs WHERE published = TRUE');
    const total = countResult[0].total;

    res.json({
      success: true,
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [blogs] = await db.query('SELECT * FROM blogs WHERE slug = ? AND published = TRUE', [slug]);

    if (blogs.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    res.json({ success: true, blog: blogs[0] });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create blog (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, featured_image, author, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const slug = generateSlug(title);

    // Check if slug exists
    const [existing] = await db.query('SELECT id FROM blogs WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'A blog with this title already exists' });
    }

    // Determine if blog should be published based on status
    const published = status === 'published';

    const [result] = await db.query(
      'INSERT INTO blogs (title, slug, content, excerpt, featured_image, author, status, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, content, excerpt || null, featured_image || null, author || 'Admin', status || 'draft', published]
    );

    res.json({
      success: true,
      id: result.insertId,
      slug,
      message: 'Blog created successfully'
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update blog (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featured_image, author, status } = req.body;

    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      updateFields.push('title = ?', 'slug = ?');
      values.push(title, generateSlug(title));
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      values.push(content);
    }
    if (excerpt !== undefined) {
      updateFields.push('excerpt = ?');
      values.push(excerpt);
    }
    if (featured_image !== undefined) {
      updateFields.push('featured_image = ?');
      values.push(featured_image);
    }
    if (author !== undefined) {
      updateFields.push('author = ?');
      values.push(author);
    }
    if (status !== undefined) {
      updateFields.push('status = ?', 'published = ?');
      values.push(status, status === 'published');
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(id);

    await db.query(
      `UPDATE blogs SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete blog (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all blogs for admin (protected)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const [blogs] = await db.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json({ success: true, blogs });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get single blog by ID for admin (protected)
router.get('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [blogs] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (blogs.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    
    res.json(blogs[0]);
  } catch (error) {
    console.error('Get admin blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
