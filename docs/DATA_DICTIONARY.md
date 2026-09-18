# Data Dictionary — `data/raw/location_aware_gis_leakage_dataset.csv`

Source: `Sukrut10k/Smart-Water-Leak-Detection` @ `1c032e4`, 5 000 rows × 13 columns, no nulls, no duplicates.
Units are **not documented** anywhere in the source repository; ranges below are measured from the file.
Where a meaning is not stated in the source, it is marked *inferred from column name* and should not be
treated as authoritative.

| Field | Type | Measured range (mean ± sd) | Meaning | Current role (Phase 1) |
|---|---|---|---|---|
| `Pressure` | float64 | 27.6 – 99.3 (60.1 ± 10.0) | Pipeline pressure reading. Unit unspecified. *Inferred from name.* | ML feature (configs A & B). Strongest signal together with Flow_Rate (leaks occur only at ≤ 53.4). |
| `Flow_Rate` | float64 | 21.2 – 132.9 (79.9 ± 15.2) | Flow rate through the pipe. Unit unspecified. *Inferred.* | ML feature (A & B). Leaks occur only at ≥ 90.2. |
| `Temperature` | float64 | 83.1 – 117.1 (100.1 ± 5.0) | Temperature reading. Centre of 100 suggests °F or an arbitrary scale; unspecified. | ML feature (A & B). ~No signal (r = −0.02). |
| `Vibration` | float64 | 1.07 – 5.24 (3.01 ± 0.50) | Vibration level of the pipe/pump. Unit unspecified. *Inferred.* | ML feature (A & B). ~No signal. |
| `RPM` | float64 | 903 – 3 083 (1 994 ± 295) | Rotational speed, presumably of an associated pump. *Inferred.* | ML feature (A & B). ~No signal. |
| `Operational_Hours` | int64 | 1 000 – 9 998 (5 488 ± 2 611), uniform | Cumulative operating hours of the asset. *Inferred.* | ML feature (A & B). ~No signal. |
| `Zone` | string | `Zone_1` … `Zone_5`, ~1 000 rows each | Top-level network area identifier. | ML feature (A only, one-hot); grouping key for GIS/analytics; maps to DB `zones`. |
| `Block` | string | `Block_1` … `Block_5`, ~1 000 each | Sub-area within a zone. | ML feature (A only, one-hot); maps conceptually to DB `lines`. |
| `Pipe` | string | `Pipe_1` … `Pipe_5`, ~1 000 each | Pipe index within a block. | ML feature (A only, one-hot); maps conceptually to DB `machines`/`sensors`. |
| `Location_Code` | string | 125 unique = `{Zone}_{Block}_{Pipe}` (verified for all rows) | Composite location key. Fully redundant with the three columns above. | ML feature (A only, 125 one-hot columns). Derived automatically by `SensorReadingInput.with_location_code()`. |
| `Latitude` | float64 | 25.081 – 25.292 | WGS-84 latitude; unique per row; clusters tightly by Zone (σ≈0.005°). Region corresponds to Dubai. | ML feature (A only); GIS marker position. |
| `Longitude` | float64 | 55.146 – 55.313 | WGS-84 longitude; see Latitude. | ML feature (A only); GIS marker position. |
| `Leakage_Flag` | int64 | {0: 4 677, 1: 323} (6.46 % positive) | Binary leak label. **Deterministically equal to** `Flow_Rate ≥ 90.248 AND Pressure ≤ 53.419` for every row. | ML target. |

## `data/raw/testing.csv`

Two rows with the 12 feature columns and **no** `Leakage_Flag`; used in the legacy README as a batch-upload example. Loaded in tests via `load_dataset(..., require_target=False)`.

## Fields the SU-03 problem needs that this dataset does NOT have

| Missing concept | Consequence |
|---|---|
| Timestamp / sampling interval | No time-series, no trend, no "timeline" possible yet |
| Sensor / asset identifier with repeated readings | Cannot build per-asset baselines |
| Production schedule / machine state | Cannot separate production-driven demand from losses |
| Consumption / metered volume | Cannot compute water-balance or estimated loss volume |
| Water tariff / cost | Cannot compute financial impact |
| Network topology (edges) | Cannot localise leaks along a graph |

These gaps are the input to Phase 2 planning; they are *not* addressed in Phase 1.

## Feature configurations used by `ml/train.py`

- **A_all_features** — numeric: Pressure, Flow_Rate, Temperature, Vibration, RPM, Operational_Hours, Latitude, Longitude; categorical (one-hot): Zone, Block, Pipe, Location_Code. (Legacy notebook equivalent.)
- **B_sensor_only** — numeric: Pressure, Flow_Rate, Temperature, Vibration, RPM, Operational_Hours. (Registered default.)
