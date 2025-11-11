# Production Deployment Guide - Complete Setup

## Overview
This guide will help you deploy your IPTV website to your production server at **365upstream.com** with the API at **api.365upstream.com**.

---

## 📋 Prerequisites

### Server Requirements:
- **Node.js**: v18 or higher
- **MySQL**: v8.0 or higher
- **Nginx** or **Apache**: For reverse proxy
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)
- **PM2**: For process management (recommended)

### Domain Setup:
- `365upstream.com` → Frontend (Next.js)
- `api.365upstream.com` → Backend (Express API)

---

## 🔧 Step 1: Backend Setup (api.365upstream.com)

### 1.1 Upload Backend Files
```bash
# On your server
cd /var/www/
mkdir iptv-backend
cd iptv-backend

# Upload the backend folder contents
# (Use FTP, SFTP, or git clone)
```

### 1.2 Configure Production Environment
```bash
cd /var/www/iptv-backend

# Copy the production environment template
cp .env.production .env

# Edit the .env file with your production settings
nano .env
```

**Update these values in `.env`:**
```env
NODE_ENV=production
PORT=5000

# Database - Your production MySQL credentials
DB_HOST=localhost
DB_USER=your_production_user
DB_PASSWORD=your_secure_password
DB_NAME=iptv_database

# Security - Generate new secure keys
JWT_SECRET=your_very_long_random_secure_string_here
SESSION_SECRET=another_very_long_random_secure_string

# Domain
FRONTEND_URL=https://365upstream.com

# Email - Your production SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@365upstream.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@365upstream.com
ADMIN_EMAIL=admin@365upstream.com

# CORS
CORS_ORIGINS=https://365upstream.com,https://www.365upstream.com,https://api.365upstream.com
```

### 1.3 Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE iptv_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iptv_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON iptv_database.* TO 'iptv_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database schema
mysql -u iptv_user -p iptv_database < database.sql
```

### 1.4 Install Dependencies & Start Backend
```bash
cd /var/www/iptv-backend

# Install dependencies
npm install --production

# Install PM2 globally (if not installed)
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name iptv-backend
pm2 save
pm2 startup
```

### 1.5 Configure Nginx for Backend (api.365upstream.com)

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/api.365upstream.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.365upstream.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.365upstream.com;

    # SSL Configuration (after getting certificate)
    ssl_certificate /etc/letsencrypt/live/api.365upstream.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.365upstream.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File upload limit
    client_max_body_size 10M;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/api.365upstream.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 1.6 Get SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate for API domain
sudo certbot --nginx -d api.365upstream.com
```

---

## 🎨 Step 2: Frontend Setup (365upstream.com)

### 2.1 Upload Frontend Files
```bash
cd /var/www/
mkdir iptv-frontend
cd iptv-frontend

# Upload the next-app folder contents
```

### 2.2 Configure Production Environment
```bash
cd /var/www/iptv-frontend

# Copy production environment
cp .env.production .env.local
```

**The `.env.local` should contain:**
```env
NEXT_PUBLIC_API_URL=https://api.365upstream.com/api
NEXT_PUBLIC_SITE_URL=https://365upstream.com
```

### 2.3 Build & Start Frontend
```bash
cd /var/www/iptv-frontend

# Install dependencies
npm install --production

# Build for production
npm run build

# Start with PM2
pm2 start npm --name iptv-frontend -- start
pm2 save
```

### 2.4 Configure Nginx for Frontend (365upstream.com)

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/365upstream.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 365upstream.com www.365upstream.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 365upstream.com www.365upstream.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/365upstream.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/365upstream.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_cache_control;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

Enable site and restart:
```bash
sudo ln -s /etc/nginx/sites-available/365upstream.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2.5 Get SSL Certificate for Frontend
```bash
sudo certbot --nginx -d 365upstream.com -d www.365upstream.com
```

---

## 🔐 Step 3: Security Hardening

### 3.1 Firewall Configuration
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3.2 Generate Secure Secrets
```bash
# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update your backend .env with the generated secrets
```

### 3.3 File Permissions
```bash
# Backend
cd /var/www/iptv-backend
chmod 600 .env
chmod 755 uploads

# Frontend
cd /var/www/iptv-frontend
chmod 600 .env.local
```

---

## 📊 Step 4: Verify Deployment

### 4.1 Check PM2 Status
```bash
pm2 status
pm2 logs iptv-backend
pm2 logs iptv-frontend
```

### 4.2 Test API
```bash
curl https://api.365upstream.com/api/settings
```

### 4.3 Test Frontend
Open browser and visit: `https://365upstream.com`

### 4.4 Test Admin Panel
Visit: `https://365upstream.com/admin/login`
- Default: `admin@site.com` / `admin123`
- **IMPORTANT**: Change password immediately!

---

## 🔄 Step 5: Ongoing Maintenance

### Update Application
```bash
# Backend
cd /var/www/iptv-backend
git pull  # or upload new files
npm install
pm2 restart iptv-backend

# Frontend
cd /var/www/iptv-frontend
git pull  # or upload new files
npm install
npm run build
pm2 restart iptv-frontend
```

### Monitor Logs
```bash
pm2 logs iptv-backend --lines 100
pm2 logs iptv-frontend --lines 100
```

### Backup Database
```bash
# Create backup script
nano /root/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u iptv_user -p'your_password' iptv_database > /backups/iptv_db_$DATE.sql
find /backups -name "iptv_db_*.sql" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /root/backup-db.sh
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
pm2 logs iptv-backend
# Check for database connection errors, missing env variables
```

### Frontend shows API errors
```bash
# Verify NEXT_PUBLIC_API_URL in .env.local
cat /var/www/iptv-frontend/.env.local

# Check if backend is running
curl https://api.365upstream.com/api/settings
```

### CORS errors
- Verify `CORS_ORIGINS` in backend `.env`
- Should include: `https://365upstream.com,https://www.365upstream.com`

### SSL certificate issues
```bash
sudo certbot renew --dry-run
```

---

## ✅ Final Checklist

- [ ] Backend running on api.365upstream.com
- [ ] Frontend running on 365upstream.com
- [ ] SSL certificates installed and working
- [ ] Database connected and populated
- [ ] Admin panel accessible
- [ ] Changed default admin password
- [ ] Email notifications working
- [ ] All navigation links working
- [ ] File uploads working
- [ ] PM2 startup configured
- [ ] Firewall configured
- [ ] Database backup scheduled

---

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables are correctly set
4. Ensure all services are running: `pm2 status`

**Your IPTV website is now live at https://365upstream.com! 🚀**
