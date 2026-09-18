# Intelligence Engine Methodology

## Objective
To convert abstract deviations in contextual expected flow into actionable industrial anomaly classifications with associated severity and confidence.

## Architecture (Model Chaining)
The Intelligence Engine uses a multi-stage approach:
1. **Anomaly Detector**: `IsolationForest` trained explicitly on `NORMAL` behaviors. It functions to protect against false positives and establish an `anomaly_score`.
2. **Event Classifier**: `HistGradientBoostingClassifier` trained to predict the 9-class SU-03 event taxonomy.
3. **Severity Engine**: Rule-based categorization mapping predictions to `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` based on magnitude and persistence.
4. **Confidence/Explainability**: Features like `predict_proba` determine numerical confidence, while an evidence generator outputs specific driving variables (like "flow_deviation_lph: high").

## Target Leakage Prevention
During training, we explicitly dropped `leakage_status`, `event_type`, and other scenario names from the feature set. The classifier purely infers the state from the Phase 4 Baseline deviations and physical telemetry.

## Fallback & Low Confidence
If model confidence falls below 40%, the system overrides the specific class and outputs `MULTI_EVENT` or `LOW_CONFIDENCE`, signaling to the operator that human review is required.

## Data Processing
During real-time inference, the Intelligence Engine reads the dynamically calculated `expected_value` and `deviation_pct` directly from the Phase 4 Baseline Model (not the simulator). This ensures a truly autonomous inference chain.
