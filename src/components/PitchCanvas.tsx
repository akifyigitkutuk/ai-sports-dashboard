'use client'
import { useEffect, useRef, useState } from 'react'
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

function drawGoal(ctx: CanvasRenderingContext2D, pr: any, x: number, y: number, w: number, h: number, depth: number, color: string = '#fff') {
    const p1 = pr(x, y), p2 = pr(x, y+w), p3 = pr(x+depth, y+w), p4 = pr(x+depth, y)
    const tp1 = { px: p1.px, py: p1.py - h * p1.scale }
    const tp2 = { px: p2.px, py: p2.py - h * p2.scale }
    const tp3 = { px: p3.px, py: p3.py - h * p3.scale }
    const tp4 = { px: p4.px, py: p4.py - h * p4.scale }

    ctx.strokeStyle = color; ctx.lineWidth = 2 * p1.scale; ctx.beginPath()
    ctx.moveTo(p1.px, p1.py); ctx.lineTo(tp1.px, tp1.py); ctx.lineTo(tp2.px, tp2.py); ctx.lineTo(p2.px, p2.py); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(tp1.px, tp1.py); ctx.lineTo(tp4.px, tp4.py); ctx.lineTo(tp3.px, tp3.py); ctx.lineTo(tp2.px, tp2.py); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(tp4.px, tp4.py); ctx.lineTo(p4.px, p4.py); ctx.stroke()
    ctx.globalAlpha = 0.1; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1.0
}

function drawHoop(ctx: CanvasRenderingContext2D, pr: any, x: number, y: number) {
    const base = pr(x, y)
    const h = 25, rim_off = 12
    const center = { px: base.px, py: base.py - h * base.scale }
    // Backboard
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2 * base.scale
    ctx.strokeRect(center.px - 10*base.scale, center.py - 15*base.scale, 20*base.scale, 15*base.scale)
    // Rim
    ctx.strokeStyle = '#ff3d00'; ctx.lineWidth = 3 * base.scale
    ctx.beginPath(); ctx.ellipse(center.px, center.py - 2*base.scale, 6*base.scale, 3*base.scale, 0, 0, Math.PI*2); ctx.stroke()
    // Support
    const pole_base = pr(x + (x < 10 ? -2 : 2), y)
    ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(pole_base.px, pole_base.py); ctx.lineTo(center.px, center.py); ctx.stroke()
}

function drawField(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType, textures: Record<string, HTMLImageElement>) {
  const conf = SPORT_CONFIGS[sport]
  const pr = (x: number, y: number) => getProj(x, y, W, H, sport)
  const s1 = pr(0, 0), s2 = pr(conf.dimX, 0), s3 = pr(conf.dimX, conf.dimY), s4 = pr(0, conf.dimY)
  
  ctx.save()
  if (sport === 'HOCKEY') {
    const r = 15 // corner radius
    ctx.beginPath(); ctx.moveTo(s1.px + r, s1.py); ctx.arcTo(s2.px, s2.py, s3.px, s3.py, r); 
    ctx.arcTo(s3.px, s3.py, s4.px, s4.py, r); ctx.arcTo(s4.px, s4.py, s1.px, s1.py, r); 
    ctx.arcTo(s1.px, s1.py, s2.px, s2.py, r); ctx.closePath(); ctx.clip()
  } else {
    ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(s3.px, s3.py); ctx.lineTo(s4.px, s4.py); ctx.closePath(); ctx.clip()
  }

  const tex = textures[sport]
  if (tex && tex.complete) {
    const pattern = ctx.createPattern(tex, 'repeat')
    if (pattern) { ctx.fillStyle = pattern; ctx.save(); ctx.scale(1, 0.6); ctx.translate(0, 100); ctx.fillRect(-W, -H, W*3, H*3); ctx.restore() }
  } else { ctx.fillStyle = conf.surfaceColor; ctx.fill() }
  
  const v1 = pr(conf.dimX/2, conf.dimY/2), vig = ctx.createRadialGradient(v1.px, v1.py, 0, v1.px, v1.py, W*0.5)
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vig; ctx.fill(); ctx.restore()

  // Precision Markings
  ctx.strokeStyle = conf.markingColor; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.6
  if (sport === 'SOCCER') {
    const h1 = pr(60, 0), h2 = pr(60, 80); ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()
    const cp = pr(60, 40); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 40*cp.scale, 20*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
    // Penalty areas
    ctx.strokeRect(s1.px, pr(0, 18).py, pr(16, 18).px - s1.px, pr(16, 62).py - pr(0, 18).py)
    ctx.strokeRect(pr(104, 18).px, pr(104, 18).py, s2.px - pr(104, 18).px, pr(120, 62).py - pr(104, 18).py)
    drawGoal(ctx, pr, 0, 32, 16, 12, -8)
    drawGoal(ctx, pr, 120, 32, 16, 12, 8)
  } else if (sport === 'HOCKEY') {
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(33,150,243,0.8)'; // Blue lines
    [75, 125].forEach(x => { const p1 = pr(x, 0), p2 = pr(x, 85); ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke() })
    ctx.strokeStyle = 'rgba(255,23,68,0.8)'; // Center line
    const cl1 = pr(100,0), cl2 = pr(100,85); ctx.beginPath(); ctx.moveTo(cl1.px, cl1.py); ctx.lineTo(cl2.px, cl2.py); ctx.stroke()
    // Face-off circles
    const faceoffSpots = [ [30, 20], [30, 65], [170, 20], [170, 65], [100, 42.5] ]
    faceoffSpots.forEach(pos => {
        const c = pr(pos[0], pos[1]); ctx.beginPath(); ctx.ellipse(c.px, c.py, 15*c.scale, 8*c.scale, 0, 0, Math.PI*2); ctx.stroke()
    })
    drawGoal(ctx, pr, 10, 38, 9, 6, -5, '#ff1744')
    drawGoal(ctx, pr, 190, 38, 9, 6, 5, '#ff1744')
  } else if (sport === 'BASKETBALL') {
    const cp = pr(47, 25); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 15*cp.scale, 8*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(0, 25).px, pr(0, 25).py, 40*cp.scale, 22*cp.scale, 0, -Math.PI/2, Math.PI/2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(94, 25).px, pr(94, 25).py, 40*cp.scale, 22*cp.scale, 0, Math.PI/2, 3*Math.PI/2); ctx.stroke()
    drawHoop(ctx, pr, 4, 25); drawHoop(ctx, pr, 90, 25)
  } else if (sport === 'F1' && conf.f1Path) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 15; ctx.lineJoin = 'round'; ctx.beginPath()
    conf.f1Path.forEach((pt, i) => { const p = pr(pt.x, pt.y); if (i === 0) ctx.moveTo(p.px, p.py); else ctx.lineTo(p.px, p.py) })
    ctx.closePath(); ctx.stroke()
    // Kerbs
    ctx.setLineDash([10, 10]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 18; ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = '#ff1744'; ctx.globalAlpha = 0.5; ctx.setLineDash([10, 10]); ctx.lineDashOffset = 10; ctx.stroke(); ctx.setLineDash([])
    // Start grid
    const sp = pr(60, 18); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(sp.px - 2, sp.py - 20*sp.scale, 4, 40*sp.scale)
  }
  ctx.globalAlpha = 1.0; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(s1.px, s1.py, s2.px-s1.px, s3.py-s2.py)
}

function drawStadiumDetals(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  ctx.fillStyle = '#020406'; ctx.fillRect(0, 0, W, H)
  const fog = ctx.createLinearGradient(0, 100, 0, 180); fog.addColorStop(0, 'rgba(0,0,0,1)'); fog.addColorStop(1, 'rgba(10,20,30,0)'); ctx.fillStyle = fog; ctx.fillRect(0, 0, W, 200)
  const lights = [W * 0.1, W * 0.9]; lights.forEach(lx => {
    const flare = ctx.createRadialGradient(lx, 50, 0, lx, 50, 150); flare.addColorStop(0, 'rgba(255,255,255,0.15)'); flare.addColorStop(1, 'transparent'); ctx.fillStyle = flare; ctx.beginPath(); ctx.arc(lx, 50, 150, 0, Math.PI*2); ctx.fill()
  })
}

export default function PitchCanvas({ players, ball, stats, onAcceptAnomaly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const textureRefs = useRef<Record<string, HTMLImageElement>>({})
  const propsRef = useRef({ players, ball, stats, onAcceptAnomaly }); propsRef.current = { players, ball, stats, onAcceptAnomaly }
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const sports: SportType[] = ['SOCCER', 'HOCKEY', 'BASKETBALL', 'AM_FOOTBALL', 'F1']; let loadedCount = 0
    sports.forEach(s => {
      const img = new Image(); img.src = SPORT_CONFIGS[s].textureUrl || ''; img.onload = () => { loadedCount++; if (loadedCount === sports.length) setLoaded(true) }; textureRefs.current[s] = img
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return
    let animId: number; let frame = 0
    const render = () => {
      frame++; const { players, ball, stats } = propsRef.current, W = canvas.width, H = canvas.height, sport = stats.sport || 'SOCCER', pr = (x: number, y: number) => getProj(x, y, W, H, sport)
      drawStadiumDetals(ctx, W, H, sport); drawField(ctx, W, H, sport, textureRefs.current)
      players.forEach((p, idx) => {
        const { px, py, scale } = pr(p.x, p.y), teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        if (p.hasBall || (sport === 'F1' && idx === 0)) {
          const pulse = (Math.sin(frame / 10) + 1) / 2; ctx.strokeStyle = `rgba(0, 230, 255, ${0.4 * pulse})`; ctx.lineWidth = 3 * scale; ctx.beginPath(); ctx.arc(px, py-4*scale, (15 + pulse*10)*scale, 0, Math.PI*2); ctx.stroke()
        }
        if (sport === 'F1') { ctx.fillStyle = teamColor; ctx.save(); ctx.translate(px, py); ctx.fillRect(-8*scale, -4*scale, 16*scale, 8*scale); ctx.restore() }
        else {
          ctx.fillStyle = teamColor; ctx.beginPath(); ctx.arc(px, py-10*scale, 5*scale, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.ellipse(px, py-4*scale, 4*scale, 7*scale, 0, 0, Math.PI*2); ctx.fill()
        }
        if (p.showBox) {
            ctx.strokeStyle = teamColor; ctx.lineWidth = 1; ctx.strokeRect(px-15*scale, py-25*scale, 30*scale, 30*scale)
            ctx.fillStyle = teamColor; ctx.font = `600 ${8*scale}px Outfit`; ctx.fillText(p.label, px-15*scale, py-28*scale)
        }
      })
      const bp = pr(ball.x, ball.y); if (stats.sport !== 'F1') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 4*bp.scale, 0, Math.PI*2); ctx.fill() }
      animId = requestAnimationFrame(render)
    }
    render(); return () => cancelAnimationFrame(animId)
  }, [loaded])

  return (
    <div className="pitch-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: '#020406' }}>
      <canvas ref={canvasRef} width={1200} height={600} style={{ width: '100%', display: 'block', imageRendering: 'auto' }} />
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e6ff', fontSize: '1rem', fontWeight: 900, backdropFilter: 'blur(10px)' }}>
          SYNCING HIGH-FIDELITY SPORTS DATA...
        </div>
      )}
    </div>
  )
}
