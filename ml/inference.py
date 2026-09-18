import pandas as pd
from typing import Dict, Any
from .model_registry import load_model
from .schemas import PredictionInput, PredictionOutput

def predict(input_data: PredictionInput, model_name: str = "RandomForest_LeakDetection", version: str = "v1") -> PredictionOutput:
    model = load_model(model_name, version)
    
    # Convert input to DataFrame for prediction
    df = pd.DataFrame([input_data.model_dump()])
    
    # Predict
    pred = int(model.predict(df)[0])
    
    # Predict Proba
    prob = float(model.predict_proba(df)[0][pred]) if hasattr(model, "predict_proba") else 0.9
    
    return PredictionOutput(leakage_prediction=pred, confidence=prob)
