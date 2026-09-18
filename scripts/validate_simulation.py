import pandas as pd
import json

def validate():
    print("Validating dataset...")
    df = pd.read_csv("data/training/train.csv")
    
    report = [
        "# Simulation Data Quality Report",
        "",
        "## Summary",
        f"- **Rows Analyzed**: {len(df)}",
        f"- **Sensors Covered**: {df['sensor_id'].nunique()}",
        f"- **Date Range**: {df['timestamp'].min()} to {df['timestamp'].max()}",
        "",
        "## Quality Checks",
        f"- **Missing Values**: {df.isnull().sum().sum()} total missing cells across df",
        f"- **Invalid Negative Pressure**: {len(df[(df['sensor_type'] == 'pressure') & (df['value'] < 0)])}",
        f"- **Invalid Negative Flow**: {len(df[(df['sensor_type'] == 'flow') & (df['value'] < 0)])}",
        "",
        "## Scenario Distribution",
    ]
    
    dist = df["event_type"].value_counts()
    for scen, count in dist.items():
        report.append(f"- **{scen}**: {count} rows ({(count/len(df))*100:.2f}%)")
        
    with open("reports/simulation_quality_report.md", "w") as f:
        f.write("\n".join(report))
        
    print("Quality report generated at reports/simulation_quality_report.md")

if __name__ == "__main__":
    validate()
