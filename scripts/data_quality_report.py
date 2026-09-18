"""Generate a data-quality report for the baseline dataset.

    python scripts/data_quality_report.py
Writes reports/data_quality_report.json and reports/data_quality_report.md
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ml.preprocess import file_sha256, load_dataset  # noqa: E402
from ml.schemas import (  # noqa: E402
    CATEGORICAL_LOCATION_FEATURES, DEFAULT_DATASET_PATH, GEO_FEATURES, SENSOR_FEATURES, TARGET,
)


def iqr_outliers(s: pd.Series) -> int:
    q1, q3 = s.quantile([0.25, 0.75])
    iqr = q3 - q1
    return int(((s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)).sum())


def build(df: pd.DataFrame, path: Path) -> dict:
    numeric = SENSOR_FEATURES + GEO_FEATURES
    leaks = df[df[TARGET] == 1]
    rep: dict = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset": str(path.relative_to(ROOT)),
        "sha256": file_sha256(path),
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "dtypes": {c: str(t) for c, t in df.dtypes.items()},
        "missing_values": {c: int(v) for c, v in df.isnull().sum().items()},
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_feature_rows_ignoring_label": int(df.drop(columns=[TARGET]).duplicated().sum()),
        "class_balance": {
            "counts": {str(k): int(v) for k, v in df[TARGET].value_counts().items()},
            "positive_rate": float(df[TARGET].mean()),
        },
        "numeric_summary": {
            c: {
                "min": float(df[c].min()), "max": float(df[c].max()), "mean": float(df[c].mean()),
                "std": float(df[c].std()), "median": float(df[c].median()),
                "negatives": int((df[c] < 0).sum()), "iqr_outliers": iqr_outliers(df[c]),
            }
            for c in numeric
        },
        "categorical_distributions": {
            c: {str(k): int(v) for k, v in df[c].value_counts().sort_index().items()}
            for c in ["Zone", "Block", "Pipe"]
        },
        "location_code": {
            "n_unique": int(df["Location_Code"].nunique()),
            "consistent_with_zone_block_pipe": bool(
                (df["Location_Code"] == df["Zone"] + "_" + df["Block"] + "_" + df["Pipe"]).all()
            ),
        },
        "unique_lat_lon_pairs": int(df[GEO_FEATURES].drop_duplicates().shape[0]),
        "leak_rate_by": {
            c: {str(k): float(v) for k, v in df.groupby(c)[TARGET].mean().round(4).items()}
            for c in ["Zone", "Block", "Pipe"]
        },
        "leak_rate_by_location_code": {
            "min": float(df.groupby("Location_Code")[TARGET].mean().min()),
            "max": float(df.groupby("Location_Code")[TARGET].mean().max()),
            "std": float(df.groupby("Location_Code")[TARGET].mean().std()),
        },
        "lat_lon_by_zone": {
            z: {"lat_mean": float(g["Latitude"].mean()), "lat_std": float(g["Latitude"].std()),
                "lon_mean": float(g["Longitude"].mean()), "lon_std": float(g["Longitude"].std())}
            for z, g in df.groupby("Zone")
        },
        "pearson_corr_with_target": {
            c: float(v) for c, v in df[numeric + [TARGET]].corr()[TARGET].drop(TARGET).round(4).items()
        },
        "leak_vs_normal_means": {
            c: {"leak": float(leaks[c].mean()), "normal": float(df[df[TARGET] == 0][c].mean())}
            for c in SENSOR_FEATURES
        },
        "label_separability": {},
    }
    # Is the label a deterministic function of Pressure & Flow_Rate?
    p_max, f_min = leaks["Pressure"].max(), leaks["Flow_Rate"].min()
    box = (df["Pressure"] <= p_max) & (df["Flow_Rate"] >= f_min)
    rep["label_separability"] = {
        "leak_pressure_range": [float(leaks["Pressure"].min()), float(p_max)],
        "leak_flow_rate_range": [float(f_min), float(leaks["Flow_Rate"].max())],
        "rows_inside_box_pressure_le_max_and_flow_ge_min": int(box.sum()),
        "leaks_inside_box": int(df.loc[box, TARGET].sum()),
        "total_leaks": int(len(leaks)),
        "box_is_perfect_separator": bool(box.sum() == df.loc[box, TARGET].sum() == len(leaks)),
    }
    return rep


def to_markdown(r: dict) -> str:
    L = ["# Data Quality Report — baseline dataset", "",
         f"Generated `{r['generated_at']}` from `{r['dataset']}` (sha256 `{r['sha256'][:16]}…`).", "",
         "## Shape & integrity", "",
         f"- Rows: **{r['shape']['rows']}**, columns: **{r['shape']['columns']}**",
         f"- Missing values: **{sum(r['missing_values'].values())}**",
         f"- Duplicate rows: **{r['duplicate_rows']}** (ignoring label: {r['duplicate_feature_rows_ignoring_label']})",
         f"- Unique lat/lon pairs: **{r['unique_lat_lon_pairs']}** (one per row)",
         f"- `Location_Code` unique values: {r['location_code']['n_unique']}; equals `Zone_Block_Pipe`: {r['location_code']['consistent_with_zone_block_pipe']}",
         "", "## Class balance", "",
         f"- Counts: {r['class_balance']['counts']}",
         f"- Positive (leak) rate: **{r['class_balance']['positive_rate']:.4f}** → heavily imbalanced",
         "", "## Numeric columns", "",
         "| Column | dtype | min | median | max | mean | std | negatives | IQR outliers | corr w/ target |",
         "|---|---|---|---|---|---|---|---|---|---|"]
    for c, s in r["numeric_summary"].items():
        L.append(f"| {c} | {r['dtypes'][c]} | {s['min']:.3f} | {s['median']:.3f} | {s['max']:.3f} | {s['mean']:.3f} | "
                 f"{s['std']:.3f} | {s['negatives']} | {s['iqr_outliers']} | {r['pearson_corr_with_target'][c]:+.3f} |")
    L += ["", "## Categorical distributions", ""]
    for c, d in r["categorical_distributions"].items():
        L.append(f"- **{c}**: {d}")
    L += ["", "## Leak rate by location", ""]
    for c, d in r["leak_rate_by"].items():
        L.append(f"- **{c}**: {d}")
    lr = r["leak_rate_by_location_code"]
    L.append(f"- **Location_Code** (125 codes): min {lr['min']:.3f}, max {lr['max']:.3f}, std {lr['std']:.3f}")
    L += ["", "Leak rate is roughly uniform (≈5.5–7.8 %) across every Zone/Block/Pipe: location carries almost no "
          "marginal signal about the label. Latitude/Longitude are tightly clustered per Zone (std ≈0.005°), so they are "
          "a proxy for Zone rather than independent information.", ""]
    L += ["## Leak vs normal sensor means", "", "| Feature | leak mean | normal mean |", "|---|---|---|"]
    for c, d in r["leak_vs_normal_means"].items():
        L.append(f"| {c} | {d['leak']:.2f} | {d['normal']:.2f} |")
    s = r["label_separability"]
    L += ["", "## Label separability (important finding)", "",
          f"- Every leak row has `Pressure ≤ {s['leak_pressure_range'][1]:.2f}` and `Flow_Rate ≥ {s['leak_flow_rate_range'][0]:.2f}`.",
          f"- Rows inside that rectangle: {s['rows_inside_box_pressure_le_max_and_flow_ge_min']}; leaks inside it: "
          f"{s['leaks_inside_box']} of {s['total_leaks']}.",
          f"- **Perfect separator: {s['box_is_perfect_separator']}**. The label is a deterministic function of two "
          "sensor columns — this is a synthetic dataset. Any reasonably flexible model will reach ≈100 % on it, and "
          "results on it must not be read as evidence the approach works on real network data.", "",
          "## Suspicious / synthetic characteristics", "",
          "- Every numeric column is a clean Gaussian (Temperature centred on 100, Vibration on 3, RPM on 2000) with no "
          "missing values, no sensor dropouts, no timestamps and no repeated sensor IDs.",
          "- There is no time dimension, no production schedule and no consumption column, so the SU-03 core "
          "requirement (separating production-driven changes from losses) cannot be evaluated on this dataset.",
          "- `Temperature` ≈ 100 with std 5 is not physically meaningful for water in °C without a stated unit.",
          "- `Latitude/Longitude` (≈25.18 N, 55.25 E) correspond to Dubai; there is one unique coordinate per row, "
          "i.e. rows are 5 000 distinct 'pipes', not repeated readings from a fixed network.", ""]
    return "\n".join(L)


def main() -> int:
    path = DEFAULT_DATASET_PATH
    df = load_dataset(path)
    rep = build(df, path)
    out = ROOT / "reports"
    out.mkdir(exist_ok=True)
    (out / "data_quality_report.json").write_text(json.dumps(rep, indent=2))
    (out / "data_quality_report.md").write_text(to_markdown(rep))
    print(f"wrote {out/'data_quality_report.json'} and .md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
