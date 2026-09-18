# Baseline Model Evaluation (regenerated)

Generated: `2026-09-18T07:53:39.411569+00:00`  
scikit-learn: `1.9.1`  
Protocol: 80/20 stratified split (seed 42), SMOTE on training fold only, legacy hyper-parameters. **All numbers below are measured by `python -m ml.train`; none are typed in by hand.**

## Results

| Config | Model | Accuracy | Precision | Recall | F1 | ROC-AUC | PR-AUC | TN | FP | FN | TP |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A_all_features | random_forest | 0.9890 | 1.0000 | 0.8308 | 0.9076 | 1.0000 | 1.0000 | 935 | 0 | 11 | 54 |
| A_all_features | decision_tree | 0.9100 | 0.0370 | 0.0154 | 0.0217 | 0.4939 | 0.0655 | 909 | 26 | 64 | 1 |
| A_all_features | logistic_regression | 0.8900 | 0.3714 | 1.0000 | 0.5417 | 0.9730 | 0.6461 | 825 | 110 | 0 | 65 |
| A_all_features | svm | 0.9070 | 0.4103 | 0.9846 | 0.5792 | 0.9719 | 0.6444 | 843 | 92 | 1 | 64 |
| B_sensor_only | random_forest | 0.9990 | 1.0000 | 0.9846 | 0.9922 | 1.0000 | 1.0000 | 935 | 0 | 1 | 64 |
| B_sensor_only | decision_tree | 0.5120 | 0.1091 | 0.9077 | 0.1947 | 0.7498 | 0.1385 | 453 | 482 | 6 | 59 |
| B_sensor_only | logistic_regression | 0.8700 | 0.3333 | 1.0000 | 0.5000 | 0.9732 | 0.6386 | 805 | 130 | 0 | 65 |
| B_sensor_only | svm | 0.9020 | 0.3988 | 1.0000 | 0.5702 | 0.9726 | 0.6311 | 837 | 98 | 0 | 65 |

Test set: 1000 rows (935 negative / 65 positive) for both configurations.

## Random-forest feature importances (aggregated over one-hot columns)

### A_all_features

| Feature | Importance |
|---|---|
| Flow_Rate | 0.3554 |
| Pressure | 0.3499 |
| Block | 0.0679 |
| Location_Code | 0.0651 |
| Pipe | 0.0584 |
| Operational_Hours | 0.0164 |
| Longitude | 0.0162 |
| Latitude | 0.0153 |
| RPM | 0.0151 |
| Vibration | 0.0145 |
| Temperature | 0.0139 |
| Zone | 0.0121 |

### B_sensor_only

| Feature | Importance |
|---|---|
| Flow_Rate | 0.5005 |
| Pressure | 0.4783 |
| Temperature | 0.0072 |
| Operational_Hours | 0.0050 |
| RPM | 0.0047 |
| Vibration | 0.0044 |

## Legacy claims vs. measurement

| Model | README claim | Notebook output | app.py radar chart (hard-coded) | Measured (config A) |
|---|---|---|---|---|
| random_forest | 0.98 | 0.989 | 0.99 | 0.9890 |
| decision_tree | 0.91 | 0.91 | 0.95 | 0.9100 |
| logistic_regression | 0.89 | 0.89 | 0.93 | 0.8900 |
| svm | 0.9 | 0.907 | 0.94 | 0.9070 |

## Interpretation

See `docs/BASELINE_AUDIT.md` (sections J and 'Data leakage investigation') for the full discussion. Key points: accuracy is a misleading headline metric on a 6.5 % positive class; the Decision Tree with the legacy hyper-parameters (`splitter='random', max_features=3`) is essentially a random classifier; the leak label is perfectly separable with a two-rule box on `Flow_Rate` and `Pressure`, which is why the Random Forest reaches ROC-AUC ≈ 1.0 with **or without** location features.
