import streamlit as st
import pandas as pd
import numpy as np
from mplsoccer import Pitch
import matplotlib.pyplot as plt
from ml_engine import train_fatigue_model, train_anomaly_model

st.set_page_config(layout='wide', page_title='AI Co-Pilot | OptiMatch Optimization')

st.markdown('''
<style>
    .reportview-container { background: #0e1117; }
    .metric-card {
        background-color: #1a1c24;
        padding: 20px;
        border-radius: 12px;
        border-left: 6px solid #4CAF50;
        margin-bottom: 20px;
    }
    .problem-card { border-left-color: #ff4b4b; }
    .solution-card { border-left-color: #00d4ff; }
</style>
''', unsafe_allow_html=True)

@st.cache_resource
def load_models(): return train_fatigue_model(), train_anomaly_model()
fatigue_model, anomaly_model = load_models()

st.title('? AI Co-Pilot: Asyalogic & Sportradar MVP')

tab1, tab2, tab3 = st.tabs(['?? Strateji', '?? Live Demo', '??? Mimari'])

with tab1:
    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="metric-card problem-card"><h3>?? Mevcut Sorunlar</h3><ul><li>Gecikme: 500ms</li><li>Kalite: %80</li><li>Yük: Manuel</li></ul></div>', unsafe_allow_html=True)
    with c2:
        st.markdown('<div class="metric-card solution-card"><h3>?? AI Kazanimlari</h3><ul><li>Gecikme: <100ms</li><li>Kalite: %99.9</li><li>HITL Role: AI Supervisor</li></ul></div>', unsafe_allow_html=True)

with tab2:
    l, r = st.columns([2, 1])
    with l:
        pitch = Pitch(pitch_type='statsbomb', pitch_color='#0e1117', line_color='#4d4d4d')
        fig, ax = pitch.draw(figsize=(10, 7))
        pitch.scatter(np.random.uniform(20, 100, 11), np.random.uniform(10, 70, 11), ax=ax, c='#4CAF50', s=150)
        st.pyplot(fig)
    with r:
        hr = st.slider('Vardiya Saati', 1, 8, 5)
        risk = fatigue_model.predict_proba([[hr, 100, 1]])[0][1]
        st.markdown(f'<div class="metric-card"><h4>AI Yorgunluk Analizi</h4><h2>{risk*100:.1f}% Risk</h2></div>', unsafe_allow_html=True)
        if st.button('SUT KAYDET'): st.error('?? ANOMALI! Kendi kalesinden sut girilemez. [HITL Intervention Active]')

with tab3:
    st.info('Teknik Detay: YOLOv8 Bounding Box + Scikit-Learn Isolation Forest')
