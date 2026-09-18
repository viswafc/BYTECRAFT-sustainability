"""PredictionService — the ML abstraction future phases plug into.

Contract:  load_model() · predict() · health() · metadata()

Phase 2 binds it to the verified Phase-1 baseline classifier via ml.registry. If no artifact is
registered the service reports MODEL_NOT_READY instead of inventing predictions. Later phases add
new services (baseline, risk, localisation) implementing the same protocol.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from typing import Protocol, runtime_checkable

from ml.inference.predictor import LeakPredictor
from ml.registry import ModelNotFoundError, ModelRegistry
from ml.schemas import SensorReadingInput

from ..core.config import get_settings
from ..core.errors import InvalidInputError, ModelUnavailableError
from ..schemas.ml import ModelHealth, ModelResponse

log = logging.getLogger("aquarisk.ml")

DISCLAIMER = ("Baseline classifier trained on the legacy synthetic dataset (label is a deterministic function of "
              "Flow_Rate and Pressure). Not validated on real network telemetry.")


@runtime_checkable
class PredictionService(Protocol):
    def load_model(self, name: str | None = None) -> None: ...
    def predict(self, readings: list[SensorReadingInput], model_name: str | None = None) -> tuple[str, list[dict]]: ...
    def health(self) -> ModelHealth: ...
    def metadata(self) -> list[ModelResponse]: ...


class BaselineLeakPredictionService:
    model_type = "leak_classifier"

    def __init__(self, artifact_dir: Path):
        self.registry = ModelRegistry(artifact_dir)
        self._predictors: dict[tuple[str, str], LeakPredictor] = {}

    # ---- helpers
    @staticmethod
    def _split(name: str) -> tuple[str, str]:
        if "/" not in name:
            raise InvalidInputError(f"model_name must look like '<feature_config>/<model>' (got '{name}').")
        cfg, m = name.split("/", 1)
        return cfg, m

    def _key(self, name: str | None) -> tuple[str, str]:
        if name:
            return self._split(name)
        d = self.registry.get_default()
        if d is None:
            raise ModelUnavailableError("No trained model is registered. Run `python -m ml.training.train`.")
        return d

    # ---- contract
    def load_model(self, name: str | None = None) -> LeakPredictor:
        key = self._key(name)
        if key not in self._predictors:
            try:
                self._predictors[key] = LeakPredictor(self.registry, *key)
                log.info("loaded model %s/%s", *key)
            except ModelNotFoundError as e:
                raise ModelUnavailableError(f"Model '{key[0]}/{key[1]}' is not registered.") from e
        return self._predictors[key]

    def predict(self, readings, model_name=None):
        p = self.load_model(model_name)
        try:
            out = p.predict(readings)
        except ValueError as e:
            raise InvalidInputError(str(e)) from e
        return f"{p.meta.feature_config}/{p.meta.model_name}@{p.meta.version}", out

    def health(self) -> ModelHealth:
        n = len(self.registry.list_models())
        d = self.registry.get_default()
        if d is None:
            return ModelHealth(state="OFFLINE", ready=False, n_registered=n,
                               detail="MODEL_NOT_READY: no default model registered")
        try:
            p = self.load_model()
        except ModelUnavailableError as e:
            return ModelHealth(state="OFFLINE", ready=False, n_registered=n, detail=f"MODEL_NOT_READY: {e.message}")
        return ModelHealth(state="ONLINE", ready=True, n_registered=n,
                           default_model=f"{p.meta.feature_config}/{p.meta.model_name}@{p.meta.version}")

    def metadata(self) -> list[ModelResponse]:
        d = self.registry.get_default()
        dkey = f"{d[0]}/{d[1]}" if d else None
        out = []
        for e in self.registry.list_models():
            try:
                m = self.registry.load_meta(e["feature_config"], e["model_name"])
            except ModelNotFoundError:
                continue
            name = f"{m.feature_config}/{m.model_name}"
            artifact = self.registry.model_path(m.feature_config, m.model_name)
            out.append(ModelResponse(
                name=name, version=m.version, model_type=self.model_type,
                status="active" if name == dkey else ("registered" if artifact.exists() else "failed"),
                path=str(m.artifact_file), features=m.features, target=m.target,
                training_dataset=m.training_dataset, trained_at=m.training_timestamp,
                metrics=m.evaluation_metrics, is_default=(name == dkey),
            ))
        return out


@lru_cache
def get_prediction_service() -> BaselineLeakPredictionService:
    return BaselineLeakPredictionService(get_settings().model_path)
