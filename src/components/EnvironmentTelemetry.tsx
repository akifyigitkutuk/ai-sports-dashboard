import { translations, type Lang } from '@/lib/translations'

interface Props {
  data: { temp: number; humidity: number; wind: string; ground: string }
  lang: Lang
}

export default function EnvironmentTelemetry({ data, lang }: Props) {
  const t = (key: string) => {
    const dict = lang === 'tr' ? translations.tr : translations.en;
    return (dict as any)[key] || key;
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#888', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
        {t('envTelemetry')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {[
          { label: t('temperature'), val: `${data.temp.toFixed(1)}°C`, icon: '🌡️' },
          { label: t('humidity'), val: `${data.humidity.toFixed(0)}%`, icon: '💧' },
          { label: t('windSpeed'), val: data.wind, icon: '🎐' },
          { label: t('surface'), val: t(data.ground as any), icon: '🏟️' }
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.5rem', color: '#555', fontWeight: 900 }}>{item.label}</span>
            <span style={{ fontSize: '0.75rem', color: '#eee', fontWeight: 700 }}>{item.val}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px', background: 'rgba(0,230,255,0.05)', border: '1px solid rgba(0,230,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e6ff' }}>
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </div>
        <p style={{ margin: 0, fontSize: '0.55rem', color: '#00e6ff', fontWeight: 800 }}>
          {t('venue_sync')}
        </p>
      </div>
    </div>
  )
}
