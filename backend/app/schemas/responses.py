from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Generic Response Wrapper
class Meta(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "0.1.0"

class BaseResponse(BaseModel):
    data: Any
    meta: Meta = Field(default_factory=Meta)

# --- Base Entity Schemas ---

class PlantBase(BaseModel):
    name: str
    code: str
    location: Optional[str] = None
    timezone: str = "UTC"
    status: str = "active"

class PlantResponse(PlantBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ZoneBase(BaseModel):
    name: str
    code: str
    status: str = "active"

class ZoneResponse(ZoneBase):
    id: int
    plant_id: int
    class Config:
        from_attributes = True

class LineBase(BaseModel):
    name: str
    code: str
    status: str = "active"

class LineResponse(LineBase):
    id: int
    zone_id: int
    class Config:
        from_attributes = True

class MachineBase(BaseModel):
    name: str
    code: str
    machine_type: Optional[str] = None
    status: str = "active"

class MachineResponse(MachineBase):
    id: int
    line_id: int
    class Config:
        from_attributes = True

class SensorBase(BaseModel):
    sensor_code: str
    sensor_type: Optional[str] = None
    unit: Optional[str] = None
    status: str = "active"

class SensorResponse(SensorBase):
    id: int
    machine_id: int
    installed_at: datetime
    class Config:
        from_attributes = True

class SystemStatus(BaseModel):
    status: str
    database: str
    ml_model_loaded: bool

class SystemStatusResponse(BaseResponse):
    data: SystemStatus
