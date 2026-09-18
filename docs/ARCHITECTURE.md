# AquaRisk AI — Architecture (Phase 2)

## Principles

1. **Real numbers only.** Every metric on screen is read from the database or from artifacts produced by `ml/training/train.py`. Empty states say "waiting", never invent.
2. **Contracts first.** Backend Pydantic schemas ⇄ `frontend/src/types/api.ts`. All success responses use `{data, meta}`, all failures `{error: {code, message}}`.
3. **Layers, not microservices.** One FastAPI app, one React app, one PostgreSQL. Layers inside the backend are strict: `api → schemas → services → repositories → models`.
4. **Swappable data sources.** `TelemetryProvider` is the seam for DB / simulator / IoT. `PredictionService` is the seam for ML.
5. **Optional infrastructure, honest status.** Without `DATABASE_URL` the API still boots; DB-backed endpoints return `503 DATABASE_UNAVAILABLE` and `/api/system/status` reports `DEGRADED`.
6. **No secrets in the browser.** The frontend calls relative `/api/*`; Vite (dev) / nginx (Docker) proxy to the backend. LLM keys live only in backend settings.

## Repository layout

```
├── backend/app/
│   ├── main.py                 FastAPI factory, lifespan (starts WS heartbeat), routers
│   ├── core/                   config (pydantic-settings), database (engine/session), logging (JSON),
│   │                           errors (AppError hierarchy + handlers), middleware (request-id/timing)
│   ├── api/                    deps.py (Pagination, service deps) · v1/{system,assets,telemetry,incidents,ml}.py
│   ├── schemas/                envelope, assets, telemetry, incidents, system, ml
│   ├── services/               asset_service, incident_service, system_service, data_service,
│   │                           telemetry/{base,database_provider,null_provider}
│   ├── repositories/           base (generic), assets, telemetry, incidents, models
│   ├── models/                 SQLAlchemy ORM entities
│   ├── ml/                     prediction_service (PredictionService protocol + baseline impl)
│   └── websocket/              manager (channels + heartbeat loop), routes (/api/ws/system, /api/ws/sensors)
├── ml/
│   ├── schemas.py              columns, feature configs, SensorReadingInput, ModelMetadata
│   ├── registry.py             file-based artifact registry (registry.json + *.meta.json)
│   ├── data/ preprocessing/ training/ evaluation/ inference/
│   └── artifacts/              <config>/<model>.joblib (git-ignored) + metadata (committed)
├── frontend/src/
│   ├── app/                    App.tsx, router.tsx (lazy routes)
│   ├── layouts/                AppLayout (shell: sidebar, top bar, status poll, WS subscription), PageHeader
│   ├── pages/                  CommandCenter DigitalTwin LiveSensors Incidents PredictiveRisk Analytics WhatIfLab Copilot Settings
│   ├── components/             ui/ metrics/ status/ tables/ modals/ drawers/ charts/ feedback/ navigation/
│   ├── services/               apiClient (base URL, timeout, cancel, envelope, errors) + per-domain services
│   ├── stores/                 appStore (Zustand: plant, status, ws, selection), toastStore
│   ├── hooks/                  useApi (abortable fetch + polling), useWebSocket (reconnect/backoff)
│   ├── types/ utils/ styles/   API types · cn/format/logger · design tokens (index.css)
│   └── features/               reserved for Phase 3+ feature modules
├── database/                   alembic.ini, migrations/, seeds/seed_infrastructure.py
├── simulator/                  reserved (Phase 3)
├── shared/                     contract notes (OpenAPI export target)
├── docker/                     backend.Dockerfile, frontend.Dockerfile, nginx.conf
├── tests/                      data/ ml/ backend/ (pytest) — frontend tests live in frontend/src/test
├── docs/ reports/ scripts/ config/ legacy/
└── docker-compose.yml  Makefile  pyproject.toml  requirements.txt  .env.example
```

## Request flow

```
Browser ──/api/*, /api/ws/*──▶ Vite (5173) | nginx (3000) ──▶ FastAPI (8000)
                                                               │
      api/v1 router ─ validates (schemas) ─▶ service ─▶ repository ─▶ SQLAlchemy ─▶ PostgreSQL
                                             │
                                             ├─ TelemetryProvider (database | simulator | iot)
                                             └─ PredictionService (baseline leak classifier | future)
```

## Health model

Every component reports one of `ONLINE | DEGRADED | OFFLINE | UNKNOWN`.
`/api/system/status` aggregates: backend, database, ml, websocket, telemetry, dataset.
The WebSocket `system` channel broadcasts the same aggregate as a heartbeat every `WS_HEARTBEAT_SECONDS`.
The frontend stores the latest state in `appStore` (from the 30 s poll and from heartbeats) and renders it in the top bar.

## Error contract

| Code | HTTP | Raised by |
|---|---|---|
| `VALIDATION_ERROR` | 422 | FastAPI request validation |
| `INVALID_INPUT` | 422 | service-level input problems (e.g. missing features for a model) |
| `<ENTITY>_NOT_FOUND` | 404 | repositories via `NotFoundError("Sensor", "S06")` → `SENSOR_NOT_FOUND` |
| `DATABASE_UNAVAILABLE` | 503 | no `DATABASE_URL` or DB unreachable |
| `MODEL_NOT_READY` | 503 | no registered/loadable model |
| `HTTP_ERROR` | * | plain HTTPException |
| `INTERNAL_ERROR` | 500 | anything unexpected (logged with trace, never returned) |

Frontend: `ApiError {status, code, message}`; `ApiErrorState` maps codes to titles ("Data stream interrupted", "Database unavailable", "Model not ready", …) and shows last-successful-update + Retry.

## Extension points for Phase 3

- **Simulator**: implement `TelemetryProvider` in `backend/app/services/telemetry/simulator_provider.py`, register it in `_REGISTRY`, set `TELEMETRY_PROVIDER=simulator`. Persist frames via `SensorReadingRepository`; broadcast on `ws_manager.broadcast("sensors", frame)`.
- **Time-series tables**: `sensor_readings(sensor_id, timestamp)` is indexed; add Alembic revisions under `database/migrations/versions/`.
- **New ML services**: implement the `PredictionService` protocol in `backend/app/ml/`, expose under `/api/ml/<name>`.
- **Charts**: `ChartContainer` is the slot; add a chart lib in `components/charts/` once real series exist.
- **Frontend features**: `features/<name>/` with its own service + store slice; pages compose them.
