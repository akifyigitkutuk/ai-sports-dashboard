import { useEffect, useRef } from 'react'
import type { Player, Ball, GameStats } from '@/lib/gameEngine'
import { SPORT_CONFIGS, type SportType } from '@/lib/sportConfigs'
import { translations, type Lang } from '@/lib/translations'

interface Props {
  players: Player[]
  ball: Ball
  stats: GameStats
  onAcceptAnomaly: (changeToPass: boolean) => void
  lang: Lang
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
  const conf = SPORT_CONFIGS[sport]
  ctx.fillStyle = sport === 'F1' ? '#08080a' : '#050a0f'
  ctx.fillRect(0, 0, W, H)

  // Light Pillars
  for (let i = 0; i < 6; i++) {
    const lx = (W / 6) * i + (W / 12)
    const beam = ctx.createLinearGradient(lx, 0, lx, 140)
    let beamCol = 'rgba(0,255,180,0.12)'
    if (sport === 'HOCKEY') beamCol = 'rgba(100,200,255,0.15)'
    if (sport === 'BASKETBALL') beamCol = 'rgba(255,150,50,0.1)'
    if (sport === 'F1') beamCol = 'rgba(255,255,255,0.1)'

    beam.addColorStop(0, beamCol)
    beam.addColorStop(1, 'transparent')
    ctx.fillStyle = beam; ctx.fillRect(lx - 15, 0, 30, 140)
  }

  // Crowds (Simple dots)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  for (let i = 0; i < 40; i++) {
    ctx.beginPath(); ctx.arc(Math.random()*W*0.2, 50+Math.random()*80, 0.5, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(W - Math.random()*W*0.2, 50+Math.random()*80, 0.5, 0, Math.PI*2); ctx.fill()
  }
}

function drawField(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  const conf = SPORT_CONFIGS[sport]
  const pr = (x: number, y: number) => getProj(x, y, W, H, sport)

  const s1 = pr(0, 0), s2 = pr(conf.dimX, 0), s3 = pr(conf.dimX, conf.dimY), s4 = pr(0, conf.dimY)
  
  // Outer Glow
  ctx.shadowBlur = 20; ctx.shadowColor = conf.surfaceColor
  ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(s3.px, s3.py); ctx.lineTo(s4.px, s4.py); ctx.closePath()
  ctx.fillStyle = conf.surfaceColor; ctx.fill(); ctx.shadowBlur = 0

  // Surface Texture
  const grad = ctx.createLinearGradient(0, s1.py, 0, s3.py)
  grad.addColorStop(0, conf.surfaceColor)
  grad.addColorStop(0.5, conf.surfaceColor)
  grad.addColorStop(1, '#050a0f')
  ctx.fillStyle = grad; ctx.fill()

  if (conf.surfaceStyle === 'WOOD') {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1
    for (let i = 0; i < conf.dimX; i += 4) {
      const p1 = pr(i, 0), p2 = pr(i, conf.dimY)
      ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke()
    }
  } else if (conf.surfaceStyle === 'GRASS') {
    for (let i = 0; i < conf.dimX; i += 10) {
      if ((i/10) % 2 === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        const z1 = pr(i, 0), z2 = pr(i+10, 0), z3 = pr(i+10, conf.dimY), z4 = pr(i, conf.dimY)
        ctx.beginPath(); ctx.moveTo(z1.px, z1.py); ctx.lineTo(z2.px, z2.py); ctx.lineTo(z3.px, z3.py); ctx.lineTo(z4.px, z4.py); ctx.fill()
      }
    }
  } else if (conf.surfaceStyle === 'ICE') {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5
    for(let i=0; i<30; i++) {
        const x = Math.random()*conf.dimX, y = Math.random()*conf.dimY
        const lw = Math.random()*10
        const p1 = pr(x, y), p2 = pr(x+lw, y+lw)
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke()
    }
  }

  // Specific Markings
  ctx.strokeStyle = conf.markingColor; ctx.lineWidth = 1.5

  if (sport === 'SOCCER') {
    const h1 = pr(60, 0), h2 = pr(60, 80); ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()
    const cp = pr(60, 40); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 40*cp.scale, 20*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
  } else if (sport === 'HOCKEY') {
    ctx.strokeStyle = '#ff4b4b'; ctx.lineWidth = 3
    const cl1 = pr(100, 0), cl2 = pr(100, 85); ctx.beginPath(); ctx.moveTo(cl1.px, cl1.py); ctx.lineTo(cl2.px, cl2.py); ctx.stroke()
    ctx.strokeStyle = '#2196f3'
    const bl1a = pr(75, 0), bl1b = pr(75, 85); ctx.beginPath(); ctx.moveTo(bl1a.px, bl1a.py); ctx.lineTo(bl1b.px, bl1b.py); ctx.stroke()
    const bl2a = pr(125, 0), bl2b = pr(125, 85); ctx.beginPath(); ctx.moveTo(bl2a.px, bl2a.py); ctx.lineTo(bl2b.px, bl2b.py); ctx.stroke()
  } else if (sport === 'BASKETBALL') {
    const cp = pr(47, 25); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 15*cp.scale, 8*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(0, 25).px, pr(0, 25).py, 45*cp.scale, 25*cp.scale, 0, -Math.PI/2, Math.PI/2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(pr(94, 25).px, pr(94, 25).py, 45*cp.scale, 25*cp.scale, 0, Math.PI/2, 3*Math.PI/2); ctx.stroke()
  } else if (sport === 'F1' && conf.f1Path) {
    // Render Realistic Path
    ctx.strokeStyle = '#222'; ctx.lineWidth = 15; ctx.lineJoin = 'round'
    ctx.beginPath()
    conf.f1Path.forEach((pt, i) => {
      const p = pr(pt.x, pt.y)
      if (i === 0) ctx.moveTo(p.px, p.py)
      else ctx.lineTo(p.px, p.py)
    })
    ctx.closePath(); ctx.stroke()

    // Kerbs & DRC
    ctx.strokeStyle = '#ff4b4b'; ctx.lineWidth = 4; ctx.setLineDash([8, 8])
    ctx.stroke(); ctx.setLineDash([]);

    // DRS Zones
    (conf.f1DrsZones || []).forEach((z: { start: number; end: number }) => {
      ctx.strokeStyle = '#00e6ff'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.globalAlpha = 0.4
      ctx.beginPath()
      const n = conf.f1Path!.length
      const startIdx = Math.floor(z.start * n)
      const endIdx = Math.floor(z.end * n)
      for (let i = startIdx; i <= endIdx; i++) {
        const p = pr(conf.f1Path![i % n].x, conf.f1Path![i % n].y)
        if (i === startIdx) ctx.moveTo(p.px, p.py)
        else ctx.lineTo(p.px, p.py)
      }
      ctx.stroke(); ctx.globalAlpha = 1.0
    })

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '800 12px Inter'
    const s1 = pr(40, 40), s2 = pr(100, 70), s3 = pr(60, 5)
    ctx.fillText('SECTOR 1', s1.px, s1.py)
    ctx.fillText('SECTOR 2', s2.px, s2.py)
    ctx.fillText('SECTOR 3', s3.px, s3.py)
  }

  // Boundary
  ctx.setLineDash([]); ctx.strokeStyle = conf.markingColor; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(s3.px, s3.py); ctx.lineTo(s4.px, s4.py); ctx.closePath(); ctx.stroke()
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
    let frame = 0
    const render = () => {
      frame++
      const { players, ball, stats } = propsRef.current
      const W = canvas.width, H = canvas.height
      const sport = stats.sport || 'SOCCER'
      const pr = (x: number, y: number) => getProj(x, y, W, H, sport)

      drawStadium(ctx, W, H, sport)
      drawField(ctx, W, H, sport)

      // AI HUD: Predicted Paths
      if (sport !== 'F1') {
        const bp = pr(ball.x, ball.y)
        const vX = (ball.vx || 0) * 15, vY = (ball.vy || 0) * 15
        const endP = pr(ball.x + vX, ball.y + vY)
        
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(bp.px, bp.py); ctx.lineTo(endP.px, endP.py); ctx.stroke(); ctx.setLineDash([])
      }

      // Players / Cars
      players.forEach((p, idx) => {
        const { px, py, scale } = pr(p.x, p.y)
        const teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        
        // Influence Zone Pulse
        if (p.hasBall || (sport === 'F1' && idx === 0)) {
          const pulse = (Math.sin(frame / 10) + 1) / 2
          ctx.strokeStyle = `rgba(0, 230, 255, ${0.4 * pulse})`
          ctx.lineWidth = 3 * scale
          ctx.beginPath(); ctx.arc(px, py-4*scale, (15 + pulse*10)*scale, 0, Math.PI*2); ctx.stroke()
        }

        if (sport === 'F1') {
          ctx.fillStyle = teamColor; ctx.save(); ctx.translate(px, py)
          // Rotate car to follow path (simulated briefly)
          ctx.fillRect(-8*scale, -4*scale, 16*scale, 8*scale)
          ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-6*scale, -6*scale, 4*scale, 4*scale); ctx.fillRect(2*scale, -6*scale, 4*scale, 4*scale)
          ctx.fillRect(-6*scale, 2*scale, 4*scale, 4*scale); ctx.fillRect(2*scale, 2*scale, 4*scale, 4*scale)
          ctx.restore()
        } else {
          ctx.fillStyle = teamColor; ctx.beginPath(); ctx.arc(px, py-10*scale, 5*scale, 0, Math.PI*2); ctx.fill()
          ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.ellipse(px, py-4*scale, 4*scale, 7*scale, 0, 0, Math.PI*2); ctx.fill()
        }
        
        if (p.showBox) {
            ctx.strokeStyle = teamColor; ctx.lineWidth = 1; ctx.strokeRect(px-15*scale, py-25*scale, 30*scale, 30*scale)
            ctx.fillStyle = teamColor; ctx.font = `600 ${8*scale}px Inter`; ctx.fillText(p.label, px-15*scale, py-28*scale)
        }
      })

      // Object (Ball/Puck/Car)
      const bp = pr(ball.x, ball.y)
      const isCar = sport === 'F1'
      const isHockey = sport === 'HOCKEY'
      
      // TARGETING HUD OVERLAY
      ctx.strokeStyle = '#00e6ff'; ctx.lineWidth = 1; ctx.setLineDash([2, 4])
      ctx.beginPath(); ctx.arc(bp.px, bp.py, 22*bp.scale, 0, Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bp.px - 30*bp.scale, bp.py); ctx.lineTo(bp.px + 30*bp.scale, bp.py); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bp.px, bp.py - 30*bp.scale); ctx.lineTo(bp.px, bp.py + 30*bp.scale); ctx.stroke(); ctx.setLineDash([])
      
      if (!isCar) {
        const glow = ctx.createRadialGradient(bp.px, bp.py, 0, bp.px, bp.py, 15*bp.scale)
        glow.addColorStop(0, isHockey ? 'rgba(255,255,255,0.8)' : 'rgba(255,40,20,0.8)')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(bp.px, bp.py, 15*bp.scale, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = isHockey ? '#111' : '#fff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 4*bp.scale, 0, Math.PI*2); ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="pitch-container" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={720} height={460} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}
