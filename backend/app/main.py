"""AquaRisk AI backend — FastAPI application factory."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import api_router
from .api.v1.system import health as _health
from .core.config import APP_VERSION, get_settings
from .core.errors import register_error_handlers
from .core.logging import configure_logging
from .core.middleware import RequestLogMiddleware
from .schemas import HealthResponse
from .websocket.manager import ws_manager
from .websocket.routes import router as ws_router

log = logging.getLogger("aquarisk")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    log.info("AquaRisk AI backend %s starting (env=%s, db=%s, telemetry=%s)", APP_VERSION, settings.environment,
             "configured" if settings.database_url else "not configured", settings.telemetry_provider)
    ws_manager.start(settings.ws_heartbeat_seconds)
    yield
    await ws_manager.stop()
    log.info("AquaRisk AI backend shutting down")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    app = FastAPI(
        title="AquaRisk AI API", version=APP_VERSION, lifespan=lifespan,
        description="Predictive Water Loss Timeline & Counterfactual Simulation Engine — Phase 2 platform API",
    )
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list,
                       allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["*"])
    app.add_middleware(RequestLogMiddleware)
    register_error_handlers(app)
    app.include_router(api_router)
    app.include_router(ws_router)
    app.add_api_route("/health", _health, methods=["GET"], response_model=HealthResponse, tags=["system"],
                      include_in_schema=False)  # root alias for docker/LB probes
    return app


app = create_app()
