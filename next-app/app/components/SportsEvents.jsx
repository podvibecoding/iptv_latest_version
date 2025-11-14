'use client'
import React, { useState, useEffect } from 'react'
import { getApiUrl, getApiBase } from '../lib/config'

export default function SportsEvents() {
  const [sliderImages, setSliderImages] = useState([])
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [heading, setHeading] = useState('Watch All Major Sport Events')

  // Load section heading
  useEffect(() => {
    const loadHeading = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/sections/sports`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeading(data.heading || 'Watch All Major Sport Events')
        }
      } catch (error) {
        // Use default heading on error
      }
    }
    loadHeading()
  }, [])

  // Load slider images from API
  useEffect(() => {
    const loadSliderImages = async () => {
      try {
        const apiUrl = getApiUrl()
        const timestamp = new Date().getTime()
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const res = await fetch(`${apiUrl}/slider-images?section=sports&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          setSliderImages([])
          setCacheBuster(Date.now())
          return
        }
        
        const data = await res.json()
        setSliderImages(data || [])
        setCacheBuster(Date.now())
      } catch (error) {
        // Silently fail - backend API may not be accessible
        setSliderImages([])
        setCacheBuster(Date.now())
      } finally {
        setLoading(false)
        // Notify that component is loaded
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { component: 'sports' } }))
        }
      }
    }
    loadSliderImages()
  }, [])

  // Use images from database
  const apiBase = getApiBase()
  const TOURNAMENTS = loading ? [] : sliderImages.map((img, idx) => ({ 
    title: `Sport ${idx + 1}`, 
    image: img.image_url.startsWith('http') ? img.image_url : `${apiBase}${img.image_url}?v=${cacheBuster}` 
  }))

  // We render the tournament list twice in a single row to create a seamless infinite scroll.
  const doubled = [...TOURNAMENTS, ...TOURNAMENTS]

  if (loading) {
    return (
      <section className="sports-events">
        <h2>{heading}</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading sports events...
        </div>
      </section>
    )
  }

  return (
    <section className="sports-events">
      <h2>{heading}</h2>

      <div className="movie-strip">
        <div className="movie-row" aria-hidden="false">
          {doubled.map((t, i) => (
            <div className="movie-card" key={i}>
              <img src={t.image} alt={t.title} style={{width:'100%',height:'auto', minHeight: '270px', objectFit: 'cover'}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
