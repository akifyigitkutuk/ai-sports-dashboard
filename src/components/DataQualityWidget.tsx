'use client'
import { useEffect, useRef } from 'react'

interface Props {
  history: number[]
}

export default function DataQualityWidget({ history }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    if (history.length < 2) return

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * H
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = '#00e6ff'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    const getX = (i: number) => (i / (history.length - 1)) * W
    const getY = (v: number) => H - (v / 100) * H

    ctx.moveTo(getX(0), getY(history[0]))
    for (let i = 1; i < history.length; i++) {
      ctx.lineTo(getX(i), getY(history[i]))
    }
    ctx.stroke()

    // Area fill
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,230,255,0.2)')
    grad.addColorStop(1, 'rgba(0,230,255,0)')
    ctx.fillStyle = grad
    ctx.lineTo(getX(history.length - 1), H)
    ctx.lineTo(getX(0), H)
    ctx.closePath()
    ctx.fill()

    // Highlight last point
    const lastX = getX(history.length - 1)
    const lastY = getY(history[history.length - 1])
    ctx.fillStyle = '#00e6ff'
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 10
    ctx.shadowColor = '#00e6ff'
    ctx.stroke()
    ctx.shadowBlur = 0

  }, [history])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#00e6ff', margin: 0 }}>
          Data Quality Analysis
        </p>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#00e676' }}>
          {history[history.length - 1]}%
        </span>
      </div>
      <canvas ref={canvasRef} width={240} height={80} style={{ width: '100%', height: '80px' }} />
      <p style={{ fontSize: '0.5rem', color: '#555', marginTop: '8px', textAlign: 'center', letterSpacing: '0.5px' }}>
        ACCURACY TREND (LIVE-AUDIT)
      </p>
    </div>
  )
}
