'use client'

import { useEffect } from 'react'
import { getApiUrl } from '../lib/config'

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const apiUrl = getApiUrl()
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(`${apiUrl}/settings?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          // Silently fail - backend may not be accessible yet
          return
        }
        
        const settings = await response.json()
        
        if (settings.favicon_url) {
          // Add API base URL if path is relative
          let faviconPath = settings.favicon_url
          if (!faviconPath.startsWith('http')) {
            const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
            faviconPath = `${apiBase}${faviconPath}`
          }
          
          // Add cache buster to force browser refresh
          const cacheBuster = `?v=${Date.now()}`
          const faviconUrl = faviconPath + cacheBuster
          
          // Update all favicon link elements
          const faviconLinks = document.querySelectorAll("link[rel*='icon']")
          faviconLinks.forEach(link => {
            link.href = faviconUrl
          })
          
          // If no favicon links exist, create them
          if (faviconLinks.length === 0) {
            // Add new favicon
            const link = document.createElement('link')
            link.rel = 'icon'
            link.type = 'image/x-icon'
            link.href = faviconUrl
            document.head.appendChild(link)
            
            // Add shortcut icon
            const shortcutLink = document.createElement('link')
            shortcutLink.rel = 'shortcut icon'
            shortcutLink.type = 'image/x-icon'
            shortcutLink.href = faviconUrl
            document.head.appendChild(shortcutLink)
            
            // Add apple touch icon
            const appleLink = document.createElement('link')
            appleLink.rel = 'apple-touch-icon'
            appleLink.href = faviconUrl
            document.head.appendChild(appleLink)
          }
        }
      } catch (error) {
        // Silently fail - this is expected if backend API is not accessible
        // Error will be visible in other components that need the API
      }
    }
    
    updateFavicon()
  }, [])
  
  return null
}
