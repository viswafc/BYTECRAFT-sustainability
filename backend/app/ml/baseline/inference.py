import pandas as pd
import numpy as np
import os
from .baseline import MLBaseline
from .features import engineer_baseline_features

class BaselineInferenceEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BaselineInferenceEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self, model_path: str):
        self.model = MLBaseline()
        try:
            self.model.load(model_path)
            self.initialized = True
        except FileNotFoundError:
            print(f"Warning: Baseline model not found at {model_path}")
            self.initialized = False
            
        # We need a small rolling buffer to calculate persistence
        self.history_buffer = {}

    def _determine_context(self, dev_pct, confidence, actual_val, expected_val, prod_level):
        if not self.initialized or confidence == "LOW":
            return "BASELINE_LOW_CONFIDENCE"
            
        if actual_val == 0 and expected_val == 0:
            return "BASELINE_MAINTENANCE"
            
        if abs(dev_pct) <= 0.15: # 15% threshold for normal
            # Did production explain a big change?
            if prod_level > 0.9 or prod_level < 0.3:
                return "BASELINE_PRODUCTION_CHANGE"
            return "BASELINE_NORMAL"
            
        return "UNEXPLAINED_DEVIATION"

    def process_telemetry(self, telemetry_dicts: list) -> list:
        if not self.initialized or not telemetry_dicts:
            return telemetry_dicts # pass-through if not ready
            
        df = pd.DataFrame(telemetry_dicts)
        X_feats = engineer_baseline_features(df, is_training=False)
        X_feats['sensor_id'] = df['sensor_id']
        features = [c for c in X_feats.columns if c != 'sensor_id']
        
        preds = self.model.predict(X_feats, features)
        
        results = []
        for i, row in df.iterrows():
            expected = preds[i]
            actual = row['value']
            
            # Prevent div by zero
            safe_exp = max(expected, 0.001)
            dev_pct = (actual - expected) / safe_exp
            
            # Minimal confidence rules
            confidence = "HIGH"
            if row.get('machine_status') == 'MAINTENANCE' or pd.isna(actual):
                confidence = "LOW"
                
            context = self._determine_context(dev_pct, confidence, actual, expected, row['production_level'])
            
            # Calculate Persistence
            sensor = row['sensor_id']
            if sensor not in self.history_buffer:
                self.history_buffer[sensor] = []
                
            is_abnormal = context == "UNEXPLAINED_DEVIATION"
            self.history_buffer[sensor].append(is_abnormal)
            if len(self.history_buffer[sensor]) > 5:
                self.history_buffer[sensor].pop(0)
                
            abnormal_count = sum(self.history_buffer[sensor])
            persistence = "HIGH" if abnormal_count >= 3 else "LOW"
            
            if abnormal_count >= 5:
                context = "PERSISTENT_UNEXPLAINED_DEVIATION"
                
            res = row.to_dict()
            res['expected_value_ai'] = round(expected, 3)
            res['deviation_pct_ai'] = round(dev_pct, 3)
            res['baseline_confidence'] = confidence
            res['persistence'] = persistence
            res['baseline_context'] = context
            results.append(res)
            
        return results
