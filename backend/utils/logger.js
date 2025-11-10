/**
 * Logger utility for better logging management
 * Provides consistent logging across the application
 */

const isProd = process.env.NODE_ENV === 'production';

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Color codes for console output
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  SUCCESS: '\x1b[32m', // Green
  RESET: '\x1b[0m'
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const color = COLORS[level] || COLORS.RESET;
  const prefix = `${color}[${timestamp}] [${level}]${COLORS.RESET}`;
  
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
};

// Logger class
class Logger {
  // Error logs (always shown)
  error(message, error = null) {
    const logMessage = formatMessage(LOG_LEVELS.ERROR, message);
    console.error(logMessage);
    if (error && error.stack && !isProd) {
      console.error(error.stack);
    }
  }

  // Warning logs (always shown)
  warn(message, data = null) {
    const logMessage = formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(logMessage);
  }

  // Info logs (shown in development and when explicitly enabled)
  info(message, data = null) {
    if (!isProd || process.env.LOG_LEVEL === 'verbose') {
      const logMessage = formatMessage(LOG_LEVELS.INFO, message, data);
      console.log(logMessage);
    }
  }

  // Debug logs (only in development)
  debug(message, data = null) {
    if (!isProd) {
      const logMessage = formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.log(logMessage);
    }
  }

  // Success logs (shown in development)
  success(message, data = null) {
    if (!isProd) {
      const timestamp = getTimestamp();
      const logMessage = `${COLORS.SUCCESS}[${timestamp}] [SUCCESS]${COLORS.RESET} ${message}`;
      console.log(logMessage);
      if (data) {
        console.log(data);
      }
    }
  }

  // HTTP request logs (only in development)
  http(method, path, statusCode = null) {
    if (!isProd) {
      const color = statusCode >= 400 ? COLORS.ERROR : COLORS.INFO;
      const status = statusCode ? ` - ${statusCode}` : '';
      console.log(`${color}[HTTP]${COLORS.RESET} ${method} ${path}${status}`);
    }
  }

  // Database operation logs
  db(operation, details = null) {
    if (!isProd) {
      this.debug(`[DB] ${operation}`, details);
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;
