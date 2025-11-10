# 🔧 Login Error Fix - RESOLVED

## Problem
Getting "Server error" when trying to login.

## Root Cause
The database.js file had a **recursive query helper function** that was causing a "Maximum call stack size exceeded" error. This happened because:

1. We added a custom `query` function to the module exports
2. This function called `pool.query()` internally
3. But since we exported `query` on the same object, it created infinite recursion

## Solution Applied ✅

### Fixed File: `backend/config/database.js`

**Removed the problematic code:**
```javascript
// Query helper with error handling (REMOVED - WAS CAUSING RECURSION)
const query = async (sql, params) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

module.exports = pool;
module.exports.query = query; // THIS WAS THE PROBLEM
```

**Now correctly exports only the pool:**
```javascript
module.exports = pool;
```

### Also Fixed: JWT_SECRET

Updated `.env` file with a proper JWT secret:
```env
JWT_SECRET=iptv-jwt-secret-key-2025-change-in-production-e8f9a2b3c4d5e6f7
```

## Verification ✅

Ran tests and confirmed:
- ✅ JWT_SECRET is configured
- ✅ Database connected successfully  
- ✅ Admin account found: admin@site.com
- ✅ Password hashing works
- ✅ JWT works correctly

## How to Test Login Now

### Option 1: Restart Backend Server (If Running)

If your backend server is already running, you need to restart it:

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where it's running
   - Or close the terminal

2. **Start it again:**
   ```bash
   cd backend
   npm start
   ```

### Option 2: If Server Was Not Running

Just start it:
```bash
cd backend
npm start
```

You should see:
```
✅ MySQL Database connected successfully
📊 Database: iptv_database
🔗 Connection pool size: 10

╔════════════════════════════════════════╗
║   IPTV Backend Server                  ║
║   Port: 5000                           ║
║   Environment: development             ║
║   Status: Running ✓                    ║
╚════════════════════════════════════════╝
```

## Test Login

### Default Credentials
- **Email:** `admin@site.com`
- **Password:** `admin123`

### Expected Behavior
1. Login should work without "Server error"
2. You should get a success response
3. JWT token will be set in cookies
4. You'll be redirected to dashboard

## What Was Wrong Before

**Error in browser:** "Server error"

**Error in server logs:** 
```
Database query error: Maximum call stack size exceeded
```

This was happening because every time the login route tried to query the database:
1. It called `db.query()`
2. Which called the pool's native query method
3. But our custom query wrapper was intercepting it
4. Creating infinite recursion → stack overflow

## Status: ✅ FIXED

The login should now work perfectly! 

If you still see errors:
1. Make sure you restarted the backend server
2. Check that MySQL is running
3. Verify database exists with `iptv_database` name
4. Check that admin account exists in the database

---

**Date Fixed:** November 10, 2025
**Files Modified:**
- `backend/config/database.js` - Removed recursive query function
- `backend/.env` - Updated JWT_SECRET
- `backend/test-login-config.js` - Created for testing (optional)
