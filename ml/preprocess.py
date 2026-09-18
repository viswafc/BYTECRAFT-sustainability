"""Dataset loading, validation and preprocessing for the baseline classifier."""
from __future__ import annotations

import hashlib
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.schemas import (
    DEFAULT_DATASET_PATH,
    FEATURE_CONFIGS,
    RAW_COLUMNS,
    TARGET,
)


class DatasetSchemaError(ValueError):
    """Raised when the CSV does not match the expected baseline schema."""


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_dataset(df: pd.DataFrame, require_target: bool = True) -> None:
    expected = RAW_COLUMNS if require_target else [c for c in RAW_COLUMNS if c != TARGET]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise DatasetSchemaError(f"Dataset is missing required columns: {missing}")
    if require_target:
        bad = set(df[TARGET].dropna().unique()) - {0, 1}
        if bad:
            raise DatasetSchemaError(f"{TARGET} must be binary 0/1, found extra values: {sorted(bad)}")
    if len(df) == 0:
        raise DatasetSchemaError("Dataset is empty")


def load_dataset(path: str | Path = DEFAULT_DATASET_PATH, require_target: bool = True) -> pd.DataFrame:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")
    df = pd.read_csv(path)
    validate_dataset(df, require_target=require_target)
    return df


def split_features_target(df: pd.DataFrame, feature_config: str) -> tuple[pd.DataFrame, pd.Series]:
    cfg = FEATURE_CONFIGS[feature_config]
    cols = cfg["numeric"] + cfg["categorical"]
    return df[cols].copy(), df[TARGET].astype(int)


def make_train_test_split(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42
):
    # Identical protocol to the legacy notebook: 80/20 stratified, seed 42.
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)


def build_preprocessor(feature_config: str) -> ColumnTransformer:
    cfg = FEATURE_CONFIGS[feature_config]
    transformers = [("num", StandardScaler(), cfg["numeric"])]
    if cfg["categorical"]:
        transformers.append(
            ("cat", OneHotEncoder(handle_unknown="ignore"), cfg["categorical"])
        )
    return ColumnTransformer(transformers=transformers)


def feature_columns(feature_config: str) -> list[str]:
    cfg = FEATURE_CONFIGS[feature_config]
    return cfg["numeric"] + cfg["categorical"]
