'use client'
import { type Player } from '@/lib/gameEngine'

interface Props {
  players: Player[]
}

export default function PlayerTrackingHub({ players }: Props) {
  // Sort by distance covered
  const sortedPlayers = [...players].sort((a, b) => b.distance - a.distance)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px',
      height: '340px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00e6ff', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
          Live Player Tracking Hub
        </p>
        <div style={{ fontSize: '0.55rem', color: '#555', fontWeight: 900 }}>
          ACTIVE_NODES: {players.length}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '5px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#666', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px' }}>PLAYER</th>
              <th style={{ padding: '8px 4px' }}>ROLE</th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>DISTANCE</th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: '#eee' }}>
                <td style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.team === 0 ? '#00e6ff' : '#ff4b4b' }} />
                  {p.team === 0 ? 'HOME' : 'AWAY'} #{p.id > 100 ? p.id - 100 : p.id + 1}
                </td>
                <td style={{ padding: '8px 4px', color: '#888', fontWeight: 700 }}>{p.role.toUpperCase()}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'monospace', color: '#aaa' }}>
                  {(p.distance / 1000).toFixed(2)} km
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  <span style={{ 
                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.5rem', fontWeight: 900,
                    background: p.hasBall ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.05)',
                    color: p.hasBall ? '#00e676' : '#555'
                  }}>
                    {p.hasBall ? 'CARRIER' : 'TRACKING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
