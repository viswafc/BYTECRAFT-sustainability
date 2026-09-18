.PHONY: setup train reports backend frontend test test-py test-fe docker-up docker-down

PY ?= .venv/bin/python

setup:            ## create venv, install python + node deps
	python3 -m venv .venv && $(PY) -m pip install -q --upgrade pip && $(PY) -m pip install -q -r requirements.txt
	cd frontend && npm install --silent

train:            ## train baseline models + regenerate reports/baseline_model_evaluation.*
	$(PY) -m ml.train

reports: train    ## regenerate all reports
	$(PY) scripts/data_quality_report.py

backend:          ## run API on :8000
	$(PY) -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:         ## run UI on :5173 (proxies /api to :8000)
	cd frontend && npm run dev

test: test-py test-fe   ## run everything

test-py:
	$(PY) -m pytest

test-fe:
	cd frontend && npx tsc -b && npm test -- --run

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v
