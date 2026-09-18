from __future__ import annotations

from sqlalchemy import func, select

from ..models import Line, Machine, Plant, Sensor, Zone
from .base import Repository


class PlantRepository(Repository[Plant]):
    model = Plant

    def get_by_code(self, code: str) -> Plant | None:
        return self.db.scalar(select(Plant).where(Plant.code == code))


class ZoneRepository(Repository[Zone]):
    model = Zone


class LineRepository(Repository[Line]):
    model = Line

    def list_for_plant(self, plant_id: int, limit: int = 100, offset: int = 0) -> list[Line]:
        stmt = select(Line).join(Zone).where(Zone.plant_id == plant_id).order_by(Line.id).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))


class MachineRepository(Repository[Machine]):
    model = Machine

    def list_for_plant(self, plant_id: int, limit: int = 100, offset: int = 0) -> list[Machine]:
        stmt = (select(Machine).join(Line).join(Zone).where(Zone.plant_id == plant_id)
                .order_by(Machine.id).limit(limit).offset(offset))
        return list(self.db.scalars(stmt))


class SensorRepository(Repository[Sensor]):
    model = Sensor

    def get_by_code(self, code: str) -> Sensor | None:
        return self.db.scalar(select(Sensor).where(Sensor.sensor_code == code))

    def _plant_stmt(self, plant_id: int | None):
        stmt = select(Sensor)
        if plant_id is not None:
            stmt = stmt.join(Machine).join(Line).join(Zone).where(Zone.plant_id == plant_id)
        return stmt

    def list_filtered(self, *, plant_id: int | None = None, machine_id: int | None = None,
                      sensor_type: str | None = None, status: str | None = None,
                      limit: int = 100, offset: int = 0) -> list[Sensor]:
        stmt = self._plant_stmt(plant_id)
        if machine_id is not None:
            stmt = stmt.where(Sensor.machine_id == machine_id)
        if sensor_type:
            stmt = stmt.where(Sensor.sensor_type == sensor_type)
        if status:
            stmt = stmt.where(Sensor.status == status)
        return list(self.db.scalars(stmt.order_by(Sensor.id).limit(limit).offset(offset)))

    def status_counts(self, plant_id: int | None = None) -> dict[str, int]:
        stmt = select(Sensor.status, func.count(Sensor.id))
        if plant_id is not None:
            stmt = stmt.join(Machine).join(Line).join(Zone).where(Zone.plant_id == plant_id)
        return {s: int(c) for s, c in self.db.execute(stmt.group_by(Sensor.status))}
