from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class BaselinePredictionBase(BaseModel):
    sensor_id: str
    timestamp: datetime
    expected_flow_lph: float
    actual_flow_lph: float
    deviation_pct: float
    confidence: str
    persistence_score: str
    baseline_state: str
    
class BaselinePredictionResponse(BaselinePredictionBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
