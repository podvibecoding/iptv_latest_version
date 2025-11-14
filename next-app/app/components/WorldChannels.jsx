'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import worldImg from '../../public/images/images 1 (1).png'
import { getApiUrl } from '../lib/config'

export default function WorldChannels() {
  const [heading, setHeading] = useState('Channels From Every Around the World')

  useEffect(() => {
    const loadHeading = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/sections/channels`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeading(data.heading || 'Channels From Every Around the World')
        }
      } catch (error) {
        // Use default heading on error
      }
    }
    loadHeading()
  }, [])

  return (
    <section className="world-channels">
      <div className="container">
        <h2>{heading}</h2>
        <div className="world-image-wrap">
          {/* Replace the src with your preferred image path */}
          <Image src={worldImg} alt="Channels from around the world" width={641} height={400} className="world-image" />
        </div>
      </div>
    </section>
  )
}
