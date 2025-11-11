'use client'
import { useState, useEffect } from 'react'
import Alert from '../components/Alert'
import ConfirmDialog from '../components/ConfirmDialog'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl, getApiBase } from '../../lib/config'
import { FaChartLine, FaLock, FaCog, FaDollarSign, FaQuestionCircle, FaDoorOpen, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit, FaTrash, FaMobileAlt, FaInfoCircle, FaSave, FaTimes, FaCircle, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaBlog } from 'react-icons/fa'
import Toast from '../../components/Toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState(() => {
    // Initialize from localStorage or default to 'analytics'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminActiveSection') || 'analytics'
    }
    return 'analytics'
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Analytics state
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [googleMeasurementId, setGoogleMeasurementId] = useState('')
  const [liveVisitors, setLiveVisitors] = useState(0)
  const [analyticsMessage, setAnalyticsMessage] = useState('')

  // Settings state
  const [logoUrl, setLogoUrl] = useState('')
  const [logoText, setLogoText] = useState('')
  const [useLogoImage, setUseLogoImage] = useState(true)
  const [logoWidth, setLogoWidth] = useState(150)
  const [faviconUrl, setFaviconUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [heroHeading, setHeroHeading] = useState('')
  const [heroParagraph, setHeroParagraph] = useState('')
  const [supportedDevicesParagraph, setSupportedDevicesParagraph] = useState('')
  const [siteTitle, setSiteTitle] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  
  // Account settings state
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Plans state
  const [plans, setPlans] = useState([])
  const [deviceTabs, setDeviceTabs] = useState([])
  const [activeTab, setActiveTab] = useState('1')
  const [newTabName, setNewTabName] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    type: '', // 'tab' or 'plan'
    id: null, 
    name: '',
    action: null 
  })
  
  // FAQs state
  const [faqs, setFaqs] = useState([])
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadSettings()
      loadPlans()
      loadDeviceTabs()
      loadFaqs()
      loadAccountInfo()
      loadAnalytics()
      
      const interval = setInterval(loadAnalytics, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  // Expose toast function for child components
  useEffect(() => {
    window.showDashboardToast = (message, type = 'info') => {
      setToast({ message, type })
    }
    return () => {
      delete window.showDashboardToast
    }
  }, [])

  // Persist active section to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminActiveSection', activeSection)
    }
  }, [activeSection])

  const checkAuth = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/auth/check`, {
        credentials: 'include'
      })
      const data = await res.json()
      
      if (!data.authenticated) {
        router.push('/admin/login')
        return
      }
      
      setAuthenticated(true)
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadAccountInfo = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/account/info`, {
        credentials: 'include'
      })
      const data = await res.json()
      setCurrentEmail(data.email || '')
    } catch (error) {
      console.error('Failed to load account info:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/analytics/realtime`, {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.activeUsers !== undefined) {
        setLiveVisitors(data.activeUsers)
      }
      if (data.message) {
        setAnalyticsMessage(data.message)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/settings`)
      const data = await res.json()
      setLogoUrl(data.logo_url || '')
      setLogoText(data.logo_text || '')
      setUseLogoImage(data.use_logo_image !== false)
      setLogoWidth(data.logo_width || 150)
      setFaviconUrl(data.favicon_url || '')
      setContactEmail(data.contact_email || '')
      setWhatsappNumber(data.whatsapp_number || '')
      setHeroHeading(data.hero_heading || '')
      setHeroParagraph(data.hero_paragraph || '')
      setSupportedDevicesParagraph(data.supported_devices_paragraph || '')
      setGoogleAnalyticsId(data.google_analytics_id || '')
      setGoogleMeasurementId(data.google_analytics_measurement_id || '')
      setSiteTitle(data.site_title || '')
      setSiteDescription(data.site_description || '')
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadPlans = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans`)
      const data = await res.json()
      setPlans(data)
    } catch (error) {
      console.error('Failed to load plans:', error)
    }
  }

  const loadDeviceTabs = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/device-tabs`)
      const data = await res.json()
      setDeviceTabs(data)
      if (data.length > 0 && !data.includes(activeTab)) {
        setActiveTab(data[0])
      }
    } catch (error) {
      console.error('Failed to load device tabs:', error)
    }
  }

  const addDeviceTab = async () => {
    if (!newTabName.trim()) {
      showMessage('error', 'Please enter a tab name')
      return
    }

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/device-tabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tabName: newTabName.trim() })
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      showMessage('success', 'Device tab created successfully!')
      setNewTabName('')
      loadDeviceTabs()
      loadPlans()
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const deleteDeviceTab = async (tab) => {
    setConfirmDialog({
      isOpen: true,
      type: 'tab',
      id: tab,
      name: tab,
      action: confirmDeleteTab
    })
  }

  const confirmDeleteTab = async () => {
    const tab = confirmDialog.id
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/device-tabs/${tab}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      showMessage('success', 'Device tab deleted successfully!')
      loadDeviceTabs()
      loadPlans()
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const renameDeviceTab = async (oldTab, newTabName) => {
    if (!newTabName.trim()) {
      showMessage('error', 'Please enter a new tab name')
      return
    }

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/device-tabs/${oldTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newTabName: newTabName.trim() })
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      showMessage('success', 'Device tab renamed successfully!')
      loadDeviceTabs()
      loadPlans()
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const apiUrl = getApiUrl()
      const apiBase = getApiBase()
      const res = await fetch(`${apiUrl}/upload/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      const fullUrl = `${apiBase}${data.url}`
      setLogoUrl(fullUrl)
      showMessage('success', 'Logo uploaded successfully! Click Save Settings to apply.')
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('favicon', file)

    try {
      const apiUrl = getApiUrl()
      const apiBase = getApiBase()
      const res = await fetch(`${apiUrl}/upload/favicon`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      const fullUrl = `${apiBase}${data.url}`
      setFaviconUrl(fullUrl)
      showMessage('success', 'Favicon uploaded successfully! Click Save Settings to apply.')
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          logo_url: logoUrl,
          logo_text: logoText,
          use_logo_image: useLogoImage,
          logo_width: parseInt(logoWidth) || 150,
          contact_email: contactEmail,
          whatsapp_number: whatsappNumber,
          favicon_url: faviconUrl,
          hero_heading: heroHeading,
          hero_paragraph: heroParagraph,
          supported_devices_paragraph: supportedDevicesParagraph,
          google_analytics_id: googleAnalyticsId,
          google_analytics_measurement_id: googleMeasurementId,
          site_title: siteTitle,
          site_description: siteDescription
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      showMessage('success', 'Settings saved successfully!')
    } catch (error) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateEmail = async () => {
    setSaving(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/account/update-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newEmail, currentPassword: emailPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      showMessage('success', data.message + ' Logging out...')
      
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } catch (error) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setSaving(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/account/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      showMessage('success', data.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const updatePlan = async (planId, updates) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const updatedPlan = await res.json()
      setPlans(plans.map(p => p.id === planId ? updatedPlan : p))
      showMessage('success', 'Plan updated successfully!')
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const addPlan = async (deviceTab, planData) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          device_tab: deviceTab,
          ...planData
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const newPlan = await res.json()
      setPlans([...plans, newPlan])
      showMessage('success', 'Plan added successfully!')
      loadPlans() // Reload to ensure correct order
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const deletePlan = async (planId, planName) => {
    setConfirmDialog({
      isOpen: true,
      type: 'plan',
      id: planId,
      name: planName,
      action: confirmDeletePlan
    })
  }

  const confirmDeletePlan = async () => {
    const planId = confirmDialog.id
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setPlans(plans.filter(p => p.id !== planId))
      showMessage('success', 'Plan deleted successfully!')
    } catch (error) {
      showMessage('error', error.message)
    }
  }

  const loadFaqs = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/faqs`)
      const data = await res.json()
      setFaqs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load FAQs:', e)
    }
  }

  const addFaq = async () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      showMessage('error', 'Please fill question and answer')
      return
    }
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: newFaqQ.trim(), answer: newFaqA.trim() })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add FAQ')
      }
      const created = await res.json()
      setFaqs(prev => [...prev, created].sort((a,b) => (a.display_order - b.display_order) || (a.id - b.id)))
      setNewFaqQ('')
      setNewFaqA('')
      showMessage('success', 'FAQ added')
    } catch (e) {
      showMessage('error', e.message)
    }
  }

  const updateFaq = async (id, updates) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update FAQ')
      }
      const updated = await res.json()
      setFaqs(prev => prev.map(f => f.id === id ? updated : f))
      showMessage('success', 'FAQ updated')
    } catch (e) {
      showMessage('error', e.message)
    }
  }

  const deleteFaq = async (id) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/faqs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete FAQ')
      }
      setFaqs(prev => prev.filter(f => f.id !== id))
      showMessage('success', 'FAQ deleted')
    } catch (e) {
      showMessage('error', e.message)
    }
  }

  const handleLogout = async () => {
    const apiUrl = getApiUrl()
    await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    router.push('/admin/login')
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const filteredPlans = plans.filter(p => p.device_tab === activeTab)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
        <p style={{ color: '#86ff00', fontSize: '20px' }}>Loading...</p>
      </div>
    )
  }

  if (!authenticated) return null

  const menuItems = [
    { id: 'analytics', icon: <FaChartLine />, label: 'Analytics' },
    { id: 'account', icon: <FaLock />, label: 'Account Settings' },
    { id: 'site', icon: <FaCog />, label: 'Site Settings' },
    { id: 'pricing', icon: <FaDollarSign />, label: 'Pricing Plans' },
    { id: 'faqs', icon: <FaQuestionCircle />, label: 'FAQs' },
    { id: 'blogs', icon: <FaBlog />, label: 'Blog Management', isLink: true, href: '/admin/blogs/manage' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Sidebar - COMPLETE SIDEBAR CODE WILL BE IN THE ACTUAL FILE */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRight: '1px solid #2a2a2a',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, color: '#86ff00', fontSize: '20px', fontWeight: '800' }}>
              ADMIN PANEL
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a3a',
              color: '#86ff00',
              padding: '8px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: '1'
            }}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          {menuItems.map(item => (
            item.isLink ? (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  width: '100%',
                  padding: sidebarOpen ? '14px 20px' : '14px 0',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '4px solid transparent',
                  color: '#999',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%',
                  padding: sidebarOpen ? '14px 20px' : '14px 0',
                  background: activeSection === item.id ? 'rgba(134, 255, 0, 0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: activeSection === item.id ? '4px solid #86ff00' : '4px solid transparent',
                  color: activeSection === item.id ? '#86ff00' : '#999',
                  fontSize: '15px',
                  fontWeight: activeSection === item.id ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          ))}
        </nav>

        <div style={{
          padding: '20px',
          borderTop: '1px solid #2a2a2a'
        }}>
          {sidebarOpen && (
            <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px' }}>
              <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>Logged in as:</div>
              <div style={{ color: '#86ff00', fontSize: '14px', fontWeight: '600', wordBreak: 'break-all' }}>
                {currentEmail}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #8b1e1e',
              background: 'transparent',
              color: '#ff6666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaDoorOpen />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s ease',
        padding: '40px 40px',
        overflowY: 'auto'
      }}>
        {message.text && (
          <Alert 
            type={message.type === 'success' ? 'success' : 'error'} 
            message={message.text}
            onClose={() => setMessage({ text: '', type: '' })}
          />
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <AnalyticsSection 
            liveVisitors={liveVisitors}
            analyticsMessage={analyticsMessage}
            googleAnalyticsId={googleAnalyticsId}
            setGoogleAnalyticsId={setGoogleAnalyticsId}
            googleMeasurementId={googleMeasurementId}
            setGoogleMeasurementId={setGoogleMeasurementId}
            saveSettings={saveSettings}
            saving={saving}
          />
        )}

        {/* Account Settings Section */}
        {activeSection === 'account' && (
          <AccountSection
            currentEmail={currentEmail}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            emailPassword={emailPassword}
            setEmailPassword={setEmailPassword}
            updateEmail={updateEmail}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            changePassword={changePassword}
            saving={saving}
          />
        )}

        {/* Site Settings Section */}
        {activeSection === 'site' && (
          <SiteSettingsSection
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            whatsappNumber={whatsappNumber}
            setWhatsappNumber={setWhatsappNumber}
            useLogoImage={useLogoImage}
            setUseLogoImage={setUseLogoImage}
            logoUrl={logoUrl}
            handleLogoUpload={handleLogoUpload}
            logoWidth={logoWidth}
            setLogoWidth={setLogoWidth}
            logoText={logoText}
            setLogoText={setLogoText}
            faviconUrl={faviconUrl}
            handleFaviconUpload={handleFaviconUpload}
            heroHeading={heroHeading}
            setHeroHeading={setHeroHeading}
            heroParagraph={heroParagraph}
            setHeroParagraph={setHeroParagraph}
            supportedDevicesParagraph={supportedDevicesParagraph}
            setSupportedDevicesParagraph={setSupportedDevicesParagraph}
            siteTitle={siteTitle}
            setSiteTitle={setSiteTitle}
            siteDescription={siteDescription}
            setSiteDescription={setSiteDescription}
            saveSettings={saveSettings}
            saving={saving}
          />
        )}

        {/* Pricing Plans Section */}
        {activeSection === 'pricing' && (
          <PricingSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            deviceTabs={deviceTabs}
            newTabName={newTabName}
            setNewTabName={setNewTabName}
            addDeviceTab={addDeviceTab}
            deleteDeviceTab={deleteDeviceTab}
            renameDeviceTab={renameDeviceTab}
            filteredPlans={filteredPlans}
            updatePlan={updatePlan}
            addPlan={addPlan}
            deletePlan={deletePlan}
          />
        )}

        {/* FAQs Section */}
        {activeSection === 'faqs' && (
          <FaqsSection
            faqs={faqs}
            newFaqQ={newFaqQ}
            setNewFaqQ={setNewFaqQ}
            newFaqA={newFaqA}
            setNewFaqA={setNewFaqA}
            addFaq={addFaq}
            updateFaq={updateFaq}
            deleteFaq={deleteFaq}
          />
        )}
      </div>
    </div>
  )
}

// Analytics Section Component
function AnalyticsSection({ liveVisitors, analyticsMessage, googleAnalyticsId, setGoogleAnalyticsId, googleMeasurementId, setGoogleMeasurementId, saveSettings, saving }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaChartLine /> Analytics Dashboard
      </h1>

      {/* Live Visitors Counter */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '50px',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '2px solid #86ff00',
        textAlign: 'center'
      }}>
        <div style={{ color: '#999', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <FaCircle color="#ff0000" size={10} /> Live Visitors Right Now
        </div>
        <div style={{ color: '#86ff00', fontSize: '72px', fontWeight: '900', lineHeight: '1', marginBottom: '16px' }}>
          {liveVisitors}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Active users on your website
        </div>
        {analyticsMessage && (
          <div style={{ marginTop: '24px' }}>
            <Alert type="info" message={analyticsMessage} />
          </div>
        )}
      </div>

      {/* Analytics Configuration */}
      <div style={{
        background: '#1a1a1a',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #2a2a2a',
        marginBottom: '32px'
      }}>
        <h3 style={{ margin: '0 0 24px 0', color: '#fff', fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCog /> Analytics Configuration
        </h3>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
            Google Analytics 4 Property ID
          </label>
          <input
            type="text"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            placeholder="123456789"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#0f0f0f',
              color: '#fff',
              fontSize: '15px',
              fontFamily: 'monospace'
            }}
          />
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
            Your GA4 Property ID (used for API access). Find it in Google Analytics → Admin → Property Settings
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
            Google Analytics 4 Measurement ID
          </label>
          <input
            type="text"
            value={googleMeasurementId}
            onChange={(e) => setGoogleMeasurementId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#0f0f0f',
              color: '#fff',
              fontSize: '15px',
              fontFamily: 'monospace'
            }}
          />
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
            Your GA4 Measurement ID (starts with G-). Find it in Google Analytics → Admin → Data Streams → Web
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            border: 'none',
            background: saving ? '#555' : '#86ff00',
            color: '#000',
            fontSize: '16px',
            fontWeight: '800',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {saving ? 'Saving...' : 'Save Analytics Settings'}
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {[
          { label: "Today's Visitors", value: '-' },
          { label: 'Page Views', value: '-' },
          { label: 'Avg. Session', value: '-' },
          { label: 'Bounce Rate', value: '-' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#1a1a1a',
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid #2a2a2a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#666', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
            <div style={{ color: '#fff', fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
              {stat.value}
            </div>
            <div style={{ color: '#888', fontSize: '11px' }}>
              Enable API for data
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Account Settings Section Component
function AccountSection({ currentEmail, newEmail, setNewEmail, emailPassword, setEmailPassword, updateEmail, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changePassword, saving }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaLock /> Account Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Change Email */}
        <div style={{
          background: '#1a1a1a',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #2a2a2a'
        }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>
            Change Email
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Current Email
            </label>
            <input
              type="email"
              value={currentEmail}
              disabled
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0a0a0a',
                color: '#666',
                fontSize: '15px',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              New Email *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new-email@example.com"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Current Password *
            </label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <button
            onClick={updateEmail}
            disabled={saving || !newEmail || !emailPassword}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: (saving || !newEmail || !emailPassword) ? '#555' : '#86ff00',
              color: '#000',
              fontSize: '15px',
              fontWeight: '700',
              cursor: (saving || !newEmail || !emailPassword) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Updating...' : 'Update Email'}
          </button>
          <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#ffa500', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaExclamationTriangle /> You will be logged out after changing your email
          </p>
        </div>

        {/* Change Password */}
        <div style={{
          background: '#1a1a1a',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #2a2a2a'
        }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>
            Change Password
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              New Password * (min 8 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <button
            onClick={changePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: (saving || !currentPassword || !newPassword || !confirmPassword) ? '#555' : '#86ff00',
              color: '#000',
              fontSize: '15px',
              fontWeight: '700',
              cursor: (saving || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Site Settings Section Component  
function SiteSettingsSection({ contactEmail, setContactEmail, whatsappNumber, setWhatsappNumber, useLogoImage, setUseLogoImage, logoUrl, handleLogoUpload, logoWidth, setLogoWidth, logoText, setLogoText, faviconUrl, handleFaviconUpload, heroHeading, setHeroHeading, heroParagraph, setHeroParagraph, supportedDevicesParagraph, setSupportedDevicesParagraph, siteTitle, setSiteTitle, siteDescription, setSiteDescription, saveSettings, saving }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaCog /> Site Settings
      </h1>

      <div style={{
        background: '#1a1a1a',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #2a2a2a'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Contact Email (Public)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>
              Displayed on your website footer
            </p>
          </div>

          <div>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              WhatsApp Number
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+1 555 123 4567"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>
            Logo Type
          </label>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ddd', fontSize: '15px' }}>
              <input
                type="radio"
                name="logoType"
                checked={useLogoImage}
                onChange={() => setUseLogoImage(true)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span>Image Logo</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ddd', fontSize: '15px' }}>
              <input
                type="radio"
                name="logoType"
                checked={!useLogoImage}
                onChange={() => setUseLogoImage(false)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span>Text Logo</span>
            </label>
          </div>

          {useLogoImage ? (
            <div>
              <label style={{ display: 'block', color: '#ddd', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
                Upload Logo Image
              </label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" style={{ height: '60px', width: 'auto', borderRadius: '8px', border: '1px solid #3a3a3a' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ color: '#ddd', fontSize: '14px' }}
                />
              </div>
              <p style={{ color: '#888', fontSize: '12px', margin: '0 0 20px 0' }}>
                Supported formats: PNG, JPG, GIF, WebP, SVG, BMP, ICO, TIFF (Max 5MB)
              </p>
              <div>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                  Logo Width (pixels)
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={logoWidth}
                  onChange={(e) => setLogoWidth(e.target.value)}
                  placeholder="150"
                  style={{
                    width: '200px',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a',
                    background: '#0f0f0f',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                />
                <p style={{ color: '#888', fontSize: '12px', margin: '10px 0 0 0' }}>
                  Recommended: 100-250px
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                Logo Text
              </label>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="Enter your site name"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #3a3a3a',
                  background: '#0f0f0f',
                  color: '#fff',
                  fontSize: '15px'
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '12px', fontSize: '15px', fontWeight: '600' }}>
            Favicon
          </label>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px 0' }}>
            Upload a custom favicon for your website. This icon appears in browser tabs and bookmarks.
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '12px' }}>
            {faviconUrl && (
              <img src={faviconUrl} alt="Favicon" style={{ height: '32px', width: '32px', borderRadius: '4px', border: '1px solid #3a3a3a' }} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFaviconUpload}
              style={{ color: '#ddd', fontSize: '14px' }}
            />
          </div>
          <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>
            Supported formats: All image formats (ICO, PNG, SVG, JPG, GIF, WebP, BMP, TIFF, AVIF, etc.) - Max 5MB
          </p>
        </div>

        <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '12px', fontSize: '15px', fontWeight: '600' }}>
            Hero Settings
          </label>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px 0' }}>
            Customize the heading and paragraph text displayed on your homepage hero section.
          </p>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(134, 255, 0, 0.1), rgba(134, 255, 0, 0.05))', 
            border: '1px solid rgba(134, 255, 0, 0.2)', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '20px' 
          }}>
            <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: '600' }}>
              To Highlight Important Words:
            </p>
            <p style={{ color: '#b0b0b0', fontSize: '12px', margin: '0', lineHeight: '1.6' }}>
              <span style={{fontWeight: '600' }}>green accent color</span> Wrap them with:<br/>
              <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                &lt;span class="accent"&gt;Your Word&lt;/span&gt;
              </code>
              <br/>
              Example: <span style={{ color: '#ddd' }}>pod developer</span> <span style={{ color: '#86ff00' }}>Premium</span> <span style={{ color: '#ddd' }}>websites</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Hero Heading
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="TITAN IPTV <span class=&quot;accent&quot;>Premium</span> TV Service"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
            <p style={{ color: '#666', fontSize: '11px', margin: '6px 0 0 0', fontStyle: 'italic' }}>
              You can also use &lt;br/&gt; for line breaks
            </p>
          </div>

          <div>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Hero Paragraph
            </label>
            <textarea
              value={heroParagraph}
              onChange={(e) => setHeroParagraph(e.target.value)}
              placeholder="Enjoy premium TV with Titan IPTV. Access a wide range of channels and exclusive content..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '12px', fontSize: '15px', fontWeight: '600' }}>
            Supported Devices Section
          </label>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px 0' }}>
            Customize the paragraph text displayed in the Supported Devices section below FAQs.
          </p>
          
          <div>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Supported Devices Paragraph
            </label>
            <textarea
              value={supportedDevicesParagraph}
              onChange={(e) => setSupportedDevicesParagraph(e.target.value)}
              placeholder="Watch your favorite content on any device, anywhere. Our IPTV service is compatible with..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* SEO Settings Section */}
        <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>
            SEO Settings
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Website Title
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="IPTV ACCESS - Best IPTV Service Provider"
              maxLength={255}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>
              Appears in browser tab and search results (Max 255 characters)
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
              Website Description
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Get the best IPTV subscription with access to thousands of channels, movies, and sports events. Enjoy crystal-clear HD streaming on any device."
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>
              Shown in search engine results and social media previews
            </p>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            border: 'none',
            background: saving ? '#555' : '#86ff00',
            color: '#000',
            fontSize: '16px',
            fontWeight: '800',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Site Settings'}
        </button>
      </div>
    </div>
  )
}

// Pricing Plans Section Component
function PricingSection({ activeTab, setActiveTab, deviceTabs, newTabName, setNewTabName, addDeviceTab, deleteDeviceTab, renameDeviceTab, filteredPlans, updatePlan, addPlan, deletePlan }) {
  const [showAddTab, setShowAddTab] = useState(false)
  const [editingTab, setEditingTab] = useState(null)
  const [editTabName, setEditTabName] = useState('')
  const [showAddPlan, setShowAddPlan] = useState(false)

  const startEditingTab = (tab) => {
    setEditingTab(tab)
    setEditTabName(tab)
  }

  const saveTabRename = async () => {
    if (editingTab && editTabName.trim()) {
      await renameDeviceTab(editingTab, editTabName.trim())
      setEditingTab(null)
      setEditTabName('')
    }
  }

  const cancelEditingTab = () => {
    setEditingTab(null)
    setEditTabName('')
  }

  const handleAddPlan = async (planData) => {
    await addPlan(activeTab, planData)
    setShowAddPlan(false)
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaDollarSign /> Pricing Plans
      </h1>

      {/* Tab Management Section */}
      <div style={{
        background: '#1a1a1a',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #2a2a2a',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAddTab ? '20px' : '0' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMobileAlt /> Manage Device Tabs
          </h3>
          <button
            onClick={() => setShowAddTab(!showAddTab)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: showAddTab ? '#666' : '#86ff00',
              color: showAddTab ? '#fff' : '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showAddTab ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Tab</>}
          </button>
        </div>

        {showAddTab && (
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '20px',
            background: '#0f0f0f',
            borderRadius: '8px',
            border: '1px solid #3a3a3a'
          }}>
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="Enter tab name (e.g., 1 Device, 2 Devices, Unlimited, Premium)"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addDeviceTab()}
            />
            <button
              onClick={addDeviceTab}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                background: '#86ff00',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Create Tab
            </button>
          </div>
        )}

        {/* Current Tabs List */}
        <div style={{ marginTop: '20px' }}>
          <p style={{ margin: '0 0 12px 0', color: '#888', fontSize: '13px' }}>
            Current device tabs ({deviceTabs.length}):
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {deviceTabs.map(tab => (
              <div
                key={tab}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#0f0f0f',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
              >
                {editingTab === tab ? (
                  <>
                    <input
                      type="text"
                      value={editTabName}
                      onChange={(e) => setEditTabName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #86ff00',
                        background: '#1a1a1a',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && saveTabRename()}
                      autoFocus
                    />
                    <button
                      onClick={saveTabRename}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#86ff00',
                        color: '#000',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditingTab}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #666',
                        background: 'transparent',
                        color: '#999',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {tab}
                    </span>
                    <button
                      onClick={() => startEditingTab(tab)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #3a3a3a',
                        background: 'transparent',
                        color: '#86ff00',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => deleteDeviceTab(tab)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#ff3333',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div style={{
        background: '#1a1a1a',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #2a2a2a'
      }}>
        {/* Header with Tabs and Add Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #2a2a2a', paddingBottom: '16px' }}>
          {/* Device Tabs Navigation */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {deviceTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  background: activeTab === tab ? '#86ff00' : '#2a2a2a',
                  color: activeTab === tab ? '#000' : '#fff',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Add New Plan Button */}
          <button
            onClick={() => setShowAddPlan(!showAddPlan)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: showAddPlan ? '#666' : '#86ff00',
              color: showAddPlan ? '#fff' : '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showAddPlan ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Plan</>}
          </button>
        </div>

        {/* Add New Plan Form */}
        {showAddPlan && (
          <AddPlanForm 
            onAdd={handleAddPlan} 
            onCancel={() => setShowAddPlan(false)} 
          />
        )}

        {/* Plans List */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredPlans.length > 0 ? (
            filteredPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onUpdate={updatePlan} onDelete={deletePlan} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                No plans found for "{activeTab}".
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                Click "Add New Plan" to create a plan for this tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add Plan Form Component
function AddPlanForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [features, setFeatures] = useState('')
  const [featured, setFeatured] = useState(false)
  const [buyLink, setBuyLink] = useState('')
  const [useWhatsApp, setUseWhatsApp] = useState(false)

  const handleSubmit = () => {
    if (!name.trim() || !price.trim()) {
      // Pass toast setter function to parent component
      if (window.showDashboardToast) {
        window.showDashboardToast('Please enter plan name and price', 'warning')
      }
      return
    }

    const featureLines = features
      .split(/\r?\n/)
      .map(f => f.trim())
      .filter(Boolean)

    onAdd({
      name: name.trim(),
      price: price.trim(),
      features: featureLines,
      is_featured: featured,
      buy_link: buyLink.trim() || null,
      use_whatsapp: useWhatsApp,
      display_order: 0
    })

    // Reset form
    setName('')
    setPrice('')
    setFeatures('')
    setFeatured(false)
    setBuyLink('')
    setUseWhatsApp(false)
  }

  return (
    <div style={{
      background: '#0f0f0f',
      padding: '24px',
      borderRadius: '12px',
      border: '2px solid #86ff00',
      marginBottom: '24px'
    }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#86ff00', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaPlus /> Add New Plan
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Plan Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 1 Month, 3 Months, 12 Months"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '15px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Price *
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $10.99"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '15px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Show "Popular" Badge
          </label>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            style={{ width: '24px', height: '24px', marginTop: '12px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
          Buy Now Link (URL)
        </label>
        <input
          type="url"
          value={buyLink}
          onChange={(e) => setBuyLink(e.target.value)}
          placeholder="https://example.com/checkout"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #3a3a3a',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', padding: '12px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #3a3a3a' }}>
          <input
            type="checkbox"
            id="useWhatsApp"
            checked={useWhatsApp}
            onChange={(e) => setUseWhatsApp(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#86ff00' }}
          />
          <label htmlFor="useWhatsApp" style={{ color: '#ddd', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#25D366', fontSize: '18px' }}></span>
            Use WhatsApp as Buy Now button
          </label>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
          {useWhatsApp ? '✓ Button will show "Buy Now" with WhatsApp icon' : 'Check this to use your WhatsApp number instead of a URL'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
          Features (one per line)
        </label>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaInfoCircle /> <strong>Tip:</strong> Write each feature on a new line. They will automatically be formatted as bullet points.
        </p>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder={'SD / HD / FHD / 4K Streams\n40,000+ Live Channels\n54,000+ VOD\nVIP & Premium Channels\nAnti-buffering Technology\n24/7 Support'}
          rows={8}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #3a3a3a',
            background: '#1a1a1a',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '12px 28px',
            borderRadius: '8px',
            border: 'none',
            background: '#86ff00',
            color: '#000',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          Add Plan
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 28px',
            borderRadius: '8px',
            border: '1px solid #3a3a3a',
            background: 'transparent',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Plan Card Component
function PlanCard({ plan, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(plan.price)
  const [featured, setFeatured] = useState(plan.is_featured)
  const [features, setFeatures] = useState(plan.features.join('\n'))
  const [buyLink, setBuyLink] = useState(plan.buy_link || '')
  const [useWhatsApp, setUseWhatsApp] = useState(plan.use_whatsapp || false)

  const handleSave = () => {
    // Split by newlines and clean up each feature
    const featureLines = features
      .split(/\r?\n/) // Handle both \n and \r\n
      .map(f => f.trim())
      .filter(Boolean) // Remove empty lines
    
    onUpdate(plan.id, {
      name,
      price,
      is_featured: featured,
      features: featureLines,
      buy_link: buyLink || null,
      use_whatsapp: useWhatsApp
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(plan.name)
    setPrice(plan.price)
    setFeatured(plan.is_featured)
    setFeatures(plan.features.join('\n'))
    setBuyLink(plan.buy_link || '')
    setUseWhatsApp(plan.use_whatsapp || false)
    setEditing(false)
  }

  return (
    <div style={{
      background: '#0f0f0f',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #2a2a2a'
    }}>
      {editing ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3a3a3a',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '15px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3a3a3a',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '15px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                Show "Popular" Badge
              </label>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: '24px', height: '24px', marginTop: '12px', cursor: 'pointer' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Buy Now Link (URL)</label>
            <input
              type="url"
              value={buyLink}
              onChange={(e) => setBuyLink(e.target.value)}
              placeholder="https://example.com/checkout"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', padding: '12px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #3a3a3a' }}>
              <input
                type="checkbox"
                id={`useWhatsApp-${plan.id}`}
                checked={useWhatsApp}
                onChange={(e) => setUseWhatsApp(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#86ff00' }}
              />
              <label htmlFor={`useWhatsApp-${plan.id}`} style={{ color: '#ddd', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#25D366', fontSize: '18px' }}></span>
                Use WhatsApp as Buy Now button
              </label>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
              {useWhatsApp ? '✓ Button will show "Buy Now" with WhatsApp icon' : 'Check this to use your WhatsApp number instead of a URL'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ddd', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
              Features (one per line)
            </label>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
              💡 <strong>Tip:</strong> Write each feature on a new line. They will automatically be formatted as bullet points.
            </p>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={'SD / HD / FHD / 4K Streams\n40,000+ Live Channels\n54,000+ VOD\nVIP & Premium Channels\nAnti-buffering Technology\n24/7 Support'}
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#1a1a1a',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'vertical'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#666' }}>
              Example: Each line = one bullet point in the pricing card
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#86ff00',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Save
            </button>
            <button onClick={handleCancel} style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: 'transparent',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                {plan.name}
                {plan.is_featured && (
                  <span style={{
                    marginLeft: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#86ff00',
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    POPULAR
                  </span>
                )}
              </h3>
              <p style={{ margin: '0 0 16px 0', color: '#86ff00', fontSize: '28px', fontWeight: '900' }}>
                {plan.price}
              </p>
              {plan.buy_link && (
                <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '13px' }}>
                  <strong style={{ color: '#aaa' }}>Link:</strong>{' '}
                  <a 
                    href={plan.buy_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#86ff00', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {plan.buy_link.length > 60 ? plan.buy_link.substring(0, 60) + '...' : plan.buy_link}
                  </a>
                </p>
              )}
              <ul style={{ margin: 0, padding: '0 0 0 24px', color: '#aaa', fontSize: '14px', lineHeight: '1.8' }}>
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #3a3a3a',
                  background: '#1a1a1a',
                  color: '#86ff00',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(plan.id, plan.name)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #8b1e1e',
                  background: 'transparent',
                  color: '#ff6666',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// FAQs Section Component
function FaqsSection({ faqs, newFaqQ, setNewFaqQ, newFaqA, setNewFaqA, addFaq, updateFaq, deleteFaq }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', color: '#fff', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaQuestionCircle /> Frequently Asked Questions
      </h1>

      <div style={{
        background: '#1a1a1a',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #2a2a2a'
      }}>
        {/* Add new FAQ */}
        <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #2a2a2a' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px', fontWeight: '700' }}>
            Add New FAQ
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <input
              type="text"
              placeholder="Question"
              value={newFaqQ}
              onChange={e => setNewFaqQ(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px'
              }}
            />
            <textarea
              placeholder="Answer"
              rows={4}
              value={newFaqA}
              onChange={e => setNewFaqA(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
            <div>
              <button
                onClick={addFaq}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#86ff00',
                  color: '#000',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>

        {/* FAQ list */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {faqs.map(faq => (
            <FaqItem key={faq.id} faq={faq} onSave={updateFaq} onDelete={deleteFaq} />
          ))}
        </div>
      </div>
    </div>
  )
}

// FAQ Item Component
function FaqItem({ faq, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(faq.question)
  const [a, setA] = useState(faq.answer)

  const save = () => {
    onSave(faq.id, { question: q, answer: a })
    setEditing(false)
  }

  const cancel = () => {
    setQ(faq.question)
    setA(faq.answer)
    setEditing(false)
  }

  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
      {editing ? (
        <>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#1a1a1a',
              color: '#fff',
              marginBottom: '12px',
              fontSize: '15px'
            }}
          />
          <textarea
            rows={4}
            value={a}
            onChange={e => setA(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#1a1a1a',
              color: '#fff',
              marginBottom: '12px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={save} style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#86ff00',
              color: '#000',
              fontWeight: '800',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Save
            </button>
            <button onClick={cancel} style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: 'transparent',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '10px', fontSize: '16px' }}>{faq.question}</div>
            <div style={{ color: '#cfcfcf', lineHeight: '1.6', fontSize: '14px' }}>{faq.answer}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              background: '#1a1a1a',
              color: '#86ff00',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Edit
            </button>
            <button onClick={() => onDelete(faq.id)} style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #8b1e1e',
              background: 'transparent',
              color: '#ff6666',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Delete
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', id: null, name: '', action: null })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.type === 'tab' ? 'Delete Device Tab' : 'Delete Plan'}
        message={
          confirmDialog.type === 'tab'
            ? `Are you sure you want to delete the "${confirmDialog.name}" device tab? This will delete ALL plans under this tab.`
            : `Are you sure you want to delete the plan "${confirmDialog.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
