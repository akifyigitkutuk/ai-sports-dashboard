'use client';

interface TimelineEvent {
  minute: number;
  type: 'Goal' | 'Card' | 'Sub';
}

const events: TimelineEvent[] = [
  { minute: 8, type: 'Goal' },
  { minute: 21, type: 'Card' },
  { minute: 34, type: 'Goal' },
  { minute: 56, type: 'Card' },
  { minute: 73, type: 'Sub' },
  { minute: 89, type: 'Sub' },
];

const colorMap = { Goal: '#ffd740', Card: '#ff4b4b', Sub: '#00aaff' };
const iconMap = { Goal: '⚽', Card: '🟨', Sub: '🔄' };

export default function MatchTimeline() {
  return (
    <div className="card card-dark" style={{ padding: '10px 14px' }}>
      <div style={{ position: 'relative', height: '50px' }}>
        {/* Timeline bar */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: '4px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px', transform: 'translateY(-50%)'
        }} />
        {/* Progress fill */}
        <div style={{
          position: 'absolute', top: '50%', left: 0,
          width: '65%', height: '4px',
          background: 'linear-gradient(90deg, #00e676, #00aaff)',
          borderRadius: '2px', transform: 'translateY(-50%)'
        }} />
        {/* Events */}
        {events.map((ev) => {
          const pct = (ev.minute / 90) * 100;
          return (
            <div key={ev.minute} style={{
              position: 'absolute', left: `${pct}%`,
              top: '50%', transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}>
              <span style={{ fontSize: '0.55rem', color: colorMap[ev.type], fontWeight: 700, lineHeight: 1 }}>
                {iconMap[ev.type]}
              </span>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: colorMap[ev.type],
                boxShadow: `0 0 6px ${colorMap[ev.type]}`,
              }} />
              <span style={{ fontSize: '0.48rem', color: colorMap[ev.type], fontWeight: 600 }}>
                {ev.minute}&apos;
              </span>
            </div>
          );
        })}
      </div>
      {/* Minute labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        {[0, 15, 30, 45, 60, 75, 90].map(m => (
          <span key={m} style={{ fontSize: '0.48rem', color: '#444' }}>{m}</span>
        ))}
      </div>
    </div>
  );
}
