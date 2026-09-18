# Baseline Modeling Methodology

## Objective
To establish a "Contextual Expected Flow" for every sensor in the water network based on surrounding operating conditions, explicitly blinding the model to future data or scenario labels (like `leakage_status`).

## Features
We engineered the following features to train the `HistGradientBoostingRegressor`:
- `production_level`: Continuous (0.0 to 1.1)
- `hour_of_day`: Extracted from timestamp
- `day_of_week`: Extracted from timestamp
- `shift_SHIFT_1`, `shift_SHIFT_2`, `shift_SHIFT_3`: Dummy encoded
- `machine_status_ACTIVE`, `machine_status_IDLE`, `machine_status_MAINTENANCE`: Dummy encoded

## Target
- `value`: The actual observed flow/pressure.

## Deliberately Excluded Features
We explicitly dropped `event_type`, `leakage_status`, `expected_value` (simulator truth), and `deviation_pct` from the training data. The model was trained purely on periods where `event_type` was `NORMAL_OPERATION` or `NORMAL_PRODUCTION_VARIATION`.

## Persistence Logic
To avoid throwing anomalous alerts for single-point spikes, we implemented a persistence buffer in `inference.py`. The AI tracks the last 5 readings. If 3 or more are `UNEXPLAINED_DEVIATION`, `persistence` flips to `HIGH`. If 5/5 are abnormal, the state escalates to `PERSISTENT_UNEXPLAINED_DEVIATION`.
