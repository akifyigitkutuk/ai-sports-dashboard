'use client'

import { translations, type Lang } from '@/lib/translations'

interface Props {
  metrics: { label: string; value: number }[]
  lang: Lang
}

export default function TacticalRadar({ metrics, lang }: Props) {
  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key
  const size = 260
  const center = size / 2
  const radius = size * 0.35
  const angleStep = (Math.PI * 2) / metrics.length

  const getPoint = (val: number, angle: number) => {
    const scale = (val / 100) * radius
    return {
      x: center + scale * Math.cos(angle - Math.PI / 2),
      y: center + scale * Math.sin(angle - Math.PI / 2)
    }
  }

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const dataPoints = metrics.map((m, i) => getPoint(m.value, i * angleStep))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00e6ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
        {t('tacticalRadar')}
      </p>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridLevels.map((lvl, idx) => (
          <path
            key={idx}
            d={metrics.map((_, i) => {
              const p = getPoint(lvl * 100, i * angleStep)
              return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            }).join(' ') + ' Z'}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {metrics.map((_, i) => {
          const p = getPoint(100, i * angleStep)
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        })}

        {/* Data Shape */}
        <path
          d={dataPath}
          fill="rgba(0, 230, 255, 0.15)"
          stroke="#00e6ff"
          strokeWidth="2"
          style={{ transition: 'all 0.5s ease-in-out' }}
        />

        {/* Data Points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" />
        ))}

        {/* Labels */}
        {metrics.map((m, i) => {
          const p = getPoint(120, i * angleStep)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontWeight="800"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {t(m.label.toLowerCase() as any)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
