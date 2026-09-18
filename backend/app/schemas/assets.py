from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class _Orm(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PlantResponse(_Orm):
    id: int
    code: str
    name: str
    location: str | None
    timezone: str
    latitude: float | None
    longitude: float | None
    status: str
    created_at: datetime
    updated_at: datetime


class ZoneResponse(_Orm):
    id: int
    plant_id: int
    code: str
    name: str
    status: str
    latitude: float | None
    longitude: float | None


class LineResponse(_Orm):
    id: int
    zone_id: int
    code: str
    name: str
    line_type: str | None
    status: str


class MachineResponse(_Orm):
    id: int
    line_id: int
    code: str
    name: str
    machine_type: str | None
    status: str


class SensorResponse(_Orm):
    id: int
    machine_id: int
    sensor_code: str
    sensor_type: str
    unit: str | None
    status: str
    installed_at: datetime | None
    latitude: float | None
    longitude: float | None


class PlantSummary(BaseModel):
    plant: PlantResponse
    zones: int
    lines: int
    machines: int
    sensors: int
    sensors_by_status: dict[str, int]
    active_incidents: int
