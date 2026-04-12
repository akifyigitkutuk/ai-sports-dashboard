'use client'

interface Props {
  factors: { label: string; value: number }[]
}

export default function FactorAnalysis({ factors }: Props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#888', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
        AI Decision Weights
      </p>

      {factors.map((f, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800 }}>
            <span style={{ color: '#aaa' }}>{f.label}</span>
            <span style={{ color: '#ffab00' }}>{(f.value * 10).toFixed(1)}x</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${f.value * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #ffab00, #ff6d00)', 
              borderRadius: '2px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,171,0,0.05)', border: '1px solid rgba(255,171,0,0.1)', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.55rem', color: '#ffab00', fontWeight: 800, textAlign: 'center' }}>
          CORE FACTOR: {factors.reduce((prev, current) => (prev.value > current.value) ? prev : current).label}
        </p>
      </div>
    </div>
  )
}
