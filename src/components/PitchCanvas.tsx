'use client'
import { useEffect, useRef } from 'react'
import type { Player, Ball, GameStats } from '@/lib/gameEngine'
import { SPORT_CONFIGS, type SportType } from '@/lib/sportConfigs'

interface Props {
  players: Player[]
  ball: Ball
  stats: GameStats
  onAcceptAnomaly: (changeToPass: boolean) => void
}

function getProj(x: number, y: number, W: number, H: number, sport: SportType) {
  const conf = SPORT_CONFIGS[sport]
  const y_norm = y / conf.dimY
  const top_narrow = conf.perspectiveTop
  const scale = top_narrow + y_norm * (1 - top_narrow)
  const x_offset = (W * (1 - scale)) / 2
  const px = x_offset + (x / conf.dimX) * (W * scale)
  const py = 120 + (y / conf.dimY) * (H - 160)
  return { px, py, scale }
}

function drawStadium(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  // Cyber-Atmosphere
  const glow = ctx.createLinearGradient(0, 0, 0, 150)
  glow.addColorStop(0, 'rgba(0,100,255,0.05)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 150)
}

function drawField(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  const conf = SPORT_CONFIGS[sport]
  const pr = (x: number, y: number) => getProj(x, y, W, H, sport)
  const s1 = pr(0, 0), s2 = pr(conf.dimX, 0), s3 = pr(conf.dimX, conf.dimY), s4 = pr(0, conf.dimY)
  
  // Field Perimeter Glow
  ctx.strokeStyle = conf.markingColor; ctx.lineWidth = 1; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(s3.px, s3.py); ctx.lineTo(s4.px, s4.py); ctx.closePath(); ctx.stroke()

  ctx.globalAlpha = 0.8; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = conf.markingColor
  
  if (sport === 'SOCCER') {
    const h1 = pr(60, 0), h2 = pr(60, 80); ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()
    const cp = pr(60, 40); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 40*cp.scale, 20*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
    // Goals
    ctx.strokeRect(pr(0, 32).px - 5, pr(0, 32).py, 10, pr(0, 48).py - pr(0, 32).py)
    ctx.strokeRect(pr(120, 32).px - 5, pr(120, 32).py, 10, pr(120, 48).py - pr(120, 32).py)
  } else if (sport === 'HOCKEY') {
    [75, 125].forEach(x => { const p1 = pr(x, 0), p2 = pr(x, 85); ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke() })
    const cl1 = pr(100,0), cl2 = pr(100,85); ctx.strokeStyle = '#ff1744'; ctx.beginPath(); ctx.moveTo(cl1.px, cl1.py); ctx.lineTo(cl2.px, cl2.py); ctx.stroke()
    ctx.strokeStyle = conf.markingColor
    const spots = [[30,20], [170,65], [100, 42.5]]; spots.forEach(p => {
        const c = pr(p[0], p[1]); ctx.beginPath(); ctx.ellipse(c.px, c.py, 10*c.scale, 5*c.scale, 0, 0, Math.PI*2); ctx.stroke()
    })
  } else if (sport === 'BASKETBALL') {
    const cp = pr(47, 25); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 12*cp.scale, 6*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(0, 25).px, pr(0, 25).py, 35*cp.scale, 20*cp.scale, 0, -Math.PI/2, Math.PI/2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(94, 25).px, pr(94, 25).py, 35*cp.scale, 20*cp.scale, 0, Math.PI/2, 3*Math.PI/2); ctx.stroke()
  } else if (sport === 'F1' && conf.f1Path) {
    ctx.strokeStyle = '#00e6ff'; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.beginPath()
    conf.f1Path.forEach((pt, i) => { const p = pr(pt.x, pt.y); if (i === 0) ctx.moveTo(p.px, p.py); else ctx.lineTo(p.px, p.py) })
    ctx.closePath(); ctx.stroke()
    // Checkered line
    const sp = pr(60, 18); ctx.strokeStyle = '#fff'; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(sp.px, sp.py - 15); ctx.lineTo(sp.px, sp.py + 15); ctx.stroke(); ctx.setLineDash([])
  }
  
  ctx.shadowBlur = 0; ctx.globalAlpha = 1.0
}

export default function PitchCanvas({ players, ball, stats, onAcceptAnomaly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ players, ball, stats, onAcceptAnomaly })
  propsRef.current = { players, ball, stats, onAcceptAnomaly }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return
    let animId: number; let frame = 0
    const render = () => {
      frame++; const { players, ball, stats } = propsRef.current, W = canvas.width, H = canvas.height, sport = stats.sport || 'SOCCER', pr = (x: number, y: number) => getProj(x, y, W, H, sport)
      drawStadium(ctx, W, H, sport); drawField(ctx, W, H, sport)
      
      players.forEach((p, idx) => {
        const { px, py, scale } = pr(p.x, p.y), teamColor = p.team === 0 ? '#00e676' : '#ff9100'
        
        ctx.shadowBlur = 10; ctx.shadowColor = teamColor
        if (sport === 'F1') {
          ctx.fillStyle = teamColor; ctx.fillRect(px - 6*scale, py - 4*scale, 12*scale, 8*scale)
        } else {
          ctx.fillStyle = teamColor; ctx.beginPath(); ctx.arc(px, py-6*scale, 4*scale, 0, Math.PI*2); ctx.fill()
        }
        
        if (p.showBox) {
            ctx.strokeStyle = teamColor; ctx.lineWidth = 1; ctx.strokeRect(px-12*scale, py-20*scale, 24*scale, 24*scale)
            ctx.fillStyle = teamColor; ctx.font = `800 ${9*scale}px Outfit`; ctx.fillText(p.label, px-12*scale, py-24*scale)
        }
      })

      const bp = pr(ball.x, ball.y)
      if (stats.sport !== 'F1') {
        ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 3*bp.scale, 0, Math.PI*2); ctx.fill()
      }

      ctx.shadowBlur = 0; animId = requestAnimationFrame(render)
    }
    render(); return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="pitch-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px', background: '#000' }}>
      <canvas ref={canvasRef} width={1200} height={600} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}
