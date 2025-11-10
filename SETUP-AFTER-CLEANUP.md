# Quick Setup Guide After Code Cleanup

## 🚀 Getting Started

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and update these values:
   ```env
   # Database (update if different)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=iptv_database
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-random-secret-key-here
   
   # Email (if using email features)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

#### Start Backend Server
```bash
npm start
# or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:5000`

---

### 2. Frontend Setup

#### Install Dependencies
```bash
cd next-app
npm install
```

#### Start Frontend
```bash
npm run dev
```

The Next.js app will start on `http://localhost:3000`

---

## 🔍 Verify Setup

### Check Backend Health
Open browser to: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "IPTV Backend API is running",
  "timestamp": "2025-11-10T..."
}
```

### Check Database Connection
Look for this in the backend console:
```
✅ MySQL Database connected successfully
📊 Database: iptv_database
🔗 Connection pool size: 10
```

---

## 📝 New Features Available

### 1. Professional Logging System

Instead of `console.log`, use the logger:

```javascript
const logger = require('./utils/logger');

// Different log levels
logger.error('Error message', error);
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
logger.success('Success message');
logger.http('GET', '/api/endpoint');
logger.db('Query executed', { query: 'SELECT ...' });
```

### 2. Input Validation Middleware

Use in your routes:

```javascript
const { validateLogin, validateBlogPost, validatePlan } = require('../middleware/validation');

// Example
router.post('/endpoint', validateLogin, async (req, res) => {
  // Validation already done
  // Handle request
});
```

### 3. Improved Database Connection

The database now has:
- Automatic retry on connection failure (3 attempts)
- Connection pooling with monitoring
- Better error messages
- Query helper function

```javascript
const db = require('./config/database');

// Using pool directly
const [rows] = await db.query('SELECT * FROM table WHERE id = ?', [id]);

// Or use the query helper
const result = await db.query('INSERT INTO table SET ?', [data]);
```

---

## 🔧 Troubleshooting

### Backend Won't Start

1. **Check .env file exists**
   ```bash
   # Make sure .env exists in backend folder
   cd backend
   dir .env
   ```

2. **Verify database credentials**
   - Open `.env`
   - Check `DB_USER`, `DB_PASSWORD`, `DB_NAME`

3. **Check database is running**
   - Start XAMPP/WAMP/MySQL
   - Verify database exists

### Database Connection Failed

The system will automatically retry 3 times. Check:
- MySQL service is running
- Database credentials in `.env` are correct
- Database `iptv_database` exists
- Required tables exist (run migration scripts if needed)

### Email Not Sending

1. **Check SMTP settings in .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

2. **For Gmail users**
   - Enable 2-factor authentication
   - Generate an "App Password"
   - Use the app password in `SMTP_PASSWORD`

### Frontend Can't Connect to Backend

1. **Verify backend is running** on port 5000
2. **Check CORS settings** in `backend/server.js`
3. **Verify Next.js proxy** in `next-app/next.config.js`

---

## 📊 Development vs Production

### Development Mode
- Verbose logging enabled
- All log levels shown
- Better error messages
- Stack traces visible

### Production Mode
Set in `.env`:
```env
NODE_ENV=production
```

Production features:
- Minimal logging (errors and warnings only)
- No debug information
- Secure cookies (HTTPS only)
- Optimized performance

---

## 🛠️ Useful Commands

### Backend
```bash
# Start server
npm start

# Development mode (auto-restart)
npm run dev

# Change admin password
npm run change-password
```

### Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## 📁 Important Files

### Configuration
- `backend/.env` - Environment variables (DON'T commit to git)
- `backend/.env.example` - Template for environment variables
- `backend/config/database.js` - Database configuration

### Middleware
- `backend/middleware/auth.js` - Authentication middleware
- `backend/middleware/validation.js` - Input validation middleware

### Utilities
- `backend/utils/logger.js` - Logging utility
- `backend/utils/emailService.js` - Email sending utility

### Routes
- `backend/routes/auth.js` - Authentication (login, password reset)
- `backend/routes/settings.js` - Site settings
- `backend/routes/plans.js` - Subscription plans
- `backend/routes/blogs.js` - Blog posts
- `backend/routes/faqs.js` - FAQ management

---

## 🔐 Security Notes

1. **Never commit .env file to git** - It's already in .gitignore
2. **Use strong JWT_SECRET** - Generate a random 32+ character string
3. **Use app-specific passwords** for email (not your main password)
4. **Change default admin password** after first login
5. **Enable HTTPS in production**

---

## 📞 Need Help?

Check these resources:
1. `CODE-CLEANUP-SUMMARY.md` - Detailed cleanup documentation
2. `DEPLOYMENT-GUIDE.md` - Production deployment guide
3. `EMAIL-SETUP-GUIDE.md` - Email configuration help
4. Backend console logs - Now using professional logger

---

**Last Updated**: November 10, 2025
**Status**: Ready to use ✅
