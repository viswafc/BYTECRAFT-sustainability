"""Inference helper used by the backend and the CLI.

    python -m ml.inference.predictor --pressure 45 --flow-rate 100 ...
"""
from __future__ import annotations

import argparse
import json

import pandas as pd

from ml.registry import ModelRegistry
from ml.schemas import DEFAULT_ARTIFACT_DIR, SensorReadingInput


class LeakPredictor:
    """Loads one registered model once and serves predictions."""

    def __init__(self, registry: ModelRegistry, feature_config: str, model_name: str):
        self.registry = registry
        self.pipeline, self.meta = registry.load(feature_config, model_name)

    @classmethod
    def from_default(cls, artifact_dir=DEFAULT_ARTIFACT_DIR) -> "LeakPredictor":
        reg = ModelRegistry(artifact_dir)
        d = reg.get_default()
        if d is None:
            raise FileNotFoundError(
                f"No default model registered in {reg.registry_path}. Run `python -m ml.training.train`."
            )
        return cls(reg, *d)

    def _frame(self, rows: list[SensorReadingInput]) -> pd.DataFrame:
        recs = [r.with_location_code().model_dump() for r in rows]
        df = pd.DataFrame(recs)
        missing = [c for c in self.meta.features if c not in df.columns or df[c].isna().any()]
        if missing:
            raise ValueError(
                f"Model {self.meta.feature_config}/{self.meta.model_name} requires features {missing} "
                "which are missing or null in the input"
            )
        return df[self.meta.features]

    def predict(self, rows: list[SensorReadingInput]) -> list[dict]:
        X = self._frame(rows)
        preds = self.pipeline.predict(X)
        probas = None
        if hasattr(self.pipeline, "predict_proba"):
            probas = self.pipeline.predict_proba(X)[:, 1]
        out = []
        for i, p in enumerate(preds):
            out.append(
                {
                    "leak_predicted": bool(int(p) == 1),
                    "leak_probability": float(probas[i]) if probas is not None else None,
                }
            )
        return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifact-dir", default=str(DEFAULT_ARTIFACT_DIR))
    ap.add_argument("--pressure", type=float, required=True)
    ap.add_argument("--flow-rate", type=float, required=True)
    ap.add_argument("--temperature", type=float, default=100.0)
    ap.add_argument("--vibration", type=float, default=3.0)
    ap.add_argument("--rpm", type=float, default=2000.0)
    ap.add_argument("--operational-hours", type=float, default=5000.0)
    a = ap.parse_args(argv)
    pred = LeakPredictor.from_default(a.artifact_dir)
    row = SensorReadingInput(
        Pressure=a.pressure, Flow_Rate=a.flow_rate, Temperature=a.temperature,
        Vibration=a.vibration, RPM=a.rpm, Operational_Hours=a.operational_hours,
    )
    result = pred.predict([row])[0]
    result["model"] = f"{pred.meta.feature_config}/{pred.meta.model_name}@{pred.meta.version}"
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
