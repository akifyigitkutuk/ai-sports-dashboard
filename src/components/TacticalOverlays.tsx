'use client'

import React from 'react'

export default function TacticalOverlays() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* Scanning Line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,230,255,0.4), transparent)',
        animation: 'scan 4s linear infinite', zIndex: 1
      }} />

      {/* Decorative Corner Brackets */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', borderTop: '1px solid #00e6ff', borderLeft: '1px solid #00e6ff' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', borderTop: '1px solid #00e6ff', borderRight: '1px solid #00e6ff' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', borderBottom: '1px solid #00e6ff', borderLeft: '1px solid #00e6ff' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', borderBottom: '1px solid #00e6ff', borderRight: '1px solid #00e6ff' }} />

      {/* Pulsing Data Points */}
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', display: 'flex', gap: '4px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ width: '4px', height: '4px', background: '#00e6ff', borderRadius: '50%', animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  )
}
