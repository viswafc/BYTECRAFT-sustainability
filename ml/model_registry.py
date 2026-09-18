import joblib
import json
import os
from .schemas import ModelMetadata

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

def save_model(model, metadata: ModelMetadata):
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    # Save the pickle file
    model_path = os.path.join(ARTIFACTS_DIR, f"{metadata.model_name}_{metadata.version}.pkl")
    joblib.dump(model, model_path)
    
    # Save the metadata
    meta_path = os.path.join(ARTIFACTS_DIR, f"{metadata.model_name}_{metadata.version}_meta.json")
    with open(meta_path, "w") as f:
        f.write(metadata.model_dump_json(indent=4))
        
    return model_path

def load_model(model_name: str, version: str = "v1"):
    model_path = os.path.join(ARTIFACTS_DIR, f"{model_name}_{version}.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model {model_name} version {version} not found in {ARTIFACTS_DIR}")
    return joblib.load(model_path)
