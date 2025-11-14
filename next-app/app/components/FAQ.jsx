'use client'
import React, { useEffect, useState } from 'react'
import { getApiUrl } from '../lib/config'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [heading, setHeading] = useState('Frequently Asked Questions')

  useEffect(() => {
    const loadHeading = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/sections/faq`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeading(data.heading || 'Frequently Asked Questions')
        }
      } catch (error) {
        // Use default heading on error
      }
    }
    loadHeading()
  }, [])

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/faqs?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (!res.ok) throw new Error('Failed to fetch FAQs')
        const data = await res.json()
        // Backend returns { success: true, faqs: [...] }
        setFaqs(data.success && Array.isArray(data.faqs) ? data.faqs : [])
      } catch (e) {
        console.error('Failed to load FAQs:', e.message)
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }
    loadFaqs()
  }, [])

  const toggle = (index) => setOpenIndex(openIndex === index ? null : index)

  if (loading) {
    return (
      <section className="faq" id="faq">
        <div className="container">
          <h2>{heading}</h2>
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Loading FAQs...
          </div>
        </div>
      </section>
    )
  }

  if (faqs.length === 0) {
    return (
      <section className="faq" id="faq">
        <div className="container">
          <h2>{heading}</h2>
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>No FAQs available at the moment.</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>Please check back later or contact support.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="faq" id="faq">
      <div className="container">
        <h2>{heading}</h2>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggle(index)} aria-expanded={openIndex === index}>
                <span>{item.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
