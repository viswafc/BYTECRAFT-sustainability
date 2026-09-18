"""Dataset availability / quality summary."""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from ml.preprocessing.pipeline import DatasetSchemaError, load_dataset
from ml.schemas import TARGET

from ..core.config import get_settings
from ..schemas.system import DataHealthResponse

log = logging.getLogger("aquarisk.data")


class DataService:
    def __init__(self, dataset_path: Path):
        self.dataset_path = dataset_path
        self._cache: DataHealthResponse | None = None

    def health(self, refresh: bool = False) -> DataHealthResponse:
        if self._cache and not refresh:
            return self._cache
        p = str(self.dataset_path)
        try:
            df = load_dataset(self.dataset_path)
        except FileNotFoundError as e:
            self._cache = DataHealthResponse(state="OFFLINE", dataset_path=p, detail=str(e), schema_valid=False)
            return self._cache
        except DatasetSchemaError as e:
            self._cache = DataHealthResponse(state="OFFLINE", dataset_path=p, detail=str(e), schema_valid=False)
            return self._cache
        missing = int(df.isnull().sum().sum())
        dups = int(df.duplicated().sum())
        self._cache = DataHealthResponse(
            state="ONLINE" if missing == 0 and dups == 0 else "DEGRADED",
            dataset_path=p, rows=int(len(df)), columns=int(df.shape[1]),
            missing_values=missing, duplicate_rows=dups,
            positive_rate=float(df[TARGET].mean()), schema_valid=True,
        )
        return self._cache


@lru_cache
def get_data_service() -> DataService:
    return DataService(get_settings().dataset_path)
