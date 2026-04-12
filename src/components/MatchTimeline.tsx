'use client'
import type { GameEvent } from '@/lib/gameEngine'

interface Props {
  events: GameEvent[]
  currentMinute: number
}

const COLOR: Record<string, string> = { Goal: '#ffd740', Card: '#ff4b4b', Sub: '#00aaff', Foul: '#ff9800' }
const ICON: Record<string, string>  = { Goal: '⚽', Card: '🟨', Sub: '🔄', Foul: '🦵' }

export default function MatchTimeline({ events, currentMinute }: Props) {
  const progress = Math.min(100, (currentMinute / 90) * 100)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '8px',
      padding: '10px 14px',
      marginTop: '8px',
    }}>
      <div style={{ position: 'relative', height: '48px' }}>
        {/* Track */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: '4px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px', transform: 'translateY(-50%)',
        }} />
        {/* Progress */}
        <div style={{
          position: 'absolute', top: '50%', left: 0,
          width: `${progress}%`, height: '4px',
          background: 'linear-gradient(90deg, #00e676, #00aaff)',
          borderRadius: '2px', transform: 'translateY(-50%)',
          transition: 'width 1s linear',
        }} />
        {/* Events */}
        {events.map((ev, idx) => {
          const pct = Math.min(99, (ev.minute / 90) * 100)
          const color = COLOR[ev.type] || '#fff'
          return (
            <div key={idx} style={{
              position: 'absolute',
              left: `${pct}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
            }}>
              <span style={{ fontSize: '0.55rem', lineHeight: 1 }}>{ICON[ev.type]}</span>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: color, boxShadow: `0 0 6px ${color}`,
              }} />
              <span style={{ fontSize: '0.47rem', color, fontWeight: 700 }}>{ev.minute}&apos;</span>
            </div>
          )
        })}
        {/* Live cursor */}
        <div style={{
          position: 'absolute',
          left: `${progress}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px', height: '10px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 0 8px #fff',
          zIndex: 2,
        }} />
      </div>
      {/* Minute markers */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[0, 15, 30, 45, 60, 75, 90].map(m => (
          <span key={m} style={{ fontSize: '0.46rem', color: '#444' }}>{m}</span>
        ))}
      </div>
    </div>
  )
}
