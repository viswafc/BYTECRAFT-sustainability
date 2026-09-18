from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query

from ...schemas import Envelope, SensorReadingResponse, TelemetrySummary, ok, ok_list
from ...services.asset_service import AssetService
from ...services.telemetry import TelemetryProvider, get_telemetry_provider
from ..deps import get_asset_service

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("/summary", response_model=Envelope[TelemetrySummary])
def telemetry_summary(plant_id: int | None = None, tp: TelemetryProvider = Depends(get_telemetry_provider)):
    return ok(tp.summary(plant_id), source=tp.name)


@router.get("/sensors/{sensor_id}/latest", response_model=Envelope[SensorReadingResponse | None])
def latest(sensor_id: int, tp: TelemetryProvider = Depends(get_telemetry_provider),
           assets: AssetService = Depends(get_asset_service)):
    assets.get_sensor(sensor_id)  # 404 if unknown
    return ok(tp.latest(sensor_id), source=tp.name)


@router.get("/sensors/{sensor_id}/history", response_model=Envelope[list[SensorReadingResponse]])
def history(sensor_id: int, since: datetime | None = None, until: datetime | None = None,
            limit: int = Query(500, ge=1, le=5000), tp: TelemetryProvider = Depends(get_telemetry_provider),
            assets: AssetService = Depends(get_asset_service)):
    assets.get_sensor(sensor_id)
    return ok_list(tp.history(sensor_id, since=since, until=until, limit=limit), limit=limit, source=tp.name)
