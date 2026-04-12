'use client'
import { useEffect, useRef, useState } from 'react'
import type { Ball } from '@/lib/gameEngine'

interface Props {
  ball: Ball
}

export default function BallTrackerCanvas({ ball }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<{ x: number, y: number }[]>([])

  // Tracking history (tail)
  useEffect(() => {
    setHistory(prev => [{ x: ball.x, y: ball.y }, ...prev.slice(0, 30)])
  }, [ball.x, ball.y])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    const scaleX = (W - 40) / 120
    const scaleY = (H - 40) / 80
    const ox = 20, oy = 20

    const t = (x: number, y: number) => ({
      px: ox + x * scaleX,
      py: oy + y * scaleY
    })

    const render = () => {
      ctx.clearRect(0, 0, W, H)

      // Background Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
      for(let i=0; i<=120; i+=20) {
        const { px } = t(i, 0)
        ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, H-oy); ctx.stroke()
      }
      for(let j=0; j<=80; j+=20) {
        const { py } = t(0, j)
        ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(W-ox, py); ctx.stroke()
      }

      // Outer Pitch Boundary
      ctx.strokeStyle = 'rgba(0,180,255,0.3)'; ctx.lineWidth = 1.5
      ctx.strokeRect(ox, oy, W-40, H-40)

      // Halfway line
      const hw = t(60, 0)
      ctx.beginPath(); ctx.moveTo(hw.px, oy); ctx.lineTo(hw.px, H-oy); ctx.stroke()

      // Trail
      if (history.length > 1) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,255,255,0.15)'; ctx.lineWidth = 2
        history.forEach((p, i) => {
          const { px, py } = t(p.x, p.y)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.stroke()
      }

      // Current Ball Position
      const { px, py } = t(ball.x, ball.y)
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 10)
      glow.addColorStop(0, 'rgba(0,255,180,0.8)'); glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill()
      
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill()

      // Coordinates Text
      ctx.fillStyle = '#aaa'; ctx.font = 'bold 9px "Inter"'; ctx.textAlign = 'left'
      ctx.fillText(`X: ${ball.x.toFixed(1)}`, ox, H - 6)
      ctx.textAlign = 'right'
      ctx.fillText(`Y: ${ball.y.toFixed(1)}`, W - ox, H - 6)
      
      ctx.fillStyle = '#00e676'; ctx.font = '800 10px "Inter"'; ctx.textAlign = 'center'
      ctx.fillText('LIVE BALL RADAR', W / 2, 12)
    }

    render()
  }, [ball, history])

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px' }}>
      <canvas ref={canvasRef} width={220} height={160} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}
