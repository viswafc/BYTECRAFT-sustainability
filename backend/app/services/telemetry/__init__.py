"""Provider factory. TELEMETRY_PROVIDER env selects the implementation; unknown values fail loudly."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from ...core.config import get_settings
from ...core.database import get_sessionmaker
from .base import TelemetryProvider
from .database_provider import DatabaseTelemetryProvider
from .null_provider import NullTelemetryProvider

# Phase 3 will register "simulator" here; a later phase "iot".
_REGISTRY: dict[str, type[TelemetryProvider]] = {
    "database": DatabaseTelemetryProvider,
}


def build_provider(db: Session | None) -> TelemetryProvider:
    name = get_settings().telemetry_provider
    if name not in _REGISTRY:
        raise ValueError(f"Unknown TELEMETRY_PROVIDER '{name}'. Known: {sorted(_REGISTRY)}")
    if db is None:
        return NullTelemetryProvider()
    return _REGISTRY[name](db)


def get_telemetry_provider() -> TelemetryProvider:
    """FastAPI dependency. Falls back to the null provider if the DB is not configured."""
    sm = get_sessionmaker()
    if sm is None:
        yield NullTelemetryProvider()
        return
    db = sm()
    try:
        yield build_provider(db)
    finally:
        db.close()


__all__ = ["TelemetryProvider", "get_telemetry_provider", "build_provider", "Depends"]
