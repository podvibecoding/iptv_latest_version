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
        contact_email: 'contact@yourdomain.com',
        whatsapp_number: '+1 555 123 4567',
        favicon_url: null,
        hero_heading: 'TITAN IPTV Premium TV Service',
        hero_paragraph: 'Enjoy premium TV with Titan IPTV. Access a wide range of channels and exclusive content, with over 40,000 channels and more than 54,000 VOD.',
        supported_devices_paragraph: 'Watch your favorite content on any device, anywhere. Our IPTV service is compatible with all major platforms including Smart TVs, Android, iOS, Windows, Mac, Fire TV Stick, and more. Enjoy seamless streaming across multiple devices with just one subscription.',
        google_analytics_id: null,
        google_analytics_measurement_id: null,
        site_title: 'IPTV ACCESS - Best IPTV Service Provider',
        site_description: 'Get the best IPTV subscription with IPTV ACCESS. Stream 40,000+ live TV channels, 54,000+ movies & series in HD/4K.',
        copyright_text: '© 2025 IPTV Services. All rights reserved.',
        slider_image_1: null,
        slider_image_2: null,
        slider_image_3: null
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
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
      contact_email, 
      whatsapp_number,
      favicon_url,
      hero_heading,
      hero_paragraph,
      supported_devices_paragraph,
      google_analytics_id,
      google_analytics_measurement_id,
      site_title,
      site_description,
      copyright_text,
      slider_image_1,
      slider_image_2,
      slider_image_3
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
    if (contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      values.push(contact_email);
    }
    if (whatsapp_number !== undefined) {
      updateFields.push('whatsapp_number = ?');
      values.push(whatsapp_number);
    }
    if (favicon_url !== undefined) {
      updateFields.push('favicon_url = ?');
      values.push(favicon_url);
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
    if (google_analytics_id !== undefined) {
      updateFields.push('google_analytics_id = ?');
      values.push(google_analytics_id);
    }
    if (google_analytics_measurement_id !== undefined) {
      updateFields.push('google_analytics_measurement_id = ?');
      values.push(google_analytics_measurement_id);
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
    if (slider_image_1 !== undefined) {
      updateFields.push('slider_image_1 = ?');
      values.push(slider_image_1);
    }
    if (slider_image_2 !== undefined) {
      updateFields.push('slider_image_2 = ?');
      values.push(slider_image_2);
    }
    if (slider_image_3 !== undefined) {
      updateFields.push('slider_image_3 = ?');
      values.push(slider_image_3);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(1); // WHERE id = 1

    await db.query(
      `UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    // Return updated settings
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json(rows[0]);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
