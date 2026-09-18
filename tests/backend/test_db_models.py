"""Schema sanity: the ORM metadata + Alembic migration produce the expected tables (SQLite in-memory)."""
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect

from backend.app.models import Base

EXPECTED = {"plants", "zones", "lines", "machines", "sensors", "sensor_readings", "incidents", "models", "model_runs"}
ROOT = Path(__file__).resolve().parents[2]


def test_metadata_tables():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    assert EXPECTED <= set(inspect(engine).get_table_names())


def test_alembic_migration_applies(tmp_path):
    db = tmp_path / "m.db"
    env = {"DATABASE_URL": f"sqlite:///{db}", "PATH": "", "PYTHONPATH": str(ROOT)}
    import os
    env["PATH"] = os.environ.get("PATH", "")
    r = subprocess.run([sys.executable, "-m", "alembic", "-c", str(ROOT / "database/alembic.ini"), "upgrade", "head"],
                       cwd=ROOT, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    engine = create_engine(f"sqlite:///{db}")
    assert EXPECTED <= set(inspect(engine).get_table_names())
