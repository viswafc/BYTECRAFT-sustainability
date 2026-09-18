from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from ..config import API_VERSION, APP_VERSION, get_settings
from ..schemas.common import (
    DataHealthResponse, HealthResponse, ModelListResponse, PredictRequest, PredictResponse, Prediction,
    SystemStatusResponse, VersionResponse,
)
from ..services.data_service import DataService, get_data_service
from ..services.db_service import db_status
from ..services.model_service import ModelService, get_model_service

root = APIRouter()
api = APIRouter(prefix="/api")


@root.get("/health", response_model=HealthResponse, tags=["system"])
def health():
    return HealthResponse(version=APP_VERSION)


@api.get("/version", response_model=VersionResponse, tags=["system"])
def version():
    return VersionResponse(version=APP_VERSION, api_version=API_VERSION, environment=get_settings().environment)


@api.get("/system/status", response_model=SystemStatusResponse, tags=["system"])
def system_status(
    ms: ModelService = Depends(get_model_service), ds: DataService = Depends(get_data_service)
):
    components = [ds.status(), ms.status(), db_status()]
    statuses = {c.status for c in components}
    # Database is optional in Phase 1, so "unknown" does not degrade the overall status.
    core = {c.status for c in components if c.name != "database"}
    overall = "error" if "error" in core else ("degraded" if ("degraded" in statuses or "error" in statuses) else "ok")
    return SystemStatusResponse(
        status=overall, version=APP_VERSION, timestamp=datetime.now(timezone.utc).isoformat(), components=components
    )


@api.get("/data/health", response_model=DataHealthResponse, tags=["data"])
def data_health(refresh: bool = False, ds: DataService = Depends(get_data_service)):
    return ds.health(refresh=refresh)


@api.get("/models", response_model=ModelListResponse, tags=["models"])
def list_models(ms: ModelService = Depends(get_model_service)):
    return ms.list_models()


@api.post("/predict", response_model=PredictResponse, tags=["models"])
def predict(req: PredictRequest, ms: ModelService = Depends(get_model_service)):
    model, results = ms.predict(req.readings, req.feature_config, req.model_name)
    return PredictResponse(model=model, predictions=[Prediction(**r) for r in results])
