import pandas as pd
import numpy as np
import json
import os
import time
from backend.app.ml.baseline.features import engineer_baseline_features
from backend.app.ml.baseline.baseline import BaselineV0, MLBaseline
from sklearn.metrics import mean_absolute_error, mean_squared_error

def evaluate_baseline():
    print("Loading datasets...")
    train_df = pd.read_csv("data/training/train.csv")
    test_df = pd.read_csv("data/testing/test.csv")
    
    # Strictly filter training data to normal operation to learn the baseline!
    normal_mask = train_df['event_type'].isin(['NORMAL_OPERATION', 'NORMAL_PRODUCTION_VARIATION'])
    train_normal = train_df[normal_mask].copy()
    
    # Feature Engineering (Drops leakage columns in training)
    print("Engineering features...")
    X_train = engineer_baseline_features(train_normal, is_training=True)
    
    # We apply inference mode feature engineering to test data 
    # to prove the model can run blind.
    X_test_feats = engineer_baseline_features(test_df, is_training=False)
    # Reattach sensor_id for grouping in the model classes
    X_test_feats['sensor_id'] = test_df['sensor_id'] 
    
    features = [c for c in X_test_feats.columns if c != 'sensor_id']
    
    results = {}
    
    # V0
    print("Training V0 Baseline...")
    v0 = BaselineV0()
    t0 = time.time()
    v0.fit(train_normal) # V0 needs the original df for its manual grouping
    v0_train_time = time.time() - t0
    
    t0 = time.time()
    v0_preds = v0.predict(test_df)
    v0_inf_time = time.time() - t0
    
    # V1 (MLBaseline)
    print("Training ML Baseline...")
    ml = MLBaseline()
    t0 = time.time()
    ml.fit(X_train, features)
    ml_train_time = time.time() - t0
    
    t0 = time.time()
    ml_preds = ml.predict(X_test_feats, features)
    ml_inf_time = time.time() - t0
    
    # Calculate metrics on test data
    y_true = test_df['value'].values
    
    def calc_metrics(y_t, y_p):
        return {
            "MAE": float(mean_absolute_error(y_t, y_p)),
            "RMSE": float(np.sqrt(mean_squared_error(y_t, y_p)))
        }
        
    v0_metrics = calc_metrics(y_true, v0_preds)
    ml_metrics = calc_metrics(y_true, ml_preds)
    
    # We want to know how it performs purely on normal data vs anomalous data
    normal_test_mask = test_df['event_type'].isin(['NORMAL_OPERATION', 'NORMAL_PRODUCTION_VARIATION'])
    y_true_normal = y_true[normal_test_mask]
    
    ml_normal_metrics = calc_metrics(y_true_normal, ml_preds[normal_test_mask])
    
    comparison = {
        "V0_Historical": {
            "metrics_all": v0_metrics,
            "train_time_sec": v0_train_time,
            "inference_time_sec": v0_inf_time,
            "strengths": "Extremely fast, totally interpretable",
            "limitations": "Cannot extrapolate outside seen bins, coarse.",
            "selected": False
        },
        "V1_HistGradientBoosting": {
            "metrics_all": ml_metrics,
            "metrics_normal_only": ml_normal_metrics,
            "train_time_sec": ml_train_time,
            "inference_time_sec": ml_inf_time,
            "strengths": "Handles complex non-linear contextual patterns natively, very fast inference",
            "limitations": "Black box decision paths",
            "selected": True
        }
    }
    
    os.makedirs("reports/baseline", exist_ok=True)
    with open("reports/baseline/model_comparison.json", "w") as f:
        json.dump(comparison, f, indent=4)
        
    with open("reports/baseline/model_comparison.md", "w") as f:
        f.write("# Baseline Model Comparison\n\n")
        for name, data in comparison.items():
            f.write(f"## {name}\n")
            f.write(f"- **Selected**: {data['selected']}\n")
            f.write(f"- **MAE (All Test Data)**: {data['metrics_all']['MAE']:.2f}\n")
            f.write(f"- **RMSE (All Test Data)**: {data['metrics_all']['RMSE']:.2f}\n")
            if "metrics_normal_only" in data:
                f.write(f"- **MAE (Normal Test Data Only)**: {data['metrics_normal_only']['MAE']:.2f}\n")
            f.write(f"- **Train Time**: {data['train_time_sec']:.4f}s\n")
            f.write(f"- **Inference Time**: {data['inference_time_sec']:.4f}s\n")
            f.write(f"- **Strengths**: {data['strengths']}\n")
            f.write(f"- **Limitations**: {data['limitations']}\n\n")
            
    # Save the selected model
    os.makedirs("backend/app/ml/baseline/models", exist_ok=True)
    ml.save("backend/app/ml/baseline/models/baseline_v1.joblib")
    print("Evaluation complete. Model saved.")
    
if __name__ == "__main__":
    evaluate_baseline()
