#!/usr/bin/env bash
# One-command verification of the Phase 1 foundation.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-.venv/bin/python}
echo "== 1. train + evaluate baseline models"; $PY -m ml.train
echo "== 2. data-quality report";            $PY scripts/data_quality_report.py
echo "== 3. python tests";                   $PY -m pytest
echo "== 4. frontend typecheck + tests";     (cd frontend && npx tsc -b && npx vitest run)
echo "== 5. single prediction via CLI";      $PY -m ml.inference --pressure 45 --flow-rate 100
echo "ALL CHECKS PASSED"
