'use client'

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null

  const styles = {
    success: {
      background: 'linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)',
      color: '#86ff00',
      border: '1px solid #86ff00',
      iconColor: '#86ff00',
      icon: '✓'
    },
    error: {
      background: 'linear-gradient(135deg, #5d1616 0%, #3d0f0f 100%)',
      color: '#ff6b6b',
      border: '1px solid #ff4444',
      iconColor: '#ff4444',
      icon: '✕'
    },
    warning: {
      background: 'linear-gradient(135deg, #5d4916 0%, #3d2f0f 100%)',
      color: '#ffa500',
      border: '1px solid #ff9800',
      iconColor: '#ff9800',
      icon: '⚠'
    },
    info: {
      background: 'linear-gradient(135deg, #16345d 0%, #0f1f3d 100%)',
      color: '#5dade2',
      border: '1px solid #3498db',
      iconColor: '#3498db',
      icon: 'ℹ'
    }
  }

  const style = styles[type] || styles.info

  return (
    <div style={{
      position: 'relative',
      background: style.background,
      color: style.color,
      padding: '16px 48px 16px 52px',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500',
      border: style.border,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      lineHeight: '1.5'
    }}>
      {/* Icon */}
      <div style={{
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        color: style.iconColor,
        background: 'rgba(0,0,0,0.2)'
      }}>
        {style.icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        {message}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            color: style.color,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(0,0,0,0.4)'
            e.target.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(0,0,0,0.2)'
            e.target.style.transform = 'translateY(-50%) scale(1)'
          }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
