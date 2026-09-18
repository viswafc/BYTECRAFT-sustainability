import sys
import os

# Add root directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.domain import Plant, Zone, Line, Machine, Sensor

def seed_database():
    # Drop and recreate tables (for this phase, acting as our migrations)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Seed 1 Plant
        plant = Plant(name="Aqua Main Facility", code="AMF-01", location="Industrial Park")
        db.add(plant)
        db.commit()
        db.refresh(plant)
        
        # Seed 3 Zones
        z1 = Zone(plant_id=plant.id, name="North Wing", code="NW-01")
        z2 = Zone(plant_id=plant.id, name="South Wing", code="SW-01")
        z3 = Zone(plant_id=plant.id, name="Central Processing", code="CP-01")
        db.add_all([z1, z2, z3])
        db.commit()
        
        # Seed 4 Lines
        l1 = Line(zone_id=z1.id, name="Cooling Line A", code="L-CA")
        l2 = Line(zone_id=z2.id, name="Production Line B", code="L-PB")
        l3 = Line(zone_id=z3.id, name="Process Water Line", code="L-PW")
        l4 = Line(zone_id=z3.id, name="Recovery Line", code="L-RL")
        db.add_all([l1, l2, l3, l4])
        db.commit()
        
        # Seed 8 Machines (2 per line)
        machines = []
        for line in [l1, l2, l3, l4]:
            machines.append(Machine(line_id=line.id, name=f"{line.name} Pump 1", code=f"P1-{line.code}", machine_type="pump"))
            machines.append(Machine(line_id=line.id, name=f"{line.name} Valve A", code=f"VA-{line.code}", machine_type="valve"))
        db.add_all(machines)
        db.commit()
        
        # Seed 20 Sensors (Distributed across machines)
        sensors = []
        sensor_types = [("pressure", "psi"), ("flow", "gpm"), ("vibration", "mm/s"), ("temperature", "C")]
        
        for i in range(20):
            machine = machines[i % len(machines)]
            stype, unit = sensor_types[i % len(sensor_types)]
            sensors.append(Sensor(
                machine_id=machine.id,
                sensor_code=f"SENS-{machine.code}-{stype[:3].upper()}-{i+1}",
                sensor_type=stype,
                unit=unit
            ))
        db.add_all(sensors)
        db.commit()
        
        print("Database seeded successfully with infrastructure entities.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
