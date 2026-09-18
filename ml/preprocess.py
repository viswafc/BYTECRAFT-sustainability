import pandas as pd
from typing import Tuple, List

def load_and_preprocess_data(data_path: str, drop_location: bool = True) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    df = pd.read_csv(data_path)
    
    # Target
    y = df["Leakage_Flag"]
    
    # Features
    X = df.drop("Leakage_Flag", axis=1)
    
    if drop_location:
        # Drop identifiers that could cause data leakage
        location_cols = ["Zone", "Block", "Pipe", "Location_Code", "Latitude", "Longitude"]
        X = X.drop([c for c in location_cols if c in X.columns], axis=1)
        
    return X, y, list(X.columns)
