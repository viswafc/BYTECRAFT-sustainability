import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

DATA_PATH = "../data/location_aware_gis_leakage_dataset.csv"
REPORT_JSON = "../reports/baseline_model_evaluation.json"
REPORT_MD = "../reports/baseline_model_evaluation.md"
DATA_DICT_MD = "../docs/DATA_DICTIONARY.md"

def generate_data_dictionary(df):
    dict_content = """# Data Dictionary\n\n"""
    
    # Analyze data types and meanings based on column names
    column_info = {
        "Pressure": {"Meaning": "Pipeline pressure measurement", "Role": "ML feature"},
        "Flow_Rate": {"Meaning": "Water flow rate through the pipeline", "Role": "ML feature"},
        "Temperature": {"Meaning": "Temperature of the water or pipeline", "Role": "ML feature"},
        "Vibration": {"Meaning": "Vibration levels of the pipeline", "Role": "ML feature"},
        "RPM": {"Meaning": "Pump revolutions per minute", "Role": "ML feature"},
        "Operational_Hours": {"Meaning": "Hours of operation of the equipment", "Role": "ML feature"},
        "Zone": {"Meaning": "Geographical or operational zone", "Role": "Location identifier"},
        "Block": {"Meaning": "Sub-division within a zone", "Role": "Location identifier"},
        "Pipe": {"Meaning": "Specific pipe identifier", "Role": "Location identifier"},
        "Location_Code": {"Meaning": "Unique code for the location", "Role": "Location identifier"},
        "Latitude": {"Meaning": "Geographical latitude", "Role": "Location identifier"},
        "Longitude": {"Meaning": "Geographical longitude", "Role": "Location identifier"},
        "Leakage_Flag": {"Meaning": "Indicator if leakage occurred (1) or not (0)", "Role": "Target variable"}
    }
    
    for col in df.columns:
        dtype = str(df[col].dtype)
        info = column_info.get(col, {"Meaning": "Unknown", "Role": "Unknown"})
        
        # Add basic stats
        stats = ""
        if pd.api.types.is_numeric_dtype(df[col]):
            if col != "Leakage_Flag":
                stats = f"Range: [{df[col].min()}, {df[col].max()}] | Mean: {df[col].mean():.2f}"
            else:
                stats = f"Balance: 0 ({sum(df[col]==0)}), 1 ({sum(df[col]==1)})"
        else:
            unique = df[col].nunique()
            stats = f"Unique categories: {unique}"
            
        dict_content += f"## {col}\n"
        dict_content += f"- **Type**: {dtype}\n"
        dict_content += f"- **Meaning**: {info['Meaning']}\n"
        dict_content += f"- **Current Role**: {info['Role']}\n"
        dict_content += f"- **Stats**: {stats}\n\n"
        
    with open(DATA_DICT_MD, "w") as f:
        f.write(dict_content)

def train_and_eval(X, y, models):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        y_prob = None
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
        elif hasattr(model, "decision_function"):
            y_prob = model.decision_function(X_test)
            
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        auc = None
        if y_prob is not None:
            try:
                auc = roc_auc_score(y_test, y_prob)
            except:
                auc = None
                
        results[name] = {
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "F1-Score": f1,
            "ROC-AUC": auc,
            "Confusion Matrix": cm
        }
    return results

def main():
    os.makedirs(os.path.dirname(REPORT_JSON), exist_ok=True)
    os.makedirs(os.path.dirname(DATA_DICT_MD), exist_ok=True)
    
    df = pd.read_csv(DATA_PATH)
    
    # 1. Generate Data Dictionary
    generate_data_dictionary(df)
    
    # Prepare data
    # Categorical encoding for baseline
    categorical_cols = ["Zone", "Block", "Pipe", "Location_Code"]
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
    
    y = df_encoded["Leakage_Flag"]
    X_config_A = df_encoded.drop("Leakage_Flag", axis=1) # All features
    
    location_features = ["Latitude", "Longitude"] + [c for c in df_encoded.columns if any(cat in c for cat in categorical_cols)]
    X_config_B = df_encoded.drop(["Leakage_Flag"] + location_features, axis=1) # Sensor/operational features only
    
    models = {
        "Random Forest": RandomForestClassifier(random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "SVM": SVC(probability=True, random_state=42)
    }
    
    # Evaluate Config A
    results_A = train_and_eval(X_config_A, y, models)
    
    # Evaluate Config B
    results_B = train_and_eval(X_config_B, y, models)
    
    report_data = {
        "Configuration_A_All_Features": results_A,
        "Configuration_B_No_Location": results_B
    }
    
    with open(REPORT_JSON, "w") as f:
        json.dump(report_data, f, indent=4)
        
    # Generate MD report
    md_content = "# Baseline Model Evaluation\n\n"
    md_content += "## Configuration A (All Features including Location)\n"
    md_content += "This configuration includes `Latitude`, `Longitude`, and categorical features like `Zone`, `Block`, `Pipe`, `Location_Code`.\n\n"
    
    for m, res in results_A.items():
        md_content += f"### {m}\n"
        md_content += f"- Accuracy: {res['Accuracy']:.4f}\n"
        md_content += f"- Precision: {res['Precision']:.4f}\n"
        md_content += f"- Recall: {res['Recall']:.4f}\n"
        md_content += f"- F1-Score: {res['F1-Score']:.4f}\n"
        md_content += f"- ROC-AUC: {res['ROC-AUC'] if res['ROC-AUC'] is not None else 'N/A'}\n"
        md_content += f"- Confusion Matrix: {res['Confusion Matrix']}\n\n"
        
    md_content += "## Configuration B (Sensor/Operational Features Only)\n"
    md_content += "This configuration removes all location identifiers to test for potential data leakage.\n\n"
    
    for m, res in results_B.items():
        md_content += f"### {m}\n"
        md_content += f"- Accuracy: {res['Accuracy']:.4f}\n"
        md_content += f"- Precision: {res['Precision']:.4f}\n"
        md_content += f"- Recall: {res['Recall']:.4f}\n"
        md_content += f"- F1-Score: {res['F1-Score']:.4f}\n"
        md_content += f"- ROC-AUC: {res['ROC-AUC'] if res['ROC-AUC'] is not None else 'N/A'}\n"
        md_content += f"- Confusion Matrix: {res['Confusion Matrix']}\n\n"
        
    md_content += "## Data Leakage Conclusion\n"
    md_content += "If the models in Configuration A perform significantly better than those in Configuration B, it strongly suggests that the location features are causing data leakage, allowing the model to 'memorize' where leaks occurred rather than learning the physical sensor behaviors that indicate a leak.\n"

    with open(REPORT_MD, "w") as f:
        f.write(md_content)
        
    print("Evaluation complete. Generated DATA_DICTIONARY.md, baseline_model_evaluation.json and baseline_model_evaluation.md.")

if __name__ == "__main__":
    main()
