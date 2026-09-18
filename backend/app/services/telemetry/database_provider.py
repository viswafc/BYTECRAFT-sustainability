from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from ...repositories import SensorReadingRepository, SensorRepository
from ...schemas.telemetry import SensorReadingResponse, TelemetrySummary
from .base import TelemetryProvider


class DatabaseTelemetryProvider(TelemetryProvider):
    """Reads persisted readings. In Phase 2 the sensor_readings table is empty by design —
    the provider reports that honestly instead of inventing values."""

    name = "database"

    def __init__(self, db: Session):
        self.readings = SensorReadingRepository(db)
        self.sensors = SensorRepository(db)

    def latest(self, sensor_id: int):
        r = self.readings.latest_for_sensor(sensor_id)
        return SensorReadingResponse.model_validate(r) if r else None

    def history(self, sensor_id: int, *, since=None, until=None, limit=500):
        return [SensorReadingResponse.model_validate(r)
                for r in self.readings.history(sensor_id, since=since, until=until, limit=limit)]

    def summary(self, plant_id=None) -> TelemetrySummary:
        counts = self.sensors.status_counts(plant_id)
        total = sum(counts.values())
        start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today = self.readings.count_since(start_of_day)
        last = self.readings.last_timestamp()
        return TelemetrySummary(
            provider=self.name,
            sensors_total=total,
            sensors_online=counts.get("online", 0),
            sensors_warning=counts.get("degraded", 0) + counts.get("maintenance", 0),
            readings_today=today,
            last_reading_at=last,
            note=None if last else "No telemetry has been ingested yet.",
        )

    def health(self):
        return "ONLINE", "database provider"
