# Baseline Model Comparison

## V0_Historical
- **Selected**: False
- **MAE (All Test Data)**: 292.17
- **RMSE (All Test Data)**: 1079.15
- **Train Time**: 0.0175s
- **Inference Time**: 0.0165s
- **Strengths**: Extremely fast, totally interpretable
- **Limitations**: Cannot extrapolate outside seen bins, coarse.

## V1_HistGradientBoosting
- **Selected**: True
- **MAE (All Test Data)**: 155.65
- **RMSE (All Test Data)**: 694.79
- **MAE (Normal Test Data Only)**: 23.23
- **Train Time**: 2.3435s
- **Inference Time**: 0.0272s
- **Strengths**: Handles complex non-linear contextual patterns natively, very fast inference
- **Limitations**: Black box decision paths

