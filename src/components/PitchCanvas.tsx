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

function drawStadium(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  ctx.fillStyle = '#020406'
  ctx.fillRect(0, 0, W, H)

  // Atmospheric Fog
  const fog = ctx.createLinearGradient(0, 100, 0, 180)
  fog.addColorStop(0, 'rgba(0,0,0,1)')
  fog.addColorStop(1, 'rgba(10,20,30,0)')
  ctx.fillStyle = fog; ctx.fillRect(0, 0, W, 200)

  // Floodlights
  const lights = [W * 0.1, W * 0.9]
  lights.forEach(lx => {
    const flare = ctx.createRadialGradient(lx, 50, 0, lx, 50, 150)
    flare.addColorStop(0, 'rgba(255,255,255,0.15)')
    flare.addColorStop(1, 'transparent')
    ctx.fillStyle = flare; ctx.beginPath(); ctx.arc(lx, 50, 150, 0, Math.PI*2); ctx.fill()
  })
}

function drawBoards(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType) {
  const conf = SPORT_CONFIGS[sport]
  const pr = (x: number, y: number) => getProj(x, y, W, H, sport)
  const h = 12 // board height in "world" units
  
  const s1 = pr(0, 0), s2 = pr(conf.dimX, 0), s3 = pr(conf.dimX, conf.dimY), s4 = pr(0, conf.dimY)
  const b1 = { px: s1.px, py: s1.py - h * s1.scale }
  const b2 = { px: s2.px, py: s2.py - h * s2.scale }
  
  // Back board
  ctx.fillStyle = 'rgba(20,20,25,0.9)'
  ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(b2.px, b2.py); ctx.lineTo(b1.px, b1.py); ctx.closePath(); ctx.fill()
  
  // Board logos/text
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = `900 ${10 * s1.scale}px Outfit`
  ctx.textAlign = 'center'
  for(let i=1; i<6; i++) {
    const x = (conf.dimX / 6) * i
    const p = pr(x, 0)
    ctx.fillText('ANTIGRAVITY SPORTS', p.px, p.py - 4 * p.scale)
  }
}

function drawField(ctx: CanvasRenderingContext2D, W: number, H: number, sport: SportType, textures: Record<string, HTMLImageElement>) {
  const conf = SPORT_CONFIGS[sport]
  const pr = (x: number, y: number) => getProj(x, y, W, H, sport)

  const s1 = pr(0, 0), s2 = pr(conf.dimX, 0), s3 = pr(conf.dimX, conf.dimY), s4 = pr(0, conf.dimY)
  
  // Field Surface
  ctx.save()
  ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py); ctx.lineTo(s3.px, s3.py); ctx.lineTo(s4.px, s4.py); ctx.closePath()
  ctx.clip()

  const tex = textures[sport]
  if (tex && tex.complete) {
    const pattern = ctx.createPattern(tex, 'repeat')
    if (pattern) {
        ctx.fillStyle = pattern
        ctx.save()
        // Simple perspective simulation for texture
        ctx.scale(1, 0.6)
        ctx.translate(0, 100)
        ctx.fillRect(-W, -H, W*3, H*3)
        ctx.restore()
    }
  } else {
    ctx.fillStyle = conf.surfaceColor; ctx.fill()
  }
  
  // Lighting Overlay (Ambient Occlusion & Vignette)
  const v1 = pr(conf.dimX/2, conf.dimY/2)
  const vig = ctx.createRadialGradient(v1.px, v1.py, 0, v1.px, v1.py, W*0.5)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = vig; ctx.fill()
  ctx.restore()

  // Markings
  ctx.strokeStyle = conf.markingColor; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.5
  if (sport === 'SOCCER') {
    const h1 = pr(60, 0), h2 = pr(60, 80); ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()
    const cp = pr(60, 40); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 40*cp.scale, 20*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
  } else if (sport === 'HOCKEY') {
    ctx.strokeStyle = '#ff4b4b'; ctx.lineWidth = 3
    const cl1 = pr(100, 0), cl2 = pr(100, 85); ctx.beginPath(); ctx.moveTo(cl1.px, cl1.py); ctx.lineTo(cl2.px, cl2.py); ctx.stroke()
    ctx.strokeStyle = '#2196f3'
    const bl1 = pr(75, 0), bl2 = pr(75, 85); ctx.beginPath(); ctx.moveTo(bl1.px, bl1.py); ctx.lineTo(bl2.px, bl2.py); ctx.stroke()
  } else if (sport === 'BASKETBALL') {
    const cp = pr(47, 25); ctx.beginPath(); ctx.ellipse(cp.px, cp.py, 15*cp.scale, 8*cp.scale, 0, 0, Math.PI*2); ctx.stroke()
  } else if (sport === 'F1' && conf.f1Path) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 15; ctx.lineJoin = 'round'; ctx.beginPath()
    conf.f1Path.forEach((pt, i) => { const p = pr(pt.x, pt.y); if (i === 0) ctx.moveTo(p.px, p.py); else ctx.lineTo(p.px, p.py) })
    ctx.closePath(); ctx.stroke()
    ctx.strokeStyle = '#00e6ff'; ctx.lineWidth = 18; ctx.globalAlpha = 0.2
    conf.f1DrsZones?.forEach(z => {
      ctx.beginPath(); const n = conf.f1Path!.length;
      for (let i = Math.floor(z.start*n); i <= Math.floor(z.end*n); i++) {
        const p = pr(conf.f1Path![i%n].x, conf.f1Path![i%n].y); if (i === Math.floor(z.start*n)) ctx.moveTo(p.px, p.py); else ctx.lineTo(p.px, p.py)
      }
      ctx.stroke()
    })
  }
  ctx.globalAlpha = 1.0
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(s1.px, s1.py, s2.px-s1.px, s3.py-s2.py)
}

export default function PitchCanvas({ players, ball, stats, onAcceptAnomaly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textureRefs = useRef<Record<string, HTMLImageElement>>({})
  const propsRef = useRef({ players, ball, stats, onAcceptAnomaly })
  propsRef.current = { players, ball, stats, onAcceptAnomaly }
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const sports: SportType[] = ['SOCCER', 'HOCKEY', 'BASKETBALL', 'AM_FOOTBALL', 'F1']
    let loadedCount = 0
    sports.forEach(s => {
      const img = new Image()
      img.src = SPORT_CONFIGS[s].textureUrl || ''
      img.onload = () => {
        loadedCount++
        if (loadedCount === sports.length) setLoaded(true)
      }
      textureRefs.current[s] = img
    })
  }, [])

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
      drawBoards(ctx, W, H, sport)
      drawField(ctx, W, H, sport, textureRefs.current)

      players.forEach((p, idx) => {
        const { px, py, scale } = pr(p.x, p.y)
        const teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        
        if (p.hasBall || (sport === 'F1' && idx === 0)) {
          const pulse = (Math.sin(frame / 10) + 1) / 2
          ctx.strokeStyle = `rgba(0, 230, 255, ${0.4 * pulse})`; ctx.lineWidth = 3 * scale
          ctx.beginPath(); ctx.arc(px, py-4*scale, (15 + pulse*10)*scale, 0, Math.PI*2); ctx.stroke()
        }

        if (sport === 'F1') {
          ctx.fillStyle = teamColor; ctx.save(); ctx.translate(px, py); ctx.fillRect(-8*scale, -4*scale, 16*scale, 8*scale); ctx.restore()
        } else {
          ctx.fillStyle = teamColor; ctx.beginPath(); ctx.arc(px, py-10*scale, 5*scale, 0, Math.PI*2); ctx.fill()
          ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.ellipse(px, py-4*scale, 4*scale, 7*scale, 0, 0, Math.PI*2); ctx.fill()
        }
        
        if (p.showBox) {
            ctx.strokeStyle = teamColor; ctx.lineWidth = 1; ctx.strokeRect(px-15*scale, py-25*scale, 30*scale, 30*scale)
            ctx.fillStyle = teamColor; ctx.font = `600 ${8*scale}px Outfit`; ctx.fillText(p.label, px-15*scale, py-28*scale)
        }
      })

      const bp = pr(ball.x, ball.y)
      if (stats.sport !== 'F1') {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bp.px, bp.py, 4*bp.scale, 0, Math.PI*2); ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animId)
  }, [loaded])

  return (
    <div className="pitch-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
      <canvas ref={canvasRef} width={720} height={460} style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }} />
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e6ff', fontSize: '0.8rem', fontWeight: 900 }}>
          LOADING PHOTOREALISTIC ENVIRONMENTS...
        </div>
      )}
    </div>
  )
}
