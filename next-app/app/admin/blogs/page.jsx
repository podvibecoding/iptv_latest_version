'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl } from '../../lib/config'
import BlogEditor from '../../components/BlogEditor'
import Toast from '../../components/Toast'

export default function CreateBlogPage() {
  const router = useRouter()
  const params = useParams()
  const [authenticated, setAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author: 'Admin',
    status: 'draft'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

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
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      router.push('/admin/login')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setToast({ message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)', type: 'warning' })
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setToast({ message: 'Image size must be less than 10MB', type: 'warning' })
      return
    }

    try {
      setUploadingImage(true)
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const res = await fetch(`${apiUrl}/upload/blog-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formDataUpload
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to upload image')
      }

      // Backend now returns full absolute URL
      const imageUrl = data.url
      console.log('Featured image uploaded:', imageUrl)
      setFormData(prev => ({ ...prev, featured_image: imageUrl }))
      setToast({ message: 'Featured image uploaded successfully!', type: 'success' })
    } catch (error) {
      console.error('Error uploading image:', error)
      setToast({ message: 'Failed to upload image: ' + error.message, type: 'error' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      setToast({ message: 'Title and content are required', type: 'warning' })
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      
      const res = await fetch(`${apiUrl}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) throw new Error('Failed to create blog')

      const data = await res.json()
      setToast({ message: 'Blog created successfully!', type: 'success' })
      setTimeout(() => router.push('/admin/blogs/manage'), 1500)
    } catch (error) {
      console.error('Error creating blog:', error)
      setToast({ message: 'Failed to create blog', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!authenticated) return null

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading blog...</p>
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
          <h1>Create New Blog Post</h1>
          <div className="header-actions">
            <Link href="/admin/blogs/manage" className="btn btn-secondary">
              ← Back to Manage Blogs
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-grid">
            <div className="form-main">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Short summary of the blog post (optional)"
                  rows="3"
                />
                <small>This will be shown in blog listings</small>
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <BlogEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog post..."
                />
                <small>Use the toolbar to format your content</small>
              </div>
            </div>

            <div className="form-sidebar">
              <div className="sidebar-section">
                <h3>Publish</h3>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Blog Post'}
                </button>
              </div>

              <div className="sidebar-section">
                <h3>Author</h3>
                <div className="form-group">
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Featured Image</h3>
                <div className="form-group">
                  <label className="upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                    <span className="btn btn-upload">
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </label>
                  <small>Or enter image URL:</small>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                {formData.featured_image && (
                  <div className="image-preview">
                    <img src={formData.featured_image} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      className="remove-image"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
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

        .admin-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .blog-form {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid #2a2a2a;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        .form-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sidebar-section {
          background: #0f0f0f;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #2a2a2a;
        }

        .sidebar-section h3 {
          margin: 0 0 1rem;
          font-size: 1.125rem;
          color: #fff;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #ddd;
          font-size: 14px;
        }

        input[type="text"],
        input[type="url"],
        textarea,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #3a3a3a;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          background: #252525;
          color: #fff;
        }

        input[type="text"]:focus,
        input[type="url"]:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #86ff00;
        }

        input[type="text"]::placeholder,
        input[type="url"]::placeholder,
        textarea::placeholder {
          color: #666;
        }

        select option {
          background: #1a1a1a;
          color: #fff;
        }

        textarea {
          resize: vertical;
        }

        small {
          display: block;
          margin-top: 0.5rem;
          color: #888;
          font-size: 0.875rem;
        }

        .upload-btn {
          cursor: pointer;
          display: block;
          margin-bottom: 0.5rem;
        }

        .btn-upload {
          display: inline-block;
          background: #86ff00;
          color: #000;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
        }

        .btn-upload:hover {
          background: #a0ff40;
          transform: translateY(-1px);
        }

        .image-preview {
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 2px solid #2a2a2a;
        }

        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .remove-image {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 68, 68, 0.9);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .remove-image:hover {
          background: rgba(255, 68, 68, 1);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }

        .btn-primary {
          background: #86ff00;
          color: #000;
          font-weight: 800;
        }

        .btn-primary:hover:not(:disabled) {
          background: #a0ff40;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #555;
          color: #888;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #2a2a2a;
          color: #fff;
          border: 1px solid #3a3a3a;
        }

        .btn-secondary:hover {
          background: #3a3a3a;
        }

        .btn-block {
          width: 100%;
          text-align: center;
        }

        /* Editor.js Styling */
        :global(.codex-editor) {
          background: #0f0f0f !important;
          border: 1px solid #3a3a3a !important;
          border-radius: 8px !important;
          padding: 1rem !important;
        }

        :global(.codex-editor__redactor) {
          background: #0f0f0f !important;
          padding-bottom: 0 !important;
        }

        :global(.ce-block) {
          background: #0f0f0f !important;
        }

        :global(.ce-block__content),
        :global(.ce-toolbar__content) {
          max-width: 100% !important;
          background: #0f0f0f !important;
        }

        :global(.ce-paragraph),
        :global(.ce-header),
        :global(.cdx-block) {
          color: #fff !important;
        }

        :global(.ce-paragraph[data-placeholder]:empty::before),
        :global(.ce-header[data-placeholder]:empty::before) {
          color: #666 !important;
        }

        :global(.ce-toolbar__plus),
        :global(.ce-toolbar__settings-btn) {
          color: #86ff00 !important;
          background: #1a1a1a !important;
        }

        :global(.ce-toolbar__plus:hover),
        :global(.ce-toolbar__settings-btn:hover) {
          background: #2a2a2a !important;
        }

        :global(.ce-inline-toolbar),
        :global(.ce-conversion-toolbar),
        :global(.ce-settings) {
          background: #1a1a1a !important;
          border: 1px solid #3a3a3a !important;
          color: #fff !important;
        }

        :global(.ce-inline-tool),
        :global(.ce-conversion-tool),
        :global(.ce-settings__button) {
          color: #ddd !important;
        }

        :global(.ce-inline-tool:hover),
        :global(.ce-conversion-tool:hover),
        :global(.ce-settings__button:hover) {
          background: #2a2a2a !important;
          color: #86ff00 !important;
        }

        :global(.ce-popover) {
          background: #1a1a1a !important;
          border: 1px solid #3a3a3a !important;
        }

        :global(.ce-popover__item) {
          color: #ddd !important;
        }

        :global(.ce-popover__item:hover) {
          background: #2a2a2a !important;
          color: #86ff00 !important;
        }

        :global(.cdx-search-field) {
          background: #252525 !important;
          border: 1px solid #3a3a3a !important;
          color: #fff !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
        }

        :global(.cdx-search-field:focus) {
          border-color: #86ff00 !important;
          outline: none !important;
        }

        :global(.cdx-search-field::placeholder) {
          color: #666 !important;
        }

        :global(.cdx-input) {
          background: #252525 !important;
          border: 1px solid #3a3a3a !important;
          color: #fff !important;
        }

        :global(.cdx-input::placeholder) {
          color: #666 !important;
        }

        :global(.ce-code__textarea) {
          background: #0a0a0a !important;
          color: #86ff00 !important;
          border: 1px solid #3a3a3a !important;
        }

        :global(.cdx-list),
        :global(.cdx-checklist),
        :global(.cdx-quote) {
          color: #fff !important;
        }

        :global(.cdx-quote__text) {
          color: #ddd !important;
        }

        :global(.cdx-attaches),
        :global(.cdx-warning) {
          background: #1a1a1a !important;
          border: 1px solid #3a3a3a !important;
          color: #fff !important;
        }

        :global(.image-tool__image) {
          background: #0f0f0f !important;
        }

        :global(.image-tool__caption) {
          color: #fff !important;
          background: #252525 !important;
          border: 1px solid #3a3a3a !important;
        }

        :global(.link-tool__content) {
          background: #1a1a1a !important;
          border: 1px solid #3a3a3a !important;
        }

        :global(.link-tool__title),
        :global(.link-tool__description),
        :global(.link-tool__anchor) {
          color: #fff !important;
        }

        :global(.tc-wrap) {
          background: #0f0f0f !important;
          border: 1px solid #3a3a3a !important;
        }

        :global(.tc-table) {
          color: #fff !important;
        }

        :global(.tc-cell) {
          border: 1px solid #3a3a3a !important;
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .admin-main {
            padding: 1rem;
          }

          .blog-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
