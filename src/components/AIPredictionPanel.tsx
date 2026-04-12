'use client'

import { translations, type Lang } from '@/lib/translations'

interface Props {
  predictions: { type: string; probability: number }[]
  lang: Lang
}

export default function AIPredictionPanel({ predictions, lang }: Props) {
  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffab00', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
        {t('aiModelInsights')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {predictions.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 900 }}>
              <span style={{ color: i === 0 ? '#fff' : '#888' }}>
                {i === 0 && '🔥 '} {t(p.type.toLowerCase().replace(' ', '_') as any)}
              </span>
              <span style={{ color: i === 0 ? '#ffab00' : '#555' }}>
                {(p.probability * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${p.probability * 100}%`, 
                height: '100%', 
                background: i === 0 ? 'linear-gradient(90deg, #ffab00, #ff6d00)' : '#444', 
                borderRadius: '2px',
                transition: 'width 0.4s ease-out'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '5px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, fontSize: '0.52rem', color: '#666', lineHeight: 1.5, textAlign: 'center' }}>
          * {lang === 'tr' ? 'YOL/HIZ VERİLERİNE DAYALI ANLIK MODEL GÜNCELLEMESİ' : 'MODEL UPDATING BASED ON REAL-TIME COORDINATE FLOW & VELOCITY'}
        </p>
      </div>
    </div>
  )
}
