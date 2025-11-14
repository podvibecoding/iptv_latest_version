'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { getApiUrl, getApiBase } from '../lib/config'

import logo14 from '../../public/images/images 1 (14).webp'
import logo15 from '../../public/images/images 1 (15).webp'
import logo16 from '../../public/images/images 1 (16).webp'
import logo17 from '../../public/images/images 1 (17).webp'
import logo18 from '../../public/images/images 1 (18).webp'
import logo19 from '../../public/images/images 1 (19).webp'
import logo20 from '../../public/images/images 1 (20).webp'
import logo21 from '../../public/images/images 1 (21).webp'
import logo22 from '../../public/images/images 1 (22).webp'

const DEFAULT_LOGOS = [logo20, logo22, logo19, logo16, logo18, logo22, logo21, logo14, logo15, logo17]

export default function Streaming(){
  const [sliderImages, setSliderImages] = useState([])
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [heading, setHeading] = useState('Streaming Services')

  // Load section heading
  useEffect(() => {
    const loadHeading = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/sections/streaming`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeading(data.heading || 'Streaming Services')
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
        const apiBase = getApiBase()
        const timestamp = new Date().getTime()
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const res = await fetch(`${apiUrl}/slider-images?section=streaming&_t=${timestamp}`, {
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
        // Convert relative paths to absolute URLs
        const imagesWithFullUrls = data.map(img => ({
          ...img,
          image_url: img.image_url.startsWith('http') ? img.image_url : `${apiBase}${img.image_url}`
        }))
        setSliderImages(imagesWithFullUrls || [])
        setCacheBuster(Date.now())
      } catch (error) {
        // Silently fail - backend API may not be accessible
        setSliderImages([])
        setCacheBuster(Date.now())
      } finally {
        setLoading(false)
        // Notify that component is loaded
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { component: 'streaming' } }))
        }
      }
    }
    loadSliderImages()
  }, [])

  // Use custom images if available, otherwise don't show anything while loading
  const LOGOS = loading ? [] : (sliderImages.length > 0 
    ? sliderImages.map(img => `${img.image_url}?v=${cacheBuster}`)
    : DEFAULT_LOGOS)

  // logos already duplicated for seamless looping
  const logos = useMemo(()=> [...LOGOS, ...LOGOS], [LOGOS])
  const duration = Math.max(12, Math.round(10 + LOGOS.length * 1.5))

  if (loading) {
    return (
      <section className="streaming">
        <h2 style={{marginBottom: '2rem'}}>{heading}</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading streaming services...
        </div>
      </section>
    )
  }

  return (
    <section className="streaming">
      <h2 style={{marginBottom: '2rem'}}>{heading}</h2>

      {/* reuse the movie strip styles so the streaming row matches the movies width/behavior */}
      <div className="movie-strip">
        <div className="movie-row" style={{ ['--movie-scroll-duration']: `${duration}s` }} aria-hidden="false">
          {logos.map((s,i)=> (
            <div className="movie-card" key={i} style={{width:120}}>
              {typeof s === 'string' ? (
                <img src={s} alt={`logo-${i}`} style={{objectFit:'contain', width:'100%', height:'auto', maxHeight: '60px'}} />
              ) : (
                <Image src={s} alt={`logo-${i}`} width={120} height={60} style={{objectFit:'contain', width:'100%', height:'auto'}} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
