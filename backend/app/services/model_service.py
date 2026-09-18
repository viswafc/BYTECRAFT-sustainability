"""Model loading / prediction service (thin wrapper over ml.*)."""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from ml.inference import LeakPredictor
from ml.model_registry import ModelNotFoundError, ModelRegistry
from ml.schemas import SensorReadingInput

from ..config import get_settings
from ..schemas.common import ComponentStatus, ModelInfo, ModelListResponse
from ..utils.errors import AppError, ModelUnavailableError

log = logging.getLogger("aquarisk.model")


class ModelService:
    def __init__(self, artifact_dir: Path):
        self.registry = ModelRegistry(artifact_dir)
        self._predictors: dict[tuple[str, str], LeakPredictor] = {}

    # -------------------------------------------------------------- listing
    def list_models(self) -> ModelListResponse:
        default = self.registry.get_default()
        default_key = f"{default[0]}/{default[1]}" if default else None
        infos = []
        for entry in self.registry.list_models():
            try:
                meta = self.registry.load_meta(entry["feature_config"], entry["model_name"])
            except ModelNotFoundError:
                continue
            infos.append(
                ModelInfo(
                    model_name=meta.model_name, feature_config=meta.feature_config, version=meta.version,
                    training_timestamp=meta.training_timestamp, features=meta.features, target=meta.target,
                    training_dataset=meta.training_dataset, evaluation_metrics=meta.evaluation_metrics,
                    is_default=(f"{meta.feature_config}/{meta.model_name}" == default_key),
                )
            )
        return ModelListResponse(default=default_key, models=infos)

    # ----------------------------------------------------------- prediction
    def _resolve(self, feature_config: str | None, model_name: str | None) -> tuple[str, str]:
        if feature_config and model_name:
            return feature_config, model_name
        default = self.registry.get_default()
        if default is None:
            raise ModelUnavailableError(
                "No trained model is registered. Run `python -m ml.train` to generate artifacts."
            )
        return (feature_config or default[0], model_name or default[1])

    def get_predictor(self, feature_config: str | None = None, model_name: str | None = None) -> LeakPredictor:
        key = self._resolve(feature_config, model_name)
        if key not in self._predictors:
            try:
                self._predictors[key] = LeakPredictor(self.registry, *key)
            except ModelNotFoundError as e:
                raise ModelUnavailableError(
                    f"Model '{key[0]}/{key[1]}' is not registered. Run `python -m ml.train` to generate artifacts."
                ) from e
        return self._predictors[key]

    def predict(self, readings: list[SensorReadingInput], feature_config=None, model_name=None):
        pred = self.get_predictor(feature_config, model_name)
        try:
            results = pred.predict(readings)
        except ValueError as e:
            raise AppError(str(e), status_code=422, code="invalid_input") from e
        return f"{pred.meta.feature_config}/{pred.meta.model_name}@{pred.meta.version}", results

    # --------------------------------------------------------------- status
    def status(self) -> ComponentStatus:
        default = self.registry.get_default()
        if default is None:
            return ComponentStatus(
                name="model", status="error",
                detail=f"no default model registered in {self.registry.registry_path}",
            )
        try:
            p = self.get_predictor()
        except ModelUnavailableError as e:
            return ComponentStatus(name="model", status="error", detail=e.message)
        m = p.meta.evaluation_metrics
        return ComponentStatus(
            name="model", status="ok",
            detail=f"{p.meta.feature_config}/{p.meta.model_name}@{p.meta.version}",
            info={
                "n_registered": len(self.registry.list_models()),
                "trained_at": p.meta.training_timestamp,
                "f1": m.get("f1"), "recall": m.get("recall"), "roc_auc": m.get("roc_auc"),
            },
        )


@lru_cache
def get_model_service() -> ModelService:
    return ModelService(get_settings().model_path)
