'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { GameEngine, type GameStats, type GameEvent, type Player, type Ball } from '@/lib/gameEngine'
import { type SportType, SPORT_CONFIGS } from '@/lib/sportConfigs'
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

function SportButton({ sport, current, onClick }: { sport: SportType, current: SportType, onClick: (s: SportType) => void }) {
  const conf = SPORT_CONFIGS[sport]
  const isActive = sport === current
  return (
    <button onClick={() => onClick(sport)} style={{
      background: isActive ? 'rgba(0,180,255,0.25)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? '#00e6ff' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: isActive ? '0 0 15px rgba(0,230,255,0.3)' : 'none',
      borderRadius: '12px', padding: '10px 18px', color: isActive ? '#fff' : '#888',
      fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
      textTransform: 'uppercase', letterSpacing: '1.5px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Outfit', sans-serif",
      display: 'flex', alignItems: 'center', gap: '8px'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#00e6ff' : 'transparent', transition: 'all 0.3s' }} />
      {conf.name}
    </button>
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
      efficiencyScore: 100, hitCount: 0, missedCount: 0, avgLatency: 0, systemMessage: null,
      sport: 'SOCCER',
      throughput: 0, streamStability: 100, aiConfidence: 99.4, anomalyRate: 0
    },
    players: [], ball: { x: 60, y: 40, vx: 0, vy: 0 },
    events: [], positionHistory: [],
  })

  const [sport, setSport] = useState<SportType>('SOCCER')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    engineRef.current = new GameEngine(sport)
    lastTickRef.current = 0

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
  }, [sport])

  const handleAcceptAnomaly = useCallback((changeToPass: boolean) => {
    engineRef.current?.acceptAnomaly(changeToPass)
    if (changeToPass) setToast('Data Corrected by AI ✓ (< 50ms)')
  }, [])

  const handleManualEvent = useCallback((type: string) => {
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

  // Dynamic Ticker Messages
  const tickerItems = [
    `ANALYSIS: ${SPORT_CONFIGS[sport].name} tracking active.`,
    `ENGINE: Computer Vision models optimized for ${SPORT_CONFIGS[sport].objectName} motion.`,
    `ALERT: Latency spikes detected in regional stream FE_018 - mitigating.`,
    `STRATEGY: ${sport === 'F1' ? 'Car #7 managing tire wear' : 'Home team pushing deep defensive line'}.`,
    `AI: Prediction confidence at 99.4% for next event.`
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#04080c', padding: '0', fontFamily: "'Outfit', sans-serif", color: '#fff' }}>

      {/* ── TOP GLASS BAR ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(6,12,20,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#00e6ff,#0062ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>A</div>
          <div>
            <h1 style={{ fontSize: '0.9rem', fontWeight: 900, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Akif Yiğit Kütük</h1>
            <p style={{ fontSize: '0.6rem', color: '#00e6ff', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>MULTI-SPORT COMMAND CENTER</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
           {(['SOCCER', 'HOCKEY', 'BASKETBALL', 'AM_FOOTBALL', 'F1'] as SportType[]).map(s => (
              <SportButton key={s} sport={s} current={sport} onClick={(val) => setSport(val)} />
           ))}
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, color: '#00e676' }}>SYSTEM STATUS: OPTIMAL</p>
          <p style={{ fontSize: '0.55rem', color: '#555', margin: 0 }}>LATENCY: {Math.round(stats.avgLatency)}ms | FPS: 60</p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* ── 3-COLUMN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.4fr 1fr', gap: '20px' }}>

          {/* ════ LEFT ════ */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px', padding: '20px', marginBottom: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#00e6ff', marginBottom: '16px' }}>
                Operational Metrics
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#aaa', marginBottom: '6px' }}>
                  <span>POSSESSION</span>
                  <span style={{ color: '#00e6ff' }}>{Math.round(stats.homePossession)}%</span>
                </div>
                <StatBar pct={stats.homePossession} color="linear-gradient(90deg,#0062ff,#00e6ff)" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#aaa', marginBottom: '6px' }}>
                  <span>PASS ACCURACY</span>
                  <span style={{ color: '#00e676' }}>{Math.round(stats.passAccuracy)}%</span>
                </div>
                <StatBar pct={stats.passAccuracy} color="linear-gradient(90deg,#00c853,#64ffda)" />
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '16px' }}>
                <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>OPERATOR FATIGUE</span>
                  <span style={{ color: riskHex, fontWeight: 800 }}>{riskPct}%</span>
                </p>
                <StatBar pct={riskPct} color={riskColor} />
                {isHighRisk && (
                  <div style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid #ff4b4b', borderRadius: '8px', padding: '8px', marginTop: '12px', fontSize: '0.6rem', color: '#ff4b4b', fontWeight: 800, textAlign: 'center', animation: 'blink 1s infinite' }}>
                    🚨 ACTION REQUIRED: OPERATOR SWAP SUGGESTED
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>
                AI Model Insights (YOLO/XGB)
              </p>
              {[
                { label: 'Tracking Confidence', val: '99.2%', col: '#00e676' },
                { label: 'Anomaly Probability', val: '0.04%', col: '#aaa' },
                { label: 'Predicted Match Quality', val: 'High', col: '#ffab00' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.62rem', color: '#666', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '0.7rem', color: item.col, fontWeight: 900 }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ════ CENTER ════ */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', background: '#060c14', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '8px', borderLeft: '3px solid #00e6ff' }}>
                  <p style={{ fontSize: '0.55rem', color: '#00e6ff', fontWeight: 800, margin: 0, letterSpacing: '1px' }}>LIVE STREAM FE_ID_042</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>{SPORT_CONFIGS[sport].name} VR-RENDER</p>
                </div>
              </div>

              <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, margin: 0 }}>HOME</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#00e676' }}>{stats.homeScore}</p>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 200, color: '#222' }}>:</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, margin: 0 }}>AWAY</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#ff9800' }}>{stats.awayScore}</p>
                  </div>
                </div>
              </div>

              <PitchCanvas players={players} ball={ball} stats={stats} onAcceptAnomaly={handleAcceptAnomaly} />
              
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'center' }}>
                 <MatchTimeline events={events} currentMinute={stats.minute} sport={sport} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 2fr', gap: '20px', marginTop: '20px' }}>
              <BallTrackerCanvas ball={ball} sport={sport} />
              <HeatmapCanvas positionHistory={positionHistory} />
            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div>
            <div style={{
              background: 'rgba(0,230,255,0.03)', border: '1px solid rgba(0,230,255,0.1)',
              borderRadius: '16px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#00e6ff', marginBottom: '16px' }}>
                Productivity & Audit
              </p>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: stats.efficiencyScore > 80 ? '#00e676' : '#ffab00' }}>
                  {stats.efficiencyScore}%
                </p>
                <p style={{ fontSize: '0.52rem', color: '#555', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Efficiency Rating</p>
                <StatBar pct={stats.efficiencyScore} color={stats.efficiencyScore > 80 ? '#00e676' : '#ffab00'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'REACTION TIME', val: `${Math.round(stats.avgLatency)}ms`, col: stats.avgLatency < 500 ? '#00e676' : '#ff4b4b' },
                  { label: 'THROUGHPUT', val: `${stats.throughput}/min`, col: '#00e6ff' },
                  { label: 'AUDIT STABILITY', val: `${Math.round(stats.streamStability)}%`, col: stats.streamStability > 90 ? '#00e676' : '#ffab00' },
                  { label: 'AI CONFIDENCE', val: `${stats.aiConfidence.toFixed(1)}%`, col: '#aaa' },
                  { label: 'ANOMALY RATE', val: `${stats.anomalyRate}%`, col: stats.anomalyRate < 5 ? '#00e676' : '#ffab00' },
                  { label: 'TOTAL CAPTURE', val: stats.hitCount, col: '#00e676' }
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ fontSize: '0.48rem', color: '#555', fontWeight: 800, margin: '0 0 2px 0' }}>{item.label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 900, color: item.col, margin: 0 }}>{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
                {sport} ACTION MATRIX
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {SPORT_CONFIGS[sport].actionButtons.map(ev => (
                  <button key={ev} onClick={() => handleManualEvent(ev)} style={{
                    padding: '16px 10px', background: 'rgba(255,255,255,0.03)',
                    color: '#fff', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900,
                    letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,230,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.border = '1px solid #00e6ff'; (e.currentTarget as HTMLButtonElement).style.color = '#00e6ff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ minHeight: '44px', marginBottom: '20px' }}>
              {stats.systemMessage && (
                <div style={{
                  background: stats.systemMessage.type === 'error' ? 'rgba(255,75,75,0.08)' : 'rgba(255,171,0,0.08)',
                  border: `1px solid ${stats.systemMessage.type === 'error' ? '#ff4b4b' : '#ffab00'}`,
                  borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  animation: 'shake 0.4s ease-in-out'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.systemMessage.type === 'error' ? '#ff4b4b' : '#ffab00', animation: 'blink 1s infinite' }} />
                  <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {stats.systemMessage.text}
                  </p>
                </div>
              )}
            </div>

            <ActionLog events={events} />
          </div>
        </div>
      </div>

      {/* ── STRATEGIC TICKER ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0,230,255,0.2)',
        padding: '6px 0', height: '28px', overflow: 'hidden', zIndex: 2000
      }}>
        <div style={{
          display: 'flex', whiteSpace: 'nowrap', width: '200%',
          animation: 'ticker 30s linear infinite'
        }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ fontSize: '0.62rem', fontWeight: 800, color: '#00e6ff', margin: '0 40px', letterSpacing: '1.5px' }}>
               📡 {item}
            </span>
          ))}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', right: '32px',
          background: 'rgba(6,20,12,0.9)', backdropFilter: 'blur(10px)',
          border: '1px solid #00e676', boxShadow: '0 10px 40px rgba(0,230,118,0.2)',
          borderRadius: '12px', padding: '16px 24px', color: '#00e676',
          fontSize: '0.8rem', fontWeight: 900, zIndex: 9999,
          animation: 'toastIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>✓</span>
            {toast}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes toastIn {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

    </div>
  )
}
