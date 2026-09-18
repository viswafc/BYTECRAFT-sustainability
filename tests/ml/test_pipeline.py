import pytest

from ml.evaluate import compute_metrics
from ml.inference import LeakPredictor
from ml.model_registry import ModelNotFoundError, ModelRegistry
from ml.preprocess import build_preprocessor, load_dataset, make_train_test_split, split_features_target
from ml.schemas import DEFAULT_ARTIFACT_DIR, FEATURE_CONFIGS, SensorReadingInput
from ml.train import build_pipeline, train_one


@pytest.fixture(scope="module")
def df():
    return load_dataset()


@pytest.mark.parametrize("cfg", list(FEATURE_CONFIGS))
def test_preprocessor_shapes(df, cfg):
    X, y = split_features_target(df, cfg)
    Xt = build_preprocessor(cfg).fit_transform(X)
    expected = len(FEATURE_CONFIGS[cfg]["numeric"]) + sum(df[c].nunique() for c in FEATURE_CONFIGS[cfg]["categorical"])
    assert Xt.shape == (5000, expected)
    assert len(y) == 5000


def test_split_is_stratified_and_deterministic(df):
    X, y = split_features_target(df, "B_sensor_only")
    _, X_test1, _, y_test1 = make_train_test_split(X, y)
    _, X_test2, _, y_test2 = make_train_test_split(X, y)
    assert list(X_test1.index) == list(X_test2.index)
    assert y_test1.sum() == 65 and len(y_test1) == 1000


def test_compute_metrics_basic():
    m = compute_metrics([0, 0, 1, 1], [0, 1, 1, 1], [0.1, 0.6, 0.8, 0.9])
    assert m["accuracy"] == 0.75 and m["recall"] == 1.0
    assert m["confusion_matrix"] == {"tn": 1, "fp": 1, "fn": 0, "tp": 2}
    assert 0 <= m["roc_auc"] <= 1 and m["pr_auc"] is not None


def test_compute_metrics_without_proba():
    m = compute_metrics([0, 1], [0, 1])
    assert m["roc_auc"] is None and "auc_note" in m


def test_train_one_writes_artifacts_and_metadata(df, tmp_path):
    from ml.schemas import DEFAULT_DATASET_PATH
    reg = ModelRegistry(tmp_path)
    meta = train_one(df, "B_sensor_only", "logistic_regression", DEFAULT_DATASET_PATH, reg)
    assert reg.model_path("B_sensor_only", "logistic_regression").exists()
    assert reg.meta_path("B_sensor_only", "logistic_regression").exists()
    assert meta.features == FEATURE_CONFIGS["B_sensor_only"]["numeric"]
    assert 0 < meta.evaluation_metrics["recall"] <= 1
    assert meta.n_train_rows == 4000 and meta.n_test_rows == 1000
    assert len(reg.list_models()) == 1


def test_pipeline_builds_for_all_models():
    for name in ["random_forest", "decision_tree", "logistic_regression", "svm"]:
        assert build_pipeline("A_all_features", name) is not None


def test_registry_missing_model_raises(tmp_path):
    with pytest.raises(ModelNotFoundError):
        ModelRegistry(tmp_path).load("nope", "nope")


@pytest.mark.skipif(not (DEFAULT_ARTIFACT_DIR / "registry.json").exists(), reason="run `python -m ml.train` first")
def test_default_model_loads_and_predicts():
    p = LeakPredictor.from_default()
    leak = SensorReadingInput(Pressure=45, Flow_Rate=100, Temperature=100, Vibration=3, RPM=2000, Operational_Hours=5000)
    normal = SensorReadingInput(Pressure=65, Flow_Rate=70, Temperature=100, Vibration=3, RPM=2000, Operational_Hours=5000)
    out = p.predict([leak, normal])
    assert out[0]["leak_predicted"] is True
    assert out[1]["leak_predicted"] is False
    assert 0 <= out[0]["leak_probability"] <= 1


def test_input_schema_validation():
    with pytest.raises(ValueError):
        SensorReadingInput(Pressure=-1, Flow_Rate=1, Temperature=1, Vibration=1, RPM=1, Operational_Hours=1)
    with pytest.raises(ValueError):
        SensorReadingInput(Pressure=1, Flow_Rate=1, Temperature=1, Vibration=1, RPM=1, Operational_Hours=1, Zone="Zone_9")
    r = SensorReadingInput(Pressure=1, Flow_Rate=1, Temperature=1, Vibration=1, RPM=1, Operational_Hours=1,
                           Zone="Zone_1", Block="Block_2", Pipe="Pipe_3").with_location_code()
    assert r.Location_Code == "Zone_1_Block_2_Pipe_3"
