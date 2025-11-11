'use client'
import { useState, useEffect } from 'react'

export default function PageLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadedComponents, setLoadedComponents] = useState({
    hero: false,
    streaming: false,
    movies: false,
    sports: false
  })

  useEffect(() => {
    // Listen for component loaded events
    const handleComponentLoaded = (e) => {
      const componentName = e.detail.component
      setLoadedComponents(prev => ({
        ...prev,
        [componentName]: true
      }))
    }

    window.addEventListener('componentLoaded', handleComponentLoaded)

    // Check if all components are loaded
    const checkAllLoaded = setInterval(() => {
      const allLoaded = Object.values(loadedComponents).every(loaded => loaded)
      if (allLoaded) {
        setIsLoading(false)
        clearInterval(checkAllLoaded)
      }
    }, 100)

    // Fallback: Remove loading after 5 seconds max
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      window.removeEventListener('componentLoaded', handleComponentLoaded)
      clearInterval(checkAllLoaded)
      clearTimeout(timeout)
    }
  }, [loadedComponents])

  return (
    <>
      {/* Full Page Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          transition: 'opacity 0.5s ease-out'
        }}>
          {/* Logo or Brand Name */}
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #7dff00 0%, #5bc700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            OUR WEBSITE
          </div>

          {/* Animated Loading Spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(125, 255, 0, 0.2)',
            borderTop: '4px solid #7dff00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />

          {/* Loading Text */}
          <div style={{
            marginTop: '24px',
            color: '#86ff00',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Loading content...
          </div>

          {/* Loading Progress */}
          <div style={{
            marginTop: '12px',
            color: '#666',
            fontSize: '0.85rem'
          }}>
            {Object.values(loadedComponents).filter(Boolean).length} / {Object.keys(loadedComponents).length} sections loaded
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Main Content - Hidden until loaded */}
      <div style={{
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.5s ease-in',
        visibility: isLoading ? 'hidden' : 'visible'
      }}>
        {children}
      </div>
    </>
  )
}
