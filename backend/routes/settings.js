const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get settings (public endpoint)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (rows.length === 0) {
      return res.json({
        logo_url: null,
        logo_text: null,
        use_logo_image: true,
        logo_width: 150,
        favicon_url: null,
        site_title: 'IPTV ACCESS - Best IPTV Service Provider',
        site_description: 'Stream 40,000+ channels',
        copyright_text: '© 2025 IPTV Services. All rights reserved.',
        contact_email: 'contact@iptv.com',
        whatsapp_number: '+1234567890',
        google_analytics_id: null,
        google_analytics_measurement_id: null
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update settings (protected endpoint)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      logo_url,
      logo_text,
      use_logo_image,
      logo_width,
      favicon_url,
      site_title,
      site_description,
      copyright_text,
      contact_email,
      whatsapp_number,
      google_analytics_id,
      google_analytics_measurement_id,
      hero_heading,
      hero_paragraph,
      supported_devices_paragraph
    } = req.body;

    const updateFields = [];
    const values = [];

    if (logo_url !== undefined) {
      updateFields.push('logo_url = ?');
      values.push(logo_url);
    }
    if (logo_text !== undefined) {
      updateFields.push('logo_text = ?');
      values.push(logo_text);
    }
    if (use_logo_image !== undefined) {
      updateFields.push('use_logo_image = ?');
      values.push(use_logo_image ? 1 : 0);
    }
    if (logo_width !== undefined) {
      updateFields.push('logo_width = ?');
      values.push(logo_width);
    }
    if (favicon_url !== undefined) {
      updateFields.push('favicon_url = ?');
      values.push(favicon_url);
    }
    if (site_title !== undefined) {
      updateFields.push('site_title = ?');
      values.push(site_title);
    }
    if (site_description !== undefined) {
      updateFields.push('site_description = ?');
      values.push(site_description);
    }
    if (copyright_text !== undefined) {
      updateFields.push('copyright_text = ?');
      values.push(copyright_text);
    }
    if (contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      values.push(contact_email);
    }
    if (whatsapp_number !== undefined) {
      updateFields.push('whatsapp_number = ?');
      values.push(whatsapp_number);
    }
    if (google_analytics_id !== undefined) {
      updateFields.push('google_analytics_id = ?');
      values.push(google_analytics_id);
    }
    if (google_analytics_measurement_id !== undefined) {
      updateFields.push('google_analytics_measurement_id = ?');
      values.push(google_analytics_measurement_id);
    }
    if (hero_heading !== undefined) {
      updateFields.push('hero_heading = ?');
      values.push(hero_heading);
    }
    if (hero_paragraph !== undefined) {
      updateFields.push('hero_paragraph = ?');
      values.push(hero_paragraph);
    }
    if (supported_devices_paragraph !== undefined) {
      updateFields.push('supported_devices_paragraph = ?');
      values.push(supported_devices_paragraph);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(1); // WHERE id = 1

    await db.query(
      `UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    // Return updated settings
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json({ success: true, settings: rows[0] });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
