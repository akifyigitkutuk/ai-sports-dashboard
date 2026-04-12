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
 * Advanced 3D Perspective Projection
 * Matches the deep focal depth of the stadium reference.
 */
function getProj(x: number, y: number, W: number, H: number) {
  const y_norm = y / 80
  const top_narrow = 0.60
  const scale = top_narrow + y_norm * (1 - top_narrow)
  
  const x_offset = (W * (1 - scale)) / 2
  const px = x_offset + (x / 120) * (W * scale)
  const py = 135 + (y / 80) * (H - 185)
  
  return { px, py, scale }
}

function drawStadium(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Deep dark background
  ctx.fillStyle = '#060a0f'
  ctx.fillRect(0, 0, W, H)

  // Stadium Silhouette (Curved Tiers)
  ctx.fillStyle = '#080e14'
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1

  const drawTier = (yStart: number, height: number, skew: number) => {
    ctx.beginPath()
    ctx.moveTo(0, yStart)
    ctx.bezierCurveTo(W * 0.25, yStart - skew, W * 0.75, yStart - skew, W, yStart)
    ctx.lineTo(W, yStart + height)
    ctx.bezierCurveTo(W * 0.75, yStart + height - skew, W * 0.25, yStart + height - skew, 0, yStart + height)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
  }

  // Draw 3-4 layers of tiers for depth
  drawTier(30, 40, 15)
  drawTier(80, 50, 20)
  drawTier(140, 60, 25)

  // Vertical Light Pillars
  for (let i = 0; i < 5; i++) {
    const lx = (W / 5) * i + (W / 10)
    const beam = ctx.createLinearGradient(lx, 0, lx, 180)
    beam.addColorStop(0, 'rgba(0,180,255,0.10)')
    beam.addColorStop(0.6, 'rgba(0,180,255,0.03)')
    beam.addColorStop(1, 'transparent')
    ctx.fillStyle = beam
    ctx.fillRect(lx - 15, 0, 30, 200)
    
    ctx.fillStyle = 'rgba(0,255,255,0.3)'
    ctx.beginPath(); ctx.arc(lx, 4, 2, 0, Math.PI * 2); ctx.fill()
  }

  // Subtle "fog" or ground glow
  const fog = ctx.createLinearGradient(0, H - 100, 0, H)
  fog.addColorStop(0, 'transparent'); fog.addColorStop(1, 'rgba(0,180,255,0.04)')
  ctx.fillStyle = fog; ctx.fillRect(0, H - 100, W, 100)
}

function drawPitch(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const pr = (x: number, y: number) => getProj(x, y, W, H)

  // High Density Grass Stripes (20 Stripes)
  for (let i = 0; i < 20; i++) {
    const step = 120 / 20
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,180,90,0.18)' : 'rgba(0,150,70,0.12)'
    ctx.beginPath()
    const p1 = pr(i * step, 0), p2 = pr((i + 1) * step, 0)
    const p3 = pr((i + 1) * step, 80), p4 = pr(i * step, 80)
    ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py)
    ctx.lineTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py)
    ctx.closePath(); ctx.fill()
  }

  const lc = 'rgba(25, 140, 190, 0.7)'
  ctx.strokeStyle = lc; ctx.lineWidth = 1.4

  // Outer boundary
  const b1 = pr(0, 0), b2 = pr(120, 0), b3 = pr(120, 80), b4 = pr(0, 80)
  ctx.beginPath(); ctx.moveTo(b1.px, b1.py); ctx.lineTo(b2.px, b2.py); ctx.lineTo(b3.px, b3.py); ctx.lineTo(b4.px, b4.py); ctx.closePath(); ctx.stroke()

  // Team Status Bar at Bottom Boundary (Red/Blue from screenshot)
  ctx.lineWidth = 4
  const bMid = pr(60, 80)
  ctx.strokeStyle = '#ff4444'; ctx.beginPath(); ctx.moveTo(b4.px, b4.py); ctx.lineTo(bMid.px, bMid.py); ctx.stroke()
  ctx.strokeStyle = '#4444ff'; ctx.beginPath(); ctx.moveTo(bMid.px, bMid.py); ctx.lineTo(b3.px, b3.py); ctx.stroke()
  ctx.lineWidth = 1.4; ctx.strokeStyle = lc

  // Halfway
  const h1 = pr(60, 0), h2 = pr(60, 80)
  ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()

  // Center Circle
  const cp = pr(60, 40)
  ctx.beginPath()
  ctx.ellipse(cp.px, cp.py, pr(70, 40).px - cp.px, pr(60, 50).py - cp.py, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Goals
  ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 2.2
  const g1s = pr(0, 36), g1e = pr(0, 44), g2s = pr(120, 36), g2e = pr(120, 44)
  ctx.beginPath(); ctx.moveTo(g1s.px, g1s.py); ctx.lineTo(g1e.px, g1e.py); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(g2s.px, g2s.py); ctx.lineTo(g2e.px, g2e.py); ctx.stroke()
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

      drawStadium(ctx, W, H)
      drawPitch(ctx, W, H)

      // Tactical Pass Vectors
      const carrier = players.find(p => p.hasBall)
      if (carrier) {
        players.filter(p => p.team === carrier.team && p.id !== carrier.id && p.role !== 'gk').slice(0, 2).forEach(tm => {
          const s = pr(carrier.x, carrier.y), e = pr(tm.x, tm.y)
          ctx.strokeStyle = 'rgba(0,255,255,0.4)'; ctx.lineWidth = 1.3; ctx.setLineDash([6, 4])
          ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(e.px, e.py); ctx.stroke(); ctx.setLineDash([])
          const rg = ctx.createRadialGradient(e.px, e.py, 0, e.px, e.py, 12 * e.scale)
          rg.addColorStop(0, 'rgba(0,255,255,0.15)'); rg.addColorStop(1, 'transparent')
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(e.px, e.py, 12 * e.scale, 0, Math.PI * 2); ctx.fill()
        })
      }

      // Draw Players as 3D Silhouettes
      [...players].sort((a, b) => a.y - b.y).forEach(p => {
        const { px, py, scale } = pr(p.x, p.y)
        const teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        
        ctx.fillStyle = p.team === 0 ? 'rgba(0,230,118,0.3)' : 'rgba(255,152,0,0.3)'
        ctx.beginPath(); ctx.ellipse(px, py, 14 * scale, 8 * scale, 0, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = '#111'
        ctx.beginPath(); ctx.ellipse(px, py - 6 * scale, 4.5 * scale, 9 * scale, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(px, py - 16 * scale, 3.2 * scale, 0, Math.PI * 2); ctx.fill()
        
        ctx.strokeStyle = teamColor; ctx.lineWidth = 1.2 * scale
        ctx.beginPath(); ctx.ellipse(px, py - 6 * scale, 4.5 * scale, 9 * scale, 0, 0, Math.PI * 2); ctx.stroke()

        if (p.showBox) {
          const bw = 24 * scale, bh = 34 * scale
          ctx.strokeStyle = p.team === 0 ? '#00e676' : '#ffd740'; ctx.lineWidth = 1.2
          ctx.strokeRect(px - bw / 2, py - bh, bw, bh)
          
          const t = 4.5 * scale
          ; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
            const bx = px + dx * bw / 2, by = py + dy * bh / 2
            ctx.beginPath(); ctx.moveTo(bx - dx * t, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by - dy * t); ctx.stroke()
          })

          ctx.font = `bold ${5.5 * scale}px "Inter"`
          const label = `[X: ${Math.round(p.x)}, Y: ${Math.round(p.y)}, Z: 2]`
          const tw = ctx.measureText(label).width + 8
          ctx.fillStyle = 'rgba(0,10,5,0.85)'
          ctx.fillRect(px - tw / 2, py - bh - 12, tw, 10)
          ctx.fillStyle = p.team === 0 ? '#00e676' : '#ffd740'; ctx.textAlign = 'center'
          ctx.fillText(label, px, py - bh - 4.5)
        }
      })

      // ENHANCED 3D Ball with "Solar Bloom" Glow
      const bp = pr(ball.x, ball.y)
      const bs = bp.scale
      
      const bloom = ctx.createRadialGradient(bp.px, bp.py, 0, bp.px, bp.py, 22 * bs)
      bloom.addColorStop(0, 'rgba(255,255,255,0.7)'); bloom.addColorStop(0.3, 'rgba(255,255,255,0.3)'); bloom.addColorStop(1, 'transparent')
      ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(bp.px, bp.py, 22 * bs, 0, Math.PI * 2); ctx.fill()

      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 5 * bs, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#00aaff'; ctx.lineWidth = 1 * bs; ctx.stroke()

      // Anomaly Popup Styling
      if (stats.showAnomalyPopup) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H)
        const pw = 340, ph = 170, px = (W - pw) / 2, py = (H - ph) / 2
        const g2 = ctx.createLinearGradient(px, py, px, py + ph)
        g2.addColorStop(0, '#1a0505'); g2.addColorStop(1, '#2c0c0c')
        ctx.fillStyle = g2; roundRect(ctx, px, py, pw, ph, 14); ctx.fill()
        ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2.5; ctx.stroke()
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 25; ctx.stroke(); ctx.shadowBlur = 0
        ctx.textAlign = 'center'; ctx.fillStyle = '#ff1744'; ctx.font = '800 14px "Inter"'
        ctx.fillText('Warning: Shot detected in own half.', W/2, py + 52)
        ctx.fillStyle = '#eee'; ctx.font = '600 12px "Inter"'; ctx.fillText('Did you mean "Pass"?', W/2, py + 82)
        ctx.fillStyle = '#999'; ctx.font = '700 12px "Inter"'; ctx.fillText('[Yes/No]', W/2, py + 107)
        const bw = pw * 0.7; ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect((W-bw)/2, py + 122, bw, 6)
        ctx.fillStyle = '#1e88e5'; ctx.fillRect((W-bw)/2, py + 122, bw * 0.45, 6)
        ctx.fillStyle = '#00e676'; ctx.font = '600 10px "Inter"'; ctx.fillText('<1 second (AI Check)', W/2, py + 144)
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="pitch-container" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={720} height={460} style={{ width: '100%', display: 'block' }} />
      {propsRef.current.stats.showAnomalyPopup && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ marginTop: '16%', display: 'flex', gap: '15px' }}>
             <button onClick={() => onAcceptAnomaly(true)} style={{ background: 'rgba(0,230,118,0.25)', border: '2px solid #00e676', color: '#00e676', padding: '7px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Yes — Pass</button>
             <button onClick={() => onAcceptAnomaly(false)} style={{ background: 'rgba(255,75,75,0.12)', border: '2px solid #ff4b4b', color: '#ff4b4b', padding: '7px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>No — Keep</button>
          </div>
        </div>
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}
