"""Metric computation for binary leak classification. Real metrics only."""
from __future__ import annotations

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def compute_metrics(y_true, y_pred, y_proba=None) -> dict:
    """Return a JSON-serialisable dict of standard classification metrics.

    ROC-AUC / PR-AUC are only computed when probabilities are supplied and both
    classes are present in ``y_true``; otherwise the reason is recorded.
    """
    y_true = np.asarray(y_true).astype(int)
    y_pred = np.asarray(y_pred).astype(int)
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = (int(v) for v in cm.ravel())

    metrics: dict = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "confusion_matrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
        "support": {"negative": int((y_true == 0).sum()), "positive": int((y_true == 1).sum())},
    }

    if y_proba is None:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None
        metrics["auc_note"] = "model does not expose predict_proba"
    elif len(np.unique(y_true)) < 2:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None
        metrics["auc_note"] = "only one class present in y_true"
    else:
        metrics["roc_auc"] = float(roc_auc_score(y_true, y_proba))
        metrics["pr_auc"] = float(average_precision_score(y_true, y_proba))
    return metrics


def evaluate_pipeline(pipeline, X_test, y_test) -> dict:
    y_pred = pipeline.predict(X_test)
    y_proba = None
    if hasattr(pipeline, "predict_proba"):
        try:
            y_proba = pipeline.predict_proba(X_test)[:, 1]
        except Exception:  # pragma: no cover - defensive
            y_proba = None
    return compute_metrics(y_test, y_pred, y_proba)
