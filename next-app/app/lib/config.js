// API URL Configuration
// Development: http://localhost:5000/api
// Production: https://api.365upstream.com/api
export function getApiUrl() {
  // Priority 1: Environment variable (set at build time)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Priority 2: Client-side detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // Production - 365upstream.com
    if (hostname === '365upstream.com' || hostname === 'www.365upstream.com') {
      return 'https://api.365upstream.com/api';
    }
  }
  
  // Priority 3: Default fallback (production)
  return 'https://api.365upstream.com/api';
}

export function getApiBase() {
  // Priority 1: Environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
  }

  // Priority 2: Client-side detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Production
    if (hostname === '365upstream.com' || hostname === 'www.365upstream.com') {
      return 'https://api.365upstream.com';
    }
  }
  
  // Priority 3: Default fallback (production)
  return 'https://api.365upstream.com';
}

// Legacy exports - kept for compatibility but components should use getApiUrl() function
export const API_URL = getApiUrl();
export const API_BASE = getApiBase();