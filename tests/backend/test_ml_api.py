import pytest

from ml.schemas import DEFAULT_ARTIFACT_DIR

HAS_MODELS = (DEFAULT_ARTIFACT_DIR / "registry.json").exists()
READING = {"Pressure": 45, "Flow_Rate": 100, "Temperature": 100, "Vibration": 3, "RPM": 2000, "Operational_Hours": 5000}


def test_ml_health_shape(client_nodb):
    d = client_nodb.get("/api/ml/health").json()["data"]
    assert {"state", "ready", "n_registered"} <= set(d)


@pytest.mark.skipif(not HAS_MODELS, reason="run `python -m ml.training.train` first")
def test_predict_default_model(client_nodb):
    r = client_nodb.post("/api/ml/predict", json={"readings": [READING]})
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["predictions"][0]["leak_predicted"] is True and "disclaimer" in d


def test_predict_unknown_model_is_model_not_ready(client_nodb):
    r = client_nodb.post("/api/ml/predict", json={"readings": [READING], "model_name": "nope/nope"})
    assert r.status_code == 503 and r.json()["error"]["code"] == "MODEL_NOT_READY"
    assert "/home/" not in r.text


def test_predict_bad_model_name_format(client_nodb):
    r = client_nodb.post("/api/ml/predict", json={"readings": [READING], "model_name": "nope"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "INVALID_INPUT"


def test_predict_validation(client_nodb):
    r = client_nodb.post("/api/ml/predict", json={"readings": [{"Pressure": -1}]})
    assert r.status_code == 422 and r.json()["error"]["code"] == "VALIDATION_ERROR"
    assert client_nodb.post("/api/ml/predict", json={"readings": []}).status_code == 422
