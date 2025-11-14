'use client'
import React, { useState, useEffect } from 'react'
import { getApiUrl } from '../lib/config'

export default function Pricing() {
  const [activeTab, setActiveTab] = useState(null)
  const [pricingData, setPricingData] = useState({ tabs: [] })
  const [loading, setLoading] = useState(true)
  const [heading, setHeading] = useState('Choose Your IPTV Plan')

  useEffect(() => {
    loadPricingData()
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
      console.error('Failed to load heading:', error)
    }
  }

  const loadPricingData = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/pricing?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!res.ok) throw new Error('Failed to fetch pricing data')
      
      const data = await res.json()
      
      if (data.success && data.tabs && data.tabs.length > 0) {
        setPricingData(data)
        setActiveTab(data.tabs[0].id)
      }
    } catch (error) {
      console.error('Failed to load pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const handleCheckout = (plan, tabName) => {
    if (plan.checkout_type === 'whatsapp' && plan.whatsapp_number) {
      const message = `Hi, I'm interested in the "${plan.title}" for "${tabName}"`
      const whatsappNumber = plan.whatsapp_number.replace(/\D/g, '')
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    } else if (plan.checkout_link) {
      window.open(ensureAbsoluteUrl(plan.checkout_link), '_blank')
    }
  }

  if (loading) {
    return (
      <section className="pricing">
        <p>Loading pricing plans...</p>
      </section>
    )
  }

  const currentTab = pricingData.tabs.find(tab => tab.id === activeTab)

  return (
    <section className="pricing">
      <h2>{heading}</h2>

      {/* Tabs */}
      <div className="pricing-tabs">
        {pricingData.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Pricing Cards */}
      {currentTab && (
        <div className="pricing-cards">
          {currentTab.plans.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card ${plan.show_badge ? 'featured' : ''}`}
              style={plan.show_badge && plan.badge_text ? {
                '--badge-text': `"${plan.badge_text}"`
              } : {}}
            >
              {/* Plan Title */}
              <h3>{plan.title}</h3>

              {/* Price */}
              <div className="price">{plan.price}</div>

              {/* Device Count */}
              <div className="device-count">{currentTab.name}</div>

              {/* Features */}
              <ul className="features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              {/* Buy Now Button */}
              <a
                className="buy-now"
                onClick={(e) => {
                  e.preventDefault()
                  handleCheckout(plan, currentTab.name)
                }}
                style={{ cursor: 'pointer' }}
              >
                Buy Now
              </a>

              {/* Ready within text */}
              <p style={{
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: '#999',
                textAlign: 'center'
              }}>
                Ready within 5-7mins
              </p>

              {/* Payment Icons */}
              <img
                src="/images/payment-icons.png"
                alt="Payment Methods"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  marginTop: '1rem',
                  opacity: 0.7
                }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
