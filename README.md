# AquaRisk AI

**Predictive Water Loss Timeline & Counterfactual Simulation Engine** — targeting problem SU-03
(Industrial Water Network Leak & Loss Detection). This repository is at **Phase 1: baseline audit,
recreation & production-grade foundation**. The original prototype
(`Sukrut10k/Smart-Water-Leak-Detection`) is frozen under `legacy/`.

## Quick start (local)

```bash
make setup           # python venv + pip deps + npm install
make train           # ~10 s: trains 8 baseline models, writes ml/artifacts + reports/
make backend         # http://localhost:8000  (docs at /docs)
make frontend        # http://localhost:5173  (proxies /api to :8000)
make test            # pytest + vitest + tsc
```

Without make:

```bash
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
python -m ml.train
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
cd frontend && npm install && npm run dev
```

Single prediction from the CLI: `python -m ml.inference --pressure 45 --flow-rate 100`

## Docker

```bash
cp .env.example .env
docker compose up --build     # db (5432) → migrate → backend (8000) → frontend (3000)
```

## Database (optional in Phase 1)

```bash
export DATABASE_URL=postgresql+psycopg://aquarisk:aquarisk@localhost:5432/aquarisk
alembic -c database/alembic.ini upgrade head
```

## Documents

| Doc | Purpose |
|---|---|
| `docs/BASELINE_AUDIT.md` | Audit of the legacy project with severities |
| `docs/DATA_DICTIONARY.md` | Every dataset field |
| `docs/ARCHITECTURE.md` | Folder tree, request flow, contracts |
| `docs/PHASE_STATUS.md` | Phase contract |
| `reports/baseline_model_evaluation.md` | Measured metrics (regenerate with `python -m ml.train`) |
| `reports/data_quality_report.md` | Measured dataset statistics |

## Configuration

Copy `.env.example` → `.env`. Secrets are read by the backend only; the frontend never sees API keys.
