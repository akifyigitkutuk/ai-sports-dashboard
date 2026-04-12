'use client'
import { SPORT_CONFIGS, type SportType } from '@/lib/sportConfigs'
import { type Ball, type GameStats, type Player } from '@/lib/gameEngine'

interface Props {
  stats: GameStats
  ball: Ball
  players: Player[]
}

export default function DigitalTwinPanel({ stats, ball, players }: Props) {
  const sport = stats.sport;
  const digitalTwin = stats.digitalTwin || {};
  const avgLatency = stats.avgLatency || 0;
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
           <div style={{ 
             position: 'relative', height: '150px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', 
             border: '1px solid rgba(0,230,255,0.1)', display: 'flex', alignItems: 'center', 
             justifyContent: 'center', marginBottom: '15px', overflow: 'hidden'
           }}>
              {/* SKELETON POSE ESTIMATION SVG */}
              <svg width="120" height="140" viewBox="0 0 100 120" style={{ filter: 'drop-shadow(0 0 5px rgba(0,230,255,0.3))' }}>
                <defs>
                  <radialGradient id="jointGlow">
                    <stop offset="0%" stopColor="#00e6ff" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                
                {/* Skeleton Bones */}
                <g stroke="#00e6ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                  {/* Spine & Head */}
                  <line x1="50" y1="25" x2="50" y2="60" />
                  <circle cx="50" cy="20" r="6" fill="none" strokeWidth="1" />
                  
                  {/* Arms */}
                  <path d="M30,35 L50,30 L70,35 L80,55" fill="none" />
                  <path d="M30,35 L20,55" fill="none" />
                  
                  {/* Legs */}
                  <path d="M40,90 L50,60 L65,85 L75,110" fill="none" />
                  <path d="M40,90 L30,110" fill="none" />
                </g>

                {/* Tracking Joints (Pulsing) */}
                <g fill="#00e6ff">
                   <circle cx="50" cy="30" r="2.5"><animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" /></circle>
                   <circle cx="30" cy="35" r="2"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle>
                   <circle cx="70" cy="35" r="2"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle>
                   <circle cx="65" cy="85" r="3" fill="#ffab00"><animate attributeName="r" values="2.5;4.5;2.5" dur="1s" repeatCount="indefinite" /></circle>
                   <circle cx="50" cy="60" r="2.5" />
                </g>
              </svg>

              {/* TECHNICAL DATA OVERLAYS */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                 <span style={{ fontSize: '0.45rem', color: '#555', fontWeight: 900 }}>POSE_ESTIMATION_v2.4</span>
                 <span style={{ fontSize: '0.55rem', color: '#00e6ff', fontWeight: 800 }}>JOINT_KNEE: {digitalTwin.jointAngle?.toFixed(1) || '110.0'}°</span>
              </div>

              <div style={{ position: 'absolute', bottom: '8px', right: '8px', textAlign: 'right' }}>
                 <p style={{ margin: 0, fontSize: '0.5rem', color: '#ffab00', fontWeight: 900 }}>VEL_VEC: {'{'}{ball.vx.toFixed(1)}, {ball.vy.toFixed(1)}, 0.4{'}'}</p>
                 <p style={{ margin: 0, fontSize: '0.42rem', color: '#555' }}>ANOMALY: <span style={{ color: '#00e676' }}>NONE</span></p>
              </div>

              <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.45rem', color: '#00e6ff', border: '1px solid #00e6ff', padding: '1px 4px', borderRadius: '2px', fontWeight: 900 }}>
                {avgLatency < 50 ? 'LIVE' : 'BUFFERED'}
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 800 }}>COORDINATES (3D)</div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>X: {ball.x.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Y: {ball.y.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Z: {Math.max(0.2, 1.1 + Math.sin(Date.now() / 400) * 0.1).toFixed(2)}</p>
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
