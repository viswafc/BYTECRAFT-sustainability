#!/usr/bin/env bash
# One-command verification of the platform foundation.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-.venv/bin/python}
echo "== 1. train + evaluate baseline models";  $PY -m ml.training.train --no-reports
echo "== 2. data-quality report";              $PY scripts/data_quality_report.py
echo "== 3. python tests (unit + DB if reachable)"; $PY -m pytest
echo "== 4. frontend typecheck + tests";       (cd frontend && npx tsc -b && npx vitest run)
echo "== 5. frontend production build";        (cd frontend && npm run build >/dev/null)
echo "== 6. single prediction via CLI";        $PY -m ml.inference.predictor --pressure 45 --flow-rate 100
echo "ALL CHECKS PASSED"
