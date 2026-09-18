"""SQLAlchemy engine/session management. The DB is optional: when DATABASE_URL is unset,
`get_db` raises DatabaseUnavailableError which the error layer maps to a 503."""
from __future__ import annotations

import logging
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings
from .errors import DatabaseUnavailableError

log = logging.getLogger("aquarisk.db")


@lru_cache
def get_engine() -> Engine | None:
    url = get_settings().database_url
    if not url:
        return None
    kwargs: dict = {"pool_pre_ping": True, "future": True}
    if url.startswith("postgresql"):
        kwargs["connect_args"] = {"connect_timeout": 3}
        kwargs["pool_size"] = 5
        kwargs["max_overflow"] = 5
    return create_engine(url, **kwargs)


@lru_cache
def get_sessionmaker() -> sessionmaker | None:
    engine = get_engine()
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False) if engine else None


class LazySession:
    """Defers opening a session until first attribute access, so FastAPI can finish validating
    the request (422) before we discover that the database is missing (503)."""

    def __init__(self, sm: sessionmaker | None):
        self._sm = sm
        self._db: Session | None = None

    def _get(self) -> Session:
        if self._db is None:
            if self._sm is None:
                raise DatabaseUnavailableError("Database is not configured (DATABASE_URL is unset).")
            self._db = self._sm()
        return self._db

    def __getattr__(self, name):
        return getattr(self._get(), name)

    def close(self) -> None:
        if self._db is not None:
            self._db.close()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a (lazy) SQLAlchemy session."""
    db = LazySession(get_sessionmaker())
    try:
        yield db  # type: ignore[misc]
    except OperationalError as e:
        log.warning("database operational error: %s", type(e).__name__)
        raise DatabaseUnavailableError("Database is unreachable.") from e
    finally:
        db.close()


def ping() -> tuple[bool, str | None, str | None]:
    """(reachable, detail, alembic_revision) without raising."""
    engine = get_engine()
    if engine is None:
        return False, "DATABASE_URL not configured", None
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            rev = None
            try:
                rev = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
            except SQLAlchemyError:
                conn.rollback()
            return True, "connected", rev
    except SQLAlchemyError as e:
        log.warning("database unreachable: %s", type(e).__name__)
        return False, f"unreachable ({type(e).__name__})", None
