"""Feature schema and constants for the baseline leak-classification dataset.

Single source of truth for column names, feature sets and the target column.
Both the training pipeline and the backend inference service import from here.
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
ML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = ML_DIR.parent
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "raw" / "location_aware_gis_leakage_dataset.csv"
DEFAULT_ARTIFACT_DIR = ML_DIR / "artifacts"

# --------------------------------------------------------------------------- #
# Columns
# --------------------------------------------------------------------------- #
TARGET = "Leakage_Flag"

SENSOR_FEATURES: list[str] = [
    "Pressure",
    "Flow_Rate",
    "Temperature",
    "Vibration",
    "RPM",
    "Operational_Hours",
]
GEO_FEATURES: list[str] = ["Latitude", "Longitude"]
CATEGORICAL_LOCATION_FEATURES: list[str] = ["Zone", "Block", "Pipe", "Location_Code"]

ALL_FEATURES: list[str] = SENSOR_FEATURES + GEO_FEATURES + CATEGORICAL_LOCATION_FEATURES
RAW_COLUMNS: list[str] = ALL_FEATURES + [TARGET]

ZONES = [f"Zone_{i}" for i in range(1, 6)]
BLOCKS = [f"Block_{i}" for i in range(1, 6)]
PIPES = [f"Pipe_{i}" for i in range(1, 6)]

FeatureConfigName = Literal["A_all_features", "B_sensor_only"]

# Configuration A: everything the legacy notebook used.
# Configuration B: sensor / operational features only (no location shortcuts).
FEATURE_CONFIGS: dict[str, dict[str, list[str]]] = {
    "A_all_features": {
        "numeric": SENSOR_FEATURES + GEO_FEATURES,
        "categorical": CATEGORICAL_LOCATION_FEATURES,
    },
    "B_sensor_only": {
        "numeric": SENSOR_FEATURES,
        "categorical": [],
    },
}

MODEL_NAMES = ["random_forest", "decision_tree", "logistic_regression", "svm"]


# --------------------------------------------------------------------------- #
# Pydantic schemas (shared with backend)
# --------------------------------------------------------------------------- #
class SensorReadingInput(BaseModel):
    """One row of input to the baseline leak classifier."""

    Pressure: float = Field(..., ge=0, description="Pipeline pressure (unitless in dataset)")
    Flow_Rate: float = Field(..., ge=0, description="Flow rate (unitless in dataset)")
    Temperature: float = Field(..., description="Temperature (unitless in dataset)")
    Vibration: float = Field(..., ge=0)
    RPM: float = Field(..., ge=0)
    Operational_Hours: float = Field(..., ge=0)
    Latitude: float | None = Field(default=None, ge=-90, le=90)
    Longitude: float | None = Field(default=None, ge=-180, le=180)
    Zone: str | None = None
    Block: str | None = None
    Pipe: str | None = None
    Location_Code: str | None = None

    @field_validator("Zone")
    @classmethod
    def _zone(cls, v: str | None) -> str | None:
        if v is not None and v not in ZONES:
            raise ValueError(f"Zone must be one of {ZONES}")
        return v

    @field_validator("Block")
    @classmethod
    def _block(cls, v: str | None) -> str | None:
        if v is not None and v not in BLOCKS:
            raise ValueError(f"Block must be one of {BLOCKS}")
        return v

    @field_validator("Pipe")
    @classmethod
    def _pipe(cls, v: str | None) -> str | None:
        if v is not None and v not in PIPES:
            raise ValueError(f"Pipe must be one of {PIPES}")
        return v

    def with_location_code(self) -> "SensorReadingInput":
        """Derive Location_Code from Zone/Block/Pipe when not provided (dataset convention)."""
        if self.Location_Code is None and self.Zone and self.Block and self.Pipe:
            return self.model_copy(update={"Location_Code": f"{self.Zone}_{self.Block}_{self.Pipe}"})
        return self


class ModelMetadata(BaseModel):
    model_name: str
    version: str
    feature_config: str
    training_dataset: str
    training_dataset_sha256: str
    features: list[str]
    target: str
    training_timestamp: str
    n_train_rows: int
    n_test_rows: int
    evaluation_metrics: dict
    sklearn_version: str
    artifact_file: str
