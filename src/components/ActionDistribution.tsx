'use client'
import { type GameEvent } from '@/lib/gameEngine'

interface Props {
  events: GameEvent[]
}

export default function ActionDistribution({ events }: Props) {
  const last20 = events.slice(-30)
  const types = Array.from(new Set(events.map(e => e.type))).slice(0, 4)
  
  const counts = types.map(t => ({
    label: t,
    count: last20.filter(e => e.type === t).length,
    color: t === 'SHOT' ? '#ff4b4b' : t === 'PASS' ? '#00e6ff' : t === 'FOUL' ? '#ffab00' : '#00e676'
  }))

  const total = Math.max(1, last20.length)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
        Live Action Distribution (Audit)
      </p>

      <div style={{ display: 'flex', height: '160px', alignItems: 'flex-end', gap: '15px' }}>
        {counts.map((c, i) => {
          const pct = (c.count / total) * 100
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
               <div style={{ height: '20px', fontSize: '0.6rem', fontWeight: 900, color: '#666', textAlign: 'center' }}>
                  {c.label}
               </div>
               <div style={{ 
                 height: `${Math.max(10, pct)}%`, 
                 background: `linear-gradient(0deg, ${c.color}22 0%, ${c.color} 100%)`,
                 borderRadius: '8px',
                 boxShadow: `0 0 15px ${c.color}33`,
                 position: 'relative',
                 transition: 'height 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
               }}>
                  <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: c.color }}>
                    {Math.round(pct)}%
                  </div>
               </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.52rem', color: '#444', fontWeight: 700, fontStyle: 'italic', textAlign: 'center' }}>
        * CALCULATED FROM LAST 30 VERIFIED CAPTURES
      </div>
    </div>
  )
}
