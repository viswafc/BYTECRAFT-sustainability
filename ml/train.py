import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from datetime import datetime

from .preprocess import load_and_preprocess_data
from .model_registry import save_model
from .schemas import ModelMetadata

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "location_aware_gis_leakage_dataset.csv")

def train():
    print("Loading data...")
    X, y, feature_names = load_and_preprocess_data(DATA_PATH, drop_location=True)
    
    print("Training Random Forest...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    print("Evaluating...")
    acc = model.score(X_test, y_test)
    print(f"Accuracy: {acc:.4f}")
    
    metadata = ModelMetadata(
        model_name="RandomForest_LeakDetection",
        version="v1",
        training_dataset="location_aware_gis_leakage_dataset.csv",
        features=feature_names,
        target="Leakage_Flag",
        training_timestamp=datetime.now(),
        evaluation_metrics={"Accuracy": acc}
    )
    
    print("Saving model artifacts...")
    save_model(model, metadata)
    print("Training complete.")

if __name__ == "__main__":
    train()
