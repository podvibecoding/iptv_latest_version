'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl } from '../../lib/config'
import dynamic from 'next/dynamic'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import '@uiw/react-markdown-preview/markdown.css'

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

export default function BlogPostPage() {
  const params = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (params?.slug) {
      loadBlog()
    }
  }, [params?.slug])

  const loadBlog = async () => {
    try {
      setLoading(true)
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/blogs/${params.slug}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Blog post not found')
        } else {
          throw new Error('Failed to fetch blog')
        }
        return
      }
      const data = await res.json()
      // Backend returns { success: true, blog: {...} }
      setBlog(data.blog || data)
    } catch (error) {
      console.error('Error loading blog:', error)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="blog-post-page">
          <div className="container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading blog post...</p>
            </div>
          </div>
        </main>
        <Footer />
      <style jsx>{`
        .blog-post-page {
          min-height: 100vh;
          padding: 120px 0 80px;
          background: var(--bg, #050505);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 3rem;
        }

        .blog-post {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 3rem;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }

        .back-link {
          display: inline-block;
          color: var(--accent, #86ff00);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 2rem;
          transition: opacity 0.3s;
        }

        .back-link:hover {
          opacity: 0.8;
        }

        .post-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .post-header h1 {
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #fff;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #bdbdbd;
          font-size: 0.95rem;
        }

        .separator {
          color: rgba(255, 255, 255, 0.3);
        }

        .featured-image {
          width: 100%;
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .post-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #cfcfcf;
        }

        :global(.post-content h2) {
          font-size: 2rem;
          margin: 2rem 0 1rem;
          color: #fff;
        }

        :global(.post-content h3) {
          font-size: 1.5rem;
          margin: 1.5rem 0 0.75rem;
          color: #fff;
        }

        :global(.post-content p) {
          margin-bottom: 1.5rem;
          color: #cfcfcf;
        }

        :global(.post-content a) {
          color: var(--accent, #86ff00);
          text-decoration: underline;
        }

        :global(.post-content a:hover) {
          opacity: 0.8;
        }

        :global(.post-content ul, .post-content ol) {
          margin: 1.5rem 0;
          padding-left: 2rem;
          color: #cfcfcf;
        }

        :global(.post-content li) {
          margin-bottom: 0.5rem;
        }

        :global(.post-content img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        :global(.post-content blockquote) {
          border-left: 4px solid var(--accent, #86ff00);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #bdbdbd;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem 1.5rem;
          border-radius: 4px;
        }

        :global(.post-content code) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--accent, #86ff00);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        :global(.post-content pre) {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        :global(.post-content pre code) {
          background: none;
          padding: 0;
          color: #cfcfcf;
        }

        .loading-spinner {
          text-align: center;
          padding: 4rem 0;
        }

        .loading-spinner p {
          color: #cfcfcf;
          margin-top: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--accent, #86ff00);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 4rem 0;
        }

        .error-message h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #fff;
        }

        .error-message p {
          font-size: 1.125rem;
          color: #cfcfcf;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1.5rem;
          }

          .blog-post {
            padding: 2rem 1.5rem;
          }

          .post-header h1 {
            font-size: 1.75rem;
          }

          .post-content {
            font-size: 1rem;
          }

          :global(.post-content h2) {
            font-size: 1.5rem;
          }

          :global(.post-content h3) {
            font-size: 1.25rem;
          }
        }
      `}</style>
      </>
    )
  }

  if (error || !blog) {
    return (
      <>
        <Header />
        <main className="blog-post-page">
          <div className="container">
            <div className="error-message">
              <h1>😕 {error || 'Blog post not found'}</h1>
              <p>The blog post you're looking for doesn't exist or has been removed.</p>
              <Link href="/blog" className="back-link">← Back to Blog</Link>
            </div>
          </div>
        </main>
        <Footer />
        <style jsx>{`
          .blog-post-page {
            min-height: 100vh;
            padding: 120px 0 80px;
            background: var(--bg, #050505);
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 3rem;
          }

          .error-message {
            text-align: center;
            padding: 4rem 0;
          }

          .error-message h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #fff;
          }

          .error-message p {
            font-size: 1.125rem;
            color: #cfcfcf;
            margin-bottom: 2rem;
          }

          .back-link {
            display: inline-block;
            background: var(--accent, #86ff00);
            color: #000;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            transition: transform 0.2s, opacity 0.2s;
          }

          .back-link:hover {
            transform: translateY(-1px);
            opacity: 0.95;
          }

          @media (max-width: 768px) {
            .container {
              padding: 0 1.5rem;
            }
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="blog-post-page">
        <article className="blog-post">
          <div className="container">
            <Link href="/blog" className="back-link">← Back to Blog</Link>
            
            <header className="post-header">
              <h1>{blog.title}</h1>
              <div className="post-meta">
                <span className="author">By {blog.author}</span>
                <span className="separator">•</span>
                <span className="date">{formatDate(blog.published_at)}</span>
              </div>
            </header>

            {blog.featured_image && (
              <div className="featured-image">
                <img src={blog.featured_image} alt={blog.title} />
              </div>
            )}

            <div className="post-content" data-color-mode="dark">
              <MarkdownPreview source={blog.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />

      <style jsx>{`
        .blog-post-page {
          min-height: 100vh;
          padding: 120px 0 80px;
          background: var(--bg, #050505);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 3rem;
        }

        .blog-post {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 3rem;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }

        .back-link {
          display: inline-block;
          color: var(--accent, #86ff00);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 2rem;
          transition: opacity 0.3s;
        }

        .back-link:hover {
          opacity: 0.8;
        }

        .post-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .post-header h1 {
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #fff;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #bdbdbd;
          font-size: 0.95rem;
        }

        .separator {
          color: rgba(255, 255, 255, 0.3);
        }

        .featured-image {
          width: 100%;
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .post-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #cfcfcf;
        }

        :global(.post-content h2) {
          font-size: 2rem;
          margin: 2rem 0 1rem;
          color: #fff;
        }

        :global(.post-content h3) {
          font-size: 1.5rem;
          margin: 1.5rem 0 0.75rem;
          color: #fff;
        }

        :global(.post-content p) {
          margin-bottom: 1.5rem;
          color: #cfcfcf;
        }

        :global(.post-content a) {
          color: var(--accent, #86ff00);
          text-decoration: underline;
        }

        :global(.post-content a:hover) {
          opacity: 0.8;
        }

        :global(.post-content ul, .post-content ol) {
          margin: 1.5rem 0;
          padding-left: 2rem;
          color: #cfcfcf;
        }

        :global(.post-content li) {
          margin-bottom: 0.5rem;
        }

        :global(.post-content img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        :global(.post-content blockquote) {
          border-left: 4px solid var(--accent, #86ff00);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #bdbdbd;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem 1.5rem;
          border-radius: 4px;
        }

        :global(.post-content code) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--accent, #86ff00);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        :global(.post-content pre) {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        :global(.post-content pre code) {
          background: none;
          padding: 0;
          color: #cfcfcf;
        }

        :global(.post-content .checklist) {
          list-style: none;
          padding: 0;
        }

        :global(.post-content .checklist-item) {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        :global(.post-content .checklist-item input) {
          margin-top: 0.25rem;
          accent-color: var(--accent, #86ff00);
        }

        :global(.post-content .checklist-item.checked span) {
          text-decoration: line-through;
          opacity: 0.7;
        }

        :global(.post-content .warning) {
          background: rgba(255, 193, 7, 0.1);
          border-left: 4px solid #ffc107;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          margin: 1.5rem 0;
        }

        :global(.post-content .warning h4) {
          color: #ffc107;
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
        }

        :global(.post-content .warning p) {
          margin: 0;
          color: #cfcfcf;
        }

        :global(.post-content .delimiter) {
          border: none;
          text-align: center;
          margin: 2rem 0;
        }

        :global(.post-content .delimiter::before) {
          content: '***';
          font-size: 1.5rem;
          color: var(--accent, #86ff00);
          letter-spacing: 0.5rem;
        }

        :global(.post-content table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.post-content table td) {
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cfcfcf;
        }

        :global(.post-content figure) {
          margin: 2rem 0;
        }

        :global(.post-content figcaption) {
          text-align: center;
          font-style: italic;
          color: #bdbdbd;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        :global(.post-content .embed) {
          margin: 2rem 0;
        }

        :global(.post-content .embed iframe) {
          width: 100%;
          min-height: 400px;
          border-radius: 8px;
        }

        :global(.post-content .embed .caption) {
          text-align: center;
          font-style: italic;
          color: #bdbdbd;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        :global(.post-content .link-preview) {
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
        }

        :global(.post-content .link-preview a) {
          display: flex;
          gap: 1rem;
          text-decoration: none;
          padding: 1rem;
          transition: background 0.2s;
        }

        :global(.post-content .link-preview a:hover) {
          background: rgba(255, 255, 255, 0.04);
        }

        :global(.post-content .link-preview img) {
          width: 150px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          margin: 0;
        }

        :global(.post-content .link-preview h4) {
          color: #fff;
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
        }

        :global(.post-content .link-preview p) {
          color: #bdbdbd;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Markdown Preview Styling */
        :global(.wmde-markdown) {
          background: transparent !important;
          color: #cfcfcf !important;
          font-size: 1.125rem !important;
        }

        :global(.wmde-markdown h1),
        :global(.wmde-markdown h2),
        :global(.wmde-markdown h3),
        :global(.wmde-markdown h4),
        :global(.wmde-markdown h5),
        :global(.wmde-markdown h6) {
          color: #fff !important;
          border-bottom-color: rgba(255, 255, 255, 0.1) !important;
        }

        :global(.wmde-markdown a) {
          color: var(--accent, #86ff00) !important;
        }

        :global(.wmde-markdown code) {
          background: rgba(255, 255, 255, 0.08) !important;
          color: var(--accent, #86ff00) !important;
        }

        :global(.wmde-markdown pre) {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
        }

        :global(.wmde-markdown blockquote) {
          background: rgba(255, 255, 255, 0.02) !important;
          border-left: 4px solid var(--accent, #86ff00) !important;
          color: #bdbdbd !important;
        }

        :global(.wmde-markdown table th),
        :global(.wmde-markdown table td) {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1.5rem;
          }

          .blog-post {
            padding: 2rem 1.5rem;
          }

          .post-header h1 {
            font-size: 1.75rem;
          }

          .post-content {
            font-size: 1rem;
          }

          :global(.post-content h2) {
            font-size: 1.5rem;
          }

          :global(.post-content h3) {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  )
}
