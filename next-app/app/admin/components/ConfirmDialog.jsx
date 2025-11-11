'use client'

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger' // danger, warning, info
}) {
  if (!isOpen) return null

  const types = {
    danger: {
      iconBg: 'linear-gradient(135deg, #5d1616 0%, #3d0f0f 100%)',
      iconColor: '#ff4444',
      confirmBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      confirmHover: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
      icon: '⚠'
    },
    warning: {
      iconBg: 'linear-gradient(135deg, #5d4916 0%, #3d2f0f 100%)',
      iconColor: '#ff9800',
      confirmBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      confirmHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      icon: '⚠'
    },
    info: {
      iconBg: 'linear-gradient(135deg, #16345d 0%, #0f1f3d 100%)',
      iconColor: '#3498db',
      confirmBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      confirmHover: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      icon: 'ℹ'
    }
  }

  const style = types[type] || types.danger

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          border: '1px solid #3a3a3a',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'slideIn 0.3s ease-out',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div style={{
          padding: '32px 32px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: style.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: style.iconColor,
            border: `2px solid ${style.iconColor}`,
            animation: 'iconPulse 1.5s ease-in-out infinite'
          }}>
            {style.icon}
          </div>

          <h3 style={{
            margin: '0 0 12px 0',
            color: '#fff',
            fontSize: '22px',
            fontWeight: '700'
          }}>
            {title}
          </h3>

          <p style={{
            margin: 0,
            color: '#999',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div style={{
          padding: '0 32px 32px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid #3a3a3a',
              background: 'transparent',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '100px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2a2a2a'
              e.target.style.borderColor = '#4a4a4a'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.borderColor = '#3a3a3a'
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: style.confirmBg,
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '100px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = style.confirmHover
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = style.confirmBg
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
