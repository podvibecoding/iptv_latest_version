import './admin-alerts.css'

export const metadata = {
  title: {
    default: 'Admin Panel - IPTV ACCESS',
    template: '%s | Admin Panel - IPTV ACCESS'
  },
  description: 'Admin panel for managing IPTV ACCESS website content, settings, and subscriptions.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AdminLayout({ children }) {
  return children
}
