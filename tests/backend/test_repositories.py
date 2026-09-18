"""Repository layer against the test DB (no HTTP)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.repositories import IncidentRepository, PlantRepository, SensorReadingRepository, SensorRepository


def test_repositories(db_url):
    with Session(create_engine(db_url)) as db:
        plants = PlantRepository(db)
        p = plants.get_by_code("PLT-CBE-01")
        assert p is not None and plants.count() == 1
        sensors = SensorRepository(db)
        assert len(sensors.list_filtered(plant_id=p.id, limit=100)) == 20
        assert sensors.status_counts(p.id) == {"unknown": 20}
        assert sensors.get_by_code("S01").sensor_type == "pressure"
        assert IncidentRepository(db).count_active(p.id) == 0
        rr = SensorReadingRepository(db)
        assert rr.latest_for_sensor(sensors.get_by_code("S01").id) is None and rr.last_timestamp() is None
