'use client'
import { useEffect, useRef } from 'react'

import { type SportType } from '@/lib/sportConfigs'

interface Props {
  points: { x: number; y: number }[]
  sport: SportType
}

export default function HeatmapCanvas({ points, sport }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const histRef = useRef(points)
  histRef.current = points

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      const W = canvas.width, H = canvas.height
      const sx = (x: number) => (x / 120) * W
      const sy = (y: number) => (y / 80) * H

      ctx.fillStyle = '#060c12'
      ctx.fillRect(0, 0, W, H)

      // Subdued 2D Pitch lines (Reverted to 2D)
      ctx.strokeStyle = '#0d2a40'
      ctx.lineWidth = 1
      ctx.strokeRect(sx(1), sy(1), sx(119) - sx(1), sy(79) - sy(1))
      ctx.beginPath(); ctx.moveTo(sx(60), sy(1)); ctx.lineTo(sx(60), sy(79)); ctx.stroke()
      ctx.beginPath(); ctx.arc(sx(60), sy(40), sx(10), 0, Math.PI * 2); ctx.stroke()

      // Dynamic Heatmap from history
      const history = histRef.current
      history.forEach(({ x, y }) => {
        const hx = sx(x), hy = sy(y)
        const r = 24
        const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r)
        grad.addColorStop(0, 'rgba(255,40,0,0.12)')
        grad.addColorStop(0.5, 'rgba(255,160,0,0.06)')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill()
      })

      // Static hot zones for visual depth
      const zones = [
        { x: 106, y: 40, r: 48, a: 0.5 },
        { x: 108, y: 32, r: 35, a: 0.4 },
        { x: 108, y: 48, r: 30, a: 0.35 },
        { x: 14, y: 40, r: 32, a: 0.22 },
        { x: 60, y: 40, r: 24, a: 0.15 },
      ]
      zones.forEach(z => {
        const hx = sx(z.x), hy = sy(z.y)
        const r = z.r
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r)
        g.addColorStop(0, `rgba(255,40,0,${z.a})`)
        g.addColorStop(0.4, `rgba(255,165,0,${z.a * 0.6})`)
        g.addColorStop(0.7, `rgba(0,255,100,${z.a * 0.2})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill()
      })

      ctx.font = 'italic 9px "Inter"'; ctx.fillStyle = 'rgba(0,230,118,0.73)'; ctx.textAlign = 'center'
      ctx.fillText('AI Verified Entry', W/2, H - 4); ctx.textAlign = 'left'

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
