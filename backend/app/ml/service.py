from typing import Dict, Any

class PredictionService:
    def __init__(self):
        self.model = None
        self.status = "MODEL_NOT_READY"
        self._load_model()
        
    def _load_model(self):
        try:
            # Here we would load the ML model using the ML registry from Phase 1.
            # We wrap it in a try-except to return MODEL_NOT_READY if missing.
            from ml.model_registry import load_model
            self.model = load_model("RandomForest_LeakDetection", "v1")
            self.status = "ONLINE"
        except Exception as e:
            self.status = "MODEL_NOT_READY"
            
    def health(self) -> str:
        return self.status
        
    def metadata(self) -> Dict[str, Any]:
        if self.status != "ONLINE":
            return {"error": "Model not loaded."}
        return {"model": "RandomForest_LeakDetection", "version": "v1"}
        
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if self.status != "ONLINE":
            return {"error": "Prediction engine is not initialized."}
            
        import pandas as pd
        df = pd.DataFrame([features])
        
        pred = int(self.model.predict(df)[0])
        prob = float(self.model.predict_proba(df)[0][pred]) if hasattr(self.model, "predict_proba") else 0.9
        
        return {"leakage_prediction": pred, "confidence": prob}

ml_service = PredictionService()
