"""TelemetryProvider — the seam that lets later phases swap DB / simulator / IoT sources
without touching the API or the frontend.

                TelemetryProvider
                 ┌──────┼──────────┐
                 ↓      ↓          ↓
          DatabaseTP  SimulatorTP  IoTTP
                      (Phase 3)   (later)
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from ...schemas.telemetry import SensorReadingResponse, TelemetrySummary


class TelemetryProvider(ABC):
    name: str = "abstract"

    @abstractmethod
    def latest(self, sensor_id: int) -> SensorReadingResponse | None: ...

    @abstractmethod
    def history(self, sensor_id: int, *, since: datetime | None = None,
                until: datetime | None = None, limit: int = 500) -> list[SensorReadingResponse]: ...

    @abstractmethod
    def summary(self, plant_id: int | None = None) -> TelemetrySummary: ...

    def health(self) -> tuple[str, str]:
        """(state, detail) with state in ONLINE|DEGRADED|OFFLINE|UNKNOWN."""
        return "UNKNOWN", "provider does not report health"
