'use client'
import { useEffect, useRef } from 'react'
import type { Player, Ball, GameStats } from '@/lib/gameEngine'

interface Props {
  players: Player[]
  ball: Ball
  stats: GameStats
  onAcceptAnomaly: (changeToPass: boolean) => void
}

function drawPitch(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const sx = (x: number) => (x / 120) * W
  const sy = (y: number) => (y / 80) * H

  // Dark background
  ctx.fillStyle = '#060c12'
  ctx.fillRect(0, 0, W, H)

  // Alternating stripes
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,80,40,0.18)' : 'rgba(0,60,25,0.12)'
    ctx.fillRect(i * (W / 10), 0, W / 10, H)
  }

  // Pitch glow center
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6)
  glow.addColorStop(0, 'rgba(0,120,200,0.06)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  const lc = '#0d5a7a'
  ctx.strokeStyle = lc
  ctx.lineWidth = 1.4

  // Outline
  ctx.strokeRect(sx(1), sy(1), sx(119) - sx(1), sy(79) - sy(1))

  // Halfway
  ctx.beginPath(); ctx.moveTo(sx(60), sy(1)); ctx.lineTo(sx(60), sy(79)); ctx.stroke()

  // Center circle
  ctx.beginPath()
  ctx.arc(sx(60), sy(40), (sx(60) - sx(50)), 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath(); ctx.arc(sx(60), sy(40), 3, 0, Math.PI * 2)
  ctx.fillStyle = lc; ctx.fill()

  // Penalty boxes
  ctx.strokeRect(sx(1), sy(18), sx(19) - sx(1), sy(62) - sy(18))
  ctx.strokeRect(sx(101), sy(18), sx(119) - sx(101), sy(62) - sy(18))

  // 6-yard boxes
  ctx.strokeRect(sx(1), sy(30), sx(7) - sx(1), sy(50) - sy(30))
  ctx.strokeRect(sx(113), sy(30), sx(119) - sx(113), sy(50) - sy(30))

  // Goals
  ctx.strokeStyle = '#ffd740'
  ctx.lineWidth = 1.5
  ctx.strokeRect(sx(0), sy(36), sx(1) - sx(0), sy(44) - sy(36))
  ctx.strokeRect(sx(119), sy(36), sx(120) - sx(119), sy(44) - sy(36))

  // Penalty spots
  ctx.strokeStyle = lc; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(sx(12), sy(40), 2, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(sx(108), sy(40), 2, 0, Math.PI * 2); ctx.stroke()

  // Penalty arcs
  ctx.beginPath()
  ctx.arc(sx(12), sy(40), sx(22) - sx(12), -Math.PI * 0.35, Math.PI * 0.35)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(sx(108), sy(40), sx(22) - sx(12), Math.PI * 0.65, Math.PI * 1.35)
  ctx.stroke()
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
      const W = canvas.width
      const H = canvas.height
      const sx = (x: number) => (x / 120) * W
      const sy = (y: number) => (y / 80) * H

      drawPitch(ctx, W, H)

      // Draw pass arrows (for players with ball recently)
      const carrier = players.find(p => p.hasBall)
      if (carrier) {
        const nearTeammates = players
          .filter(p => p.team === carrier.team && p.role !== 'gk' && p.id !== carrier.id)
          .slice(0, 2)
        nearTeammates.forEach(t => {
          ctx.save()
          ctx.strokeStyle = 'rgba(0,170,255,0.55)'
          ctx.lineWidth = 1.3
          ctx.setLineDash([5, 4])
          ctx.beginPath()
          ctx.moveTo(sx(carrier.x), sy(carrier.y))
          ctx.lineTo(sx(t.x), sy(t.y))
          ctx.stroke()
          ctx.setLineDash([])

          // Arrowhead
          const angle = Math.atan2(sy(t.y) - sy(carrier.y), sx(t.x) - sx(carrier.x))
          ctx.fillStyle = 'rgba(0,170,255,0.7)'
          ctx.beginPath()
          ctx.moveTo(sx(t.x), sy(t.y))
          ctx.lineTo(sx(t.x) - 8 * Math.cos(angle - 0.35), sy(t.y) - 8 * Math.sin(angle - 0.35))
          ctx.lineTo(sx(t.x) - 8 * Math.cos(angle + 0.35), sy(t.y) - 8 * Math.sin(angle + 0.35))
          ctx.closePath(); ctx.fill()
          ctx.restore()
        })
      }

      // Draw players
      players.forEach(p => {
        const cx = sx(p.x), cy = sy(p.y)
        const teamColor = p.team === 0 ? '#00e676' : '#ff9800'
        const teamGlow  = p.team === 0 ? 'rgba(0,230,118,0.25)' : 'rgba(255,152,0,0.25)'

        // Glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16)
        grad.addColorStop(0, teamGlow)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill()

        // Dot
        ctx.beginPath(); ctx.arc(cx, cy, p.hasBall ? 8 : 6, 0, Math.PI * 2)
        ctx.fillStyle = teamColor; ctx.fill()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke()

        // Bounding box on key players
        if (p.showBox) {
          const bw = 22, bh = 22
          ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 1.1
          ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh)

          // Corner markers
          const t = 4
          ; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
            const bx = cx + dx * bw / 2
            const by = cy + dy * bh / 2
            ctx.beginPath()
            ctx.moveTo(bx - dx * t, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by - dy * t)
            ctx.stroke()
          })

          // Coordinate label
          ctx.font = 'bold 6.5px "Inter", sans-serif'
          ctx.textAlign = 'center'
          const lw = ctx.measureText(p.label).width + 6
          ctx.fillStyle = 'rgba(0,0,0,0.82)'
          ctx.fillRect(cx - lw / 2, cy - bh / 2 - 13, lw, 12)
          ctx.fillStyle = '#ffd740'
          ctx.fillText(p.label, cx, cy - bh / 2 - 4)
        }
      })

      // Ball
      const bx = sx(ball.x), by = sy(ball.y)
      const ballGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 14)
      ballGlow.addColorStop(0, 'rgba(255,255,255,0.4)')
      ballGlow.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = ballGlow
      ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill()

      ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'; ctx.fill()
      ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 1.5; ctx.stroke()

      // Anomaly popup overlay
      if (stats.showAnomalyPopup) {
        const pw = W * 0.46, ph = H * 0.38
        const px = (W - pw) / 2, py = (H - ph) / 2

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, W, H)

        // Popup box
        const popupGrad = ctx.createLinearGradient(px, py, px, py + ph)
        popupGrad.addColorStop(0, '#160404')
        popupGrad.addColorStop(1, '#1f0808')
        ctx.fillStyle = popupGrad
        roundRect(ctx, px, py, pw, ph, 12)
        ctx.fill()

        ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2
        roundRect(ctx, px, py, pw, ph, 12)
        ctx.stroke()

        // Glow border
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 20
        ctx.strokeStyle = 'rgba(255,23,68,0.4)'; ctx.lineWidth = 6
        roundRect(ctx, px, py, pw, ph, 12)
        ctx.stroke()
        ctx.shadowBlur = 0

        // Text
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ff1744'; ctx.font = `bold ${W * 0.022}px "Inter", sans-serif`
        ctx.fillText('⚠ Warning: Shot detected in own half.', W / 2, py + ph * 0.3)

        ctx.fillStyle = '#ffffff'; ctx.font = `${W * 0.019}px "Inter", sans-serif`
        ctx.fillText('Did you mean "Pass"?', W / 2, py + ph * 0.52)

        // Progress bar (AI check)
        const barW = pw * 0.6, barH = 6
        const barX = (W - barW) / 2, barY = py + ph * 0.64
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(barX, barY, barW, barH)
        ctx.fillStyle = '#00e676'
        ctx.fillRect(barX, barY, barW * 0.92, barH)

        ctx.fillStyle = '#888'; ctx.font = `${W * 0.014}px "Inter", sans-serif`
        ctx.fillText('<1 second (AI Check)', W / 2, barY + 18)

        ctx.textAlign = 'left'
      }

      // Last event overlay (bottom center of pitch)
      if (stats.lastAiEvent && !stats.showAnomalyPopup) {
        ctx.save()
        ctx.font = `bold ${W * 0.013}px "Inter", sans-serif`
        ctx.textAlign = 'center'
        const msg = stats.lastAiEvent
        const mw = ctx.measureText(msg).width + 14
        ctx.fillStyle = 'rgba(0,20,10,0.88)'
        roundRect(ctx, W / 2 - mw / 2, H - 22, mw, 18, 4)
        ctx.fill()
        ctx.strokeStyle = '#00e676'; ctx.lineWidth = 0.8
        roundRect(ctx, W / 2 - mw / 2, H - 22, mw, 18, 4)
        ctx.stroke()
        ctx.fillStyle = '#00e676'
        ctx.fillText(msg, W / 2, H - 9)
        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <canvas
        ref={canvasRef}
        width={720}
        height={430}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {/* Invisible click targets for anomaly popup */}
      {propsRef.current.stats.showAnomalyPopup && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ marginTop: '10%', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onAcceptAnomaly(true)}
              style={{
                padding: '7px 18px', background: 'rgba(0,230,118,0.18)',
                border: '1px solid #00e676', borderRadius: '6px',
                color: '#00e676', fontWeight: 700, fontSize: '0.72rem',
                cursor: 'pointer', letterSpacing: '1px',
              }}
            >Yes — Change to PASS</button>
            <button
              onClick={() => onAcceptAnomaly(false)}
              style={{
                padding: '7px 18px', background: 'rgba(255,75,75,0.12)',
                border: '1px solid rgba(255,75,75,0.4)', borderRadius: '6px',
                color: '#ff4b4b', fontWeight: 700, fontSize: '0.72rem',
                cursor: 'pointer', letterSpacing: '1px',
              }}
            >No — Keep as SHOT</button>
          </div>
        </div>
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
