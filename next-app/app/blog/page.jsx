import { getApiUrl } from '../lib/config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BlogPageClient from './BlogPageClient'

// Tell Next.js to use dynamic rendering for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBlogs(page = 1) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const apiUrl = getApiUrl()
    const res = await fetch(`${apiUrl}/blogs?page=${page}&limit=9`, {
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    clearTimeout(timeoutId)
    if (!res.ok) throw new Error('Failed to fetch blogs')
    return await res.json()
  } catch (error) {
    // Silent fail - backend not available
    return { blogs: [], pagination: { totalPages: 1, currentPage: 1 } }
  }
}

export default async function BlogPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1
  const data = await getBlogs(page)

  return (
    <>
      <Header />
      <BlogPageClient initialBlogs={data.blogs} initialPage={page} totalPages={data.pagination.totalPages} />
      <Footer />
    </>
  )
}
