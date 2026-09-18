"""Backend test fixtures.

Two modes:
  * unit  — DATABASE_URL unset → API must degrade gracefully (503 DATABASE_UNAVAILABLE).
  * db    — PostgreSQL from TEST_DATABASE_URL (default: the docker-compose/local dev instance),
            migrated with Alembic and re-seeded once per session. If it is unreachable the DB tests
            are SKIPPED with an explicit reason — never silently faked on SQLite.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]


def _reset_singletons():
    from backend.app.core import config, database
    from backend.app.services import data_service
    from backend.app.ml import prediction_service
    for f in (config.get_settings, database.get_engine, database.get_sessionmaker,
              data_service.get_data_service, prediction_service.get_prediction_service):
        f.cache_clear()


def _make_client(env: dict[str, str]) -> TestClient:
    for k in ("DATABASE_URL", "TELEMETRY_PROVIDER"):
        os.environ.pop(k, None)
    os.environ["DATABASE_URL"] = ""  # empty = explicitly none; a developer's .env must not leak into unit tests
    os.environ.update(env)
    os.environ["ENVIRONMENT"] = "test"
    _reset_singletons()
    import importlib
    import backend.app.main as m
    importlib.reload(m)
    return TestClient(m.app)


@pytest.fixture(scope="session")
def db_url(tmp_path_factory) -> str:
    url = os.getenv("TEST_DATABASE_URL", "postgresql+psycopg://aquarisk:aquarisk@localhost:5432/aquarisk_test")
    # create the test database if the server is reachable; skip otherwise
    from sqlalchemy import create_engine, text
    from sqlalchemy.engine import make_url
    u = make_url(url)
    try:
        admin = create_engine(u.set(database="postgres"), isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 2})
        with admin.connect() as conn:
            exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname=:d"), {"d": u.database}).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{u.database}"'))
    except Exception as e:  # noqa: BLE001
        pytest.skip(f"PostgreSQL test database unreachable ({type(e).__name__}); set TEST_DATABASE_URL or start docker compose db")
    env = {**os.environ, "DATABASE_URL": url, "PYTHONPATH": str(ROOT)}
    r = subprocess.run([sys.executable, "-m", "alembic", "-c", str(ROOT / "database/alembic.ini"), "upgrade", "head"],
                       cwd=ROOT, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    r = subprocess.run([sys.executable, str(ROOT / "database/seeds/seed_infrastructure.py"), "--reset"],
                       cwd=ROOT, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return url


@pytest.fixture
def client_nodb():
    """API with no database configured."""
    c = _make_client({})
    with c:
        yield c
    _reset_singletons()


@pytest.fixture
def client(db_url):
    """API wired to the migrated + seeded test database."""
    c = _make_client({"DATABASE_URL": db_url})
    with c:
        yield c
    _reset_singletons()
