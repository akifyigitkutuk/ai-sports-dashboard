'use client'
import { translations, type Lang } from '@/lib/translations'

export interface UserCommand {
  id: string
  type: string
  timestamp: string
  status: 'SUCCESS' | 'WARN'
}

export default function CommandHistory({ commands, lang }: { commands: UserCommand[], lang: Lang }) {
  const t = (key: string) => {
    const dict = lang === 'tr' ? translations.tr : translations.en;
    return (dict as any)[key] || key;
  };

  return (
    <div style={{
      background: 'rgba(6,12,20,0.4)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      height: '52px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      boxShadow: 'inset 0 0 20px rgba(0,230,255,0.02)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.65rem',
        fontWeight: 900,
        color: '#00e6ff',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        paddingRight: '20px',
        flexShrink: 0,
        height: '100%'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#00e6ff', boxShadow: '0 0 10px #00e6ff' }} />
        {t('commandHistory')}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {commands.length === 0 ? (
          <span style={{ fontSize: '0.6rem', color: '#444', fontStyle: 'italic', letterSpacing: '1px' }}>
            {lang === 'tr' ? 'KOMUT GİRİŞİ BEKLENİYOR...' : 'WAITING FOR COMMAND INPUT...'}
          </span>
        ) : (
          [...commands].reverse().map((cmd) => (
            <div key={cmd.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              background: cmd.status === 'SUCCESS' ? 'rgba(0,230,118,0.08)' : 'rgba(255,171,0,0.08)',
              border: `1px solid ${cmd.status === 'SUCCESS' ? 'rgba(0,230,118,0.3)' : 'rgba(255,171,0,0.3)'}`,
              borderRadius: '8px',
              animation: 'slideIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: cmd.status === 'SUCCESS' ? '#00e676' : '#ffab00',
                boxShadow: `0 0 8px ${cmd.status === 'SUCCESS' ? '#00e676' : '#ffab00'}`
              }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t(cmd.type.toLowerCase().replace(' ', '_') as any)}
              </span>
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontFamily: 'monospace' }}>{cmd.timestamp}</span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
