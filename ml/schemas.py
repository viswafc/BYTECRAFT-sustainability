from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ModelMetadata(BaseModel):
    model_name: str
    version: str
    training_dataset: str
    features: List[str]
    target: str
    training_timestamp: datetime
    evaluation_metrics: Dict[str, float]
    
class PredictionInput(BaseModel):
    Pressure: float
    Flow_Rate: float
    Temperature: float
    Vibration: float
    RPM: float
    Operational_Hours: float
    # Omitting location identifiers to prevent data leakage in production

class PredictionOutput(BaseModel):
    leakage_prediction: int
    confidence: float
