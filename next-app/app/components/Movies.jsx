'use client'
import React, { useState, useEffect } from 'react'
import { getApiUrl, getApiBase } from '../lib/config'

export default function Movies() {
  const [sliderImages, setSliderImages] = useState([])
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [heading, setHeading] = useState('Movies & TV Shows')

  // Load section heading
  useEffect(() => {
    const loadHeading = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/sections/movies`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeading(data.heading || 'Movies & TV Shows')
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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const apiUrl = getApiUrl()
        const timestamp = new Date().getTime()
        const res = await fetch(`${apiUrl}/slider-images?section=movies&_t=${timestamp}`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        clearTimeout(timeoutId)
        const data = await res.json()
        setSliderImages(data || [])
        setCacheBuster(Date.now())
      } catch (error) {
        // Silent fail - backend not available
      } finally {
        setLoading(false)
        // Notify that component is loaded
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { component: 'movies' } }))
        }
      }
    }
    loadSliderImages()
  }, [])

  // Use images from database
  const apiBase = getApiBase()
  const SAMPLE = loading ? [] : sliderImages.map((img, idx) => ({ 
    title: `Movie ${idx + 1}`, 
    image: img.image_url.startsWith('http') ? img.image_url : `${apiBase}${img.image_url}?v=${cacheBuster}` 
  }))

  // We render the movie list twice in a single row to create a seamless infinite scroll.
  const doubled = [...SAMPLE, ...SAMPLE]

  if (loading) {
    return (
      <section className="movies">
        <h2>{heading}</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading movies...
        </div>
      </section>
    )
  }

  return (
    <section className="movies">
      <h2>{heading}</h2>

      <div className="movie-strip">
        <div className="movie-row" aria-hidden="false">
          {doubled.map((m, i) => (
            <div className="movie-card" key={i} style={{width:180}}>
              <img src={m.image} alt={m.title} style={{width:'100%',height:'auto',borderRadius:'12px', minHeight: '270px', objectFit: 'cover'}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
