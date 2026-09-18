# Development Guide

## Prerequisites
Python 3.11+, Node 22+, Docker (for PostgreSQL) — or any PostgreSQL 16 instance.

## First run (new developer)

```bash
git clone … && cd BYTECRAFT-sustainability
cp .env.example .env                 # edit POSTGRES_PASSWORD / DATABASE_URL if needed
make setup                           # venv + pip + npm
make train                           # ~10 s → ml/artifacts + reports/
make db-up                           # docker compose up -d db   (or start your own PostgreSQL)
make migrate && make seed
make backend                         # http://localhost:8000  (docs at /docs)
make frontend                        # http://localhost:5173
```
Open http://localhost:5173 → top bar should read **SYSTEM ONLINE**, Command Center shows 20 connected sensors, "No active incidents".

## Everyday commands
| Task | Command |
|---|---|
| all checks | `make check` (`scripts/run_all_checks.sh`) |
| python tests | `make test-py` |
| frontend tests + typecheck | `make test-fe` |
| new migration | `.venv/bin/alembic -c database/alembic.ini revision --autogenerate -m "…"` |
| CLI prediction | `.venv/bin/python -m ml.inference.predictor --pressure 45 --flow-rate 100` |
| full stack in Docker | `docker compose up --build` → UI :3000, API :8000, DB :5432 |

## Conventions
- **Backend layering**: route → schema → service → repository. Routes never touch `Session` directly; repositories never build responses.
- **Errors**: raise `AppError` subclasses (`NotFoundError("Sensor", code)`) — the handler produces the envelope. Never `raise HTTPException` with ad-hoc bodies.
- **Frontend data access**: only via `services/*`. Components use `useApi(fn, deps, {enabled, pollMs})` and render `LoadingState / ApiErrorState / EmptyState`.
- **Global state**: `stores/appStore` for plant selection, system state, WS state, selections. Page-local state stays local.
- **Colours**: use tokens from `styles/index.css` (`bg-surface`, `text-muted`, `text-primary`, `bg-danger/10` …). No hex in components.
- **Telemetry numerals**: class `telemetry` (monospace, tabular nums).
- **Honesty rule**: if a value is not computed from real data, show an empty state that says so.

## Logging
Backend emits one JSON line per request: `{ts, level, logger, msg:"request", request_id, path, method, status_code, duration_ms}`; errors log the trace server-side only. Frontend `utils/logger` is dev-only.

## Adding a page
1. `pages/NewPage.tsx` (default export) → 2. lazy route in `app/router.tsx` → 3. entry in `components/navigation/Sidebar.tsx` `NAV` → 4. add to the navigation test list.

## Adding an API resource
1. ORM in `models/entities.py` + Alembic revision → 2. repository → 3. schema(s) → 4. service → 5. router in `api/v1/` and include in `api/v1/__init__.py` → 6. types in `frontend/src/types/api.ts` + service → 7. tests in `tests/backend/`.
