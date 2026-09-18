import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
import joblib
import os

class EventClassifier:
    """
    Supervised Stage 2: Classifies the specific event type from the taxonomy.
    """
    def __init__(self):
        self.model = HistGradientBoostingClassifier(random_state=42, max_iter=100)
        
    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.model.fit(X, y)
        self.classes_ = self.model.classes_
        
    def predict(self, X: pd.DataFrame):
        return self.model.predict(X)
        
    def predict_proba(self, X: pd.DataFrame):
        return self.model.predict_proba(X)

    def save(self, path: str):
        joblib.dump(self.model, path)
        
    def load(self, path: str):
        if os.path.exists(path):
            self.model = joblib.load(path)
            self.classes_ = self.model.classes_
        else:
            raise FileNotFoundError(f"Model not found at {path}")
