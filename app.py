import streamlit as st
import pandas as pd
import numpy as np
from mplsoccer import Pitch
import matplotlib.pyplot as plt
from ml_engine import train_fatigue_model, train_anomaly_model

st.set_page_config(layout='wide', page_title='AI Co-Pilot | OptiMatch')

st.markdown('''
<style>
    .reportview-container { background: #0e1117; }
    .metric-card { background-color: #1a1c24; padding: 15px; border-radius: 10px; border-left: 5px solid #4CAF50; margin-bottom: 10px; }
</style>
''', unsafe_allow_html=True)

@st.cache_resource
def load_models(): return train_fatigue_model(), train_anomaly_model()
fatigue_model, anomaly_model = load_models()

st.title('? AI-Driven Sports Data Optimization')
col_l, col_c, col_r = st.columns([1, 2, 1])

with col_l:
    st.subheader('?? Stats')
    hr = st.slider('Shift Hour', 1, 8, 4)
    risk = fatigue_model.predict_proba([[hr, 100, 1]])[0][1]
    st.markdown(f'<div class="metric-card"><h2>{risk*100:.1f}% Risk</h2></div>', unsafe_allow_html=True)

with col_c:
    st.subheader('??? Pitch')
    pitch = Pitch(pitch_type='statsbomb', pitch_color='#0e1117', line_color='#45464d')
    fig, ax = pitch.draw(figsize=(10, 7))
    pitch.scatter(np.random.uniform(10, 110, 11), np.random.uniform(5, 75, 11), ax=ax, c='#4CAF50', s=100)
    st.pyplot(fig)

with col_r:
    st.subheader('?? Actions')
    if st.button('SHOT'): st.warning('?? ANOMALY: Shot from OWN HALF?')
    if st.button('GOAL'): st.success('? Verified')
