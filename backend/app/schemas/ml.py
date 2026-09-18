from __future__ import annotations

from pydantic import BaseModel, Field

from ml.schemas import SensorReadingInput  # shared input contract


class ModelResponse(BaseModel):
    name: str
    version: str
    model_type: str
    status: str
    path: str
    features: list[str]
    target: str
    training_dataset: str
    trained_at: str
    metrics: dict
    is_default: bool


class ModelHealth(BaseModel):
    state: str  # ONLINE|DEGRADED|OFFLINE|UNKNOWN
    ready: bool
    detail: str | None = None
    default_model: str | None = None
    n_registered: int = 0


class PredictRequest(BaseModel):
    readings: list[SensorReadingInput] = Field(..., min_length=1, max_length=1000)
    model_name: str | None = Field(default=None, description="'<feature_config>/<model_name>'; default model if omitted")


class Prediction(BaseModel):
    leak_predicted: bool
    leak_probability: float | None


class PredictResponse(BaseModel):
    model: str
    predictions: list[Prediction]
    disclaimer: str
