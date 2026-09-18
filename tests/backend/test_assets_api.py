"""CRUD/read + schema tests against the migrated + seeded test DB."""


def test_plants_list_and_get(client):
    b = client.get("/api/plants").json()
    assert b["meta"]["count"] == 1
    p = b["data"][0]
    assert {"id", "code", "name", "location", "timezone", "status", "created_at", "updated_at"} <= set(p)
    assert p["code"] == "PLT-CBE-01" and p["timezone"] == "Asia/Kolkata"
    assert client.get(f"/api/plants/{p['id']}").json()["data"]["id"] == p["id"]


def test_plant_summary_counts(client):
    pid = client.get("/api/plants").json()["data"][0]["id"]
    s = client.get(f"/api/plants/{pid}/summary").json()["data"]
    assert (s["zones"], s["lines"], s["machines"], s["sensors"]) == (3, 4, 8, 20)
    assert s["active_incidents"] == 0
    assert s["sensors_by_status"] == {"unknown": 20}


def test_hierarchy_endpoints(client):
    pid = client.get("/api/plants").json()["data"][0]["id"]
    zones = client.get(f"/api/zones?plant_id={pid}").json()["data"]
    lines = client.get(f"/api/lines?plant_id={pid}").json()["data"]
    machines = client.get(f"/api/machines?plant_id={pid}").json()["data"]
    assert len(zones) == 3 and len(lines) == 4 and len(machines) == 8
    assert {l["name"] for l in lines} == {"Cooling Line A", "Process Water Line", "Production Line B", "Recovery Line"}
    zid = zones[0]["id"]
    assert all(l["zone_id"] == zid for l in client.get(f"/api/lines?zone_id={zid}").json()["data"])
    assert client.get(f"/api/zones/{zid}").json()["data"]["plant_id"] == pid


def test_sensors_filters_and_lookup(client):
    all_ = client.get("/api/sensors?limit=1000").json()["data"]
    assert len(all_) == 20
    assert {"sensor_code", "sensor_type", "unit", "status", "installed_at", "machine_id"} <= set(all_[0])
    pressure = client.get("/api/sensors?sensor_type=pressure").json()["data"]
    assert pressure and all(s["sensor_type"] == "pressure" for s in pressure)
    s06 = client.get("/api/sensors/by-code/S06").json()["data"]
    assert s06["sensor_code"] == "S06"
    assert client.get(f"/api/sensors/{s06['id']}").json()["data"]["sensor_code"] == "S06"


def test_not_found_uses_entity_code(client):
    r = client.get("/api/sensors/by-code/S99")
    assert r.status_code == 404
    assert r.json() == {"error": {"code": "SENSOR_NOT_FOUND", "message": "Sensor S99 was not found."}}
    assert client.get("/api/plants/999").json()["error"]["code"] == "PLANT_NOT_FOUND"
    assert client.get("/api/incidents/1").json()["error"]["code"] == "INCIDENT_NOT_FOUND"


def test_pagination(client):
    p1 = client.get("/api/sensors?limit=5&offset=0").json()
    p2 = client.get("/api/sensors?limit=5&offset=5").json()
    assert p1["meta"]["count"] == 5 and p1["meta"]["limit"] == 5 and p2["meta"]["offset"] == 5
    assert {s["id"] for s in p1["data"]}.isdisjoint({s["id"] for s in p2["data"]})


def test_telemetry_is_empty_not_fabricated(client):
    s = client.get("/api/telemetry/summary").json()
    d = s["data"]
    assert d["provider"] == "database" and s["meta"]["source"] == "database"
    assert d["sensors_total"] == 20 and d["readings_today"] == 0 and d["last_reading_at"] is None
    sid = client.get("/api/sensors/by-code/S01").json()["data"]["id"]
    assert client.get(f"/api/telemetry/sensors/{sid}/latest").json()["data"] is None
    assert client.get(f"/api/telemetry/sensors/{sid}/history").json()["data"] == []
    assert client.get("/api/telemetry/sensors/999999/latest").status_code == 404


def test_incidents_empty(client):
    b = client.get("/api/incidents?active_only=true").json()
    assert b["data"] == [] and b["meta"]["count"] == 0


def test_model_registry_mirrored_into_db(client, db_url):
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import Session
    from backend.app.models import ModelRegistryEntry
    with Session(create_engine(db_url)) as db:
        rows = list(db.scalars(select(ModelRegistryEntry)))
    api = client.get("/api/ml/models").json()["data"]
    assert len(rows) == len(api)
    if rows:
        assert sum(r.status == "active" for r in rows) == 1
        assert {"name", "version", "model_type", "status", "path", "metrics"} <= set(api[0])
