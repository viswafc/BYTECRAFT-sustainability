from __future__ import annotations

from ...schemas.telemetry import TelemetrySummary
from .base import TelemetryProvider


class NullTelemetryProvider(TelemetryProvider):
    """Used when no database is configured. Returns empty results, never fabricated data."""

    name = "none"

    def latest(self, sensor_id):
        return None

    def history(self, sensor_id, *, since=None, until=None, limit=500):
        return []

    def summary(self, plant_id=None):
        return TelemetrySummary(provider=self.name, sensors_total=0, sensors_online=0, sensors_warning=0,
                                readings_today=0, last_reading_at=None,
                                note="No telemetry source configured.")

    def health(self):
        return "OFFLINE", "no telemetry provider configured"
