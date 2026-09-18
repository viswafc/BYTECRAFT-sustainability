.PHONY: setup train reports db-up migrate seed backend frontend test test-py test-fe check docker-up docker-down

PY ?= .venv/bin/python

setup:            ## venv + python deps + npm install
	python3 -m venv .venv && $(PY) -m pip install -q --upgrade pip && $(PY) -m pip install -q -r requirements.txt
	cd frontend && npm install --silent

train:            ## train baseline models + regenerate reports/baseline_model_evaluation.*
	$(PY) -m ml.training.train

reports: train
	$(PY) scripts/data_quality_report.py

db-up:            ## start only PostgreSQL via docker
	docker compose up -d db

migrate:          ## apply alembic migrations (uses DATABASE_URL from .env)
	$(PY) -m alembic -c database/alembic.ini upgrade head

seed:             ## seed infrastructure entities (idempotent)
	$(PY) database/seeds/seed_infrastructure.py

backend:          ## API on :8000
	$(PY) -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:         ## UI on :5173 (proxies /api + /api/ws to :8000)
	cd frontend && npm run dev

test: test-py test-fe

test-py:
	$(PY) -m pytest

test-fe:
	cd frontend && npx tsc -b && npx vitest run

check:            ## everything, one command
	./scripts/run_all_checks.sh

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v
