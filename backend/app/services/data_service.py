"""Dataset availability / quality summary."""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from ml.preprocess import DatasetSchemaError, load_dataset
from ml.schemas import TARGET

from ..config import get_settings
from ..schemas.common import ComponentStatus, DataHealthResponse

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
            self._cache = DataHealthResponse(status="error", dataset_path=p, detail=str(e), schema_valid=False)
            return self._cache
        except DatasetSchemaError as e:
            self._cache = DataHealthResponse(status="error", dataset_path=p, detail=str(e), schema_valid=False)
            return self._cache
        missing = int(df.isnull().sum().sum())
        dups = int(df.duplicated().sum())
        self._cache = DataHealthResponse(
            status="ok" if missing == 0 and dups == 0 else "degraded",
            dataset_path=p, rows=int(len(df)), columns=int(df.shape[1]),
            missing_values=missing, duplicate_rows=dups,
            positive_rate=float(df[TARGET].mean()), schema_valid=True,
        )
        return self._cache

    def status(self) -> ComponentStatus:
        h = self.health()
        return ComponentStatus(
            name="dataset", status=h.status, detail=h.detail or f"{h.rows} rows x {h.columns} cols",
            info={"positive_rate": h.positive_rate, "path": h.dataset_path},
        )


@lru_cache
def get_data_service() -> DataService:
    return DataService(get_settings().dataset_path)
