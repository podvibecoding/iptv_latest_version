'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl, getApiBase } from '../lib/config'

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState('')
  const [logoText, setLogoText] = useState('')
  const [useLogoImage, setUseLogoImage] = useState(true)
  const [logoWidth, setLogoWidth] = useState(150)
  const [email, setEmail] = useState('contact@yourdomain.com')
  const [whatsApp, setWhatsApp] = useState('')
  const [copyrightText, setCopyrightText] = useState('© 2025 IPTV Services. All rights reserved.')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const apiUrl = getApiUrl()
        const apiBase = getApiBase()
        const res = await fetch(`${apiUrl}/settings?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
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
        if (data.contact_email) setEmail(data.contact_email)
        if (data.whatsapp_number) setWhatsApp(data.whatsapp_number)
        if (data.copyright_text) setCopyrightText(data.copyright_text)
      } catch (e) {
        console.error('Failed to load settings for footer:', e)
      }
    }
    loadSettings()
  }, [])

  const waHref = whatsApp
    ? `https://wa.me/${whatsApp.replace(/[^\d]/g, '')}`
    : 'https://wa.me/'

  // Handle navigation with hash
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
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid footer-grid-4">
        {/* First row: Logo, Nav, Email */}
        <div className="footer-first-row">
          {/* 1) Left: Logo (optional) */}
          <div className="footer-col footer-logo-col">
            {useLogoImage && logoUrl ? (
              <Link href="/" className="footer-logo" aria-label="Homepage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Site logo"
                  style={{ width: logoWidth, height: 'auto', maxWidth: 220, objectFit: 'contain' }}
                />
              </Link>
            ) : !useLogoImage && logoText ? (
              <Link href="/" className="footer-logo" aria-label="Homepage">
                <span className="footer-logo-fallback">{logoText}</span>
              </Link>
            ) : null}
          </div>

          {/* 2) Center: nav links in one line */}
          <nav className="footer-col footer-links" aria-label="Footer navigation">
            <ul className="footer-nav-list">
              <li><a href="/#pricing" onClick={(e) => handleHashNavigation(e, '#pricing')}>Pricing</a></li>
              <li><Link href="/channels">Channel List</Link></li>
              <li><a href="/#faq" onClick={(e) => handleHashNavigation(e, '#faq')}>FAQ</a></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </nav>

          {/* 3) Right: email */}
          <div className="footer-col footer-email-col">
            <a href={`mailto:${email}`} className="email-link" aria-label={`Send email to ${email}`}>
              {email}
            </a>
          </div>
        </div>

        {/* Second row: WhatsApp CTA */}
        <div className="footer-col footer-whatsapp-col">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
            aria-label="Chat with us on WhatsApp"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>{copyrightText}</p>
      </div>
    </footer>
  )
}
