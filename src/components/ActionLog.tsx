'use client'
import { useEffect, useRef } from 'react'
import type { GameEvent } from '@/lib/gameEngine'

interface Props {
  events: GameEvent[]
}

const SPORT_ICONS: Record<string, string> = {
  SOCCER: '⚽',
  HOCKEY: '🏒',
  BASKETBALL: '🏀',
  AM_FOOTBALL: '🏈',
  F1: '🏎️'
}

export default function ActionLog({ events }: Props) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px', padding: '10px', height: '180px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: '6px'
    }} ref={logRef}>
      <p style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Live Action History</span>
        <span style={{ fontSize: '0.5rem', color: '#00e6ff' }}>AI VERIFIED</span>
      </p>

      {events.length === 0 && (
        <p style={{ fontSize: '0.62rem', color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
          Waiting for field activity...
        </p>
      )}

      {[...events].reverse().map((ev, i) => {
        const isHit = ev.status === 'HIT'
        const isMiss = ev.status === 'MISSED'
        const dotColor = isHit ? '#00e676' : isMiss ? '#ff4b4b' : '#aaa'

        return (
          <div key={ev.id || i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: isMiss ? 'rgba(255,75,75,0.08)' : 'rgba(255,255,255,0.03)',
            padding: '6px 8px', borderRadius: '5px', border: isMiss ? '1px solid rgba(255,75,75,0.2)' : '1px solid rgba(255,255,255,0.04)',
            animation: 'fadeIn 0.3s ease-out', position: 'relative'
          }}>
            <span style={{ fontSize: '0.65rem' }}>{SPORT_ICONS[ev.sport || 'SOCCER']}</span>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#555', minWidth: '32px' }}>
              [{ev.minute}{ev.sport === 'F1' ? 'L' : "'"}]
            </span>
            <span style={{ height: '5px', width: '5px', borderRadius: '50%', backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isMiss ? '#ff4b4b' : '#eee', flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {ev.type} <span style={{ opacity: 0.4, fontSize: '0.52rem' }}>({ev.team === 0 ? 'HOME' : 'AWAY'})</span>
            </span>
            
            {isHit && ev.latency !== undefined && (
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#00e676', background: 'rgba(0,230,118,0.1)', padding: '2px 4px', borderRadius: '3px' }}>
                {Math.round(ev.latency)}ms
              </span>
            )}
            {isMiss && (
              <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#ff4b4b', border: '1px solid #ff4b4b', padding: '1px 4px', borderRadius: '3px' }}>
                MISS
              </span>
            )}
          </div>
        )
      })}

      <style jsx>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
