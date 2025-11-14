-- IPTV Admin Dashboard Database Schema

CREATE DATABASE IF NOT EXISTS iptv_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iptv_database;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_default_account BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Website settings
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  logo_url VARCHAR(255),
  logo_text VARCHAR(255),
  use_logo_image BOOLEAN DEFAULT TRUE,
  logo_width INT DEFAULT 150,
  favicon_url VARCHAR(255),
  site_title VARCHAR(255),
  site_description TEXT,
  copyright_text VARCHAR(255),
  contact_email VARCHAR(255),
  whatsapp_number VARCHAR(50),
  google_analytics_id VARCHAR(100),
  google_analytics_measurement_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hero section settings
CREATE TABLE IF NOT EXISTS hero_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  heading VARCHAR(255),
  description TEXT,
  focused_word VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Content sections (streaming, sports, channels, devices)
CREATE TABLE IF NOT EXISTS sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  heading VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_section_key (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Section images (many-to-one relationship with sections)
CREATE TABLE IF NOT EXISTS section_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_key VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_key) REFERENCES sections(section_key) ON DELETE CASCADE,
  INDEX idx_section_key (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing tabs
CREATE TABLE IF NOT EXISTS pricing_tabs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing plans
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tab_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  use_whatsapp BOOLEAN DEFAULT FALSE,
  checkout_link VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tab_id) REFERENCES pricing_tabs(id) ON DELETE CASCADE,
  INDEX idx_tab_id (tab_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan features
CREATE TABLE IF NOT EXISTS plan_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  feature_text VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_plan_id (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255),
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Slider images (movies, sports sections)
CREATE TABLE IF NOT EXISTS slider_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings row
INSERT INTO settings (id, site_title, site_description, copyright_text, contact_email, whatsapp_number, use_logo_image, logo_width)
VALUES (1, 'IPTV ACCESS - Best IPTV Service Provider', 'Stream 40,000+ channels and 54,000+ VOD', '© 2025 IPTV Services. All rights reserved.', 'contact@iptv.com', '+1234567890', TRUE, 150)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default hero settings
INSERT INTO hero_settings (id, heading, description, focused_word)
VALUES (1, 'Premium IPTV Service', 'Stream unlimited channels and content', 'Premium')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default sections
INSERT INTO sections (section_key, heading, description) VALUES
('streaming', 'Streaming Services', 'Watch all major streaming content'),
('sports', 'Major Sports Events', 'Never miss a game'),
('channels', 'Channel Categories', 'Thousands of channels worldwide'),
('devices', 'Supported Devices', 'Watch on any device')
ON DUPLICATE KEY UPDATE heading=VALUES(heading);
