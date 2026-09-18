"""Seed infrastructure entities only (no readings, no incidents, no predictions).

    python database/seeds/seed_infrastructure.py            # idempotent: upserts by code
    python database/seeds/seed_infrastructure.py --reset    # delete plant + cascade first

1 plant · 3 zones · 4 lines · 8 machines · 20 sensors, plus the Phase-1 baseline model
entries mirrored from ml/artifacts/registry.json into model_registry.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from sqlalchemy import delete, select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from backend.app.core.database import get_engine  # noqa: E402
from backend.app.models import Line, Machine, ModelRegistryEntry, Plant, Sensor, Zone  # noqa: E402

INSTALLED = datetime(2024, 3, 1, tzinfo=timezone.utc)

PLANT = dict(code="PLT-CBE-01", name="Coimbatore Industrial Water Complex", location="Coimbatore, Tamil Nadu, IN",
             timezone="Asia/Kolkata", latitude=11.0168, longitude=76.9558, status="active")

# zone -> lines -> machines -> sensors  (sensor tuple: type, unit)
P, F, T, V, R = ("pressure", "bar"), ("flow", "m3/h"), ("temperature", "degC"), ("vibration", "mm/s"), ("rpm", "rpm")
TOPOLOGY = {
    ("ZN-A", "Utilities & Cooling"): {
        ("LN-A1", "Cooling Line A", "cooling"): {
            ("MC-A1-P1", "Cooling Tower Pump 1", "pump"): [P, F, V, R],
            ("MC-A1-HX1", "Plate Heat Exchanger 1", "heat_exchanger"): [P, T],
        },
        ("LN-A2", "Process Water Line", "process_water"): {
            ("MC-A2-P1", "Process Feed Pump", "pump"): [P, F, R],
            ("MC-A2-FL1", "Sand Filter Bank", "filter"): [P, F],
        },
    },
    ("ZN-B", "Production Hall"): {
        ("LN-B1", "Production Line B", "production"): {
            ("MC-B1-W1", "Wash Station B1", "wash_station"): [F, T],
            ("MC-B1-CH1", "Chiller Unit B1", "chiller"): [P, F, T],
        },
    },
    ("ZN-C", "Effluent & Recovery"): {
        ("LN-C1", "Recovery Line", "recovery"): {
            ("MC-C1-P1", "Recovery Transfer Pump", "pump"): [P, F, V],
            ("MC-C1-TK1", "Recovery Balance Tank", "tank"): [("level", "m")],
        },
    },
}


def seed(db: Session, reset: bool) -> dict[str, int]:
    if reset:
        db.execute(delete(Plant).where(Plant.code == PLANT["code"]))
        db.flush()

    plant = db.scalar(select(Plant).where(Plant.code == PLANT["code"])) or Plant(**PLANT)
    for k, v in PLANT.items():
        setattr(plant, k, v)
    db.add(plant)
    db.flush()

    counts = {"plants": 1, "zones": 0, "lines": 0, "machines": 0, "sensors": 0, "models": 0}
    sensor_seq = 1
    for (zcode, zname), lines in TOPOLOGY.items():
        zone = db.scalar(select(Zone).where(Zone.plant_id == plant.id, Zone.code == zcode)) or Zone(plant_id=plant.id, code=zcode)
        zone.name, zone.status = zname, "active"
        db.add(zone); db.flush(); counts["zones"] += 1
        for (lcode, lname, ltype), machines in lines.items():
            line = db.scalar(select(Line).where(Line.zone_id == zone.id, Line.code == lcode)) or Line(zone_id=zone.id, code=lcode)
            line.name, line.line_type, line.status = lname, ltype, "active"
            db.add(line); db.flush(); counts["lines"] += 1
            for (mcode, mname, mtype), sensors in machines.items():
                m = db.scalar(select(Machine).where(Machine.line_id == line.id, Machine.code == mcode)) or Machine(line_id=line.id, code=mcode)
                m.name, m.machine_type, m.status = mname, mtype, "active"
                db.add(m); db.flush(); counts["machines"] += 1
                for stype, unit in sensors:
                    scode = f"S{sensor_seq:02d}"
                    sensor_seq += 1
                    s = db.scalar(select(Sensor).where(Sensor.sensor_code == scode)) or Sensor(sensor_code=scode)
                    s.machine_id, s.sensor_type, s.unit = m.id, stype, unit
                    # No telemetry has been ingested yet, so status is honestly "unknown".
                    s.status, s.installed_at = "unknown", INSTALLED
                    db.add(s); counts["sensors"] += 1
    db.flush()

    # mirror the file-based ML registry
    reg = ROOT / "ml" / "artifacts" / "registry.json"
    if reg.exists():
        idx = json.loads(reg.read_text())
        default = idx.get("default") or {}
        dkey = f"{default.get('feature_config')}/{default.get('model_name')}" if default else None
        for key, e in idx.get("models", {}).items():
            meta_path = ROOT / "ml" / "artifacts" / e["feature_config"] / f"{e['model_name']}.meta.json"
            meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
            obj = db.scalar(select(ModelRegistryEntry).where(ModelRegistryEntry.name == key,
                                                             ModelRegistryEntry.version == e["version"]))
            obj = obj or ModelRegistryEntry(name=key, version=e["version"])
            obj.model_type = "leak_classifier"
            obj.path = f"ml/artifacts/{e['artifact_file']}"
            obj.status = "active" if key == dkey else "registered"
            obj.features, obj.target = meta.get("features"), meta.get("target")
            obj.training_dataset, obj.training_dataset_sha256 = meta.get("training_dataset"), meta.get("training_dataset_sha256")
            obj.metrics = e.get("evaluation_metrics")
            obj.trained_at = datetime.fromisoformat(e["training_timestamp"])
            db.add(obj); counts["models"] += 1
    db.commit()
    return counts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--reset", action="store_true")
    a = ap.parse_args()
    engine = get_engine()
    if engine is None:
        print("DATABASE_URL is not set", file=sys.stderr)
        return 2
    with Session(engine) as db:
        counts = seed(db, a.reset)
    print("seeded:", counts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
