import argparse
import pandas as pd
import json
import os
import random
import numpy as np
from datetime import datetime, timedelta
from simulator.engine.core import SimulationEngine

def compute_derived_features(df):
    if len(df) == 0:
        return df
        
    df = df.sort_values(by=["sensor_id", "timestamp"])
    
    # Calculate Deviations
    # expected_value is flow_lph for flow sensors and pressure_bar for pressure sensors.
    df["deviation_pct"] = np.where(
        df["expected_value"] > 0,
        (df["value"] - df["expected_value"]) / df["expected_value"],
        0.0
    )
    
    # Calculate rolling means per sensor
    df["rolling_mean_3"] = df.groupby("sensor_id")["value"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["rolling_std_3"] = df.groupby("sensor_id")["value"].transform(lambda x: x.rolling(3, min_periods=1).std().fillna(0))
    
    # Rate of change
    df["rate_of_change"] = df.groupby("sensor_id")["value"].diff().fillna(0)
    
    return df

def generate_dataset(days, interval_minutes, seed):
    random.seed(seed)
    np.random.seed(seed)
    
    engine = SimulationEngine()
    
    start_time = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(days=days)
    
    current_time = start_time
    all_telemetry = []
    
    scenarios = list(engine.scenarios.keys())
    scenario_probs = [engine.scenarios[s]["probability"] for s in scenarios]
    
    active_scenario = "NORMAL_OPERATION"
    scenario_end_time = start_time
    
    while current_time < end_time:
        # Determine if we need a new scenario
        if current_time >= scenario_end_time:
            active_scenario = np.random.choice(scenarios, p=scenario_probs)
            scen_config = engine.scenarios[active_scenario]
            if "duration_hours" in scen_config:
                dur = random.uniform(*scen_config["duration_hours"])
                scenario_end_time = current_time + timedelta(hours=dur)
            else:
                scenario_end_time = current_time + timedelta(minutes=interval_minutes * random.randint(10, 50))
        
        telemetry_step = engine.generate_step(current_time, active_scenario)
        all_telemetry.extend(telemetry_step)
        
        current_time += timedelta(minutes=interval_minutes)
        
    df = pd.DataFrame(all_telemetry)
    df = compute_derived_features(df)
    
    # Time-aware split (e.g. 70/15/15)
    total_duration = end_time - start_time
    train_end = start_time + total_duration * 0.70
    valid_end = start_time + total_duration * 0.85
    
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    train_df = df[df["timestamp"] < train_end]
    valid_df = df[(df["timestamp"] >= train_end) & (df["timestamp"] < valid_end)]
    test_df = df[df["timestamp"] >= valid_end]
    
    os.makedirs("data/training", exist_ok=True)
    os.makedirs("data/validation", exist_ok=True)
    os.makedirs("data/testing", exist_ok=True)
    os.makedirs("data/manifests", exist_ok=True)
    
    # We save as CSV for easy inspection, in production we would use Parquet.
    train_df.to_csv("data/training/train.csv", index=False)
    valid_df.to_csv("data/validation/valid.csv", index=False)
    test_df.to_csv("data/testing/test.csv", index=False)
    
    manifest = {
        "dataset_version": "1.0",
        "created_at": datetime.utcnow().isoformat(),
        "generator_version": "1.0",
        "days_simulated": days,
        "interval_minutes": interval_minutes,
        "seed": seed,
        "total_rows": len(df),
        "splits": {
            "train": len(train_df),
            "validation": len(valid_df),
            "test": len(test_df)
        },
        "label_distribution": df["event_type"].value_counts().to_dict()
    }
    
    with open("data/manifests/dataset_manifest.json", "w") as f:
        json.dump(manifest, f, indent=4)
        
    print(f"Generated {len(df)} rows of telemetry. Seed: {seed}")
    print("Manifest saved to data/manifests/dataset_manifest.json")
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AquaRisk AI Data Generator")
    parser.add_argument("--days", type=int, default=30, help="Number of days to simulate")
    parser.add_argument("--interval", type=int, default=5, help="Interval in minutes")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    
    args = parser.parse_args()
    generate_dataset(args.days, args.interval, args.seed)
