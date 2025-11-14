'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getApiUrl } from '../lib/config'

export default function SupportedDevices({ settings }) {
  const [heading, setHeading] = useState('Supported Devices')
  const [description, setDescription] = useState('')
  const defaultParagraph = ''

  useEffect(() => {
    const loadSection = async () => {
      try {
        const apiUrl = getApiUrl()
        
        // Load heading from sections
        const resSection = await fetch(`${apiUrl}/sections/devices`, { cache: 'no-store' })
        if (resSection.ok) {
          const dataSection = await resSection.json()
          setHeading(dataSection.heading || 'Supported Devices')
        }
        
        // Load paragraph from settings
        const resSettings = await fetch(`${apiUrl}/settings`, { cache: 'no-store' })
        if (resSettings.ok) {
          const dataSettings = await resSettings.json()
          setDescription(dataSettings.supported_devices_paragraph || defaultParagraph)
        } else {
          setDescription(defaultParagraph)
        }
      } catch (error) {
        // Use default values on error
        setDescription(defaultParagraph)
      }
    }
    loadSection()
  }, [])

  return (
    <section className="supported-devices" style={{ padding: '1rem 0', background: '#0a0a0a' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#fff' }}>
          {heading}
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#b0b0b0', 
          maxWidth: '800px', 
          margin: '0 auto 50px', 
          lineHeight: '1.8' 
        }}>
          {description}
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: '1rem' 
        }}>
          <Image 
            src="/images/Supported-Devices/Suppordted-Devices.png"
            alt="Supported Devices - Smart TV, Android, iOS, Fire Stick, Mac, Windows"
            width={1200}
            height={400}
            style={{ 
              width: '100%', 
              maxWidth: '900px', 
              height: 'auto',
              borderRadius: '12px'
            }}
            priority={false}
          />
        </div>
      </div>
    </section>
  )
}
