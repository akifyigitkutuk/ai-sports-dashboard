'use client'
import { useState, useEffect } from 'react'

interface Props {
  message: string
  correction: string
  onAccept: (val: boolean) => void
}

export default function AnomalyPopup({ message, correction, onAccept }: Props) {
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const start = Date.now()
    const duration = 800 // < 1 second as per image
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.max(0, 1 - elapsed / duration)
      setProgress(next)
      if (next === 0) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2000,
      width: '320px',
      background: 'rgba(15, 5, 5, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '2px solid #ff4b4b',
      boxShadow: '0 0 30px rgba(255, 75, 75, 0.4)',
      borderRadius: '20px',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'center',
      animation: 'popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ width: '20px' }} /> {/* Spacer */}
        <button 
          onClick={() => onAccept(false)}
          style={{ background: 'none', border: 'none', color: '#ff4b4b', fontSize: '1.2rem', cursor: 'pointer', padding: 0 }}
        >×</button>
      </div>

      <h2 style={{ color: '#ff4b4b', fontSize: '1rem', fontWeight: 900, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Warning: {message}
      </h2>
      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 20px 0' }}>
        Did you mean "{correction}"?<br/>
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>[Yes/No]</span>
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button 
          onClick={() => onAccept(true)}
          style={{
            flex: 1, padding: '10px', background: '#ff4b4b', color: '#fff', 
            border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 900, 
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >YES</button>
        <button 
          onClick={() => onAccept(false)}
          style={{
            flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem', 
            fontWeight: 900, cursor: 'pointer'
          }}
        >NO</button>
      </div>

      {/* Progress Footer */}
      <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', borderRadius: '4px' }}>
             <div style={{ width: `${progress * 100}%`, height: '100%', background: '#00e676', transition: 'width 0.016s linear' }} />
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', color: '#00e676', fontWeight: 800 }}>
          &lt;1 second (AI Check)
        </p>
      </div>

      <style jsx>{`
        @keyframes popIn {
          from { transform: translate(-50%, -40%) scale(0.9); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
