'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getApiUrl } from '../lib/config'
import movie1 from '../../public/images/images 1 (1).jpg'
import movie2 from '../../public/images/images 1 (2).jpg'
import movie3 from '../../public/images/images 1 (3).jpg'
import movie4 from '../../public/images/images 1 (4).jpg'
import movie5 from '../../public/images/images 1 (5).jpg'
import movie6 from '../../public/images/images 1 (6).jpg'

const DEFAULT_MOVIES = [
  { title: 'Movie 1', image: movie1 },
  { title: 'Movie 2', image: movie2 },
  { title: 'Movie 3', image: movie3 },
  { title: 'Movie 4', image: movie4 },
  { title: 'Movie 5', image: movie5 },
  { title: 'Movie 6', image: movie6 }
]

export default function Movies() {
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
        const res = await fetch(`${apiUrl}/slider-images?section=movies&_t=${timestamp}`, {
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
        console.error('Failed to load movies slider images:', error)
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

  // Use custom images if available, otherwise use default movies
  const SAMPLE = loading ? [] : (sliderImages.length > 0
    ? sliderImages.map((img, idx) => ({ title: `Movie ${idx + 1}`, image: `${img.image_url}?v=${cacheBuster}` }))
    : DEFAULT_MOVIES)

  // We render the movie list twice in a single row to create a seamless infinite scroll.
  const doubled = [...SAMPLE, ...SAMPLE]

  if (loading) {
    return (
      <section className="movies">
        <h2>Movies & TV Shows</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading movies...
        </div>
      </section>
    )
  }

  return (
    <section className="movies">
      <h2>Movies & TV Shows</h2>

      <div className="movie-strip">
        <div className="movie-row" aria-hidden="false">
          {doubled.map((m, i) => (
            <div className="movie-card" key={i} style={{width:180}}>
              {typeof m.image === 'string' ? (
                <img src={m.image} alt={m.title} style={{width:'100%',height:'auto',borderRadius:'12px', minHeight: '270px', objectFit: 'cover'}} />
              ) : (
                <Image src={m.image} alt={m.title} width={180} height={270} style={{width:'100%',height:'auto',borderRadius:'12px'}} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
