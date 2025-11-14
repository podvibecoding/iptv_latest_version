# IPTV Backend API

Complete Node.js + Express + MySQL backend for IPTV admin dashboard.

## 🚀 Features

- ✅ **Authentication**: JWT-based admin authentication with password recovery
- ✅ **Settings Management**: Logo, favicon, site info, analytics
- ✅ **Content Management**: Hero section, streaming services, sports, channels, devices
- ✅ **Pricing System**: Multiple tabs, plans, features, popular badges
- ✅ **FAQs Management**: Add/edit/delete FAQs with ordering
- ✅ **Blog System**: Create/edit blogs with featured images
- ✅ **File Uploads**: Multer-based image uploads (all formats)
- ✅ **Email Service**: Password recovery via Gmail SMTP
- ✅ **Security**: Helmet, CORS, bcrypt, JWT
- ✅ **Docker Ready**: Dockerfile + docker-compose included

## 📋 Requirements

- Node.js 16+ 
- MySQL 5.7+ or 8.0+
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=iptv_database

# JWT Secret (min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Gmail SMTP (for password recovery)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

```bash
# Create database and tables
mysql -u root -p < database.sql

# Or import manually
mysql -u root -p
CREATE DATABASE iptv_database;
USE iptv_database;
SOURCE database.sql;
```

### 4. Seed Default Admin

```bash
npm run seed
```

Default credentials:
- **Email**: admin@site.com
- **Password**: admin123

⚠️ **Change these immediately after first login!**

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on **http://localhost:5000**

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

### Seed Admin in Docker

```bash
docker-compose exec backend npm run seed
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | No | Admin login |
| GET | `/me` | Yes | Get current admin |
| PUT | `/change-password` | Yes | Change password |
| PUT | `/change-email` | Yes | Change email |
| POST | `/forgot-password` | No | Request password reset |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/logout` | Yes | Logout |

### Settings (`/api/settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all settings |
| PUT | `/` | Yes | Update settings |

### File Uploads (`/api/upload`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Generic file upload |
| POST | `/logo` | Yes | Upload logo |
| POST | `/favicon` | Yes | Upload favicon |
| POST | `/blog-image` | Yes | Upload blog image |
| POST | `/section-image` | Yes | Upload section image |

### FAQs (`/api/faqs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all FAQs |
| POST | `/` | Yes | Create FAQ |
| PUT | `/:id` | Yes | Update FAQ |
| DELETE | `/:id` | Yes | Delete FAQ |
| PUT | `/reorder/all` | Yes | Reorder FAQs |

### Blogs (`/api/blogs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get blogs (paginated) |
| GET | `/:slug` | No | Get single blog |
| POST | `/` | Yes | Create blog |
| PUT | `/:id` | Yes | Update blog |
| DELETE | `/:id` | Yes | Delete blog |
| GET | `/admin/all` | Yes | Get all blogs (admin) |

### Pricing (`/api/pricing`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all tabs, plans, features |
| POST | `/tabs` | Yes | Create pricing tab |
| PUT | `/tabs/:id` | Yes | Update pricing tab |
| DELETE | `/tabs/:id` | Yes | Delete pricing tab |
| POST | `/plans` | Yes | Create plan |
| PUT | `/plans/:id` | Yes | Update plan |
| DELETE | `/plans/:id` | Yes | Delete plan |

## 🔒 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

Or in cookies:
```
cookie: token=<your-jwt-token>
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication in Google Account
2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Update `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js      # MySQL connection pool
│   └── email.js         # Nodemailer configuration
├── middleware/
│   └── auth.js          # JWT authentication
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── settings.js      # Settings routes
│   ├── upload.js        # File upload routes
│   ├── faqs.js          # FAQs routes
│   ├── blogs.js         # Blogs routes
│   └── pricing.js       # Pricing routes
├── scripts/
│   └── seed.js          # Database seeding
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── database.sql         # Database schema
├── server.js            # Main entry point
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 5000 | Server port |
| DB_HOST | Yes | localhost | MySQL host |
| DB_USER | Yes | root | MySQL user |
| DB_PASSWORD | Yes | - | MySQL password |
| DB_NAME | Yes | iptv_database | Database name |
| JWT_SECRET | Yes | - | JWT secret key (min 32 chars) |
| JWT_EXPIRES_IN | No | 7d | JWT expiration |
| EMAIL_HOST | No | smtp.gmail.com | SMTP host |
| EMAIL_PORT | No | 587 | SMTP port |
| EMAIL_USER | Yes* | - | SMTP username |
| EMAIL_PASSWORD | Yes* | - | SMTP password |
| EMAIL_FROM | No | - | From email address |
| FRONTEND_URL | No | http://localhost:3000 | Frontend URL for CORS |
| UPLOAD_DIR | No | ./uploads | Upload directory |

*Required for password recovery feature

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
# Ensure database exists
CREATE DATABASE iptv_database;
```

### Email Not Sending

```bash
# Verify Gmail app password
# Check EMAIL_USER and EMAIL_PASSWORD in .env
# Ensure 2FA is enabled on Gmail account
```

### File Upload Issues

```bash
# Ensure uploads directory exists
mkdir uploads

# Check permissions
chmod 755 uploads
```

## 📝 Development

```bash
# Start with auto-reload
npm run dev

# Run seed script
npm run seed

# Test endpoints
curl http://localhost:5000/health
```

## 🚀 Production Deployment

### Manual Deployment

```bash
# Set environment to production
NODE_ENV=production

# Start with PM2
npm install -g pm2
pm2 start server.js --name iptv-backend
pm2 save
pm2 startup
```

### Docker Deployment

```bash
# Build and deploy
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

## 🔐 Security Notes

1. **Change default admin credentials** immediately
2. Use strong JWT_SECRET (min 32 characters)
3. Enable HTTPS in production
4. Use environment variables for sensitive data
5. Keep dependencies updated
6. Enable firewall rules

## 📄 License

ISC

## 🆘 Support

For issues or questions, check the logs:

```bash
# Development
tail -f logs/error.log

# Docker
docker-compose logs -f backend
```
