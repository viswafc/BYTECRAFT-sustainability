"""Database connectivity check (optional in Phase 1 - the app runs without a DB)."""
from __future__ import annotations

import logging

from ..config import get_settings
from ..schemas.common import ComponentStatus

log = logging.getLogger("aquarisk.db")


def db_status() -> ComponentStatus:
    url = get_settings().database_url
    if not url:
        return ComponentStatus(
            name="database", status="unknown", detail="DATABASE_URL not configured (optional in Phase 1)"
        )
    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            ver = None
            try:
                ver = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
            except Exception:
                conn.rollback()
        return ComponentStatus(name="database", status="ok", detail="connected", info={"migration": ver})
    except Exception as e:  # noqa: BLE001
        log.warning("database unreachable: %s", type(e).__name__)
        return ComponentStatus(name="database", status="error", detail=f"unreachable ({type(e).__name__})")
