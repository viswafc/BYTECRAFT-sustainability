import os
import pytest
from ml.preprocess import load_and_preprocess_data
from ml.model_registry import load_model

def test_data_preprocessing():
    # Make sure it can load a small chunk or handle missing file gracefully if not available
    # For CI, we might mock this, but here we assume the dataset is available locally
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "location_aware_gis_leakage_dataset.csv")
    if os.path.exists(data_path):
        X, y, feature_names = load_and_preprocess_data(data_path, drop_location=True)
        assert len(X) > 0
        assert len(y) > 0
        assert "Leakage_Flag" not in X.columns
        assert "Latitude" not in X.columns
    else:
        pytest.skip("Dataset not available for testing")

def test_model_loading():
    # Check if the trained model can be loaded
    try:
        model = load_model("RandomForest_LeakDetection", "v1")
        assert model is not None
    except FileNotFoundError:
        pytest.skip("Model artifacts not generated yet")
