import pandas as pd
import json
import os

def profile_data():
    file_path = "../legacy/data/location_aware_gis_leakage_dataset.csv"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    df = pd.read_csv(file_path)
    
    profile = {
        "columns": list(df.columns),
        "types": {col: str(df[col].dtype) for col in df.columns},
        "row_count": len(df),
        "nulls": df.isnull().sum().to_dict(),
        "duplicates": int(df.duplicated().sum()),
        "categorical_values": {},
        "numerical_ranges": {}
    }
    
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].nunique() < 20:
            profile["categorical_values"][col] = df[col].value_counts().to_dict()
        if pd.api.types.is_numeric_dtype(df[col]):
            profile["numerical_ranges"][col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "std": float(df[col].std())
            }
            
    # Specialized aggregations if columns exist
    if "Leakage_Flag" in df.columns:
        profile["leakage_distribution"] = df["Leakage_Flag"].value_counts().to_dict()
    if "Zone" in df.columns:
        profile["zone_distribution"] = df["Zone"].value_counts().to_dict()
        
    os.makedirs("reports", exist_ok=True)
    
    with open("reports/baseline_data_profile.json", "w") as f:
        json.dump(profile, f, indent=4)
        
    with open("reports/baseline_data_profile.md", "w") as f:
        f.write("# Baseline Data Profile\n\n")
        f.write(f"- **Row Count**: {profile['row_count']}\n")
        f.write(f"- **Columns**: {len(profile['columns'])}\n")
        f.write(f"- **Duplicates**: {profile['duplicates']}\n\n")
        f.write("## Columns and Nulls\n")
        for col in profile['columns']:
            f.write(f"- `{col}` ({profile['types'][col]}): {profile['nulls'][col]} nulls\n")
            
        f.write("\n## Numerical Ranges\n")
        for col, r in profile['numerical_ranges'].items():
            f.write(f"- `{col}`: Min {r['min']:.2f}, Max {r['max']:.2f}, Mean {r['mean']:.2f}\n")
            
    print("Created baseline_data_profile.json and .md")

if __name__ == "__main__":
    profile_data()
