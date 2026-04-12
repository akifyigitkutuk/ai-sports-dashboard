'use client';
import { useEffect, useRef } from 'react';

export default function HeatmapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const sx = (x: number) => (x / 120) * W;
    const sy = (y: number) => (y / 80) * H;

    // Background
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, W, H);

    // Pitch lines
    ctx.strokeStyle = '#1e4d6b';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx(1), sy(1), sx(118), sy(78));
    ctx.beginPath(); ctx.moveTo(sx(60), sy(1)); ctx.lineTo(sx(60), sy(79)); ctx.stroke();
    ctx.beginPath(); ctx.arc(sx(60), sy(40), sx(10) - sx(0), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(sx(1), sy(18), sx(18), sy(44));
    ctx.strokeRect(sx(101), sy(18), sx(18), sy(44));

    // Heatmap circles (hot zones)
    const heatZones = [
      { x: sx(95), y: sy(40), r: 60, intensity: 0.85 },
      { x: sx(105), y: sy(30), r: 40, intensity: 0.7 },
      { x: sx(105), y: sy(50), r: 35, intensity: 0.6 },
      { x: sx(85), y: sy(40), r: 50, intensity: 0.5 },
      { x: sx(18), y: sy(40), r: 35, intensity: 0.35 },
      { x: sx(70), y: sy(40), r: 30, intensity: 0.25 },
    ];

    heatZones.forEach(({ x, y, r, intensity }) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const alpha = intensity;
      if (intensity > 0.6) {
        grad.addColorStop(0, `rgba(255,50,0,${alpha})`);
        grad.addColorStop(0.3, `rgba(255,140,0,${alpha * 0.8})`);
        grad.addColorStop(0.6, `rgba(255,220,0,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,255,100,0)');
      } else if (intensity > 0.4) {
        grad.addColorStop(0, `rgba(255,200,0,${alpha})`);
        grad.addColorStop(0.5, `rgba(100,255,50,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,255,100,0)');
      } else {
        grad.addColorStop(0, `rgba(50,200,50,${alpha})`);
        grad.addColorStop(1, 'rgba(0,255,100,0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });

    // AI verified text
    ctx.fillStyle = '#00e676';
    ctx.font = 'italic 9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('AI Verified Entry', W / 2, H - 4);
    ctx.textAlign = 'left';
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={220}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}
