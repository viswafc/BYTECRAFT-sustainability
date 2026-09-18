import pandas as pd
df = pd.read_csv("data/training/train.csv")
print("Unique event types in training data:")
print(df['event_type'].value_counts())
