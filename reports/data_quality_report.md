# Data Quality Report — baseline dataset

Generated `2026-09-18T08:46:52.631630+00:00` from `data/raw/location_aware_gis_leakage_dataset.csv` (sha256 `9d7758a4b58969da…`).

## Shape & integrity

- Rows: **5000**, columns: **13**
- Missing values: **0**
- Duplicate rows: **0** (ignoring label: 0)
- Unique lat/lon pairs: **5000** (one per row)
- `Location_Code` unique values: 125; equals `Zone_Block_Pipe`: True

## Class balance

- Counts: {'0': 4677, '1': 323}
- Positive (leak) rate: **0.0646** → heavily imbalanced

## Numeric columns

| Column | dtype | min | median | max | mean | std | negatives | IQR outliers | corr w/ target |
|---|---|---|---|---|---|---|---|---|---|
| Pressure | float64 | 27.587 | 60.135 | 99.262 | 60.056 | 9.965 | 0 | 42 | -0.327 |
| Flow_Rate | float64 | 21.164 | 79.738 | 132.936 | 79.852 | 15.157 | 0 | 34 | +0.329 |
| Temperature | float64 | 83.122 | 100.050 | 117.145 | 100.053 | 4.994 | 0 | 47 | -0.019 |
| Vibration | float64 | 1.072 | 3.010 | 5.240 | 3.008 | 0.502 | 0 | 36 | -0.003 |
| RPM | float64 | 903.474 | 1997.595 | 3083.405 | 1994.494 | 295.012 | 0 | 23 | -0.005 |
| Operational_Hours | int64 | 1000.000 | 5489.000 | 9998.000 | 5488.248 | 2611.426 | 0 | 0 | +0.013 |
| Latitude | float64 | 25.081 | 25.193 | 25.292 | 25.184 | 0.060 | 0 | 0 | -0.013 |
| Longitude | float64 | 55.146 | 55.271 | 55.313 | 55.249 | 0.048 | 0 | 0 | -0.011 |

## Categorical distributions

- **Zone**: {'Zone_1': 1005, 'Zone_2': 984, 'Zone_3': 965, 'Zone_4': 1026, 'Zone_5': 1020}
- **Block**: {'Block_1': 990, 'Block_2': 1007, 'Block_3': 1017, 'Block_4': 950, 'Block_5': 1036}
- **Pipe**: {'Pipe_1': 1025, 'Pipe_2': 967, 'Pipe_3': 993, 'Pipe_4': 1002, 'Pipe_5': 1013}

## Leak rate by location

- **Zone**: {'Zone_1': 0.0667, 'Zone_2': 0.0569, 'Zone_3': 0.0653, 'Zone_4': 0.0712, 'Zone_5': 0.0627}
- **Block**: {'Block_1': 0.0778, 'Block_2': 0.0556, 'Block_3': 0.0551, 'Block_4': 0.0632, 'Block_5': 0.0714}
- **Pipe**: {'Pipe_1': 0.0751, 'Pipe_2': 0.0662, 'Pipe_3': 0.0624, 'Pipe_4': 0.0589, 'Pipe_5': 0.0602}
- **Location_Code** (125 codes): min 0.000, max 0.205, std 0.038

Leak rate is roughly uniform (≈5.5–7.8 %) across every Zone/Block/Pipe: location carries almost no marginal signal about the label. Latitude/Longitude are tightly clustered per Zone (std ≈0.005°), so they are a proxy for Zone rather than independent information.

## Leak vs normal sensor means

| Feature | leak mean | normal mean |
|---|---|---|
| Pressure | 47.68 | 60.91 |
| Flow_Rate | 98.83 | 78.54 |
| Temperature | 99.68 | 100.08 |
| Vibration | 3.00 | 3.01 |
| RPM | 1989.37 | 1994.85 |
| Operational_Hours | 5621.99 | 5479.01 |

## Label separability (important finding)

- Every leak row has `Pressure ≤ 53.42` and `Flow_Rate ≥ 90.25`.
- Rows inside that rectangle: 323; leaks inside it: 323 of 323.
- **Perfect separator: True**. The label is a deterministic function of two sensor columns — this is a synthetic dataset. Any reasonably flexible model will reach ≈100 % on it, and results on it must not be read as evidence the approach works on real network data.

## Suspicious / synthetic characteristics

- Every numeric column is a clean Gaussian (Temperature centred on 100, Vibration on 3, RPM on 2000) with no missing values, no sensor dropouts, no timestamps and no repeated sensor IDs.
- There is no time dimension, no production schedule and no consumption column, so the SU-03 core requirement (separating production-driven changes from losses) cannot be evaluated on this dataset.
- `Temperature` ≈ 100 with std 5 is not physically meaningful for water in °C without a stated unit.
- `Latitude/Longitude` (≈25.18 N, 55.25 E) correspond to Dubai; there is one unique coordinate per row, i.e. rows are 5 000 distinct 'pipes', not repeated readings from a fixed network.
