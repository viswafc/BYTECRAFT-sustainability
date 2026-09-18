import pandas as pd

def inspect():
    df = pd.read_csv("data/training/train.csv")
    print("Columns:")
    for col in df.columns:
        print(f"- {col}")
    
    print("\nHead:")
    print(df.head(2).to_string())

if __name__ == "__main__":
    inspect()
