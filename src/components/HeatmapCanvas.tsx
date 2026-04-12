'use client'
import { useEffect, useRef } from 'react'

interface Props {
  positionHistory: { x: number; y: number }[]
}

/**
 * Matching Perspective Projection for Heatmap
 */
function getProj(x: number, y: number, W: number, H: number) {
  const y_norm = y / 80
  const top_narrow = 0.82 // Slightly wider than main pitch for better coverage
  const scale = top_narrow + y_norm * (1 - top_narrow)
  
  const x_offset = (W * (1 - scale)) / 2
  const px = x_offset + (x / 120) * (W * scale)
  const py = 10 + (y / 80) * (H - 20)
  
  return { px, py, scale }
}

export default function HeatmapCanvas({ positionHistory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const histRef = useRef(positionHistory)
  histRef.current = positionHistory

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      const W = canvas.width, H = canvas.height
      const pr = (x: number, y: number) => getProj(x, y, W, H)

      ctx.fillStyle = '#04080c'
      ctx.fillRect(0, 0, W, H)

      // Subdued Pitch Lines
      ctx.strokeStyle = '#0d2a40'
      ctx.lineWidth = 1
      
      const b1 = pr(0, 0), b2 = pr(120, 0), b3 = pr(120, 80), b4 = pr(0, 80)
      ctx.beginPath(); ctx.moveTo(b1.px, b1.py); ctx.lineTo(b2.px, b2.py); ctx.lineTo(b3.px, b3.py); ctx.lineTo(b4.px, b4.py); ctx.closePath(); ctx.stroke()
      
      const h1 = pr(60, 0), h2 = pr(60, 80)
      ctx.beginPath(); ctx.moveTo(h1.px, h1.py); ctx.lineTo(h2.px, h2.py); ctx.stroke()

      // Dynamic Heatmap Points
      const history = histRef.current
      history.forEach(({ x, y }) => {
        const { px, py, scale } = pr(x, y)
        const rad = 24 * scale
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad)
        g.addColorStop(0, 'rgba(255,50,0,0.14)')
        g.addColorStop(0.5, 'rgba(255,160,0,0.06)')
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill()
      })

      // Static Hot Zones (Goal areas)
      const zones = [
        { x: 105, y: 40, r: 45, a: 0.5 },
        { x: 108, y: 30, r: 35, a: 0.4 },
        { x: 108, y: 50, r: 30, a: 0.35 },
        { x: 15, y: 40, r: 28, a: 0.25 },
        { x: 60, y: 40, r: 22, a: 0.15 },
      ]
      zones.forEach(z => {
        const { px, py, scale } = pr(z.x, z.y)
        const rad = z.r * scale
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad)
        g.addColorStop(0, `rgba(255,40,0,${z.a})`)
        g.addColorStop(0.4, `rgba(255,160,0,${z.a * 0.6})`)
        g.addColorStop(0.7, `rgba(0,255,100,${z.a * 0.2})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill()
      })

      ctx.font = 'italic 9px "Inter"'; ctx.fillStyle = 'rgba(0,230,118,0.7)'; ctx.textAlign = 'center'
      ctx.fillText('AI Verified Entry', W/2, H - 4)

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginTop: '8px' }}>
      <canvas ref={canvasRef} width={720} height={200} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  )
}
