'use client'
import { SPORT_CONFIGS, type SportType } from '@/lib/sportConfigs'
import { type Ball } from '@/lib/gameEngine'

interface Props {
  sport: SportType
  ball: Ball
  digitalTwin: Record<string, number>
  avgLatency: number
}

export default function DigitalTwinPanel({ sport, ball, digitalTwin, avgLatency }: Props) {
  const conf = SPORT_CONFIGS[sport]
  
  return (
    <div style={{
      background: 'rgba(0,15,30,0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0,230,255,0.2)',
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,230,255,0.1)', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', color: '#00e6ff' }}>DIGITAL TWIN TELEMETRY</h3>
        <span style={{ fontSize: '0.6rem', background: 'rgba(0,230,255,0.1)', color: '#00e6ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>LIVE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexGrow: 1 }}>
        {/* LEFT: PHYSICAL TO DIGITAL MAPPING */}
        <div>
           <div style={{ position: 'relative', height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(0,230,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
              {/* Simple Wireframe SVG based on sport */}
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#00e6ff" strokeWidth="0.5" strokeDasharray="2,2" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#00e6ff" strokeWidth="1" />
                <path d="M50 10 L50 90 M10 50 L90 50" stroke="rgba(0,230,255,0.3)" strokeWidth="0.5" />
                {/* Movement Vector */}
                <line x1="50" y1="50" x2={50 + ball.vx * 10} y2={50 + ball.vy * 10} stroke="#00e676" strokeWidth="2" markerEnd="url(#arrow)" />
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#00e676" />
                  </marker>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '0.5rem', color: '#555' }}>
                REF_ID: {Math.random().toString(36).substring(7).toUpperCase()}
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 800 }}>COORDINATES (3D)</div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>X: {ball.x.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Y: {ball.y.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Z: {Math.abs(Math.sin(Date.now() / 1000) * 2).toFixed(2)}</p>
           </div>
        </div>

        {/* RIGHT: ASSET ANALYSIS */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '20px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conf.digitalTwinMetrics.map(m => (
                <div key={m.key}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.55rem', color: '#aaa', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#00e6ff' }}>
                    {digitalTwin[m.key]?.toFixed(1) || '0.0'}<span style={{ fontSize: '0.6rem', marginLeft: '3px', color: '#555' }}>{m.unit}</span>
                  </p>
                </div>
              ))}
              
              <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.55rem', color: '#aaa', fontWeight: 700 }}>SYSTEM STATUS</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#00e676' }}>VERIFIED ✓</p>
                  <p style={{ margin: 0, fontSize: '0.6rem', color: '#555' }}>LATENCY: &lt;{Math.round(avgLatency)}ms</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
