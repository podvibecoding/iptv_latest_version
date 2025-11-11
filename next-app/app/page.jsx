import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Streaming from './components/Streaming'
import Movies from './components/Movies'
import SportsEvents from './components/SportsEvents'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import WhyChooseUs from './components/WhyChooseUs'
import WorldChannels from './components/WorldChannels'
import SupportedDevices from './components/SupportedDevices'
import Footer from './components/Footer'
import StructuredData from './components/StructuredData'
import PageLoader from './components/PageLoader'
import { getApiUrl } from './lib/config'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Dynamic metadata that uses admin panel settings
export async function generateMetadata() {
  const settings = await getSettings()
  
  const title = settings.site_title || 'IPTV ACCESS - Best IPTV Service Provider | 40,000+ Live Channels & VOD Streaming'
  const description = settings.site_description || 'Get the best IPTV subscription with IPTV ACCESS. Stream 40,000+ live TV channels, 54,000+ movies & series in HD/4K. Premium IPTV with anti-freeze technology, EPG guide, multi-device support for Smart TV, Android, iOS, Firestick. Free trial available. Affordable IPTV packages starting at $10.99/month.'
  
  return {
    title: title,
    description: description,
    alternates: {
      canonical: 'https://iptv-access.com',
    },
    openGraph: {
      url: 'https://iptv-access.com',
      title: title,
      description: description,
    },
  }
}

async function getSettings() {
  try {
    const apiUrl = getApiUrl()
    const res = await fetch(`${apiUrl}/settings`, {
      cache: 'no-store' // Always get fresh data
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Failed to load settings:', error)
    return null
  }
}

export default async function Page() {
  const settings = await getSettings()

  return (
    <PageLoader>
      <StructuredData />
      <Header />
      <main id="main-content">
        <h1 style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          IPTV ACCESS - Best IPTV Service Provider with 40,000+ Live TV Channels and VOD Streaming
        </h1>
        <Hero settings={settings} />
        <Stats />
        <Streaming />
        <Movies />
        <SportsEvents />
        <Pricing />
        <WhyChooseUs />
        <WorldChannels />
        <FAQ />
        <SupportedDevices settings={settings} />
      </main>
      <Footer />
    </PageLoader>
  )
}
