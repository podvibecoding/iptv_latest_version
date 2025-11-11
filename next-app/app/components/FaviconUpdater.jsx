'use client'

import { useEffect } from 'react'
import { getApiUrl } from '../lib/config'

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/settings?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          console.warn('Failed to fetch favicon settings')
          return
        }
        
        const settings = await response.json()
        
        if (settings.favicon_url) {
          // Update all favicon link elements
          const faviconLinks = document.querySelectorAll("link[rel*='icon']")
          faviconLinks.forEach(link => link.remove())
          
          // Add new favicon
          const link = document.createElement('link')
          link.rel = 'icon'
          link.href = settings.favicon_url
          document.head.appendChild(link)
          
          // Add apple touch icon
          const appleLink = document.createElement('link')
          appleLink.rel = 'apple-touch-icon'
          appleLink.href = settings.favicon_url
          document.head.appendChild(appleLink)
        }
      } catch (error) {
        console.error('Failed to load favicon:', error)
      }
    }
    
    updateFavicon()
  }, [])
  
  return null
}
