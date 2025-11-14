-- Add hero settings columns to the settings table
USE iptv_database;

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS hero_heading VARCHAR(255),
ADD COLUMN IF NOT EXISTS hero_paragraph TEXT,
ADD COLUMN IF NOT EXISTS supported_devices_paragraph TEXT;

-- Set default values for the first row
UPDATE settings 
SET 
  hero_heading = COALESCE(hero_heading, 'Premium IPTV Service'),
  hero_paragraph = COALESCE(hero_paragraph, 'Enjoy premium TV with POD IPTV. Access a wide range of channels and exclusive content, with over 40,000 channels and more than 54,000 VOD.'),
  supported_devices_paragraph = COALESCE(supported_devices_paragraph, 'Watch your favorite content on any device, anywhere. Our IPTV service is compatible with all major platforms including Smart TVs, Android, iOS, Windows, Mac, Fire TV Stick, and more.')
WHERE id = 1;

-- Verify the columns were added
SELECT id, hero_heading, hero_paragraph FROM settings WHERE id = 1;
