from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from ml.schemas import SensorReadingInput  # re-exported for API use

Status = Literal["ok", "degraded", "error", "unknown"]


class HealthResponse(BaseModel):
    status: Literal["healthy"] = "healthy"
    version: str


class VersionResponse(BaseModel):
    name: str = "AquaRisk AI"
    version: str
    api_version: str
    environment: str
    phase: str = "1"


class ComponentStatus(BaseModel):
    name: str
    status: Status
    detail: str | None = None
    info: dict = Field(default_factory=dict)


class SystemStatusResponse(BaseModel):
    status: Status
    version: str
    timestamp: str
    components: list[ComponentStatus]


class DataHealthResponse(BaseModel):
    status: Status
    dataset_path: str
    rows: int | None = None
    columns: int | None = None
    missing_values: int | None = None
    duplicate_rows: int | None = None
    positive_rate: float | None = None
    schema_valid: bool | None = None
    detail: str | None = None


class ModelInfo(BaseModel):
    model_name: str
    feature_config: str
    version: str
    training_timestamp: str
    features: list[str]
    target: str
    training_dataset: str
    evaluation_metrics: dict
    is_default: bool


class ModelListResponse(BaseModel):
    default: str | None
    models: list[ModelInfo]


class PredictRequest(BaseModel):
    readings: list[SensorReadingInput] = Field(..., min_length=1, max_length=1000)
    feature_config: str | None = None
    model_name: str | None = None


class Prediction(BaseModel):
    leak_predicted: bool
    leak_probability: float | None


class PredictResponse(BaseModel):
    model: str
    predictions: list[Prediction]
