'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { GameEngine, type GameStats, type GameEvent, type Player, type Ball } from '@/lib/gameEngine'
import MatchTimeline from '@/components/MatchTimeline'

const PitchCanvas   = dynamic(() => import('@/components/PitchCanvas'),   { ssr: false })
const HeatmapCanvas = dynamic(() => import('@/components/HeatmapCanvas'), { ssr: false })
const BallTrackerCanvas = dynamic(() => import('@/components/BallTrackerCanvas'), { ssr: false })
const ActionLog = dynamic(() => import('@/components/ActionLog'), { ssr: false })

interface DisplayState {
  stats: GameStats
  players: Player[]
  ball: Ball
  events: GameEvent[]
  positionHistory: { x: number; y: number }[]
}

function StatBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '7px', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
    </div>
  )
}

export default function Dashboard() {
  const engineRef = useRef<GameEngine | null>(null)
  const lastTickRef = useRef<number>(0)
  const animRef = useRef<number>(0)

  const [display, setDisplay] = useState<DisplayState>({
    stats: {
      minute: 0, homeScore: 0, awayScore: 0, homePossession: 55,
      homeShots: 4, homeShotsOnTarget: 2, passAccuracy: 91,
      distanceCovered: 18, fatigueRisk: 0.18, shiftHour: 1.5,
      lastAiEvent: null, showAnomalyPopup: false, anomalySuppressed: false,
    },
    players: [], ball: { x: 60, y: 40, vx: 0, vy: 0 },
    events: [], positionHistory: [],
  })

  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    engineRef.current = new GameEngine()

    const loop = (ts: number) => {
      const dt = lastTickRef.current ? Math.min(ts - lastTickRef.current, 50) : 16
      lastTickRef.current = ts

      const eng = engineRef.current!
      eng.tick(dt)

      setDisplay({
        stats: { ...eng.stats },
        players: eng.players.map(p => ({ ...p })),
        ball: { ...eng.ball },
        events: [...eng.events],
        positionHistory: [...eng.positionHistory],
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const handleAcceptAnomaly = useCallback((changeToPass: boolean) => {
    engineRef.current?.acceptAnomaly(changeToPass)
    if (changeToPass) setToast('Data Corrected by AI ✓ (< 50ms)')
  }, [])

  const handleManualEvent = useCallback((type: 'CARD' | 'PASS' | 'FOUL' | 'SHOT') => {
    const res = engineRef.current?.manualEvent(type)
    if (res === 'SUCCESS') {
      setToast('Data Successfully Verified ✓ (< 50ms)')
    } else if (res === 'WARN') {
      setToast('Unexpected Entry! Check physical truth.')
    }
  }, [])

  const { stats, players, ball, events, positionHistory } = display

  const riskPct = Math.round(stats.fatigueRisk * 100)
  const isHighRisk = riskPct >= 80

  const riskColor = isHighRisk
    ? 'linear-gradient(90deg,#ff4b4b,#ff1744)'
    : stats.fatigueRisk > 0.35
    ? 'linear-gradient(90deg,#ffab00,#ffd740)'
    : 'linear-gradient(90deg,#00e676,#69ff47)'
  const riskHex = isHighRisk ? '#ff4b4b' : stats.fatigueRisk > 0.35 ? '#ffab00' : '#00e676'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060c12', padding: '8px 12px', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <h1 style={{
        textAlign: 'center', fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 900,
        color: '#fff', margin: '0 0 6px', letterSpacing: '0.3px',
        textShadow: '0 0 30px rgba(0,160,255,0.3)',
      }}>
        ML-Driven Optimization: Transforming Sports Data Entry Workflows
      </h1>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: '8px' }} />

      {/* ── 3-COLUMN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.1fr 1fr', gap: '12px' }}>

        {/* ════ LEFT ════ */}
        <div>
          {/* Operational Bottleneck */}
          <div
            style={{
              background: 'linear-gradient(135deg,rgba(255,34,68,0.09),rgba(6,12,18,0.97))',
              border: '1px solid rgba(255,34,68,0.25)',
              borderLeft: '4px solid #ff2244',
              borderRadius: '8px',
              padding: '11px 13px',
              marginBottom: '9px',
            }}
          >
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ff4b4b', marginBottom: '8px' }}>
              ⬛ The Operational Bottleneck (The Problem)
            </p>
            {[
              { title: 'The 500ms Human Latency Gap:', body: 'Human reaction time for manual data entry averages 500ms, too slow for live betting/broadcasting.' },
              { title: 'The 2-Minute Delayed Feedback Loop:', body: "Errors at min 13 only caught by int'l supervisors at min 15, causing critical 'bad data' window." },
              { title: '80% Quality Score Ceiling:', body: 'Manual processes and communication lag prevent reaching the 95.5% market requirement.' },
            ].map(({ title, body }) => (
              <p key={title} style={{ fontSize: '0.65rem', lineHeight: 1.55, color: '#c0c0c0', marginBottom: '7px' }}>
                <span style={{ color: '#ff4b4b', marginRight: '4px' }}>●</span>
                <strong style={{ color: '#fff' }}>{title}</strong><br />{body}
              </p>
            ))}
          </div>

          {/* Live Stats */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '11px 13px', marginBottom: '9px',
          }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>
              📊 Player/Team Live Stats
            </p>

            <p style={{ fontSize: '0.64rem', color: '#aaa', marginBottom: '2px' }}>
              Possession: <strong style={{ color: '#69ff47' }}>Home {Math.round(stats.homePossession)}%</strong>
              <span style={{ color: '#666' }}> / Away {Math.round(100 - stats.homePossession)}%</span>
            </p>
            <StatBar pct={stats.homePossession} color="linear-gradient(90deg,#00e676,#69ff47)" />

            <p style={{ fontSize: '0.64rem', color: '#aaa', marginBottom: '2px' }}>
              Shots on Target: <strong style={{ color: '#fff' }}>{stats.homeShotsOnTarget}/{stats.homeShots}</strong>
            </p>
            <StatBar pct={(stats.homeShotsOnTarget / Math.max(1, stats.homeShots)) * 100} color="linear-gradient(90deg,#ffab00,#ffd740)" />

            <p style={{ fontSize: '0.64rem', color: '#aaa', marginBottom: '2px' }}>
              Pass Accuracy: <strong style={{ color: '#fff' }}>{Math.round(stats.passAccuracy)}%</strong>
            </p>
            <StatBar pct={stats.passAccuracy} color="linear-gradient(90deg,#00e676,#69ff47)" />

            <p style={{ fontSize: '0.64rem', color: '#aaa', marginBottom: '2px' }}>
              Distance Covered: <strong style={{ color: '#fff' }}>{stats.distanceCovered.toFixed(1)} km</strong>
            </p>
            <StatBar pct={Math.min(100, stats.distanceCovered / 1.12)} color="linear-gradient(90deg,#ffab00,#ffd740)" />

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '7px', marginTop: '2px' }}>
              <p style={{ fontSize: '0.64rem', color: '#aaa', marginBottom: '4px' }}>
                ⚠ Operator Fatigue Risk: <strong style={{ color: riskHex }}>{riskPct}%</strong>
                <span style={{ color: '#555', fontSize: '0.56rem' }}> (Shift: {stats.shiftHour.toFixed(1)}h)</span>
              </p>
              <StatBar pct={riskPct} color={riskColor} />
              {isHighRisk && (
                <p style={{ fontSize: '0.6rem', color: '#ff4b4b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🚨 HIGH ERROR RISK — TAKE A BREAK
                </p>
              )}
            </div>
          </div>

          {/* Technical Engine */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px', padding: '11px 13px',
          }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>
              🔧 The Technical Engine (The Python ML Stack)
            </p>
            {[
              { icon: '📷', title: 'Real-Time Computer Vision (YOLOv8):', body: 'Automatically tracks player/ball coordinates (X, Y, Z) to verify manual entry against physical reality.' },
              { icon: '📈', title: 'Anomaly Detection (Isolation Forest):', body: "Python-based ML model trained on historical 'Event Data' to flag impossible events." },
              { icon: '🧠', title: 'Operator Fatigue Prediction (Random Forest):', body: 'Analyzes reaction times and error frequency to predict when an operator needs a break.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', minWidth: '18px' }}>{icon}</span>
                <p style={{ fontSize: '0.61rem', color: '#bbb', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ddd' }}>{title}</strong><br />{body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ════ CENTER ════ */}
        <div>
          <p style={{
            textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff',
            letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px',
            textShadow: '0 0 24px rgba(0,180,255,0.4)',
          }}>
            Control Center
          </p>

          {/* Scoreboard */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#00e676', fontWeight: 700 }}>HOME</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '8px' }}>
              {stats.homeScore} – {(stats as any).awayScore ?? 0}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#ff9800', fontWeight: 700 }}>AWAY</span>
            <span style={{ fontSize: '0.65rem', color: '#ffd740', marginLeft: '8px' }}>
              {Math.floor(stats.minute)}&apos;
            </span>
          </div>

          <PitchCanvas players={players} ball={ball} stats={stats} onAcceptAnomaly={handleAcceptAnomaly} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 2fr', gap: '12px', marginTop: '10px' }}>
            <BallTrackerCanvas ball={ball} />
            <HeatmapCanvas positionHistory={positionHistory} />
          </div>

          <MatchTimeline events={events} currentMinute={stats.minute} />
        </div>

        {/* ════ RIGHT ════ */}
        <div>
          {/* Supervisor badge */}
          <div style={{
            background: 'linear-gradient(90deg,rgba(0,230,118,0.18),rgba(0,230,118,0.04))',
            border: '2px solid #00e676', borderRadius: '7px',
            padding: '7px 12px', fontSize: '0.62rem', fontWeight: 800,
            color: '#00e676', letterSpacing: '1.8px', textAlign: 'center',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>
            AI SECURITY NET: ACTIVE (Green)
          </div>

          {/* Buttons */}
          <p style={{ fontSize: '0.57rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#666', marginBottom: '6px' }}>
            Data Entry &amp; Supervisor View
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            {(['CARD', 'PASS', 'FOUL', 'SHOT'] as const).map(ev => (
              <button key={ev} onClick={() => handleManualEvent(ev)} style={{
                padding: '10px 4px', background: 'rgba(255,255,255,0.06)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '7px', fontSize: '0.75rem', fontWeight: 900,
                letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.1s ease',
                fontFamily: "'Inter', sans-serif",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,230,118,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00e676'; (e.currentTarget as HTMLButtonElement).style.color = '#00e676' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              >
                {ev}
              </button>
            ))}
          </div>

          {stats.lastAiEvent && !stats.showAnomalyPopup && (
            <p style={{ fontSize: '0.61rem', color: '#00e676', marginBottom: '8px', fontWeight: 600 }}>
              ✓ {stats.lastAiEvent}
            </p>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }} />

          {/* Quality Dashboard */}
          <div style={{
            background: 'rgba(255,230,118,0.03)', border: '1px solid rgba(255,215,64,0.15)',
            borderRadius: '10px', padding: '12px 14px', marginBottom: '9px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
             <p style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffab00', marginBottom: '8px', letterSpacing: '1px' }}>
                ⭐ Operator Quality Dashboard
             </p>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                <div>
                   <p style={{ fontSize: '1.4rem', fontWeight: 900, color: stats.efficiencyScore > 80 ? '#00e676' : '#ff4b4b', marginBottom: '-4px' }}>
                      {stats.efficiencyScore}%
                   </p>
                   <p style={{ fontSize: '0.52rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Efficiency Rating</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.66rem', color: '#aaa', marginBottom: '2px' }}>
                      CAPTURED: <strong style={{color: '#00e676'}}>{stats.hitCount}</strong> / MISSED: <strong style={{color: '#ff4b4b'}}>{stats.missedCount}</strong>
                   </p>
                   <p style={{ fontSize: '0.56rem', color: '#666' }}>Avg Latency: {Math.round(stats.avgLatency)}ms</p>
                </div>
             </div>
             <StatBar pct={stats.efficiencyScore} color={stats.efficiencyScore > 80 ? '#00e676' : stats.efficiencyScore > 50 ? '#ffab00' : '#ff4b4b'} />
          </div>

          {/* System Notification Area */}
          <div style={{ minHeight: '38px', marginBottom: '9px' }}>
            {stats.systemMessage && (
              <div style={{
                background: stats.systemMessage.type === 'error' ? 'rgba(255,75,75,0.1)' : 'rgba(255,171,0,0.1)',
                border: `1px solid ${stats.systemMessage.type === 'error' ? '#ff4b4b' : '#ffab00'}`,
                borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px',
                animation: 'shake 0.4s ease-in-out'
              }}>
                <span style={{ fontSize: '0.9rem' }}>{stats.systemMessage.type === 'error' ? '🚨' : '⚠️'}</span>
                <p style={{ fontSize: '0.63rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {stats.systemMessage.text}
                </p>
              </div>
            )}
          </div>

          <ActionLog events={events} />

          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-4px); }
              75% { transform: translateX(4px); }
            }
          `}</style>

        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#0a1a0f', border: '2px solid #00e676',
          borderRadius: '8px', padding: '12px 20px', color: '#00e676',
          fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 4px 20px rgba(0,230,118,0.2)',
          animation: 'toastIn 0.3s ease-out forwards', zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
      <style jsx global>{`
        @keyframes toastIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
