/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname),
  
  // Webpack configuration for React Quill compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress findDOMNode warning from react-quill
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    return config
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Proxy API requests to backend (avoids CORS issues in development)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ]
  },

  // Security headers for better SEO
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    
    const headers = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ]
    
    // Only add HSTS in production (it breaks localhost HTTP)
    if (!isDev) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      })
    }
    
    return [
      {
        source: '/:path*',
        headers: headers,
      },
    ]
  },
}

module.exports = nextConfig

