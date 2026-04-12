'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MatchTimeline from '@/components/MatchTimeline';

const FootballPitch = dynamic(() => import('@/components/FootballPitch'), { ssr: false });
const HeatmapCanvas = dynamic(() => import('@/components/HeatmapCanvas'), { ssr: false });

type EventType = 'GOAL' | 'PASS' | 'FOUL' | 'SHOT' | null;

// ── ML Simulation in JS ──────────────────────────────────────────────────────
function predictFatigueRisk(shiftHour: number, tempo = 120, prevErrors = 1): number {
  const raw = shiftHour * 0.4 + tempo * 0.005 + prevErrors * 0.2;
  return Math.min(0.98, Math.max(0.02, raw / 8));
}

function isAnomaly(event: string, x: number): boolean {
  return event === 'SHOT' && x < 60;
}

// ── Player Data ───────────────────────────────────────────────────────────────
const PLAYERS = [
  { x: 15, y: 40, label: '', showBox: false },
  { x: 25, y: 22, label: 'X:102, Y:45, Z:2', showBox: true },
  { x: 40, y: 62, label: '', showBox: false },
  { x: 50, y: 40, label: 'X:102, Y:43, Z:2', showBox: true },
  { x: 60, y: 70, label: 'X:102, Y:45, Z:2', showBox: true },
  { x: 22, y: 40, label: '', showBox: false },
  { x: 78, y: 30, label: 'X:108, Y:43, Z:2', showBox: true },
  { x: 88, y: 52, label: '', showBox: false },
  { x: 95, y: 70, label: '', showBox: false },
  { x: 102, y: 40, label: 'X:102, Y:48, Z:2', showBox: true },
  { x: 72, y: 40, label: '', showBox: false },
];

function StatBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="stat-bar-bg">
      <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function Dashboard() {
  const [shiftHour, setShiftHour] = useState(5);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const risk = useMemo(() => predictFatigueRisk(shiftHour), [shiftHour]);
  const riskPct = Math.round(risk * 100);
  const riskColor =
    risk > 0.6 ? 'linear-gradient(90deg,#ff4b4b,#ff1744)' :
    risk > 0.35 ? 'linear-gradient(90deg,#ffab00,#ffd740)' :
    'linear-gradient(90deg,#00e676,#69ff47)';
  const riskHex = risk > 0.6 ? '#ff4b4b' : risk > 0.35 ? '#ffab00' : '#00e676';

  function handleEvent(type: EventType) {
    if (!type) return;
    if (isAnomaly(type, 45)) {
      setShowPopup(true);
      setLastEvent(null);
    } else {
      setLastEvent(type);
      setShowPopup(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080d14', padding: '0.5rem 1rem' }}>
      {/* ── HEADER ── */}
      <h1 style={{
        textAlign: 'center', fontSize: '1.45rem', fontWeight: 900,
        color: '#fff', padding: '8px 0 4px',
        textShadow: '0 0 28px rgba(0,180,255,0.35)',
        letterSpacing: '0.4px'
      }}>
        ML-Driven Optimization: Transforming Sports Data Entry Workflows
      </h1>
      <hr className="divider" />

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.1fr 1fr', gap: '14px', marginTop: '8px' }}>

        {/* ════════ LEFT ════════ */}
        <div>
          {/* Problem */}
          <div className="card card-red">
            <div className="section-label" style={{ color: '#ff4b4b' }}>⬛ The Operational Bottleneck (The Problem)</div>
            {[
              { title: 'The 500ms Human Latency Gap:', body: 'Human reaction time for manual data entry averages 500ms, too slow for live betting/broadcasting.' },
              { title: 'The 2-Minute Delayed Feedback Loop:', body: "Errors at min 13 only caught by int'l supervisors at min 15, causing critical 'bad data' window." },
              { title: '80% Quality Score Ceiling:', body: 'Manual processes and comm. lag prevent reaching the 95.5% market requirement.' },
            ].map(({ title, body }) => (
              <p key={title} style={{ fontSize: '0.67rem', lineHeight: 1.55, color: '#c8c8c8', marginBottom: '8px' }}>
                🔴 <strong style={{ color: '#fff' }}>{title}</strong><br />{body}
              </p>
            ))}
          </div>

          {/* Live Stats */}
          <div className="card card-blue">
            <div className="section-label" style={{ color: '#00aaff' }}>📊 Player / Team Live Stats</div>

            <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>
              Possession: <strong style={{ color: '#69ff47' }}>Home 55%</strong> / Away 42%
            </p>
            <StatBar pct={55} color="linear-gradient(90deg,#00e676,#69ff47)" />

            <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>Shots on Target: <strong>4 / 7</strong></p>
            <StatBar pct={57} color="linear-gradient(90deg,#ffab00,#ffd740)" />

            <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>Pass Accuracy: <strong>91%</strong></p>
            <StatBar pct={91} color="linear-gradient(90deg,#00e676,#69ff47)" />

            <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>Distance Covered: <strong>112 km</strong></p>
            <StatBar pct={74} color="linear-gradient(90deg,#ffab00,#ffd740)" />

            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '4px' }}>
                Operator Shift Hour:
                <input
                  type="range" min={1} max={8} value={shiftHour}
                  onChange={e => setShiftHour(Number(e.target.value))}
                  style={{ width: '100%', accentColor: riskHex, cursor: 'pointer' }}
                />
                <strong style={{ color: riskHex }}>{shiftHour}h</strong>
              </p>
              <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>
                ⚠ Operator Fatigue Risk: <strong style={{ color: riskHex }}>{riskPct}%</strong>
              </p>
              <StatBar pct={riskPct} color={riskColor} />
              {risk > 0.6 && (
                <p style={{ fontSize: '0.62rem', color: '#ff4b4b', marginTop: '4px', fontWeight: 600 }}>
                  🚨 HIGH FATIGUE DETECTED — Break recommended within 15 min
                </p>
              )}
            </div>
          </div>

          {/* Technical Engine */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="section-label">🔧 The Technical Engine (Python ML Stack)</div>
            {[
              { icon: '📷', title: 'Real-Time Computer Vision (YOLOv8):', body: 'Automatically tracks player/ball coordinates (X, Y, Z) to verify manual entry against physical reality.' },
              { icon: '📈', title: 'Anomaly Detection (Isolation Forest):', body: 'Python-based ML model trained on historical Event Data to flag impossible events.' },
              { icon: '🧠', title: 'Operator Fatigue Prediction (Random Forest):', body: 'Analyzes reaction times and error frequency to predict when an operator needs a break.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', minWidth: '18px' }}>{icon}</span>
                <p style={{ fontSize: '0.63rem', color: '#bbb', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>{title}</strong><br />{body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ CENTER ════════ */}
        <div>
          <p className="center-title">Control Center</p>

          {/* Warning Popup */}
          {showPopup && (
            <div className="warn-popup">
              <p style={{ color: '#ff1744', fontWeight: 700, fontSize: '0.85rem' }}>
                ⚠ Warning: Shot detected in own half.
              </p>
              <p style={{ color: '#fff', fontSize: '0.73rem', margin: '6px 0' }}>
                Did you mean <strong>&quot;Pass&quot;</strong>?
              </p>
              <p style={{ color: '#888', fontSize: '0.62rem', marginBottom: '10px' }}>&lt;1 second (AI Check)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="action-btn" onClick={() => { setShowPopup(false); setLastEvent('PASS (AI Corrected)'); }}
                  style={{ borderColor: '#00e676', color: '#00e676' }}>
                  ✅ Yes, change to PASS
                </button>
                <button className="action-btn" onClick={() => { setShowPopup(false); setLastEvent('SHOT (Override)'); }}>
                  ❌ No, keep as SHOT
                </button>
              </div>
            </div>
          )}

          {/* Pitch */}
          <div className="pitch-container">
            <FootballPitch players={PLAYERS} lastEvent={lastEvent} showPopup={showPopup} />
          </div>

          {/* Heatmap */}
          <div className="pitch-container" style={{ marginTop: '8px' }}>
            <HeatmapCanvas />
          </div>

          {/* Timeline */}
          <div style={{ marginTop: '8px' }}>
            <MatchTimeline />
          </div>
        </div>

        {/* ════════ RIGHT ════════ */}
        <div>
          {/* Supervisor Badge */}
          <div className="supervisor-badge">SUPERVISOR VIEW: CO-PILOT ACTIVE ●</div>

          {/* Action Buttons */}
          <div className="section-label">Data Entry &amp; Supervisor View</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            {(['GOAL', 'PASS', 'FOUL', 'SHOT'] as EventType[]).map(ev => (
              <button
                key={ev}
                className={`action-btn${ev === 'SHOT' ? ' shot-btn' : ''}`}
                onClick={() => handleEvent(ev)}
              >
                {ev}
              </button>
            ))}
          </div>

          {lastEvent && !showPopup && (
            <p style={{ fontSize: '0.63rem', color: '#00e676', marginBottom: '8px', fontWeight: 600 }}>
              ✓ {lastEvent} — AI Verified (12ms)
            </p>
          )}

          <hr className="divider" />

          {/* AS-IS vs TO-BE */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', marginBottom: '10px' }}>
            <div className="section-label">System Design: &quot;AS-IS&quot; vs. &quot;TO-BE&quot;</div>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="col-red">Current Manual<br />(The Bottleneck)</th>
                  <th className="col-green">ML-Optimized<br />(The Co-Pilot)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Step 1', 'Employee Entry', 'Employee Entry'],
                  ['Step 2', 'Global Mgr. Review', 'ML Anomaly Check (10ms)'],
                  ['Step 3', 'Local Mgr. Warning', 'Instant Pop-up Alert'],
                  ['Step 4', 'Employee Correction', 'Immediate Correction'],
                ].map(([step, bad, good]) => (
                  <tr key={step}>
                    <td>{step}</td>
                    <td className="col-red">{bad}</td>
                    <td className="col-green">{good}</td>
                  </tr>
                ))}
                <tr>
                  <td>Time elapsed</td>
                  <td className="col-red" style={{ fontWeight: 700, fontSize: '0.7rem' }}>2-5 minutes</td>
                  <td className="col-green" style={{ fontWeight: 700, fontSize: '0.7rem' }}>&lt;1 second</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.54rem', color: '#666', marginTop: '6px' }}>
              * HITL: System enhances humans — one operator manages 3-5 matches simultaneously instead of just one.
            </p>
          </div>

          {/* Operational Impact */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px' }}>
            <div className="section-label">Operational Impact</div>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th className="col-red">Current Manual</th>
                  <th className="col-green">ML Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Data Latency', '~500ms (Human)', '<50ms (AI)'],
                  ['Op. Efficiency', '1 Match/Op', '3-5 Matches/Op'],
                  ['Error Feedback', '2-3 Min', '<10ms (Auto)'],
                  ['Data Integrity', 'Variable', '99.3% Verified'],
                  ['Scalability', 'Linear', 'Technological'],
                ].map(([param, cur, tgt]) => (
                  <tr key={param}>
                    <td>{param}</td>
                    <td className="col-red">{cur}</td>
                    <td className="col-green">{tgt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
