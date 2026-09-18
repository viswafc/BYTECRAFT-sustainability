"""File-based model registry.

Layout (inside the artifact directory):

    artifacts/
      <feature_config>/
        <model_name>.joblib
        <model_name>.meta.json
      registry.json          # index of every trained model + the default one

The registry is deliberately simple; Phase-N can move the index into the
``models`` / ``model_runs`` DB tables without changing callers.
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib

from ml.schemas import DEFAULT_ARTIFACT_DIR, ModelMetadata

REGISTRY_FILE = "registry.json"
DEFAULT_MODEL_KEY = "default"


class ModelNotFoundError(FileNotFoundError):
    pass


class ModelRegistry:
    def __init__(self, artifact_dir: str | Path = DEFAULT_ARTIFACT_DIR):
        self.artifact_dir = Path(artifact_dir)

    # ------------------------------------------------------------------ paths
    def _model_dir(self, feature_config: str) -> Path:
        return self.artifact_dir / feature_config

    def model_path(self, feature_config: str, model_name: str) -> Path:
        return self._model_dir(feature_config) / f"{model_name}.joblib"

    def meta_path(self, feature_config: str, model_name: str) -> Path:
        return self._model_dir(feature_config) / f"{model_name}.meta.json"

    @property
    def registry_path(self) -> Path:
        return self.artifact_dir / REGISTRY_FILE

    # ------------------------------------------------------------------ write
    def save(self, pipeline, meta: ModelMetadata) -> Path:
        d = self._model_dir(meta.feature_config)
        d.mkdir(parents=True, exist_ok=True)
        path = self.model_path(meta.feature_config, meta.model_name)
        joblib.dump(pipeline, path)
        self.meta_path(meta.feature_config, meta.model_name).write_text(
            meta.model_dump_json(indent=2)
        )
        self._update_index(meta)
        return path

    def _update_index(self, meta: ModelMetadata) -> None:
        idx = self.load_index()
        idx.setdefault("models", {})
        idx["models"][f"{meta.feature_config}/{meta.model_name}"] = {
            "model_name": meta.model_name,
            "feature_config": meta.feature_config,
            "version": meta.version,
            "training_timestamp": meta.training_timestamp,
            "artifact_file": meta.artifact_file,
            "evaluation_metrics": meta.evaluation_metrics,
        }
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        self.registry_path.write_text(json.dumps(idx, indent=2))

    def set_default(self, feature_config: str, model_name: str) -> None:
        idx = self.load_index()
        idx[DEFAULT_MODEL_KEY] = {"feature_config": feature_config, "model_name": model_name}
        self.registry_path.write_text(json.dumps(idx, indent=2))

    # ------------------------------------------------------------------- read
    def load_index(self) -> dict:
        if self.registry_path.exists():
            return json.loads(self.registry_path.read_text())
        return {"models": {}}

    def list_models(self) -> list[dict]:
        return list(self.load_index().get("models", {}).values())

    def get_default(self) -> tuple[str, str] | None:
        d = self.load_index().get(DEFAULT_MODEL_KEY)
        if not d:
            return None
        return d["feature_config"], d["model_name"]

    def load_meta(self, feature_config: str, model_name: str) -> ModelMetadata:
        p = self.meta_path(feature_config, model_name)
        if not p.exists():
            raise ModelNotFoundError(f"No metadata for {feature_config}/{model_name} at {p}")
        return ModelMetadata.model_validate_json(p.read_text())

    def load(self, feature_config: str, model_name: str):
        p = self.model_path(feature_config, model_name)
        if not p.exists():
            raise ModelNotFoundError(
                f"Model artifact {p} not found. Run `python -m ml.training.train` to generate artifacts."
            )
        return joblib.load(p), self.load_meta(feature_config, model_name)
