# IPTV Backend - Quick Start Guide

## ✅ Backend Created Successfully!

Your complete backend has been generated with:
- **Express.js** server with clean architecture
- **MySQL** database with full schema
- **JWT authentication** with password recovery
- **File uploads** with Multer (all image formats)
- **Email service** via Gmail SMTP
- **Docker** ready deployment
- **Complete API** for admin dashboard

## 🚀 Quick Start

### 1. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE iptv_database;
USE iptv_database;
SOURCE database.sql;
exit;
```

### 2. Configure Environment

The `.env` file is already created. Update these values:

```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=change-this-to-random-32-character-string
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### 3. Create Default Admin

```bash
npm run seed
```

This creates:
- **Email**: admin@site.com
- **Password**: admin123

⚠️ **Change these after first login!**

### 4. Start Backend

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: **http://localhost:5000**

## 📋 API Endpoints Ready

- `POST /api/auth/login` - Admin login
- `GET /api/settings` - Get website settings
- `POST /api/upload/logo` - Upload logo
- `GET /api/faqs` - Get FAQs
- `GET /api/blogs` - Get blogs
- `GET /api/pricing` - Get pricing plans
- And 20+ more endpoints!

## 🔧 Troubleshooting

### Can't connect to database?
1. Check MySQL is running
2. Verify DB_PASSWORD in .env
3. Ensure database exists: `SHOW DATABASES;`

### Seed script fails?
1. Ensure database schema is imported
2. Check database connection settings
3. Run: `mysql -u root -p < database.sql`

## 🐳 Docker Alternative

```bash
# Start everything with Docker
docker-compose up -d

# Seed admin in Docker
docker-compose exec backend npm run seed
```

## 📚 Full Documentation

See `README.md` for complete API documentation, all endpoints, and advanced configuration.

## ✨ Next Steps

1. Import database schema
2. Update .env with your credentials
3. Run seed script
4. Start server
5. Test login at: http://localhost:5000/api/auth/login

---

**Need help?** Check the README.md or server logs for details.
