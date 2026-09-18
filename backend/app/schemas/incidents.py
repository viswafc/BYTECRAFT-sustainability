from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    plant_id: int
    zone_id: int | None
    line_id: int | None
    machine_id: int | None
    sensor_id: int | None
    title: str
    incident_type: str
    severity: str
    status: str
    started_at: datetime
    ended_at: datetime | None
    summary: str | None
