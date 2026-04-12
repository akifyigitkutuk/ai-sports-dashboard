import streamlit as st
import numpy as np
from mplsoccer import Pitch
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from ml_engine import train_fatigue_model, train_anomaly_model

st.set_page_config(
    layout="wide",
    page_title="ML-Driven Optimization: Transforming Sports Data Entry",
    page_icon="⚽"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
html, body, .stApp { background-color: #080d14 !important; font-family: 'Inter', sans-serif !important; color: #e0e0e0; }
.block-container { padding: 0.5rem 1rem !important; max-width: 100% !important; }
section[data-testid="stSidebar"] { display: none; }
.main-header { text-align:center; font-size:1.55rem; font-weight:900; color:#fff; padding:10px 0 4px 0; letter-spacing:0.5px; text-shadow:0 0 30px rgba(0,200,255,0.3); }
.card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px 14px; margin-bottom:10px; }
.card-red { border-left:4px solid #ff4b4b; background:linear-gradient(135deg,rgba(255,75,75,0.08) 0%,rgba(8,13,20,0.95) 100%); }
.card-blue { border-left:4px solid #00aaff; background:linear-gradient(135deg,rgba(0,170,255,0.06) 0%,rgba(8,13,20,0.95) 100%); }
.card-title { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:7px; }
.ct-red { color:#ff4b4b; } .ct-blue { color:#00aaff; } .ct-green { color:#00e676; }
.bullet { font-size:0.7rem; line-height:1.55; color:#c8c8c8; margin-bottom:5px; }
.bullet b { color:#fff; }
.stat-label { font-size:0.67rem; color:#aaa; margin-bottom:2px; }
.bar-bg { background:rgba(255,255,255,0.08); border-radius:4px; height:7px; margin-bottom:8px; overflow:hidden; }
.bar-green { background:linear-gradient(90deg,#00e676,#69ff47); height:100%; border-radius:4px; }
.bar-yellow { background:linear-gradient(90deg,#ffab00,#ffd740); height:100%; border-radius:4px; }
.bar-red { background:linear-gradient(90deg,#ff4b4b,#ff1744); height:100%; border-radius:4px; }
.supervisor-badge { background:linear-gradient(90deg,rgba(0,230,118,0.18),rgba(0,230,118,0.04)); border:1px solid #00e676; border-radius:6px; padding:6px 10px; font-size:0.63rem; font-weight:700; color:#00e676; letter-spacing:1.5px; text-align:center; margin-bottom:8px; text-transform:uppercase; }
.stButton>button { width:100%; background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:6px; font-size:0.73rem; font-weight:700; letter-spacing:1.5px; padding:9px 4px; transition:all 0.2s ease; }
.stButton>button:hover { background:rgba(0,230,118,0.18); border-color:#00e676; color:#00e676; box-shadow:0 0 12px rgba(0,230,118,0.25); }
.ai-verified { font-size:0.62rem; color:#00e676; margin:3px 0 7px 0; }
.cmp-table { width:100%; border-collapse:collapse; font-size:0.6rem; }
.cmp-table th { padding:5px 6px; font-size:0.58rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; background:rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.1); }
.cmp-table td { padding:5px 6px; border-bottom:1px solid rgba(255,255,255,0.05); color:#ccc; }
.col-red { color:#ff4b4b; font-weight:600; } .col-green { color:#00e676; font-weight:600; }
.warn-box { border:2px solid #ff1744; border-radius:10px; background:linear-gradient(135deg,#1a0808,#200c0c); padding:14px 16px; margin:6px 0; box-shadow:0 0 28px rgba(255,23,68,0.4); text-align:center; }
.warn-title { color:#ff1744; font-weight:700; font-size:0.82rem; }
.warn-body { color:#fff; font-size:0.72rem; margin:5px 0; }
.center-title { font-size:1.05rem; font-weight:700; color:#fff; text-align:center; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:4px; text-shadow:0 0 20px rgba(0,200,255,0.45); }
.tech-item { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
.tech-icon { font-size:0.95rem; min-width:20px; }
.tech-text { font-size:0.64rem; color:#bbb; line-height:1.5; }
.tech-text b { color:#fff; }
hr.divider { border:0; border-top:1px solid rgba(255,255,255,0.07); margin:6px 0; }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def load_models():
    return train_fatigue_model(), train_anomaly_model()


fatigue_model, anomaly_model = load_models()

if "last_event" not in st.session_state:
    st.session_state.last_event = None
if "show_popup" not in st.session_state:
    st.session_state.show_popup = False

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown('<div class="main-header">ML-Driven Optimization: Transforming Sports Data Entry Workflows</div>', unsafe_allow_html=True)
st.markdown("<hr class='divider'>", unsafe_allow_html=True)

# ── 3-COLUMN LAYOUT ───────────────────────────────────────────────────────────
left, center, right = st.columns([1.1, 2.2, 1.1], gap="medium")

# ══════════ LEFT ══════════════════════════════════════════════════════════════
with left:
    # Problem Card
    st.markdown("""
    <div class="card card-red">
        <div class="card-title ct-red">⬛ The Operational Bottleneck (The Problem)</div>
        <div class="bullet">🔴 <b>The 500ms Human Latency Gap:</b><br>
        Human reaction time for manual data entry averages 500ms, too slow for live betting/broadcasting.</div>
        <div class="bullet">🔴 <b>The 2-Minute Delayed Feedback Loop:</b><br>
        Errors at min 13 only caught by intl. supervisors at min 15, causing critical 'bad data' window.</div>
        <div class="bullet">🔴 <b>80% Quality Score Ceiling:</b><br>
        Manual processes and comm. lag prevent reaching the 95.5% market requirement.</div>
    </div>
    """, unsafe_allow_html=True)

    # Live Stats
    shift_hr = st.slider("Operator Shift Hour", 1, 8, 5, key="shift_hour")
    risk = fatigue_model.predict_proba([[shift_hr, 120, 1]])[0][1]
    risk_pct = int(risk * 100)
    risk_color = "bar-red" if risk > 0.6 else "bar-yellow" if risk > 0.35 else "bar-green"
    risk_hex = "#ff4b4b" if risk > 0.6 else "#ffab00" if risk > 0.35 else "#00e676"

    st.markdown(f"""
    <div class="card card-blue">
        <div class="card-title ct-blue">📊 Player / Team Live Stats</div>
        <div class="stat-label">Possession: <b style="color:#69ff47">Home 55%</b> / Away 42%</div>
        <div class="bar-bg"><div class="bar-green" style="width:55%"></div></div>
        <div class="stat-label">Shots on Target: <b>4 / 7</b></div>
        <div class="bar-bg"><div class="bar-yellow" style="width:57%"></div></div>
        <div class="stat-label">Pass Accuracy: <b>91%</b></div>
        <div class="bar-bg"><div class="bar-green" style="width:91%"></div></div>
        <div class="stat-label">Distance Covered: <b>112 km</b></div>
        <div class="bar-bg"><div class="bar-yellow" style="width:74%"></div></div>
        <div class="stat-label" style="margin-top:8px">⚠ Operator Fatigue Risk:
            <b style="color:{risk_hex}">{risk_pct}%</b></div>
        <div class="bar-bg"><div class="{risk_color}" style="width:{risk_pct}%"></div></div>
    </div>
    """, unsafe_allow_html=True)

    # Technical Engine
    st.markdown("""
    <div class="card">
        <div class="card-title" style="color:#aaa">🔧 The Technical Engine (Python ML Stack)</div>
        <div class="tech-item">
            <div class="tech-icon">📷</div>
            <div class="tech-text"><b>Real-Time Computer Vision (YOLOv8):</b><br>
            Automatically tracks player/ball coords (X, Y, Z) to verify manual entry vs. physical reality.</div>
        </div>
        <div class="tech-item">
            <div class="tech-icon">📈</div>
            <div class="tech-text"><b>Anomaly Detection (Isolation Forest):</b><br>
            Python-based ML model trained on historical Event Data to flag impossible events.</div>
        </div>
        <div class="tech-item">
            <div class="tech-icon">🧠</div>
            <div class="tech-text"><b>Operator Fatigue Prediction (Random Forest):</b><br>
            Analyzes reaction times and error frequency to predict when an operator needs a break.</div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ══════════ CENTER ════════════════════════════════════════════════════════════
with center:
    st.markdown('<div class="center-title">Control Center</div>', unsafe_allow_html=True)

    # Warning popup (shown when SHOT is pressed)
    if st.session_state.show_popup:
        st.markdown("""
        <div class="warn-box">
            <div class="warn-title">⚠ Warning: Shot detected in own half.</div>
            <div class="warn-body">Did you mean <b>"Pass"</b>?</div>
            <div style="font-size:0.65rem;color:#aaa">&lt;1 second (AI Check)</div>
        </div>
        """, unsafe_allow_html=True)
        cy, cn = st.columns(2)
        if cy.button("✅ Yes — Change to PASS", key="yes_btn"):
            st.session_state.show_popup = False
            st.session_state.last_event = "PASS (AI Corrected)"
        if cn.button("❌ No — Keep as SHOT", key="no_btn"):
            st.session_state.show_popup = False
            st.session_state.last_event = "SHOT (Operator Override)"

    # ── Pitch ────────────────────────────────────────────────────────────────
    np.random.seed(42)
    px = np.array([15, 25, 40, 50, 60, 22, 78, 88, 95, 102, 72])
    py = np.array([40, 22, 62, 40, 70, 40, 30, 52, 70, 40, 40])

    pitch = Pitch(pitch_type="statsbomb", pitch_color="#080d14",
                  line_color="#1e4d6b", linewidth=1.5, goal_type="box")
    fig, ax = pitch.draw(figsize=(8.5, 5.2))
    fig.patch.set_facecolor("#080d14")

    pitch.scatter(px, py, ax=ax, c="#00e676", s=180, edgecolors="white",
                  linewidth=1.2, zorder=5)

    # Bounding boxes with coords
    bb_coords = [(25, 22), (60, 70), (78, 30), (102, 40), (50, 40)]
    bb_labels = ["X:102, Y:45, Z:2", "X:102, Y:45, Z:2",
                 "X:102, Y:48, Z:2", "X:108, Y:43, Z:2", "X:102, Y:43, Z:2"]
    for (bx, by), label in zip(bb_coords, bb_labels):
        rect = mpatches.FancyBboxPatch((bx - 6, by - 6), 12, 12,
                                       boxstyle="round,pad=0.5",
                                       linewidth=1.2, edgecolor="#ffd740",
                                       facecolor="none", zorder=6)
        ax.add_patch(rect)
        ax.text(bx, by + 10.5, label, fontsize=4.2, color="#ffd740",
                ha="center", va="bottom", zorder=7, fontweight="bold",
                bbox=dict(facecolor="#000000aa", edgecolor="none", pad=0.4, boxstyle="round"))

    # Ball
    pitch.scatter([72], [40], ax=ax, c="#ffffff", s=110, edgecolors="#ffab00",
                  linewidth=1.5, zorder=8)

    # Pass arrows (neon blue)
    arrows = [((25, 50), (22, 40)), ((50, 40), (78, 30))]
    for (x1, y1), (x2, y2) in arrows:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#00aaff",
                                   lw=1.3, connectionstyle="arc3,rad=0.15"),
                    zorder=4)

    if st.session_state.last_event and not st.session_state.show_popup:
        ax.text(60, 38, f"✓ {st.session_state.last_event}", fontsize=6.5,
                color="#00e676", ha="center", va="center", zorder=9, fontweight="bold",
                bbox=dict(facecolor="#001a0a", edgecolor="#00e676",
                          boxstyle="round,pad=0.5", linewidth=1.2))

    plt.tight_layout(pad=0.1)
    st.pyplot(fig, use_container_width=True)
    plt.close()

    # ── Heatmap ──────────────────────────────────────────────────────────────
    np.random.seed(7)
    hm_x = np.concatenate([np.random.normal(95, 7, 70), np.random.normal(18, 8, 15)])
    hm_y = np.concatenate([np.random.normal(40, 12, 70), np.random.normal(40, 14, 15)])
    hm_x = np.clip(hm_x, 0, 120)
    hm_y = np.clip(hm_y, 0, 80)

    pitch_h = Pitch(pitch_type="statsbomb", pitch_color="#080d14",
                    line_color="#1e4d6b", linewidth=1)
    fig_h, ax_h = pitch_h.draw(figsize=(8.5, 2.8))
    fig_h.patch.set_facecolor("#080d14")
    pitch_h.kdeplot(hm_x, hm_y, ax=ax_h, cmap="RdYlGn_r",
                    fill=True, levels=50, alpha=0.75, thresh=0.04)
    ax_h.text(60, -9, "AI Verified Entry", fontsize=6.5, color="#00e676",
              ha="center", style="italic")
    plt.tight_layout(pad=0.1)
    st.pyplot(fig_h, use_container_width=True)
    plt.close()

    # ── Timeline ─────────────────────────────────────────────────────────────
    events_min = [8, 21, 34, 56, 73, 89]
    event_types = ["Goal", "Card", "Goal", "Card", "Sub", "Sub"]
    event_colors = {"Goal": "#ffd740", "Card": "#ff4b4b", "Sub": "#00aaff"}

    fig_t, ax_t = plt.subplots(figsize=(8.5, 0.55))
    fig_t.patch.set_facecolor("#080d14")
    ax_t.set_facecolor("#080d14")
    ax_t.barh(0, 90, height=0.25, color="#1a2333", edgecolor="none")
    for em, et in zip(events_min, event_types):
        ax_t.scatter(em, 0, color=event_colors.get(et, "#fff"), s=55, zorder=5)
        ax_t.text(em, 0.18, et, fontsize=5, color=event_colors.get(et, "#fff"),
                  ha="center", va="bottom", fontweight="bold")
    ax_t.set_xlim(0, 90)
    ax_t.set_ylim(-0.35, 0.45)
    ax_t.axis("off")
    for x in range(0, 91, 6):
        ax_t.text(x, -0.3, str(x), fontsize=4.5, color="#555", ha="center")
    ax_t.text(91, -0.3, "90 min", fontsize=4.5, color="#555", ha="left")
    plt.tight_layout(pad=0.05)
    st.pyplot(fig_t, use_container_width=True)
    plt.close()


# ══════════ RIGHT ═════════════════════════════════════════════════════════════
with right:
    # Supervisor Badge
    st.markdown('<div class="supervisor-badge">SUPERVISOR VIEW: CO-PILOT ACTIVE ●</div>',
                unsafe_allow_html=True)

    # Buttons
    st.markdown('<div class="card-title" style="color:#aaa;font-size:0.6rem;letter-spacing:2px;margin-bottom:6px">DATA ENTRY & SUPERVISOR VIEW</div>',
                unsafe_allow_html=True)

    cg, cp = st.columns(2)
    cf, cs = st.columns(2)

    with cg:
        if st.button("GOAL", key="btn_goal"):
            st.session_state.last_event = "GOAL"
            st.session_state.show_popup = False
    with cp:
        if st.button("PASS", key="btn_pass"):
            st.session_state.last_event = "PASS"
            st.session_state.show_popup = False
    with cf:
        if st.button("FOUL", key="btn_foul"):
            st.session_state.last_event = "FOUL"
            st.session_state.show_popup = False
    with cs:
        if st.button("SHOT", key="btn_shot"):
            st.session_state.show_popup = True
            st.session_state.last_event = None

    if st.session_state.last_event and not st.session_state.show_popup:
        st.markdown(f'<div class="ai-verified">✓ {st.session_state.last_event} — AI Verified (12ms)</div>',
                    unsafe_allow_html=True)

    # AS-IS vs TO-BE
    st.markdown("""
    <div class="card" style="margin-top:6px">
        <div class="card-title" style="color:#ccc">SYSTEM DESIGN: "AS-IS" vs. "TO-BE"</div>
        <table class="cmp-table">
            <tr>
                <th></th>
                <th class="col-red">CURRENT MANUAL<br>(The Bottleneck)</th>
                <th class="col-green">ML-OPTIMIZED<br>(The Co-Pilot)</th>
            </tr>
            <tr><td>Step 1</td><td>Employee Entry</td><td>Employee Entry</td></tr>
            <tr><td>Step 2</td><td class="col-red">Global Mgr. Review</td><td class="col-green">ML Anomaly Check (10ms)</td></tr>
            <tr><td>Step 3</td><td class="col-red">Local Mgr. Warning</td><td class="col-green">Instant Pop-up Alert</td></tr>
            <tr><td>Step 4</td><td class="col-red">Employee Correction</td><td class="col-green">Immediate Correction</td></tr>
            <tr>
                <td>Time</td>
                <td class="col-red" style="font-weight:700;font-size:0.75rem">2-5 minutes</td>
                <td class="col-green" style="font-weight:700;font-size:0.75rem">&lt;1 second</td>
            </tr>
        </table>
        <div style="font-size:0.56rem;color:#777;margin-top:5px">
            * HITL: System enhances humans — one operator manages 3-5 matches simultaneously instead of just one.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Operational Impact
    st.markdown("""
    <div class="card">
        <div class="card-title" style="color:#ccc">OPERATIONAL IMPACT</div>
        <table class="cmp-table">
            <tr>
                <th>Parameter</th>
                <th class="col-red">Current Manual Status</th>
                <th class="col-green">ML Target</th>
            </tr>
            <tr><td>Data Latency</td><td class="col-red">~500ms (Human)</td><td class="col-green">&lt;50ms (AI)</td></tr>
            <tr><td>Op. Efficiency</td><td class="col-red">1 Match/Operator</td><td class="col-green">3-3 Matches/Op</td></tr>
            <tr><td>Error Feedback</td><td class="col-red">2-3 Min (Manual)</td><td class="col-green">&lt;10ms (Auto)</td></tr>
            <tr><td>Data Integrity</td><td class="col-red">Variable (Human)</td><td class="col-green">99.3% Verified</td></tr>
            <tr><td>Scalability</td><td class="col-red">Linear (More staff)</td><td class="col-green">Technological</td></tr>
        </table>
    </div>
    """, unsafe_allow_html=True)
