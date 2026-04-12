import { useState, useEffect } from 'react'
import { translations, type Lang } from '@/lib/translations'

interface Props {
  message: string
  correction: string
  onAccept: (val: boolean) => void
  lang: Lang
}

export default function AnomalyPopup({ message, correction, onAccept, lang }: Props) {
  const [progress, setProgress] = useState(1)
  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key

  useEffect(() => {
    const start = Date.now()
    const duration = 800 // < 1 second as per image
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.max(0, 1 - elapsed / duration)
      setProgress(next)
      if (next === 0) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2000,
      width: '340px',
      background: 'rgba(20, 10, 10, 0.95)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 75, 75, 0.5)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(255, 75, 75, 0.2)',
      borderRadius: '24px',
      padding: '0 0 24px 0',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      textAlign: 'center',
      animation: 'popIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
    }}>
      {/* Red Header Glow */}
      <div style={{ height: '40px', background: 'linear-gradient(180deg, rgba(255,75,75,0.2) 0%, transparent 100%)', position: 'relative' }}>
         <button 
          onClick={() => onAccept(false)}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}
        >×</button>
      </div>

      <div style={{ padding: '0 30px' }}>
        <h2 style={{ color: '#ff4b4b', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '0.5px' }}>
           {t('warning')}: <span style={{ color: '#fff' }}>{message}</span>
        </h2>
        <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 700, margin: '0 0 24px 0' }}>
          {t('did_you_mean')} "{t(correction.toLowerCase().replace(' ', '_') as any)}"?<br/>
          <span style={{ fontSize: '0.75rem', color: '#00e6ff', opacity: 0.9 }}>[{lang === 'tr' ? 'Evet/Hayır' : 'Yes/No'}]</span>
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => onAccept(true)}
            style={{
              flex: 2, padding: '14px 10px', background: '#00e676', color: '#000', 
              border: 'none', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900, 
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,230,118,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}
          >{t('yes_it_was')} {t(correction.toLowerCase().replace(' ', '_') as any)}</button>
          <button 
            onClick={() => onAccept(false)}
            style={{
              flex: 1, padding: '14px 10px', background: 'rgba(255,255,255,0.05)', color: '#fff', 
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.7rem', 
              fontWeight: 900, cursor: 'pointer', opacity: 0.8
            }}
          >{t('no_ignore')}</button>
        </div>

        {/* AI Check Footer */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', padding: '1px' }}>
              <div style={{ 
                width: `${progress * 100}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #00e676, #00e6ff)', 
                borderRadius: '10px',
                transition: 'width 0.016s linear' 
              }} />
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.7rem', color: '#00e676', fontWeight: 800, letterSpacing: '1px' }}>
            &lt;1 {lang === 'tr' ? 'saniye' : 'second'} ({t('ai_check')})
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          from { transform: translate(-50%, -40%) scale(0.9); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
