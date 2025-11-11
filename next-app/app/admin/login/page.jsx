'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApiUrl } from '../../lib/config'
import Alert from '../components/Alert'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [recovering, setRecovering] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // check if the email is valid format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Use relative URL - Next.js proxy will forward to backend
      const loginUrl = '/api/auth/login'
      console.log('Attempting login to:', loginUrl)
      console.log('Request body:', JSON.stringify({ email, password }))
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      console.log('Response received:', res.status, res.statusText)

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to connect to server. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setError('')
    setSuccess('')
    setRecovering(true)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Recovery failed')
      }

      setSuccess(data.message)
      
      // If default email, clear password field for retry
      if (data.isDefaultEmail) {
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setRecovering(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <div style={{
        background: '#2a2a2a',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #3a3a3a'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          color: '#86ff00',
          fontSize: '28px',
          fontWeight: '800',
          textAlign: 'center'
        }}>
          Admin Panel
        </h1>
        <p style={{ 
          margin: '0 0 30px 0', 
          color: '#999',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Sign in to manage your IPTV website
        </p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@site.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#86ff00'}
              onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #3a3a3a',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#86ff00'}
                onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#86ff00'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye slash icon (hide password)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye icon (show password)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: loading ? '#555' : '#86ff00',
              color: '#000',
              fontSize: '16px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#75e600'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#86ff00'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleRecoverPassword}
          disabled={recovering || !email}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #3a3a3a',
            background: 'transparent',
            color: (recovering || !email) ? '#666' : '#86ff00',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (recovering || !email) ? 'not-allowed' : 'pointer',
            marginTop: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!recovering && email) {
              e.target.style.background = '#1a1a1a'
              e.target.style.borderColor = '#86ff00'
            }
          }}
          onMouseLeave={(e) => {
            if (!recovering && email) {
              e.target.style.background = 'transparent'
              e.target.style.borderColor = '#3a3a3a'
            }
          }}
        >
          {recovering ? 'Recovering...' : 'Recover Password'}
        </button>

        <p style={{ 
          marginTop: '16px', 
          color: '#666', 
          fontSize: '12px', 
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          If you forgot your password: <br/>Enter your email above and click “Recover Password” to reset your password.
        </p>

        <p style={{ 
          marginTop: '12px', 
          color: '#666', 
          fontSize: '13px', 
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Need help? Contact your system administrator.
        </p>
      </div>
    </div>
  )
}
