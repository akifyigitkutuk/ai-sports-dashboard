'use client';
import { useEffect, useRef } from 'react';

interface Player {
  x: number;
  y: number;
  label: string;
  showBox?: boolean;
}

interface PitchProps {
  players: Player[];
  lastEvent: string | null;
  showPopup: boolean;
}

export default function FootballPitch({ players, lastEvent, showPopup }: PitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Scale coords from StatsBomb (0-120 x 0-80) to canvas
    const sx = (x: number) => (x / 120) * W;
    const sy = (y: number) => (y / 80) * H;

    // Background
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, W, H);

    // Pitch green tint
    const pitchGrad = ctx.createLinearGradient(0, 0, W, H);
    pitchGrad.addColorStop(0, 'rgba(0,60,30,0.35)');
    pitchGrad.addColorStop(0.5, 'rgba(0,40,20,0.25)');
    pitchGrad.addColorStop(1, 'rgba(0,60,30,0.35)');
    ctx.fillStyle = pitchGrad;
    ctx.fillRect(0, 0, W, H);

    // Stripe pattern
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(0,255,100,0.03)';
        ctx.fillRect(i * (W / 10), 0, W / 10, H);
      }
    }

    const lineColor = '#1e5a7a';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;

    // Outline
    ctx.strokeRect(sx(1), sy(1), sx(118), sy(78));

    // Halfway line
    ctx.beginPath(); ctx.moveTo(sx(60), sy(1)); ctx.lineTo(sx(60), sy(79)); ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(sx(60), sy(40), sx(10) - sx(0), 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx(60), sy(40), 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    // Left penalty box
    ctx.strokeRect(sx(1), sy(18), sx(18), sy(44));
    ctx.strokeRect(sx(1), sy(30), sx(6), sy(20));

    // Right penalty box
    ctx.strokeRect(sx(101), sy(18), sx(18), sy(44));
    ctx.strokeRect(sx(113), sy(30), sx(6), sy(20));

    // Goals
    ctx.strokeStyle = '#ffd740';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx(0), sy(36), sx(1), sy(8));
    ctx.strokeRect(sx(119), sy(36), sx(1), sy(8));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;

    // Pass arrows (neon blue)
    const arrows = [
      { x1: sx(25), y1: sy(22), x2: sx(50), y2: sy(40) },
      { x1: sx(50), y1: sy(40), x2: sx(78), y2: sy(30) },
    ];
    arrows.forEach(({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len, uy = dy / len;
      ctx.strokeStyle = '#00aaff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(dy, dx);
      ctx.fillStyle = '#00aaff';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Players
    players.forEach((p) => {
      const cx = sx(p.x), cy = sy(p.y);

      // Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      grad.addColorStop(0, 'rgba(0,230,118,0.3)');
      grad.addColorStop(1, 'rgba(0,230,118,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();

      // Player dot
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00e676'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

      // Bounding box
      if (p.showBox) {
        ctx.strokeStyle = '#ffd740';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - 12, cy - 12, 24, 24);

        // Corner ticks
        const t = 4;
        ctx.strokeStyle = '#ffd740';
        ['topleft', 'topright', 'botleft', 'botright'].forEach((corner) => {
          const bx = corner.includes('right') ? cx + 12 : cx - 12;
          const by = corner.includes('bot') ? cy + 12 : cy - 12;
          const dx2 = corner.includes('right') ? -t : t;
          const dy2 = corner.includes('bot') ? -t : t;
          ctx.beginPath();
          ctx.moveTo(bx + dx2, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + dy2);
          ctx.stroke();
        });

        // Coordinate label
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        const tw = ctx.measureText(p.label).width + 8;
        ctx.fillRect(cx - tw / 2, cy - 26, tw, 13);
        ctx.fillStyle = '#ffd740';
        ctx.font = 'bold 7px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, cx, cy - 17);
      }
    });

    // Ball
    ctx.beginPath(); ctx.arc(sx(72), sy(40), 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 1.5; ctx.stroke();

    // Confirmed event overlay
    if (lastEvent && !showPopup) {
      ctx.fillStyle = 'rgba(0,26,10,0.85)';
      const msg = `✓ ${lastEvent} — AI Verified (12ms)`;
      const mw = ctx.measureText(msg).width + 20;
      ctx.fillRect(sx(60) - mw / 2, sy(40) - 12, mw, 22, );
      ctx.strokeStyle = '#00e676'; ctx.lineWidth = 1;
      ctx.strokeRect(sx(60) - mw / 2, sy(40) - 12, mw, 22);
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(msg, sx(60), sy(40) + 4);
    }

    ctx.textAlign = 'left';
  }, [players, lastEvent, showPopup]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={400}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}
