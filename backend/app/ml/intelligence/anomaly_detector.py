import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

class AnomalyDetector:
    """
    Unsupervised Stage 1: Determines if current context is ANOMALOUS vs NORMAL.
    Trained strictly on NORMAL data to learn boundaries.
    """
    def __init__(self):
        self.model = IsolationForest(contamination=0.01, random_state=42)
        
    def fit(self, X: pd.DataFrame):
        self.model.fit(X)
        
    def predict(self, X: pd.DataFrame):
        # IsolationForest returns 1 for inliers (Normal), -1 for outliers (Anomaly)
        preds = self.model.predict(X)
        return preds == -1 # Return True if Anomaly
        
    def decision_function(self, X: pd.DataFrame):
        # Raw anomaly score (lower is more anomalous)
        # We invert it so higher = more anomalous (0 to 1 scaling roughly)
        scores = self.model.score_samples(X)
        return -scores

    def save(self, path: str):
        joblib.dump(self.model, path)
        
    def load(self, path: str):
        if os.path.exists(path):
            self.model = joblib.load(path)
        else:
            raise FileNotFoundError(f"Model not found at {path}")
