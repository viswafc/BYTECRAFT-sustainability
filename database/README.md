# Database

PostgreSQL schema managed with Alembic. Models live in `backend/app/models/entities.py`.

```bash
export DATABASE_URL=postgresql+psycopg://aquarisk:aquarisk@localhost:5432/aquarisk
alembic -c database/alembic.ini upgrade head          # apply
alembic -c database/alembic.ini revision --autogenerate -m "msg"   # new migration
```

Entities (Phase 1): plants, zones, lines, machines, sensors, sensor_readings, incidents, models, model_runs.
The API runs without a database in Phase 1; `/api/system/status` reports it as `unknown` when `DATABASE_URL` is unset.
