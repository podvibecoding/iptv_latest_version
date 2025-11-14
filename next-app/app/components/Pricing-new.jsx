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

  const getActivePlans = () => {
    const tab = pricingData.tabs.find(t => t.id === activeTab)
    return tab ? tab.plans : []
  }

  const handleCheckout = (plan, tabName) => {
    if (plan.checkout_type === 'whatsapp' && plan.whatsapp_number) {
      // Format WhatsApp message
      const message = `Hi, I'm interested in the "${plan.title}" for "${tabName}"`
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${plan.whatsapp_number.replace(/\D/g, '')}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    } else if (plan.checkout_link) {
      // Open checkout link
      const url = plan.checkout_link.trim()
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank')
      } else if (url.startsWith('www.')) {
        window.open(`https://${url}`, '_blank')
      } else {
        window.open(`https://${url}`, '_blank')
      }
    }
  }

  if (loading) {
    return (
      <section style={{
        padding: '80px 20px',
        background: '#000',
        textAlign: 'center'
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>Loading pricing...</div>
      </section>
    )
  }

  if (!pricingData.tabs || pricingData.tabs.length === 0) {
    return (
      <section style={{
        padding: '80px 20px',
        background: '#000',
        textAlign: 'center'
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>No pricing plans available</div>
      </section>
    )
  }

  const currentTab = pricingData.tabs.find(t => t.id === activeTab)
  const tabName = currentTab ? currentTab.name : ''

  return (
    <section style={{
      padding: '80px 20px',
      background: '#000',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: '800',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '15px',
          letterSpacing: '-0.5px'
        }}>
          {heading}
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#999',
          fontSize: 'clamp(14px, 2vw, 18px)',
          marginBottom: '50px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Select the perfect plan for your streaming needs
        </p>

        {/* Device Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '50px'
        }}>
          {pricingData.tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 30px',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '50px',
                border: activeTab === tab.id ? '2px solid #86ff00' : '2px solid #333',
                background: activeTab === tab.id ? '#86ff00' : 'transparent',
                color: activeTab === tab.id ? '#000' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.borderColor = '#86ff00'
                  e.target.style.color = '#86ff00'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.borderColor = '#333'
                  e.target.style.color = '#fff'
                }
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {getActivePlans().map(plan => (
            <div
              key={plan.id}
              style={{
                background: '#0a0a0a',
                border: plan.show_badge ? '2px solid #86ff00' : '1px solid #222',
                borderRadius: '16px',
                padding: '30px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(134, 255, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Badge */}
              {plan.show_badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#86ff00',
                  color: '#000',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {plan.badge_text || 'Popular'}
                </div>
              )}

              {/* Plan Title */}
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '10px',
                marginTop: plan.show_badge ? '10px' : '0'
              }}>
                {plan.title}
              </h3>

              {/* Price */}
              <div style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#86ff00',
                marginBottom: '25px',
                lineHeight: '1'
              }}>
                {plan.price}
              </div>

              {/* Features */}
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 30px 0',
                flex: 1
              }}>
                {plan.features && plan.features.map((feature, index) => (
                  <li key={index} style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #222',
                    color: '#ccc',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <span style={{ color: '#86ff00', fontSize: '18px', flexShrink: 0 }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Buy Now Button */}
              <button
                onClick={() => handleCheckout(plan, tabName)}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: '50px',
                  border: 'none',
                  background: plan.show_badge ? '#86ff00' : 'linear-gradient(135deg, #86ff00 0%, #6bc700 100%)',
                  color: '#000',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 5px 20px rgba(134, 255, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
