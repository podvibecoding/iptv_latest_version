'use client'
import React, { useEffect, useRef, useState } from 'react'
import { getApiUrl } from '../lib/config'

function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!target) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const current = Math.floor(progress * target)
      setValue(current)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

function StatItem({ stat, started }) {
  const value = started ? parseInt(stat.stat_value) : 0
  const animatedValue = useCountUp(value, 1800)
  
  return (
    <div className="stat-item">
      <h2><span data-stat={stat.stat_key}>{animatedValue}K</span></h2>
      <p>{stat.stat_label}</p>
    </div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/stats?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load stats:', e.message)
        setStats([])
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      })
    }, { threshold: 0.4 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  if (loading) {
    return (
      <section className="stats" ref={ref}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading statistics...
        </div>
      </section>
    )
  }

  if (stats.length === 0) {
    return null // Don't show section if no stats
  }

  return (
    <section className="stats" ref={ref}>
      {stats.map((stat) => (
        <StatItem key={stat.id} stat={stat} started={started} />
      ))}
    </section>
  )
}
