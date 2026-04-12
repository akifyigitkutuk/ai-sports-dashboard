import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest

def train_fatigue_model():
    n_samples = 1000
    shift_hours = np.random.uniform(1, 10, n_samples)
    tempo = np.random.uniform(50, 150, n_samples)
    prev_errors = np.random.randint(0, 5, n_samples)
    target = (shift_hours * 0.4 + tempo * 0.005 + prev_errors * 0.2 > 4.5).astype(int)
    df = pd.DataFrame({'shift_hours': shift_hours, 'tempo': tempo, 'prev_errors': prev_errors, 'risk': target})
    model = RandomForestClassifier(n_estimators=50)
    model.fit(df[['shift_hours', 'tempo', 'prev_errors']], df['risk'])
    return model

def train_anomaly_model():
    n_samples = 1000
    x, y = np.random.uniform(0, 100, n_samples), np.random.uniform(0, 100, n_samples)
    time_gap = np.random.uniform(2, 60, n_samples)
    X = np.column_stack([x, y, time_gap])
    model = IsolationForest(contamination=0.05)
    model.fit(X)
    return model
