import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from ml.schemas import DEFAULT_ARTIFACT_DIR

client = TestClient(app)
HAS_MODELS = (DEFAULT_ARTIFACT_DIR / "registry.json").exists()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "healthy", "version": "0.1.0"}


def test_version():
    r = client.get("/api/version")
    assert r.status_code == 200
    body = r.json()
    assert body["version"] == "0.1.0" and body["api_version"] == "v1" and body["name"] == "AquaRisk AI"


def test_system_status_shape():
    r = client.get("/api/system/status")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in {"ok", "degraded", "error", "unknown"}
    names = {c["name"] for c in body["components"]}
    assert names == {"dataset", "model", "database"}
    ds = next(c for c in body["components"] if c["name"] == "dataset")
    assert ds["status"] == "ok"


def test_data_health():
    r = client.get("/api/data/health")
    assert r.status_code == 200
    b = r.json()
    assert b["rows"] == 5000 and b["schema_valid"] is True


def test_predict_validation_error_is_structured():
    r = client.post("/api/predict", json={"readings": [{"Pressure": -5}]})
    assert r.status_code == 422
    b = r.json()
    assert b["error"]["code"] == "validation_error"
    assert isinstance(b["error"]["details"], list)
    assert "Traceback" not in r.text


def test_predict_empty_readings_rejected():
    assert client.post("/api/predict", json={"readings": []}).status_code == 422


def test_unknown_model_returns_503_without_paths():
    r = client.post("/api/predict", json={
        "readings": [{"Pressure": 1, "Flow_Rate": 1, "Temperature": 1, "Vibration": 1, "RPM": 1, "Operational_Hours": 1}],
        "feature_config": "nope", "model_name": "nope"})
    assert r.status_code == 503
    assert r.json()["error"]["code"] == "model_unavailable"
    assert "/home/" not in r.text


def test_request_id_header():
    r = client.get("/health", headers={"x-request-id": "abc123"})
    assert r.headers["x-request-id"] == "abc123"


@pytest.mark.skipif(not HAS_MODELS, reason="run `python -m ml.train` first")
def test_models_and_predict():
    r = client.get("/api/models")
    assert r.status_code == 200
    assert r.json()["default"] is not None and len(r.json()["models"]) >= 1
    r = client.post("/api/predict", json={"readings": [
        {"Pressure": 45, "Flow_Rate": 100, "Temperature": 100, "Vibration": 3, "RPM": 2000, "Operational_Hours": 5000}]})
    assert r.status_code == 200
    p = r.json()["predictions"][0]
    assert p["leak_predicted"] is True and 0 <= p["leak_probability"] <= 1


@pytest.mark.skipif(not HAS_MODELS, reason="run `python -m ml.train` first")
def test_predict_missing_location_features_for_config_a():
    r = client.post("/api/predict", json={
        "readings": [{"Pressure": 45, "Flow_Rate": 100, "Temperature": 100, "Vibration": 3, "RPM": 2000, "Operational_Hours": 5000}],
        "feature_config": "A_all_features", "model_name": "random_forest"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "invalid_input"
