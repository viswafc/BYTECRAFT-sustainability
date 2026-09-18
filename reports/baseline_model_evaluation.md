# Baseline Model Evaluation

## Configuration A (All Features including Location)
This configuration includes `Latitude`, `Longitude`, and categorical features like `Zone`, `Block`, `Pipe`, `Location_Code`.

### Random Forest
- Accuracy: 0.9970
- Precision: 1.0000
- Recall: 0.9455
- F1-Score: 0.9720
- ROC-AUC: 0.9999615199615199
- Confusion Matrix: [[945, 0], [3, 52]]

### Decision Tree
- Accuracy: 0.9990
- Precision: 0.9821
- Recall: 1.0000
- F1-Score: 0.9910
- ROC-AUC: 0.9994708994708994
- Confusion Matrix: [[944, 1], [0, 55]]

### Logistic Regression
- Accuracy: 0.9510
- Precision: 0.5652
- Recall: 0.4727
- F1-Score: 0.5149
- ROC-AUC: 0.9686195286195286
- Confusion Matrix: [[925, 20], [29, 26]]

### SVM
- Accuracy: 0.9450
- Precision: 0.0000
- Recall: 0.0000
- F1-Score: 0.0000
- ROC-AUC: 0.9578066378066378
- Confusion Matrix: [[945, 0], [55, 0]]

## Configuration B (Sensor/Operational Features Only)
This configuration removes all location identifiers to test for potential data leakage.

### Random Forest
- Accuracy: 0.9980
- Precision: 0.9818
- Recall: 0.9818
- F1-Score: 0.9818
- ROC-AUC: 0.99998075998076
- Confusion Matrix: [[944, 1], [1, 54]]

### Decision Tree
- Accuracy: 0.9990
- Precision: 0.9821
- Recall: 1.0000
- F1-Score: 0.9910
- ROC-AUC: 0.9994708994708994
- Confusion Matrix: [[944, 1], [0, 55]]

### Logistic Regression
- Accuracy: 0.9520
- Precision: 0.5778
- Recall: 0.4727
- F1-Score: 0.5200
- ROC-AUC: 0.9744877344877345
- Confusion Matrix: [[926, 19], [29, 26]]

### SVM
- Accuracy: 0.9450
- Precision: 0.0000
- Recall: 0.0000
- F1-Score: 0.0000
- ROC-AUC: 0.9530158730158731
- Confusion Matrix: [[945, 0], [55, 0]]

## Data Leakage Conclusion
If the models in Configuration A perform significantly better than those in Configuration B, it strongly suggests that the location features are causing data leakage, allowing the model to 'memorize' where leaks occurred rather than learning the physical sensor behaviors that indicate a leak.
