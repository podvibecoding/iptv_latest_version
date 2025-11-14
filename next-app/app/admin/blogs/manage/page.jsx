'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl, getApiBase } from '../../../lib/config'
import Toast from '../../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function BlogsManagementPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, blogId: null, blogTitle: '' })
  const apiBase = getApiBase()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadBlogs()
    }
  }, [authenticated])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      if (!res.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      
      setAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      router.push('/admin/login')
    }
  }

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      
      const res = await fetch(`${apiUrl}/blogs/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) throw new Error('Failed to fetch blogs')

      const data = await res.json()
      // Backend returns {success: true, blogs: []}
      setBlogs(data.blogs || [])
    } catch (error) {
      console.error('Error loading blogs:', error)
      setToast({ message: 'Failed to load blogs', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    setConfirmDialog({ isOpen: true, blogId: id, blogTitle: title })
  }

  const confirmDelete = async () => {
    const { blogId } = confirmDialog
    
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) throw new Error('Failed to delete blog')

      setToast({ message: 'Blog deleted successfully!', type: 'success' })
      loadBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      setToast({ message: 'Failed to delete blog', type: 'error' })
    }
  }

  const filteredBlogs = blogs.filter(blog => {
    if (filter === 'all') return true
    return blog.status === filter
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!authenticated) return null

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading blogs...</p>
        </div>
        <style jsx>{`
          .admin-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f0f0f;
          }
          .loading-container {
            text-align: center;
          }
          .loading-container p {
            color: #86ff00;
            font-size: 1.125rem;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #2a2a2a;
            border-top: 4px solid #86ff00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <header className="admin-header">
        <div className="header-content">
          <h1>Manage Blogs</h1>
          <div className="header-actions">
            <Link href="/admin/dashboard" className="btn btn-back">
              ← Dashboard
            </Link>
            <Link href="/admin/blogs" className="btn btn-primary">
              + Create New Blog
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({blogs.length})
          </button>
          <button
            className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published ({blogs.filter(b => b.status === 'published').length})
          </button>
          <button
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Drafts ({blogs.filter(b => b.status === 'draft').length})
          </button>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <p>No blogs found</p>
            <Link href="/admin/blogs" className="btn btn-primary">
              Create your first blog
            </Link>
          </div>
        ) : (
          <div className="blogs-grid">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="blog-card">
                {blog.featured_image && (
                  <div className="blog-image">
                    <img 
                      src={blog.featured_image.startsWith('http') ? blog.featured_image : `${apiBase}${blog.featured_image}`} 
                      alt={blog.title} 
                    />
                  </div>
                )}
                <div className="blog-content">
                  <div className="blog-header">
                    <h3>{blog.title}</h3>
                    <span className={`status-badge ${blog.status}`}>
                      {blog.status}
                    </span>
                  </div>
                  {blog.excerpt && (
                    <p className="blog-excerpt">{blog.excerpt}</p>
                  )}
                  <div className="blog-meta">
                    <span className="author">{blog.author}</span>
                    <span className="date">{formatDate(blog.created_at)}</span>
                  </div>
                  <div className="blog-actions">
                    <Link 
                      href={`/admin/blogs/edit/${blog.id}/new`}
                      className="btn btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id, blog.title)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: #0f0f0f;
        }

        .admin-header {
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
          border-bottom: 1px solid #2a2a2a;
          padding: 1.5rem 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          font-size: 1.75rem;
          color: #fff;
          font-weight: 800;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        :global(.header-actions .btn) {
          padding: 0.875rem 1.75rem;
          border-radius: 10px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
          text-align: center;
          font-size: 1rem;
          white-space: nowrap;
        }

        :global(.header-actions .btn-primary) {
          background: linear-gradient(135deg, #86ff00 0%, #9fff33 100%);
          color: #000;
          box-shadow: 0 4px 15px rgba(134, 255, 0, 0.3);
          font-weight: 900;
          border: none;
        }

        :global(.header-actions .btn-primary:hover) {
          background: linear-gradient(135deg, #9fff33 0%, #b3ff66 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(134, 255, 0, 0.4);
        }

        :global(.header-actions .btn-back) {
          background: transparent;
          color: #fff;
          border: 2px solid #3a3a3a;
          font-weight: 700;
        }

        :global(.header-actions .btn-back:hover) {
          background: rgba(255, 255, 255, 0.05);
          border-color: #86ff00;
          color: #86ff00;
          transform: translateY(-2px);
        }

        .admin-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2a2a2a;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: #1a1a1a;
          border: 1px solid #3a3a3a;
          color: #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .filter-btn:hover {
          background: #2a2a2a;
          border-color: #86ff00;
        }

        .filter-btn.active {
          background: #86ff00;
          color: #000;
          border-color: #86ff00;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state p {
          color: #888;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .blog-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .blog-card:hover {
          border-color: #86ff00;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(134, 255, 0, 0.1);
        }

        .blog-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #0f0f0f;
        }

        .blog-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-content {
          padding: 1.5rem;
        }

        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .blog-header h3 {
          font-size: 1.25rem;
          color: #fff;
          font-weight: 700;
          flex: 1;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.published {
          background: rgba(134, 255, 0, 0.2);
          color: #86ff00;
        }

        .status-badge.draft {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .blog-excerpt {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-meta {
          display: flex;
          gap: 1rem;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #2a2a2a;
          font-size: 0.875rem;
        }

        .blog-meta .author {
          color: #86ff00;
          font-weight: 600;
        }

        .blog-meta .date {
          color: #666;
        }

        .blog-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.875rem 1.75rem !important;
          border-radius: 10px !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: inline-block !important;
          text-align: center !important;
          font-size: 1rem !important;
          white-space: nowrap !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #86ff00 0%, #9fff33 100%) !important;
          color: #000 !important;
          box-shadow: 0 4px 15px rgba(134, 255, 0, 0.3) !important;
          font-weight: 900 !important;
          border: none !important;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #9fff33 0%, #b3ff66 100%) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(134, 255, 0, 0.4) !important;
        }

        .btn-primary:active {
          transform: translateY(0) !important;
        }

        .btn-back {
          background: transparent !important;
          color: #fff !important;
          border: 2px solid #3a3a3a !important;
          font-weight: 700 !important;
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: #86ff00 !important;
          color: #86ff00 !important;
          transform: translateY(-2px) !important;
        }

        .btn-back:active {
          transform: translateY(0) !important;
        }

        .btn-secondary {
          background: #2a2a2a;
          color: #fff;
          border: 1px solid #3a3a3a;
        }

        .btn-secondary:hover {
          background: #3a3a3a;
          transform: translateY(-1px);
        }

        :global(a.btn-edit) {
          flex: 1;
          background: rgba(134, 255, 0, 0.1) !important;
          color: #86ff00 !important;
          border: 1px solid rgba(134, 255, 0, 0.3) !important;
          font-size: 0.9rem !important;
          font-weight: 700 !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          text-decoration: none !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          display: inline-block !important;
          text-align: center !important;
        }

        :global(a.btn-edit:hover) {
          background: #86ff00 !important;
          color: #000 !important;
          border-color: #86ff00 !important;
        }

        .btn-delete {
          flex: 1;
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
          border: 1px solid rgba(255, 68, 68, 0.3);
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          text-align: center;
        }

        .btn-delete:hover {
          background: #ff4444;
          color: #fff;
          border-color: #ff4444;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .blogs-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }
        }
      `}</style>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, blogId: null, blogTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${confirmDialog.blogTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
