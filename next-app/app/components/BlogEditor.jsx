'use client'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

export default function BlogEditor({ value, onChange, placeholder = 'Start writing...' }) {
  return (
    <div className="blog-editor-wrapper" data-color-mode="dark">
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        height={500}
        placeholder={placeholder}
      />
      
      <style jsx global>{`
        .blog-editor-wrapper {
          margin: 1rem 0;
        }

        .w-md-editor {
          background: #0f0f0f !important;
          border: 2px solid #3a3a3a !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: none !important;
        }

        .w-md-editor:focus-within {
          border-color: #86ff00 !important;
        }

        .w-md-editor-toolbar {
          background: #1a1a1a !important;
          border-bottom: 1px solid #3a3a3a !important;
          padding: 10px !important;
        }

        .w-md-editor-toolbar ul > li > button,
        .w-md-editor-toolbar ul > li button {
          color: #ddd !important;
          background: transparent !important;
          border-radius: 6px !important;
        }

        .w-md-editor-toolbar ul > li > button:hover,
        .w-md-editor-toolbar ul > li button:hover {
          background: #2a2a2a !important;
          color: #86ff00 !important;
        }

        .w-md-editor-toolbar ul > li.active > button,
        .w-md-editor-toolbar ul > li button.active {
          background: #2a2a2a !important;
          color: #86ff00 !important;
        }

        .w-md-editor-text-pre,
        .w-md-editor-text-input,
        .w-md-editor-text {
          background: #0f0f0f !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 16px !important;
          line-height: 1.8 !important;
        }

        .w-md-editor-text-input {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #86ff00 !important;
        }

        .w-md-editor-text-pre > code,
        .w-md-editor-text-input {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        
        .w-md-editor-text-pre *,
        .w-md-editor-text-input *,
        .w-md-editor-text * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .w-md-editor-text::placeholder {
          color: #666 !important;
        }

        .w-md-editor-area {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #0f0f0f !important;
        }

        .w-md-editor-area textarea {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #0f0f0f !important;
          caret-color: #86ff00 !important;
        }
        
        .w-md-editor-area * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .w-md-editor-content {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #0f0f0f !important;
        }
        
        .w-md-editor-content * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .w-md-editor-input {
          color: #ffffff !important;
          background: #0f0f0f !important;
        }
        
        .w-md-editor .w-md-editor-text-pre > .token,
        .w-md-editor .w-md-editor-text-pre span {
          color: #ffffff !important;
        }

        .w-md-editor-preview {
          background: #0f0f0f !important;
          color: #fff !important;
        }

        .wmde-markdown {
          background: #0f0f0f !important;
          color: #fff !important;
        }

        .wmde-markdown h1,
        .wmde-markdown h2,
        .wmde-markdown h3,
        .wmde-markdown h4,
        .wmde-markdown h5,
        .wmde-markdown h6 {
          color: #fff !important;
          border-bottom-color: #3a3a3a !important;
        }

        .wmde-markdown a {
          color: #86ff00 !important;
        }

        .wmde-markdown a:hover {
          color: #a0ff40 !important;
        }

        .wmde-markdown code {
          background: #1a1a1a !important;
          color: #86ff00 !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
        }

        .wmde-markdown pre {
          background: #0a0a0a !important;
          border: 1px solid #3a3a3a !important;
          border-radius: 8px !important;
        }

        .wmde-markdown pre code {
          background: transparent !important;
          color: #86ff00 !important;
        }

        .wmde-markdown blockquote {
          background: #1a1a1a !important;
          border-left: 4px solid #86ff00 !important;
          color: #ddd !important;
          border-radius: 4px !important;
        }

        .wmde-markdown table {
          border-collapse: collapse;
        }

        .wmde-markdown table th,
        .wmde-markdown table td {
          border: 1px solid #3a3a3a !important;
          padding: 12px !important;
          background: #0f0f0f !important;
        }

        .wmde-markdown table th {
          background: #1a1a1a !important;
          color: #86ff00 !important;
          font-weight: 700;
        }

        .wmde-markdown hr {
          border-color: #3a3a3a !important;
        }

        .wmde-markdown ul,
        .wmde-markdown ol {
          color: #fff !important;
        }

        .wmde-markdown li {
          color: #fff !important;
        }

        .wmde-markdown img {
          border-radius: 8px;
          max-width: 100%;
        }
      `}</style>
    </div>
  )
}
