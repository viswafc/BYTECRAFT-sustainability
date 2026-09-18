# AquaRisk AI — Phase 1 Architecture

## Principles

- **Real numbers only** — every metric shown anywhere is read from artifacts produced by `ml/train.py`.
- **Nothing depends on the CWD** — all paths resolve from the repo root (`ml/schemas.py`, `backend/app/config.py`).
- **Frontend never holds secrets or backend hostnames** — it calls relative `/api/*` URLs; Vite (dev) or nginx (Docker) proxies them.
- **Modules, not monolith** — `ml` is importable by the backend and by scripts; the backend is an app factory; the frontend has a component library.
- **Optional infrastructure** — the API and UI run without PostgreSQL in Phase 1; the DB is wired (models + migration) but reported as `unknown` when unset.

## Folder tree

```
BYTECRAFT-sustainability/
├── backend/
│   ├── Dockerfile
│   └── app/
│       ├── main.py            # FastAPI factory, lifespan, middleware, routers
│       ├── config.py          # pydantic-settings (env / .env)
│       ├── api/routes.py      # /health /api/version /api/system/status /api/data/health /api/models /api/predict
│       ├── services/          # data_service, model_service, db_service
│       ├── models/            # SQLAlchemy ORM (plants … model_runs)
│       ├── schemas/common.py  # response/request schemas
│       └── utils/             # logging (JSON), errors (uniform envelope), middleware (request-id)
├── ml/
│   ├── schemas.py             # columns, feature configs, SensorReadingInput, ModelMetadata
│   ├── preprocess.py          # load/validate CSV, split, ColumnTransformer
│   ├── train.py               # reproducible training + reports
│   ├── evaluate.py            # metrics (acc/prec/rec/F1/CM/ROC-AUC/PR-AUC)
│   ├── model_registry.py      # file-based registry + metadata
│   ├── inference.py           # LeakPredictor + CLI
│   └── artifacts/             # <config>/<model>.joblib (ignored) + .meta.json + registry.json (committed)
├── frontend/                  # React 19 + Vite + TypeScript + Tailwind v4
│   ├── src/components/ui/     # Button Card Badge Metric StatusIndicator DataTable Drawer Modal ChartContainer LoadingState ErrorState
│   ├── src/layout/            # AppShell (nav + live status), PageHeader
│   ├── src/pages/             # CommandCenter SystemStatus DataHealth ApiHealth
│   ├── src/lib/               # api.ts (typed client + ApiError), useApi.ts
│   ├── src/test/              # vitest + testing-library
│   ├── Dockerfile, nginx.conf
│   └── vite.config.ts         # /api proxy, host 0.0.0.0
├── database/
│   ├── alembic.ini
│   └── migrations/            # env.py + versions/0001_phase1_core_entities.py
├── data/raw/                  # immutable baseline CSVs
├── docs/                      # BASELINE_AUDIT, DATA_DICTIONARY, ARCHITECTURE, PHASE_STATUS
├── reports/                   # baseline_model_evaluation.{json,md}, data_quality_report.{json,md}
├── scripts/                   # data_quality_report.py, run_all_checks.sh
├── tests/                     # data/ ml/ backend/ (pytest)
├── config/                    # non-secret reference config
├── simulator/                 # reserved (Phase 2+)
├── legacy/smart-water-leak-detection/   # frozen baseline
├── docker-compose.yml, Makefile, pyproject.toml, requirements.txt, .env.example
```

## Request flow

```
Browser ──/api/*──▶ Vite dev server (5173) / nginx (3000) ──▶ FastAPI (8000)
                                                               ├── DataService  ──▶ data/raw/*.csv
                                                               ├── ModelService ──▶ ml.inference ──▶ ml/artifacts
                                                               └── db_status    ──▶ PostgreSQL (optional)
```

## Error contract

All non-2xx responses share one envelope; stack traces go to logs only.

```json
{ "error": { "code": "validation_error|invalid_input|model_unavailable|http_error|internal_error",
             "message": "human readable", "details": [ ... optional ... ] } }
```

## Model registry contract

`ml/artifacts/registry.json` lists every trained `<feature_config>/<model_name>` with its metrics and marks the default.
Each artifact has a sibling `.meta.json` (`ModelMetadata`): model_name, version, feature_config, training_dataset (+ sha256),
features, target, training_timestamp, n_train/test rows, evaluation_metrics, sklearn_version, artifact_file.

## Extension points for Phase 2+

- `simulator/` for time-series generation; new tables already exist (`sensors`, `sensor_readings`).
- `backend/app/services/` — add services; routers are plain `APIRouter`s.
- `ml/schemas.FEATURE_CONFIGS` — add configs without touching training code.
- `frontend/src/pages/` + `nav` array in `AppShell.tsx` — add pages.
- `ChartContainer` is the slot for the interactive chart library; no chart lib is bundled yet.
- LLM: `Settings.ai_provider/ai_model/ai_api_key` are read server-side only; no provider code exists yet.
