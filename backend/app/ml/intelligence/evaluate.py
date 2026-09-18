import pandas as pd
import numpy as np
import json
import os
import time
from backend.app.ml.intelligence.features import engineer_intelligence_features
from backend.app.ml.intelligence.anomaly_detector import AnomalyDetector
from backend.app.ml.intelligence.classifier import EventClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

def evaluate_intelligence():
    print("Loading datasets...")
    train_df = pd.read_csv("data/training/train.csv")
    test_df = pd.read_csv("data/testing/test.csv")
    
    print("Engineering features...")
    # Features requires the outputs from Phase 4. We will use the simulator's true expected_value and deviation_pct 
    # to avoid compounding training error, as approved in the plan.
    train_features = engineer_intelligence_features(train_df, is_training=True)
    test_features = engineer_intelligence_features(test_df, is_training=True)
    
    # Isolate training features
    X_train = train_features.drop(columns=['event_type'])
    y_train = train_features['event_type']
    
    X_test = test_features.drop(columns=['event_type'])
    y_test = test_features['event_type']
    
    # 1. Anomaly Detector
    print("Training Anomaly Detector (Isolation Forest)...")
    # Train only on NORMAL data
    normal_mask = y_train.isin(['NORMAL_OPERATION', 'NORMAL_PRODUCTION_VARIATION', 'MAINTENANCE_EVENT'])
    X_train_normal = X_train[normal_mask]
    
    ad = AnomalyDetector()
    t0 = time.time()
    ad.fit(X_train_normal)
    ad_train_time = time.time() - t0
    
    t0 = time.time()
    ad_preds = ad.predict(X_test)
    ad_inf_time = time.time() - t0
    
    # 2. Multi-Class Classifier
    print("Training Event Classifier (HistGradientBoosting)...")
    clf = EventClassifier()
    t0 = time.time()
    clf.fit(X_train, y_train)
    clf_train_time = time.time() - t0
    
    t0 = time.time()
    y_pred = clf.predict(X_test)
    clf_inf_time = time.time() - t0
    
    # Metrics
    acc = accuracy_score(y_test, y_pred)
    p, r, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro', zero_division=0)
    
    # Per-class metrics
    p_class, r_class, f1_class, support = precision_recall_fscore_support(y_test, y_pred, labels=clf.classes_, zero_division=0)
    per_class = {}
    for i, cls in enumerate(clf.classes_):
        per_class[cls] = {
            "precision": float(p_class[i]),
            "recall": float(r_class[i]),
            "f1": float(f1_class[i]),
            "support": int(support[i])
        }
        
    comparison = {
        "HistGradientBoostingClassifier": {
            "accuracy": float(acc),
            "macro_precision": float(p),
            "macro_recall": float(r),
            "macro_f1": float(f1),
            "train_time_sec": clf_train_time,
            "inference_time_sec": clf_inf_time,
            "per_class": per_class,
            "selected": True
        }
    }
    
    os.makedirs("reports/intelligence", exist_ok=True)
    with open("reports/intelligence/model_comparison.json", "w") as f:
        json.dump(comparison, f, indent=4)
        
    with open("reports/intelligence/model_comparison.md", "w") as f:
        f.write("# Intelligence Model Evaluation\n\n")
        f.write(f"- **Accuracy**: {acc:.4f}\n")
        f.write(f"- **Macro F1**: {f1:.4f}\n")
        f.write(f"- **Train Time**: {clf_train_time:.2f}s\n")
        f.write("\n## Per Class Performance\n")
        for cls, metrics in per_class.items():
            f.write(f"- **{cls}**: F1: {metrics['f1']:.2f}, Recall: {metrics['recall']:.2f} (Support: {metrics['support']})\n")
            
    # Save the selected models
    os.makedirs("backend/app/ml/intelligence/models", exist_ok=True)
    ad.save("backend/app/ml/intelligence/models/anomaly_detector_v1.joblib")
    clf.save("backend/app/ml/intelligence/models/event_classifier_v1.joblib")
    print("Evaluation complete. Models saved.")
    
if __name__ == "__main__":
    evaluate_intelligence()
