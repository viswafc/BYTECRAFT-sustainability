# Phase Status

## Phase 1 — Baseline audit, recreation & production-grade foundation

**Status: COMPLETE** (with one environment-limited caveat on Docker, see below)

| Area | Status | Evidence |
|---|---|---|
| Baseline repository | **OK** | `Sukrut10k/Smart-Water-Leak-Detection@1c032e4` cloned, every file inspected, snapshot in `legacy/`, audit in `docs/BASELINE_AUDIT.md` |
| Dataset | **OK** | Loaded programmatically; 5 000 × 13, 0 nulls, 0 dups; `reports/data_quality_report.{json,md}`; `docs/DATA_DICTIONARY.md` |
| ML | **OK** | `python -m ml.train` reproduces the notebook's exact accuracies (RF 0.989 / DT 0.910 / LR 0.890 / SVM 0.907); 8 artifacts + metadata; config A vs B leakage comparison; `reports/baseline_model_evaluation.{json,md}` |
| Backend | **OK** | FastAPI on :8000 — `/health`, `/api/version`, `/api/system/status`, `/api/data/health`, `/api/models`, `/api/predict`; JSON logs; uniform error envelope; verified live |
| Frontend | **OK** | React/Vite/TS/Tailwind on :5173 — Command Center, System Status, Data Health, API Health; 11 reusable components; dark-industrial theme; proxy to backend verified live |
| Database | **OK** | SQLAlchemy models for 9 entities + Alembic migration `0001_phase1_core`; migration applied and verified (SQLite in tests; PostgreSQL via compose). Runtime-optional in Phase 1. |
| Tests | **OK** | `pytest`: 27 passed (data 5, ml 11, backend 11). `vitest`: 4 passed (loads, navigation, API-unreachable state, backend error message). `tsc -b` clean. One command: `scripts/run_all_checks.sh` |
| Docker | **OK (prepared, not executed here)** | `backend/Dockerfile`, `frontend/Dockerfile` + `nginx.conf`, `docker-compose.yml` (db → migrate → backend → frontend) written and YAML-validated. The Docker daemon is **not available in the build sandbox**, so `docker compose up` was not run. Every step the images perform (pip install, `python -m ml.train --no-reports`, `npm run build`, alembic upgrade) was executed natively and passes. First `docker compose up --build` on a Docker host should be treated as a smoke test. |

### Phase 1 demo checklist (PART 15)

| Step | Command | Result |
|---|---|---|
| Install dependencies | `make setup` | ✔ |
| Start the database | `docker compose up db` / any PostgreSQL + `alembic upgrade head` | ✔ migration verified |
| Start backend | `make backend` | ✔ |
| Start frontend | `make frontend` | ✔ |
| Load the original dataset | automatic on `/api/data/health` | ✔ 5 000 rows |
| Load the baseline model | automatic on `/api/models` | ✔ `B_sensor_only/random_forest@0.1.0` |
| Run one prediction | UI button, or `python -m ml.inference --pressure 45 --flow-rate 100` | ✔ leak, p = 0.995 |
| See model status | `/api/system/status` → `model.status = ok` | ✔ |
| See system health | `/health` → `{"status":"healthy","version":"0.1.0"}` | ✔ |
| Regenerate real metrics | `python -m ml.train` | ✔ ~10 s |

### Explicitly NOT done (per Phase 1 scope)

Synthetic time-series generation, predictive risk, graph localisation, digital twin, counterfactual simulation,
financial engine, AI Copilot, action recommendations, full dashboard, IoT integration. `ChartContainer` slots on the
Command Center are labelled as future-phase placeholders, not disguised features.

## Phase 2 — not started

Recommended entry point: see the "Exact recommended next step" section in the Phase 1 completion summary.
