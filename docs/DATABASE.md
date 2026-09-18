# Database (PostgreSQL 16)

Managed with Alembic (`database/alembic.ini`, revision `0001_core_entities`). ORM: `backend/app/models/entities.py`.

```bash
export DATABASE_URL=postgresql+psycopg://aquarisk:aquarisk@localhost:5432/aquarisk
alembic -c database/alembic.ini upgrade head
python database/seeds/seed_infrastructure.py          # idempotent (--reset to recreate)
alembic -c database/alembic.ini revision --autogenerate -m "msg"
```

## Tables & relationships

```
plants 1─∞ zones 1─∞ lines 1─∞ machines 1─∞ sensors 1─∞ sensor_readings
plants 1─∞ incidents (optional FKs → zones, lines, machines, sensors)
model_registry 1─∞ model_runs
```

| Table | Key columns | Indexes / constraints |
|---|---|---|
| `plants` | id, code*, name, location, timezone, latitude, longitude, status, created_at, updated_at | unique(code), ix(status) |
| `zones` | id, plant_id→plants, code, name, status, lat/lon | unique(plant_id, code), ix(plant_id), ix(status) |
| `lines` | id, zone_id→zones, code, name, line_type, status | unique(zone_id, code), ix(zone_id), ix(status) |
| `machines` | id, line_id→lines, code, name, machine_type, status | unique(line_id, code), ix(line_id), ix(status) |
| `sensors` | id, machine_id→machines, sensor_code*, sensor_type, unit, status, installed_at, lat/lon | unique(sensor_code), ix(machine_id), ix(sensor_type), ix(status) |
| `sensor_readings` | id, sensor_id→sensors, timestamp, value, quality | ix(sensor_id, timestamp), ix(timestamp) |
| `incidents` | id, plant_id→plants, zone_id, line_id, machine_id, sensor_id, title, incident_type, severity, status, started_at, ended_at, summary, details(JSON) | ix(plant_id), ix(plant_id, status), ix(severity), ix(status), ix(started_at) |
| `model_registry` | id, name, version, model_type, path, status, features(JSON), target, training_dataset(+sha256), metrics(JSON), trained_at | unique(name, version), ix(name), ix(status) |
| `model_runs` | id, model_id→model_registry, run_type, started_at, finished_at, status, n_rows, metrics, error | ix(model_id) |

All FKs cascade on delete from parent → child except incident pins (SET NULL). Timestamps are `timestamptz`.

## Status vocabularies (enforced in code, not DB enums)
- assets: `active | inactive | maintenance | decommissioned`
- sensors: `online | offline | degraded | maintenance | unknown` (seeded as `unknown` — no telemetry yet)
- incidents: severity `low|medium|high|critical`, status `open|acknowledged|investigating|resolved|closed`
- models: `registered | active | deprecated | failed`

## Seed (Phase 2)
1 plant (`PLT-CBE-01`, Coimbatore) · 3 zones · 4 lines (Cooling Line A, Process Water Line, Production Line B, Recovery Line) · 8 machines · 20 sensors (`S01`–`S20`) · 8 model_registry rows mirrored from `ml/artifacts/registry.json`. **No readings, no incidents.**

## Tests
DB tests use `TEST_DATABASE_URL` (default `…/aquarisk_test`, created automatically). If PostgreSQL is unreachable they are skipped with a reason — they are never faked on SQLite.
