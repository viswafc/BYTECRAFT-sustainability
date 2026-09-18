from ml.schemas import DEFAULT_ARTIFACT_DIR

HAS_MODELS = (DEFAULT_ARTIFACT_DIR / "registry.json").exists()


def test_health_root_and_api(client_nodb):
    for u in ("/health", "/api/health"):
        r = client_nodb.get(u)
        assert r.status_code == 200 and r.json() == {"status": "healthy", "version": "0.1.0"}


def test_version_envelope(client_nodb):
    b = client_nodb.get("/api/version").json()
    assert set(b) == {"data", "meta"}
    assert b["data"]["phase"] == "2" and b["meta"]["version"] == "0.1.0" and "timestamp" in b["meta"]


def test_system_status_without_db_is_degraded_not_error(client_nodb):
    r = client_nodb.get("/api/system/status")
    assert r.status_code == 200
    d = r.json()["data"]
    comps = {c["name"]: c["state"] for c in d["components"]}
    assert set(comps) == {"backend", "database", "ml", "websocket", "telemetry", "dataset"}
    assert comps["backend"] == "ONLINE" and comps["database"] == "UNKNOWN" and comps["websocket"] == "ONLINE"
    assert d["state"] == "DEGRADED"
    assert all(c["state"] in {"ONLINE", "DEGRADED", "OFFLINE", "UNKNOWN"} for c in d["components"])


def test_system_status_with_db_online(client):
    d = client.get("/api/system/status").json()["data"]
    comps = {c["name"]: c["state"] for c in d["components"]}
    assert comps["database"] == "ONLINE" and comps["telemetry"] == "ONLINE"
    if HAS_MODELS:
        assert comps["ml"] == "ONLINE" and d["state"] == "ONLINE"


def test_data_health(client_nodb):
    d = client_nodb.get("/api/data/health").json()["data"]
    assert d["rows"] == 5000 and d["schema_valid"] is True and d["state"] == "ONLINE"


def test_request_id_and_structured_error_shape(client_nodb):
    r = client_nodb.get("/api/plants/1", headers={"x-request-id": "abc123"})
    assert r.headers["x-request-id"] == "abc123"
    assert r.status_code == 503
    assert r.json() == {"error": {"code": "DATABASE_UNAVAILABLE", "message": "Database is not configured (DATABASE_URL is unset)."}}


def test_validation_error_shape(client_nodb):
    r = client_nodb.get("/api/plants?limit=0")
    assert r.status_code == 422
    b = r.json()["error"]
    assert b["code"] == "VALIDATION_ERROR" and isinstance(b["details"], list)
    assert "Traceback" not in r.text


def test_websocket_system_channel(client_nodb):
    with client_nodb.websocket_connect("/api/ws/system") as ws:
        first = ws.receive_json()
        assert first["type"] == "connected" and first["channel"] == "system"
        ws.send_text("ping")
        # pong or heartbeat may arrive first depending on timing; accept both then require a pong
        seen = {ws.receive_json()["type"], ws.receive_json()["type"]}
        assert "pong" in seen


def test_websocket_sensors_channel_connects(client_nodb):
    with client_nodb.websocket_connect("/api/ws/sensors") as ws:
        assert ws.receive_json()["type"] == "connected"
