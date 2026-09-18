import pandas as pd
import numpy as np

def engineer_baseline_features(df: pd.DataFrame, is_training: bool = False) -> pd.DataFrame:
    """
    Constructs the contextual features required to estimate expected water flow.
    We explicitly drop 'event_type', 'leakage_status', and 'expected_value'
    to prevent target leakage.
    """
    df = df.copy()
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    # Extract time components
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    # Categorical encodings (One-Hot)
    # We expect 'shift' (SHIFT_1, SHIFT_2, etc) and 'machine_status' (ACTIVE, IDLE, MAINTENANCE)
    df = pd.get_dummies(df, columns=['shift', 'machine_status'], drop_first=False)
    
    # Ensure standard categorical columns exist (in case of inference single-row where dummy drops some)
    expected_cols = [
        'shift_SHIFT_1', 'shift_SHIFT_2', 'shift_SHIFT_3',
        'machine_status_ACTIVE', 'machine_status_IDLE', 'machine_status_MAINTENANCE'
    ]
    for c in expected_cols:
        if c not in df.columns:
            df[c] = False
            
    # For training, we need the target. For inference, we might not.
    features = [
        'production_level', 'hour_of_day', 'day_of_week'
    ] + expected_cols
    
    if is_training:
        # Strictly enforce blinding
        drop_cols = ['event_type', 'leakage_status', 'expected_value', 'deviation_pct']
        for c in drop_cols:
            if c in df.columns:
                df = df.drop(columns=[c])
                
        # Return features + target
        return df[features + ['value', 'sensor_id']]
        
    return df[features]
