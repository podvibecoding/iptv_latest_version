// Shared API URL configuration
// In development: uses Next.js proxy (/api -> localhost:5000/api)
// In production: uses direct API URL (https://api.365upstream.com/api)
export function getApiUrl() {
  // Check if we're in browser (client-side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In development (localhost), use relative URL - Next.js proxy handles it
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api'; // No protocol/port - use Next.js proxy
    }
    
    // In production, use the API subdomain with /api
    return 'https://api.365upstream.com/api';
  }
  
  // Server-side: use environment variable or fallback
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  return 'https://api.365upstream.com/api';
}

export function getApiBase() {
  // Check if we're in browser (client-side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In development (localhost), return backend URL
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // In production, return base URL WITHOUT /api
    return 'https://api.365upstream.com';
  }
  
  // Server-side: return base URL without /api
  return 'https://api.365upstream.com';
}

// Legacy exports - kept for compatibility but components should use getApiUrl() function
export const API_URL = getApiUrl();
export const API_BASE = getApiBase();