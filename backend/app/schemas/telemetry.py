from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SensorReadingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    sensor_id: int
    timestamp: datetime
    value: float
    quality: str | None = None


class TelemetrySummary(BaseModel):
    provider: str
    sensors_total: int
    sensors_online: int
    sensors_warning: int
    readings_today: int
    last_reading_at: datetime | None
    note: str | None = None
