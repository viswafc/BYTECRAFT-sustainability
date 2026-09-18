import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
import joblib
import os

class BaselineV0:
    """
    A simple historical contextual median estimator.
    """
    def __init__(self):
        self.lookup_table = None
        
    def fit(self, df: pd.DataFrame):
        # We group by hour_of_day and a binned production_level to find median flow
        df = df.copy()
        if 'timestamp' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        if 'hour_of_day' not in df.columns and 'timestamp' in df.columns:
            df['hour_of_day'] = df['timestamp'].dt.hour
            
        df['prod_bin'] = pd.cut(df['production_level'], bins=[-1, 0.1, 0.5, 0.9, 1.1], labels=['off', 'low', 'med', 'high'])
        self.lookup_table = df.groupby(['sensor_id', 'hour_of_day', 'prod_bin'])['value'].median().reset_index()
        
    def predict(self, df: pd.DataFrame):
        df = df.copy()
        if 'timestamp' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        if 'hour_of_day' not in df.columns and 'timestamp' in df.columns:
            df['hour_of_day'] = df['timestamp'].dt.hour
            
        df['prod_bin'] = pd.cut(df['production_level'], bins=[-1, 0.1, 0.5, 0.9, 1.1], labels=['off', 'low', 'med', 'high'])
        merged = pd.merge(df, self.lookup_table, on=['sensor_id', 'hour_of_day', 'prod_bin'], how='left', suffixes=('', '_pred'))
        
        # Fallback to overall median if context missing
        overall_median = self.lookup_table['value'].median()
        preds = merged['value_pred'].fillna(overall_median).values
        return preds

class MLBaseline:
    """
    HistGradientBoostingRegressor capable of learning complex non-linear contextual patterns.
    """
    def __init__(self):
        self.models = {} # One model per sensor to isolate spatial differences
        
    def fit(self, df: pd.DataFrame, features: list):
        sensors = df['sensor_id'].unique()
        for sensor in sensors:
            sensor_data = df[df['sensor_id'] == sensor]
            X = sensor_data[features]
            y = sensor_data['value']
            
            model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
            model.fit(X, y)
            self.models[sensor] = model
            
    def predict(self, df: pd.DataFrame, features: list):
        preds = np.zeros(len(df))
        for sensor, model in self.models.items():
            mask = df['sensor_id'] == sensor
            if mask.sum() > 0:
                X = df.loc[mask, features]
                preds[mask] = model.predict(X)
        return preds
        
    def save(self, path: str):
        joblib.dump(self.models, path)
        
    def load(self, path: str):
        if os.path.exists(path):
            self.models = joblib.load(path)
        else:
            raise FileNotFoundError(f"Model not found at {path}")
