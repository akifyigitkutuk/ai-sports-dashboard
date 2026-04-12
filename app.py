import streamlit as st
import pandas as pd
import numpy as np
from mplsoccer import Pitch
import matplotlib.pyplot as plt
from ml_engine import train_fatigue_model, train_anomaly_model

st.set_page_config(layout='wide', page_title='AI Co-Pilot | ASYALOGIC & SPORTRADAR')

st.markdown('''
<style>
    .main { background-color: #0e1117; }
    .stApp { background-color: #0e1117; }
    .metric-card {
        background-color: #1a1c24; padding: 25px; border-radius: 15px;
        border-top: 5px solid #4CAF50; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .problem-card { border-top-color: #ff4b4b; background: linear-gradient(145deg, #1a1c24, #251212); }
    .solution-card { border-top-color: #00d4ff; background: linear-gradient(145deg, #1a1c24, #0a2333); }
    h1, h2, h3, h4 { color: white !important; font-family: 'Inter', sans-serif; }
</style>
''', unsafe_allow_html=True)

@st.cache_resource
def load_models(): return train_fatigue_model(), train_anomaly_model()
fatigue_model, anomaly_model = load_models()

st.title('⚽ AI Co-Pilot: Transforming Sports Data Entry')
st.markdown('##### Asyalogic & Sportradar Operasyonel Optimizasyon Prototipi')

tab1, tab2, tab3 = st.tabs(['🚀 STRATEJİ', '🎮 DEMO (MVP)', '🛠️ MİMARİ'])

with tab1:
    st.markdown('### 1. Operasyonel Sorunlar vs. AI Çözümü')
    c1, c2 = st.columns(2)
    with c1:
        st.markdown('''<div class="metric-card problem-card"><h4>🔴 Mevcut Krizler</h4><ul><li><b>Gecikme:</b> 500ms insan tepki süresi.</li><li><b>Kalite:</b> %80 kalite skoru.</li><li><b>Sosyal:</b> Yüksek stres ve motivasyon kaybı.</li></ul></div>''', unsafe_allow_html=True)
    with c2:
        st.markdown('''<div class="metric-card solution-card"><h4>🔵 AI Co-Pilot (HITL)</h4><ul><li><b>Hız:</b> 0.1s denetim süresi.</li><li><b>Kalite:</b> %99+ veri doğruluğu.</li><li><b>Ölçeklenme:</b> 1 kişi 5 maçı denetleyebilir.</li></ul></div>''', unsafe_allow_html=True)

with tab2:
    l, r = st.columns([2, 1])
    with l:
        st.subheader('Live Tracking Simulation')
        p = Pitch(pitch_type='statsbomb', pitch_color='#0e1117', line_color='#4d4d4d')
        fig, ax = p.draw(figsize=(10, 7))
        p.scatter(np.random.uniform(20, 100, 11), np.random.uniform(10, 70, 11), ax=ax, c='#4CAF50', s=150, edgecolors='white')
        st.pyplot(fig)
    with r:
        hr = st.slider('Vardiya Süresi (Saat)', 1, 8, 5)
        risk = fatigue_model.predict_proba([[hr, 120, 1]])[0][1]
        st.markdown(f'<div class="metric-card"><h4>Hata Riski</h4><h2 style="color:{"#ff4b4b" if risk > 0.5 else "#4CAF50"}">{risk*100:.1f}%</h2></div>', unsafe_allow_html=True)
        if st.button('ŞUT ÇEK (Hatalı Giriş Örneği)', use_container_width=True):
            st.error('🚨 ANOMALİ: Kendi kalesinden şut girildi!')
            st.info('AI Co-Pilot: Bunu PAS olarak değiştirmek ister misiniz? (HITL Intervention Active)')

with tab3:
    st.markdown('### 3. Teknik Derinlik')
    st.write('- **ML:** Scikit-Learn Isolation Forest')
    st.write('- **CV:** YOLOv8 Object Detection')
    st.write('- **Vision:** MediaPipe Skeleton Tracking')
