import pandas as pd
import numpy as np
from datetime import datetime
from backend.app.ml.intelligence.features import engineer_intelligence_features
from backend.app.ml.intelligence.anomaly_detector import AnomalyDetector
from backend.app.ml.intelligence.classifier import EventClassifier
from backend.app.ml.intelligence.rules import calculate_severity, generate_evidence

class IntelligenceEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IntelligenceEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self, ad_path: str, clf_path: str):
        self.ad = AnomalyDetector()
        self.clf = EventClassifier()
        try:
            self.ad.load(ad_path)
            self.clf.load(clf_path)
            self.initialized = True
        except FileNotFoundError as e:
            print(f"Warning: Intelligence models not found: {e}")
            self.initialized = False
            
        self.history_buffer = {}

    def process_telemetry(self, telemetry_dicts: list) -> list:
        """
        Receives telemetry dictionaries that have ALREADY passed through Phase 4 BaselineEngine.
        Expects keys: 'expected_value_ai', 'deviation_pct_ai', 'baseline_context'
        """
        if not self.initialized or not telemetry_dicts:
            return []
            
        df = pd.DataFrame(telemetry_dicts)
        
        # Remap AI outputs to what the feature engine expects
        df['expected_value'] = df['expected_value_ai']
        df['deviation_pct'] = df['deviation_pct_ai']
        
        X_feats = engineer_intelligence_features(df, is_training=False)
        features = [c for c in X_feats.columns if c != 'sensor_id']
        
        # 1. Anomaly Detection
        is_anomalous = self.ad.predict(X_feats)
        anomaly_scores = self.ad.decision_function(X_feats)
        
        # 2. Event Classification
        events = self.clf.predict(X_feats)
        probs = self.clf.predict_proba(X_feats)
        
        results = []
        for i, row in df.iterrows():
            # If the anomaly detector says it's normal, but the classifier says Leak, 
            # we should trust the anomaly detector to suppress false positives!
            # However, since the classifier is trained heavily on NORMAL_OPERATION, we can trust the ensemble.
            pred_event = events[i]
            
            # Confidence logic
            class_idx = list(self.clf.classes_).index(pred_event)
            confidence = float(probs[i][class_idx])
            
            if confidence < 0.4:
                pred_event = "MULTI_EVENT" # or LOW_CONFIDENCE_EVENT
                
            # If production surge, force confidence mapping
            if pred_event == 'NORMAL_PRODUCTION_VARIATION':
                confidence = 0.95
                
            # Severity logic
            persistence = row.get('persistence', 'LOW') # Passed from Phase 4
            severity = calculate_severity(pred_event, row['value'] - row['expected_value_ai'], persistence)
            
            # Evidence logic
            evidence = generate_evidence(X_feats.iloc[i].to_dict(), row['expected_value_ai'])
            
            # Construct Intelligence Event
            res = {
                "timestamp": row['timestamp'],
                "sensor_id": row['sensor_id'],
                "plant_id": row.get('plant_id', 'UNKNOWN'),
                "event_type": pred_event,
                "severity": severity,
                "confidence": round(confidence, 3),
                "anomaly_score": round(float(anomaly_scores[i]), 3),
                "evidence": evidence,
                "model_version": "event_classifier_v1"
            }
            results.append(res)
            
        return results
