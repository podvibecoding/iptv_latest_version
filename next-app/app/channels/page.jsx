'use client'
import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getApiUrl } from '../lib/config'

export default function ChannelsPage() {
  const [channelImages, setChannelImages] = useState([])
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannelImages = async () => {
      try {
        const apiUrl = getApiUrl()
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const res = await fetch(`${apiUrl}/slider-images?section=channels&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (res.ok) {
          const data = await res.json()
          console.log('📊 Channels API Response:', data.length, 'images')
          if (data && data.length > 0) {
            const newBuster = Date.now()
            const imagesWithBuster = data.map(img => `${img.image_url}?v=${newBuster}`)
            console.log('✅ Setting channel images:', imagesWithBuster)
            setChannelImages(imagesWithBuster)
            setCacheBuster(newBuster)
          } else {
            console.log('⚠️ No images from API')
            setChannelImages([])
          }
        } else {
          console.log('❌ API request failed')
          setChannelImages([])
        }
      } catch (error) {
        console.error('Error loading channel images:', error)
        setChannelImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchChannelImages()
  }, [])

  const images = channelImages

  // Duplicate images for seamless infinite scroll
  const duplicatedImages = useMemo(() => [...images, ...images], [images])
  const duration = Math.max(12, Math.round(10 + images.length * 1.5))

  return (
    <>
      <Header />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        paddingTop: '100px',
        paddingBottom: '80px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 5%'
        }}>
          {/* Page Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #7dff00 0%, #5bc700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Channels List
          </h1>
          
          <p style={{
            textAlign: 'center',
            color: '#aaa',
            fontSize: '1.1rem',
            marginBottom: '50px',
            maxWidth: '700px',
            margin: '0 auto 50px'
          }}>
            Explore our comprehensive list of available channels across all categories
          </p>

          {/* Video Container */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto 60px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(125, 255, 0, 0.15)',
            border: '1px solid rgba(125, 255, 0, 0.2)'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden'
            }}>
              <iframe
                src="https://player.vimeo.com/video/916781453?autoplay=1&playsinline=1&color&autopause=0&loop=0&muted=1&title=1&portrait=1&byline=1&h=2ef70cf25f#t="
                title="Channels List Video"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Image Slider Section */}
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '40px',
              color: '#7dff00'
            }}>
              Channel Categories
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Loading channel categories...
              </div>
            ) : images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No channel categories available
              </div>
            ) : (
              /* Infinite Scroll Container */
              <div className="movie-strip">
                <div className="movie-row" style={{ '--movie-scroll-duration': `${duration}s` }}>
                  {duplicatedImages.map((image, index) => (
                    <div className="movie-card" key={index} style={{ width: 120 }}>
                      <img
                        src={image}
                        alt={`Channel ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
