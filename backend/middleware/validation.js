/**
 * Input validation middleware for request validation
 */

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  return password && password.length >= 8;
};

// Validate login request
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Invalid credentials' 
    });
  }

  next();
};

// Validate password reset request
const validatePasswordReset = (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ 
      error: 'Reset token is required' 
    });
  }

  if (!newPassword) {
    return res.status(400).json({ 
      error: 'New password is required' 
    });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long' 
    });
  }

  next();
};

// Validate email recovery request
const validateEmailRecovery = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  next();
};

// Validate blog post data
const validateBlogPost = (req, res, next) => {
  const { title, content, excerpt } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Title is required' 
    });
  }

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Content is required' 
    });
  }

  if (title.length > 200) {
    return res.status(400).json({ 
      error: 'Title must not exceed 200 characters' 
    });
  }

  if (excerpt && excerpt.length > 500) {
    return res.status(400).json({ 
      error: 'Excerpt must not exceed 500 characters' 
    });
  }

  next();
};

// Validate plan data
const validatePlan = (req, res, next) => {
  const { name, price, duration } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Plan name is required' 
    });
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({ 
      error: 'Invalid price value' 
    });
  }

  if (!duration || duration.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Duration is required' 
    });
  }

  next();
};

// Validate FAQ data
const validateFAQ = (req, res, next) => {
  const { question, answer } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Question is required' 
    });
  }

  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Answer is required' 
    });
  }

  if (question.length > 500) {
    return res.status(400).json({ 
      error: 'Question must not exceed 500 characters' 
    });
  }

  next();
};

// Sanitize string input (basic XSS prevention)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

module.exports = {
  validateLogin,
  validatePasswordReset,
  validateEmailRecovery,
  validateBlogPost,
  validatePlan,
  validateFAQ,
  sanitizeString,
  isValidEmail,
  isValidPassword
};
