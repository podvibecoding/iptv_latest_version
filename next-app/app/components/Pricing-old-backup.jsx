'use client'
import React, { useState, useEffect } from 'react'
import { getApiUrl } from '../lib/config'

// Helper function to ensure URL has protocol
const ensureAbsoluteUrl = (url) => {
  if (!url) return null
  
  // Remove any leading/trailing whitespace
  url = url.trim()
  
  // If URL already has protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If URL starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`
  }
  
  // Otherwise, assume it needs https://
  return `https://${url}`
}

export default function Pricing() {
  const [devices, setDevices] = useState('1 Device')
  const [plans, setPlans] = useState([])
  const [deviceTabs, setDeviceTabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [heading, setHeading] = useState('Choose Your IPTV Plan')

  useEffect(() => {
    loadDeviceTabs()
    loadPlans()
    loadWhatsAppNumber()
    loadHeading()
  }, [])

  const loadHeading = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/sections/pricing`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setHeading(data.heading || 'Choose Your IPTV Plan')
      }
    } catch (error) {
      // Use default heading on error
    }
  }

  const loadDeviceTabs = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/pricing?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error('Failed to fetch tabs')
      const data = await res.json()
      // Extract tab names from the response
      const tabs = data.tabs && Array.isArray(data.tabs) ? data.tabs.map(t => t.name) : []
      setDeviceTabs(tabs)
      if (tabs.length > 0) {
        setDevices(tabs[0]) // Set first tab as default
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Failed to load tabs:', error)
      // Set empty array - no fallback
      setDeviceTabs([])
    }
  }

  const loadPlans = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/pricing?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      // Flatten the plans from all tabs and add tab_name for filtering
      const allPlans = []
      if (data.tabs && Array.isArray(data.tabs)) {
        data.tabs.forEach(tab => {
          if (tab.plans && Array.isArray(tab.plans)) {
            tab.plans.forEach(plan => {
              allPlans.push({
                ...plan,
                device_tab: tab.name, // Use tab name instead of ID
                name: plan.title, // Map title to name for compatibility
                is_featured: plan.is_popular, // Map is_popular to is_featured
                buy_link: plan.checkout_link // Map checkout_link to buy_link
              })
            })
          }
        })
      }
      
      setPlans(allPlans)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Failed to load plans:', error)
      // Set empty array - no fallback, force database usage
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const loadWhatsAppNumber = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/settings?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setWhatsappNumber(data.whatsapp_number || '')
    } catch (error) {
      clearTimeout(timeoutId)
      setWhatsappNumber('')
    }
  }

  const getPlansForDevice = (deviceTab) => {
    const filtered = plans.filter(p => p.device_tab === deviceTab)
    
    // Sort by display_order
    const sorted = filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id)
    
    // Remove duplicates by normalized name
    const seen = new Set()
    const unique = []
    for (const p of sorted) {
      const key = (p.name || '').trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(p)
      }
    }

    return unique.map(p => ({
      label: p.name,
      price: p.price,
      featured: p.is_featured,
      features: p.features || [],
      buy_link: p.buy_link || null,
      use_whatsapp: p.use_whatsapp || false
    }))
  }

  const currentPlans = getPlansForDevice(devices)

  return (
    <section className="pricing" id="pricing">
      <h2>{heading}</h2>

      <div className="pricing-tabs">
        {deviceTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${devices === tab ? 'active' : ''}`}
            onClick={() => setDevices(tab)}
            aria-pressed={devices === tab}
            aria-label={tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pricing-cards">
        {currentPlans.length > 0 ? (
          currentPlans.map((plan, idx) => (
            <article key={`${plan.label}-${idx}`} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              <h3>{plan.label}</h3>
              <div className="price">{plan.price}</div>
              <div className="device-count">{devices}</div>
              <ul className="features">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))
                ) : (
                  <>
                    <li>SD / HD / FHD / 4K Streams</li>
                    <li>40,000+ Live Channels</li>
                    <li>54,000+ VOD</li>
                    <li>VIP & Premium Channels</li>
                    <li>Anti-buffering Technology</li>
                    <li>24/7 Support</li>
                  </>
                )}
              </ul>
              {plan.use_whatsapp && whatsappNumber ? (
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in the ${plan.label} plan for ${devices}`}
                  className="buy-now"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Now
                </a>
              ) : plan.buy_link ? (
                <a 
                  href={ensureAbsoluteUrl(plan.buy_link)} 
                  className="buy-now"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Now
                </a>
              ) : (
                <button className="buy-now">Buy Now</button>
              )}
              <p style={{ margin: '10px 0 17px 0', color: '#aaa', fontSize: '13px', textAlign: 'center' }}>
                Ready within 5-7mins
              </p>
              <img 
                src="/images/images 1 (6).webp" 
                alt="Payment methods" 
                style={{ width: '50%', maxWidth: '120px', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </article>
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#888' 
          }}>
            <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>No pricing plans available</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Please check back later or contact support.</p>
          </div>
        )}
      </div>
    </section>
  )
}
