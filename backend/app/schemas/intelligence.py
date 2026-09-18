from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class EvidenceItem(BaseModel):
    feature: str
    value: float
    direction: str

class IntelligenceEventBase(BaseModel):
    timestamp: datetime
    sensor_id: str
    plant_id: str
    event_type: str
    severity: str
    confidence: float
    anomaly_score: float
    evidence: List[EvidenceItem]
    model_version: str
    
class IntelligenceEventResponse(IntelligenceEventBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
