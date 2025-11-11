'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getApiUrl, getApiBase } from '../lib/config'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoText, setLogoText] = useState('')
  const [useLogoImage, setUseLogoImage] = useState(true)
  const [logoWidth, setLogoWidth] = useState(150)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  
  const toggleMenu = () => setMenuOpen(v => !v)
  const handleLinkClick = () => setMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
        setMenuOpen(false) // close mobile menu when scrolling
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const apiUrl = getApiUrl()
      const apiBase = getApiBase()
      // Add timestamp to force cache busting
      const res = await fetch(`${apiUrl}/settings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!res.ok) return
      const data = await res.json()
      
      // Handle logo URL properly
      if (data.logo_url) {
        let fullLogoUrl = data.logo_url
        
        // If it already starts with http/https, use as is
        if (fullLogoUrl.startsWith('http://') || fullLogoUrl.startsWith('https://')) {
          setLogoUrl(fullLogoUrl)
        }
        // If it starts with /uploads, prepend the API base URL (not /api)
        else if (fullLogoUrl.startsWith('/uploads')) {
          setLogoUrl(`${apiBase}${fullLogoUrl}`)
        }
        // Otherwise use as is
        else {
          setLogoUrl(fullLogoUrl)
        }
      }
      
      if (data.logo_text) setLogoText(data.logo_text)
      if (data.use_logo_image !== undefined) setUseLogoImage(data.use_logo_image)
      if (data.logo_width) setLogoWidth(data.logo_width)
      if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoaded(true)
    }
  }

  // Generate WhatsApp link
  const getWhatsAppLink = () => {
    if (!whatsappNumber) return '/#pricing'
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    return `https://wa.me/${cleanNumber}?text=Hi, I'm interested in a free trial For your subscription service`
  }

  // Handle navigation with hash - redirect to home if not already there
  const handleHashNavigation = (e, hash) => {
    e.preventDefault()
    if (pathname === '/') {
      // Already on home page, just scroll
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to home page with hash
      router.push(`/${hash}`)
    }
    setMenuOpen(false)
  }

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-inner">
        <Link href="/" className="logo" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}>
          {useLogoImage && logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" style={{ width: logoWidth, height: 'auto' }} />
          ) : !useLogoImage && logoText ? (
            <span>{logoText}</span>
          ) : null}
        </Link>
        <nav aria-label="Primary">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><a href="/#pricing" onClick={(e) => handleHashNavigation(e, '#pricing')}>Pricing</a></li>
            <li><Link href="/channels">Channels List</Link></li>
            <li><a href="/#faq" onClick={(e) => handleHashNavigation(e, '#faq')}>FAQ</a></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </nav>
        <Link href={getWhatsAppLink()} className="free-trial" target={whatsappNumber ? "_blank" : "_self"} rel={whatsappNumber ? "noopener noreferrer" : ""}>Free Trial</Link>
        {/* Burger for small screens */}
        <button
          className={`burger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      {/* Mobile menu panel */}
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <ul>
          <li><Link href="/" onClick={handleLinkClick}>Home</Link></li>
          <li><a href="/#pricing" onClick={(e) => handleHashNavigation(e, '#pricing')}>Pricing</a></li>
          <li><Link href="/channels" onClick={handleLinkClick}>Channels List</Link></li>
          <li><a href="/#faq" onClick={(e) => handleHashNavigation(e, '#faq')}>FAQ</a></li>
          <li><Link href="/blog" onClick={handleLinkClick}>Blog</Link></li>
          <li className="mobile-cta"><Link href={getWhatsAppLink()} className="btn-cta" target={whatsappNumber ? "_blank" : "_self"} rel={whatsappNumber ? "noopener noreferrer" : ""} onClick={handleLinkClick}>Free Trial</Link></li>
        </ul>
      </div>
    </header>
  )
}