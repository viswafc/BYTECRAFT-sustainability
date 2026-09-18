from __future__ import annotations

from datetime import datetime

from sqlalchemy import func, select

from ..models import SensorReading
from .base import Repository


class SensorReadingRepository(Repository[SensorReading]):
    model = SensorReading

    def latest_for_sensor(self, sensor_id: int) -> SensorReading | None:
        stmt = (select(SensorReading).where(SensorReading.sensor_id == sensor_id)
                .order_by(SensorReading.timestamp.desc()).limit(1))
        return self.db.scalar(stmt)

    def history(self, sensor_id: int, *, since: datetime | None = None, until: datetime | None = None,
                limit: int = 500) -> list[SensorReading]:
        stmt = select(SensorReading).where(SensorReading.sensor_id == sensor_id)
        if since:
            stmt = stmt.where(SensorReading.timestamp >= since)
        if until:
            stmt = stmt.where(SensorReading.timestamp <= until)
        return list(self.db.scalars(stmt.order_by(SensorReading.timestamp.desc()).limit(limit)))

    def count_since(self, since: datetime) -> int:
        return int(self.db.scalar(select(func.count()).select_from(SensorReading)
                                  .where(SensorReading.timestamp >= since)) or 0)

    def last_timestamp(self) -> datetime | None:
        return self.db.scalar(select(func.max(SensorReading.timestamp)))
