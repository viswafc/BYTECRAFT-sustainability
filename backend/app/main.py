"""AquaRisk AI backend - FastAPI application factory."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import api, root
from .config import APP_VERSION, get_settings
from .utils.errors import register_error_handlers
from .utils.logging import configure_logging
from .utils.middleware import RequestLogMiddleware

log = logging.getLogger("aquarisk")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    log.info("AquaRisk AI backend %s starting (env=%s, model_path=%s)",
             APP_VERSION, settings.environment, settings.model_path)
    yield
    log.info("AquaRisk AI backend shutting down")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    app = FastAPI(
        title="AquaRisk AI API",
        version=APP_VERSION,
        description="Predictive Water Loss Timeline & Counterfactual Simulation Engine — Phase 1 foundation API",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLogMiddleware)
    register_error_handlers(app)
    app.include_router(root)
    app.include_router(api)

    return app


app = create_app()
