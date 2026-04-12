'use client'
import { useEffect, useRef } from 'react'

interface Props {
  positionHistory: { x: number; y: number }[]
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
      const sx = (x: number) => (x / 120) * W
      const sy = (y: number) => (y / 80) * H

      ctx.fillStyle = '#060c12'
      ctx.fillRect(0, 0, W, H)

      // Pitch lines
      ctx.strokeStyle = '#0d4a68'
      ctx.lineWidth = 1
      ctx.strokeRect(sx(1), sy(1), sx(119) - sx(1), sy(79) - sy(1))
      ctx.beginPath(); ctx.moveTo(sx(60), sy(1)); ctx.lineTo(sx(60), sy(79)); ctx.stroke()
      ctx.beginPath(); ctx.arc(sx(60), sy(40), sx(60) - sx(50), 0, Math.PI * 2); ctx.stroke()
      ctx.strokeRect(sx(1), sy(18), sx(19) - sx(1), sy(62) - sy(18))
      ctx.strokeRect(sx(101), sy(18), sx(119) - sx(101), sy(62) - sy(18))

      // Heatmap from position history
      const history = histRef.current
      history.forEach(({ x, y }) => {
        const hx = sx(x), hy = sy(y)
        const r = 28
        const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r)
        grad.addColorStop(0, 'rgba(255,40,0,0.12)')
        grad.addColorStop(0.4, 'rgba(255,160,0,0.07)')
        grad.addColorStop(0.7, 'rgba(60,220,60,0.04)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill()
      })

      // Static hot zones near goals for visual richness
      const staticZones = [
        { x: sx(96), y: sy(40), r: 55, a: 0.55 },
        { x: sx(106), y: sy(32), r: 35, a: 0.45 },
        { x: sx(106), y: sy(48), r: 30, a: 0.38 },
        { x: sx(88), y: sy(40), r: 42, a: 0.28 },
        { x: sx(16), y: sy(40), r: 32, a: 0.22 },
        { x: sx(60), y: sy(40), r: 25, a: 0.15 },
      ]
      staticZones.forEach(({ x: zx, y: zy, r, a }) => {
        const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, r)
        g.addColorStop(0, `rgba(255,50,0,${a})`)
        g.addColorStop(0.35, `rgba(255,165,0,${a * 0.7})`)
        g.addColorStop(0.65, `rgba(100,220,30,${a * 0.4})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(zx, zy, r, 0, Math.PI * 2); ctx.fill()
      })

      // "AI Verified Entry" label
      ctx.font = 'italic 9px "Inter", sans-serif'
      ctx.fillStyle = '#00e676'
      ctx.textAlign = 'center'
      ctx.fillText('AI Verified Entry', W / 2, H - 4)
      ctx.textAlign = 'left'

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginTop: '8px' }}>
      <canvas
        ref={canvasRef}
        width={720}
        height={200}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  )
}
