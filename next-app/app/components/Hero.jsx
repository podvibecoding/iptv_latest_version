'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getApiUrl, getApiBase } from '../lib/config'
import devicesImg from '../../public/images/devices.webp'
import tvImg from '../../public/images/tv-1024x636-1-1.webp'

export default function Hero({ settings }){
  const whatsappNumber = settings?.whatsapp_number || ''
  const heroHeading = settings?.hero_heading || 'POD IPTV <span class="accent">Premium</span><br/>TV Service'
  const heroParagraph = settings?.hero_paragraph || 'Enjoy premium TV with POD IPTV. Access a wide range of channels and exclusive content, with over 40,000 channels and more than 54,000 VOD.'
  
  const [sliderImages, setSliderImages] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)

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
        
        const res = await fetch(`${apiUrl}/slider-images?section=hero&_t=${timestamp}`, {
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
          window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { component: 'hero' } }))
        }
      }
    }
    loadSliderImages()
  }, [])

  // Auto-slide effect
  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
      }, 5000) // Change slide every 5 seconds

      return () => clearInterval(interval)
    }
  }, [sliderImages.length])

  const getWhatsAppLink = () => {
    if (!whatsappNumber) return '/#pricing'
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    return `https://wa.me/${cleanNumber}?text=Hi,  I'm interested in a free trial For your subscription service`
  }
  
  return (
    <section className="hero" id="home">
      <div className="container hero-inner">
        <div className="hero-left">
          <h1 dangerouslySetInnerHTML={{ __html: heroHeading }} />
          <p className="lead">{heroParagraph}</p>
          <div className="hero-ctas">
            <Link href={getWhatsAppLink()} className="btn-cta" target={whatsappNumber ? "_blank" : "_self"} rel={whatsappNumber ? "noopener noreferrer" : ""}>Free Trial</Link>
          </div>
          <div className="devices">
            <Image src={devicesImg} alt="devices" width={640} height={80} style={{width:'50%', height:'auto'}} />
          </div>
        </div>
        <div className="hero-right">
          {loading ? (
            <div style={{ 
              width: '100%', 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '12px'
            }}>
              <div style={{ color: '#86ff00', fontSize: '14px' }}>Loading...</div>
            </div>
          ) : sliderImages.length > 0 ? (
            <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
              {sliderImages.map((img, index) => (
                <img
                  key={img.id}
                  src={`${img.image_url}?v=${cacheBuster}`}
                  alt={`Slider ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    opacity: currentSlide === index ? 1 : 0,
                    transition: 'opacity 1s ease-in-out',
                    position: index === 0 ? 'relative' : 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
              ))}
              {sliderImages.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginTop: '16px',
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        background: currentSlide === index ? '#86ff00' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Image src={tvImg} alt="tv" width={1024} height={636} priority style={{width:'100%', height:'auto'}} />
          )}
        </div>
      </div>
    </section>
  )
}
