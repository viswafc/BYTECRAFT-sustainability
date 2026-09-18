from __future__ import annotations

from fastapi import APIRouter

from ...core.config import API_VERSION, APP_VERSION, PHASE, get_settings
from ...schemas import DataHealthResponse, Envelope, HealthResponse, SystemStatusResponse, VersionResponse, ok
from ...services.data_service import get_data_service
from ...services.system_service import system_status

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def health():
    """Plain liveness (no envelope) so load balancers / docker healthchecks stay simple."""
    return HealthResponse(version=APP_VERSION)


@router.get("/version", response_model=Envelope[VersionResponse])
def version():
    return ok(VersionResponse(version=APP_VERSION, api_version=API_VERSION,
                              environment=get_settings().environment, phase=PHASE))


@router.get("/system/status", response_model=Envelope[SystemStatusResponse])
def status():
    return ok(system_status())


@router.get("/data/health", response_model=Envelope[DataHealthResponse])
def data_health(refresh: bool = False):
    return ok(get_data_service().health(refresh=refresh))
