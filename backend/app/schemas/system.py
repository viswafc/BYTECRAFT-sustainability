from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

HealthState = Literal["ONLINE", "DEGRADED", "OFFLINE", "UNKNOWN"]


class HealthResponse(BaseModel):
    status: Literal["healthy"] = "healthy"
    version: str


class VersionResponse(BaseModel):
    name: str = "AquaRisk AI"
    version: str
    api_version: str
    environment: str
    phase: str


class ComponentHealth(BaseModel):
    name: str  # backend|database|ml|websocket|dataset|telemetry
    state: HealthState
    detail: str | None = None
    info: dict = Field(default_factory=dict)


class SystemStatusResponse(BaseModel):
    state: HealthState
    version: str
    environment: str
    uptime_seconds: float
    components: list[ComponentHealth]


class DataHealthResponse(BaseModel):
    state: HealthState
    dataset_path: str
    rows: int | None = None
    columns: int | None = None
    missing_values: int | None = None
    duplicate_rows: int | None = None
    positive_rate: float | None = None
    schema_valid: bool | None = None
    detail: str | None = None
