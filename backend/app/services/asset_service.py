"""Asset (plant → sensor) read services. API → schema → service → repository → DB."""
from __future__ import annotations

from sqlalchemy.orm import Session

from ..core.errors import NotFoundError
from ..repositories import (IncidentRepository, LineRepository, MachineRepository, PlantRepository,
                            SensorRepository, ZoneRepository)
from ..schemas.assets import (LineResponse, MachineResponse, PlantResponse, PlantSummary, SensorResponse,
                              ZoneResponse)


class AssetService:
    def __init__(self, db: Session):
        self.db = db
        self.plants = PlantRepository(db)
        self.zones = ZoneRepository(db)
        self.lines = LineRepository(db)
        self.machines = MachineRepository(db)
        self.sensors = SensorRepository(db)
        self.incidents = IncidentRepository(db)

    # plants
    def list_plants(self, limit: int, offset: int, status: str | None = None) -> list[PlantResponse]:
        return [PlantResponse.model_validate(p) for p in self.plants.list(limit=limit, offset=offset, status=status)]

    def get_plant(self, plant_id: int) -> PlantResponse:
        p = self.plants.get(plant_id)
        if not p:
            raise NotFoundError("Plant", plant_id)
        return PlantResponse.model_validate(p)

    def plant_summary(self, plant_id: int) -> PlantSummary:
        plant = self.get_plant(plant_id)
        return PlantSummary(
            plant=plant,
            zones=self.zones.count(plant_id=plant_id),
            lines=len(self.lines.list_for_plant(plant_id, limit=10_000)),
            machines=len(self.machines.list_for_plant(plant_id, limit=10_000)),
            sensors=len(self.sensors.list_filtered(plant_id=plant_id, limit=10_000)),
            sensors_by_status=self.sensors.status_counts(plant_id),
            active_incidents=self.incidents.count_active(plant_id),
        )

    # zones / lines / machines
    def list_zones(self, limit, offset, plant_id=None):
        return [ZoneResponse.model_validate(z) for z in self.zones.list(limit=limit, offset=offset, plant_id=plant_id)]

    def get_zone(self, zone_id: int):
        z = self.zones.get(zone_id)
        if not z:
            raise NotFoundError("Zone", zone_id)
        return ZoneResponse.model_validate(z)

    def list_lines(self, limit, offset, zone_id=None, plant_id=None):
        rows = (self.lines.list_for_plant(plant_id, limit, offset) if plant_id is not None
                else self.lines.list(limit=limit, offset=offset, zone_id=zone_id))
        return [LineResponse.model_validate(r) for r in rows]

    def get_line(self, line_id: int):
        r = self.lines.get(line_id)
        if not r:
            raise NotFoundError("Line", line_id)
        return LineResponse.model_validate(r)

    def list_machines(self, limit, offset, line_id=None, plant_id=None):
        rows = (self.machines.list_for_plant(plant_id, limit, offset) if plant_id is not None
                else self.machines.list(limit=limit, offset=offset, line_id=line_id))
        return [MachineResponse.model_validate(r) for r in rows]

    def get_machine(self, machine_id: int):
        r = self.machines.get(machine_id)
        if not r:
            raise NotFoundError("Machine", machine_id)
        return MachineResponse.model_validate(r)

    # sensors
    def list_sensors(self, limit, offset, **filters):
        return [SensorResponse.model_validate(s) for s in self.sensors.list_filtered(limit=limit, offset=offset, **filters)]

    def get_sensor(self, sensor_id: int):
        s = self.sensors.get(sensor_id)
        if not s:
            raise NotFoundError("Sensor", sensor_id)
        return SensorResponse.model_validate(s)

    def get_sensor_by_code(self, code: str):
        s = self.sensors.get_by_code(code)
        if not s:
            raise NotFoundError("Sensor", code)
        return SensorResponse.model_validate(s)
