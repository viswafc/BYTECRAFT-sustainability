from fastapi import APIRouter

from . import assets, incidents, ml, system, telemetry

api_router = APIRouter(prefix="/api")
api_router.include_router(system.router)
api_router.include_router(assets.router)
api_router.include_router(telemetry.router)
api_router.include_router(incidents.router)
api_router.include_router(ml.router)
