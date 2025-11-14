const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../config/email');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validatePasswordChange = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
];

const validateEmailChange = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (admins.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const admin = admins[0];

    // Verify password (check both password and password_hash columns for compatibility)
    const passwordField = admin.password || admin.password_hash;
    const isValidPassword = await bcrypt.compare(password, passwordField);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get current admin info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT id, email, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({ success: true, admin: admins[0] });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, validatePasswordChange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current admin
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const admin = admins[0];

    // Verify current password
    const passwordField = admin.password || admin.password_hash;
    const isValid = await bcrypt.compare(currentPassword, passwordField);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password (update both columns for compatibility)
    await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hashedPassword, req.admin.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Change email
router.put('/change-email', authMiddleware, validateEmailChange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get current admin
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const admin = admins[0];

    // Verify password
    const passwordField = admin.password || admin.password_hash;
    const isValid = await bcrypt.compare(password, passwordField);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Password is incorrect' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM admins WHERE email = ? AND id != ?', [email, req.admin.id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    // Update email
    await db.query(
      'UPDATE admins SET email = ? WHERE id = ?',
      [email, req.admin.id]
    );

    res.json({ success: true, message: 'Email updated successfully', email });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    // Check if admin exists
    const [admins] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (admins.length === 0) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await db.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, resetToken, expiresAt]
    );

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find valid token
    const [resets] = await db.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (resets.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const reset = resets[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update admin password
    await db.query('UPDATE admins SET password_hash = ? WHERE email = ?', [hashedPassword, reset.email]);

    // Mark token as used
    await db.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [reset.id]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Logout (client-side token removal, but endpoint for consistency)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
