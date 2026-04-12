'use client'
import type { GameEvent } from '@/lib/gameEngine'
import { type SportType } from '@/lib/sportConfigs'

interface Props {
  events: GameEvent[]
  currentMinute: number
  sport: SportType
}

const COLOR: Record<string, string> = { Goal: '#ffd740', Card: '#ff4b4b', Sub: '#00aaff', Foul: '#ff9800', 'PIT STOP': '#ff4b4b', LAP: '#00e6ff' }
const ICON: Record<string, string>  = { Goal: '⚽', Card: '🟨', Sub: '🔄', Foul: '🦵', 'PIT STOP': '🔧', LAP: '🏁' }

export default function MatchTimeline({ events, currentMinute, sport }: Props) {
  let maxVal = 90
  let unit = 'min'
  let markers = [0, 15, 30, 45, 60, 75, 90]

  if (sport === 'F1') {
    maxVal = 50; unit = 'Laps'; markers = [0, 10, 20, 30, 40, 50]
  } else if (sport === 'HOCKEY') {
    maxVal = 60; unit = 'min'; markers = [0, 20, 40, 60]
  } else if (sport === 'BASKETBALL') {
    maxVal = 48; unit = 'min'; markers = [0, 12, 24, 36, 48]
  }

  const progress = Math.min(100, (currentMinute / maxVal) * 100)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '8px',
      padding: '10px 14px',
      marginTop: '8px',
      width: '100%'
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
          const pct = Math.min(99, (ev.minute / maxVal) * 100)
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
              <span style={{ fontSize: '0.47rem', color, fontWeight: 700 }}>{ev.minute}{unit === 'min' ? "'" : ''}</span>
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
      {/* Markers */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {markers.map(m => (
          <span key={m} style={{ fontSize: '0.46rem', color: '#444' }}>{m} {m === maxVal ? unit : ''}</span>
        ))}
      </div>
    </div>
  )
}
