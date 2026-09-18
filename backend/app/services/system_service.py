"""Aggregates component health into one SystemStatusResponse."""
from __future__ import annotations

import time

from ..core.config import APP_VERSION, get_settings
from ..core.database import get_sessionmaker, ping
from ..ml import get_prediction_service
from ..schemas.system import ComponentHealth, HealthState, SystemStatusResponse
from ..websocket.manager import ws_manager
from .data_service import get_data_service
from .telemetry import build_provider

_STARTED = time.monotonic()


def _db_health() -> ComponentHealth:
    settings = get_settings()
    if not settings.database_url:
        return ComponentHealth(name="database", state="UNKNOWN", detail="DATABASE_URL not configured")
    okay, detail, rev = ping()
    return ComponentHealth(name="database", state="ONLINE" if okay else "OFFLINE", detail=detail,
                           info={"migration": rev} if rev else {})


def _ml_health() -> ComponentHealth:
    h = get_prediction_service().health()
    return ComponentHealth(name="ml", state=h.state, detail=h.detail or h.default_model,
                           info={"n_registered": h.n_registered, "ready": h.ready})


def _ws_health() -> ComponentHealth:
    return ComponentHealth(name="websocket", state="ONLINE" if ws_manager.running else "OFFLINE",
                           detail=f"{ws_manager.connection_count} client(s)",
                           info={"channels": ws_manager.channel_counts()})


def _telemetry_health() -> ComponentHealth:
    sm = get_sessionmaker()
    db = sm() if sm else None
    try:
        provider = build_provider(db)
        state, detail = provider.health()
        return ComponentHealth(name="telemetry", state=state, detail=detail, info={"provider": provider.name})
    except Exception as e:  # noqa: BLE001 - config errors must not take /status down
        return ComponentHealth(name="telemetry", state="OFFLINE", detail=str(e))
    finally:
        if db:
            db.close()


def _dataset_health() -> ComponentHealth:
    h = get_data_service().health()
    return ComponentHealth(name="dataset", state=h.state, detail=h.detail or f"{h.rows} rows x {h.columns} cols",
                           info={"positive_rate": h.positive_rate})


def system_status() -> SystemStatusResponse:
    components = [
        ComponentHealth(name="backend", state="ONLINE", detail=f"v{APP_VERSION}"),
        _db_health(), _ml_health(), _ws_health(), _telemetry_health(), _dataset_health(),
    ]
    # Overall: OFFLINE if backend/db/ml offline; DEGRADED if anything degraded/unknown-but-configured.
    core = {c.name: c.state for c in components}
    state: HealthState
    if core["database"] == "OFFLINE" or core["ml"] == "OFFLINE":
        state = "DEGRADED"
    elif any(s == "DEGRADED" for s in core.values()) or core["database"] == "UNKNOWN":
        state = "DEGRADED"
    else:
        state = "ONLINE"
    return SystemStatusResponse(state=state, version=APP_VERSION, environment=get_settings().environment,
                                uptime_seconds=round(time.monotonic() - _STARTED, 1), components=components)
