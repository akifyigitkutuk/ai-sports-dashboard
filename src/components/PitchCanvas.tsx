'use client'
import { useEffect, useRef } from 'react'
import type { Player, Ball, GameStats } from '@/lib/gameEngine'

interface Props {
  players: Player[]
  ball: Ball
  stats: GameStats
  onAcceptAnomaly: (changeToPass: boolean) => void
}

/**
 * Perspective Projection
 * StatsBomb units (120x80) -> Canvas pixels (W x H)
 * Narrower at the top, wider at the bottom (2.5D Isometric style)
 */
function getProj(x: number, y: number, W: number, H: number) {
  const y_norm = y / 80
  // Field narrowing at top: 70% width at top, 100% at base
  const top_narrow = 0.70
  const scale = top_narrow + y_norm * (1 - top_narrow)
  
  // Center horizontally based on the current perspective width
  const x_offset = (W * (1 - scale)) / 2
  const px = x_offset + (x / 120) * (W * scale)
  
  // Vertical squeeze and offset to create depth
  // We place the pitch in the lower part of the canvas
  const py = 50 + (y / 80) * (H - 80)
  
  return { px, py, scale }
}

function drawPitch(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const pr = (x: number, y: number) => getProj(x, y, W, H)

  // Dark background (Stadium Floor)
  ctx.fillStyle = '#04080c'
  ctx.fillRect(0, 0, W, H)

  // Side Stadium Glows (Neon Blue accents from screenshot)
  const leftGlow = ctx.createLinearGradient(0, 0, W * 0.2, 0)
  leftGlow.addColorStop(0, 'rgba(0,180,255,0.08)'); leftGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = leftGlow; ctx.fillRect(0, 0, W * 0.2, H)

  const rightGlow = ctx.createLinearGradient(W * 0.8, 0, W, 0)
  rightGlow.addColorStop(1, 'rgba(0,180,255,0.08)'); rightGlow.addColorStop(0, 'transparent')
  ctx.fillStyle = rightGlow; ctx.fillRect(W * 0.8, 0, W * 0.2, H)

  // Top Stadium Structure (Subtle lines)
  ctx.strokeStyle = 'rgba(0,255,255,0.03)'; ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(0, 10 * i); ctx.lineTo(W, 10 * i); ctx.stroke()
  }

  // Draw the Grass Stripes with Perspective
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,140,70,0.15)' : 'rgba(0,110,45,0.10)'
    ctx.beginPath()
    const p1 = pr(i * 10, 0), p2 = pr((i + 1) * 10, 0)
    const p3 = pr((i + 1) * 10, 80), p4 = pr(i * 10, 80)
    ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py)
    ctx.lineTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py)
    ctx.closePath(); ctx.fill()
  }

  const lc = 'rgba(25, 120, 160, 0.6)' // Line color
  ctx.strokeStyle = lc
  ctx.lineWidth = 1.3

  // Outer boundary
  const b1 = pr(0, 0), b2 = pr(120, 0), b3 = pr(120, 80), b4 = pr(0, 80)
  ctx.beginPath()
  ctx.moveTo(b1.px, b1.py); ctx.lineTo(b2.px, b2.py)
  ctx.lineTo(b3.px, b3.py); ctx.lineTo(b4.px, b4.py)
  ctx.closePath(); ctx.stroke()

  // Halfway line
  const h1 = pr(60, 0), h2 = pr(60, 80)
  ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()

  // Center Circle
  const cp = pr(60, 40)
  ctx.beginPath()
  // Ellipse used to simulate perspective circle
  const rx = pr(70, 40).px - cp.px
  const ry = pr(60, 50).py - cp.py
  ctx.ellipse(cp.px, cp.py, rx, ry, 0, 0, Math.PI * 2)
  ctx.stroke()
  
  // Center spot
  ctx.beginPath(); ctx.arc(cp.px, cp.py, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = lc; ctx.fill()

  // Penalty boxes (Projected)
  const pb_paths = [
    [[0,18], [18,18], [18,62], [0,62]],
    [[120,18], [102,18], [102,62], [120,62]]
  ]
  pb_paths.forEach(pts => {
    ctx.beginPath()
    const start = pr(pts[0][0], pts[0][1])
    ctx.moveTo(start.px, start.py)
    pts.slice(1).forEach(pt => {
       const p = pr(pt[0], pt[1])
       ctx.lineTo(p.px, p.py)
    })
    ctx.stroke()
  })

  // 6-yard boxes
  const sb_paths = [
    [[0,30], [6,30], [6,50], [0,50]],
    [[120,30], [114,30], [114,50], [120,50]]
  ]
  sb_paths.forEach(pts => {
    ctx.beginPath()
    const start = pr(pts[0][0], pts[0][1])
    ctx.moveTo(start.px, start.py)
    pts.slice(1).forEach(pt => {
       const p = pr(pt[0], pt[1])
       ctx.lineTo(p.px, p.py)
    })
    ctx.stroke()
  })

  // Goals (Drawn with depth)
  ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 1.6
  const g1s = pr(0, 36), g1e = pr(0, 44), g2s = pr(120, 36), g2e = pr(120, 44)
  ctx.beginPath(); ctx.moveTo(g1s.px, g1s.py); ctx.lineTo(g1e.px, g1e.py); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(g2s.px, g2s.py); ctx.lineTo(g2e.px, g2e.py); ctx.stroke()
  
  // Goal Depth
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  const d1 = pr(-2, 36), d2 = pr(-2, 44)
  ctx.beginPath(); ctx.moveTo(g1s.px, g1s.py); ctx.lineTo(d1.px, d1.py); ctx.lineTo(d2.px, d2.py); ctx.lineTo(g1e.px, g1e.py); ctx.stroke()
  
  const d3 = pr(122, 36), d4 = pr(122, 44)
  ctx.beginPath(); ctx.moveTo(g2s.px, g2s.py); ctx.lineTo(d3.px, d3.py); ctx.lineTo(d4.px, d4.py); ctx.lineTo(g2e.px, g2e.py); ctx.stroke()
}

export default function PitchCanvas({ players, ball, stats, onAcceptAnomaly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ players, ball, stats, onAcceptAnomaly })
  propsRef.current = { players, ball, stats, onAcceptAnomaly }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      const { players, ball, stats } = propsRef.current
      const W = canvas.width, H = canvas.height
      const pr = (x: number, y: number) => getProj(x, y, W, H)

      drawPitch(ctx, W, H)

      // Draw Projected Pass Lines
      const carrier = players.find(p => p.hasBall)
      if (carrier) {
        const tms = players.filter(p => p.team === carrier.team && p.id !== carrier.id && p.role !== 'gk').slice(0, 2)
        tms.forEach(tm => {
          const s = pr(carrier.x, carrier.y), e = pr(tm.x, tm.y)
          ctx.save()
          ctx.strokeStyle = 'rgba(0,180,255,0.6)'; ctx.lineWidth = 1.3; ctx.setLineDash([5, 4])
          ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(e.px, e.py); ctx.stroke()
          
          const ang = Math.atan2(e.py - s.py, e.px - s.px); ctx.setLineDash([])
          ctx.fillStyle = 'rgba(0,255,255,0.7)'
          ctx.beginPath(); ctx.moveTo(e.px, e.py)
          ctx.lineTo(e.px - 8 * Math.cos(ang - 0.4), e.py - 8 * Math.sin(ang - 0.4))
          ctx.lineTo(e.px - 8 * Math.cos(ang + 0.4), e.py - 8 * Math.sin(ang + 0.4))
          ctx.fill(); ctx.restore()
        })
      }

      // Draw Players (Sorted by Y for correct overlapping)
      [...players].sort((a, b) => a.y - b.y).forEach(p => {
        const { px, py, scale } = pr(p.x, p.y)
        const teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        
        // Shadow/Glow at base
        const g = ctx.createRadialGradient(px, py, 0, px, py, 14 * scale)
        g.addColorStop(0, p.team === 0 ? 'rgba(0,230,118,0.35)' : 'rgba(255,152,0,0.35)')
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 14 * scale, 0, Math.PI * 2); ctx.fill()

        // Player Model Simplified (Head/Body circles)
        ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(px, py - 4 * scale, 3 * scale, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = teamColor; ctx.beginPath(); ctx.arc(px, py, 5 * scale, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()

        if (p.showBox) {
          const bw = 24 * scale, bh = 30 * scale
          ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 1
          ctx.strokeRect(px - bw / 2, py - bh, bw, bh)
          
          // Corner accents (Isometric style)
          ctx.beginPath(); ctx.moveTo(px - bw / 2, py - bh + 4); ctx.lineTo(px - bw / 2, py - bh); ctx.lineTo(px - bw / 2 + 4, py - bh); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(px + bw / 2, py - bh + 4); ctx.lineTo(px + bw / 2, py - bh); ctx.lineTo(px + bw / 2 - 4, py - bh); ctx.stroke()

          // Floating Label
          ctx.font = `bold ${5.5 * scale}px "Inter"`
          ctx.textAlign = 'center'
          const tw = ctx.measureText(p.label).width + 6
          ctx.fillStyle = 'rgba(0,0,10,0.85)'
          ctx.fillRect(px - tw/2, py - bh - 11, tw, 9)
          ctx.fillStyle = '#ffd740'; ctx.fillText(p.label, px, py - bh - 4)
        }
      })

      // Ball (Projected)
      const bp = pr(ball.x, ball.y)
      const bs = bp.scale
      const ballGlow = ctx.createRadialGradient(bp.px, bp.py, 0, bp.px, bp.py, 10 * bs)
      ballGlow.addColorStop(0, 'rgba(255,255,255,0.5)'); ballGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = ballGlow; ctx.beginPath(); ctx.arc(bp.px, bp.py, 10 * bs, 0, Math.PI * 2); ctx.fill()

      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 4 * bs, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 1.2 * bs; ctx.stroke()

      // Anomaly Popup Overlay (Centered)
      if (stats.showAnomalyPopup) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H)
        const pw = W * 0.44, ph = H * 0.35
        const px = (W - pw) / 2, py = (H - ph) / 2
        
        ctx.fillStyle = '#1a0505'; 
        const g2 = ctx.createLinearGradient(px, py, px, py + ph)
        g2.addColorStop(0, '#1a0505'); g2.addColorStop(1, '#250b0b')
        ctx.fillStyle = g2
        roundRect(ctx, px, py, pw, ph, 12); ctx.fill()
        
        ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2; ctx.stroke()
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 15; ctx.stroke(); ctx.shadowBlur = 0
        
        ctx.textAlign = 'center'; ctx.fillStyle = '#ff1744'; ctx.font = '700 13px "Inter"'
        ctx.fillText('Warning: Shot detected in own half.', W / 2, py + 42)
        ctx.fillStyle = '#ffffff'; ctx.font = '500 11px "Inter"'
        ctx.fillText('Did you mean "Pass"?', W / 2, py + 72)
        
        const bw = pw * 0.65; ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect((W-bw)/2, py + 90, bw, 6)
        ctx.fillStyle = '#00e676'; ctx.fillRect((W-bw)/2, py + 90, bw * 0.88, 6)
        ctx.fillStyle = '#aaa'; ctx.font = '400 9px "Inter"'
        ctx.fillText('<1 second (AI Check)', W / 2, py + 110)
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="pitch-container" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={720} height={430} style={{ width: '100%', display: 'block' }} />
      {propsRef.current.stats.showAnomalyPopup && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ marginTop: '14%', display: 'flex', gap: '10px' }}>
             <button onClick={() => onAcceptAnomaly(true)} style={{ background: 'rgba(0,230,118,0.25)', border: '2px solid #00e676', color: '#00e676', padding: '6.5px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.67rem', fontWeight: 800 }}>YES — CHANGE TO PASS</button>
             <button onClick={() => onAcceptAnomaly(false)} style={{ background: 'rgba(255,75,75,0.12)', border: '2px solid #ff4b4b', color: '#ff4b4b', padding: '6.5px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.67rem', fontWeight: 800 }}>NO — KEEP AS SHOT</button>
          </div>
        </div>
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}
