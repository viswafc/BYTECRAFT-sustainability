# AquaRisk AI

**Predictive Water Loss Timeline & Counterfactual Simulation Engine** — targeting problem SU-03
(Industrial Water Network Leak & Loss Detection).

Current state: **Phase 2 — Modular Industrial AI Architecture & Base Application.** The system is a
real, running full-stack skeleton (React + FastAPI + PostgreSQL + registered Phase 1 baseline model) with
clean contracts and honest empty states. Leak prediction, predictive risk, digital twin, counterfactuals,
financial engine and Copilot are **not implemented yet** — their pages say so. The original prototype
(`Sukrut10k/Smart-Water-Leak-Detection`) is frozen under `legacy/`.

## Architecture

```
frontend (React 19 / Vite / TS / Tailwind / Zustand)  ──HTTP /api + WS /api/ws──▶  backend (FastAPI)
                                                                                    api → schemas → services → repositories → PostgreSQL 16
                                                                                    services/telemetry (provider abstraction)
                                                                                    ml/prediction_service → ml/artifacts (Phase 1 baseline)
```
Details: `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/DEVELOPMENT.md`.

## Tech stack
Python 3.11 · FastAPI · SQLAlchemy 2 · Alembic · psycopg 3 · scikit-learn · React 19 · Vite 7 · TypeScript · Tailwind 4 · Zustand · Vitest · pytest · Docker Compose · nginx.

## Quick start (local)

```bash
cp .env.example .env
make setup           # python venv + pip deps + npm install
make train           # ~10 s: trains baseline models, writes ml/artifacts + reports/
make db-up           # PostgreSQL via docker (or point DATABASE_URL at your own instance)
make migrate seed    # alembic upgrade head + seed 1 plant / 3 zones / 4 lines / 8 machines / 20 sensors
make backend         # http://localhost:8000  (docs at /docs)
make frontend        # http://localhost:5173  (proxies /api and /api/ws to :8000)
make check           # every test + typecheck + build in one command
```

Without make:

```bash
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
python -m ml.train
alembic -c database/alembic.ini upgrade head && python database/seeds/seed_infrastructure.py
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
cd frontend && npm install && npm run dev
```

The backend starts even without a database: `/api/system/status` reports `database: OFFLINE`, asset
endpoints return `503 DATABASE_UNAVAILABLE`, and the UI shows the "DATA STREAM INTERRUPTED" state.

## Environment variables
See `.env.example`. Key ones: `DATABASE_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, `WS_HEARTBEAT_SECONDS`,
`TELEMETRY_PROVIDER` (`database` | `null`), `TEST_DATABASE_URL`. The frontend receives **no** secrets — it
only talks to the same-origin `/api`.

## Testing

```bash
make test-py    # pytest: data, ml, backend (DB tests use TEST_DATABASE_URL, skipped if unreachable)
make test-fe    # vitest (boot, navigation, loading/error/empty states) + tsc -b
```

## Docker

```bash
docker compose up --build     # db (5432) → migrate+seed → backend (8000) → frontend (3000)
```

## Documents

| Doc | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | Folder tree, layering, request/WS flow, state, abstractions |
| `docs/API.md` | Every endpoint, envelopes, error codes, WS frames |
| `docs/DATABASE.md` | Tables, indexes, vocabularies, seed, migrations |
| `docs/DEVELOPMENT.md` | Day-to-day workflow and conventions |
| `docs/PHASE_STATUS.md` | Phase contracts and what is/isn't done |
| `docs/BASELINE_AUDIT.md`, `docs/DATA_DICTIONARY.md` | Phase 1 audit & dataset |
| `reports/*.md` | Measured metrics (regenerate with `python -m ml.train`) |

## Current status
Phase 1 ✔ · Phase 2 ✔ (see `docs/PHASE_STATUS.md`) · Phase 3 (intelligence modules) not started.
