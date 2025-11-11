'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getApiUrl } from '../lib/config'

import img1 from '../../public/images/images 1 (1).jpg'
import img23 from '../../public/images/images 1 (23).jpg'
import img24 from '../../public/images/images 1 (24).jpg'
import img25 from '../../public/images/images 1 (25).jpg'
import img26 from '../../public/images/images 1 (26).jpg'
import img27 from '../../public/images/images 1 (27).jpg'
import img28 from '../../public/images/images 1 (28).jpg'
import img29 from '../../public/images/images 1 (29).jpg'

const DEFAULT_TOURNAMENTS = [
  { title: 'Sport 1', image: img25 },
  { title: 'Sport 2', image: img26 },
  { title: 'Sport 3', image: img27 },
  { title: 'Sport 4', image: img28 },
  { title: 'Sport 5', image: img29 },
  { title: 'Sport 6', image: img1 },
  { title: 'Sport 8', image: img24 },
  { title: 'Sport 9', image: img23 },
  { title: 'Sport 11', image: img25 },
  { title: 'Sport 12', image: img26 },
  { title: 'Sport 13', image: img27 },
  { title: 'Sport 14', image: img28 },
  { title: 'Sport 15', image: img29 },
  { title: 'Sport 16', image: img1 },
  { title: 'Sport 17', image: img23 },
  { title: 'Sport 18', image: img24 },
]

export default function SportsEvents() {
  const [sliderImages, setSliderImages] = useState([])
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)

  // Load slider images from API
  useEffect(() => {
    const loadSliderImages = async () => {
      try {
        const apiUrl = getApiUrl()
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const res = await fetch(`${apiUrl}/slider-images?section=sports&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        const data = await res.json()
        setSliderImages(data || [])
        setCacheBuster(Date.now())
      } catch (error) {
        console.error('Failed to load sports slider images:', error)
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

  // Use custom images if available, otherwise use default sports
  const TOURNAMENTS = loading ? [] : (sliderImages.length > 0
    ? sliderImages.map((img, idx) => ({ title: `Sport ${idx + 1}`, image: `${img.image_url}?v=${cacheBuster}` }))
    : DEFAULT_TOURNAMENTS)

  // We render the tournament list twice in a single row to create a seamless infinite scroll.
  const doubled = [...TOURNAMENTS, ...TOURNAMENTS]

  if (loading) {
    return (
      <section className="sports-events">
        <h2>Watch All Major Sport Events</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading sports events...
        </div>
      </section>
    )
  }

  return (
    <section className="sports-events">
      <h2>Watch All Major Sport Events</h2>

      <div className="movie-strip">
        <div className="movie-row" aria-hidden="false">
          {doubled.map((t, i) => (
            <div className="movie-card" key={i}>
              {typeof t.image === 'string' ? (
                <img src={t.image} alt={t.title} style={{width:'100%',height:'auto', minHeight: '270px', objectFit: 'cover'}} />
              ) : (
                <Image src={t.image} alt={t.title} width={180} height={270} style={{width:'100%',height:'auto'}} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
