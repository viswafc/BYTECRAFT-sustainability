# Baseline Audit — `Sukrut10k/Smart-Water-Leak-Detection`

Audited commit: `1c032e42678f4242a20225f0fa610b2003ee52d5` (cloned 2026-09-18).
A verbatim copy of the baseline lives in `legacy/smart-water-leak-detection/`.

Severity legend: **CRITICAL** blocks reproduction/correctness · **HIGH** materially misleading or unsafe · **MEDIUM** should be fixed before scaling · **LOW** cosmetic / hygiene.

---

## A. Existing architecture

The repository is a two-artifact prototype with no shared code between the parts:

```
Smart-Water-Leak-Detection/
├── frontend/app.py                        # 480-line single-file Streamlit app
├── ml_model/water_leak_detection.ipynb    # training notebook (14 code cells)
├── data/location_aware_gis_leakage_dataset.csv   # 5 000 × 13
├── data/testing.csv                       # 2 rows, no label
├── requirements.txt                       # 9 unpinned packages
├── .gitignore                             # ignores *.pkl
└── README.md
```

- There is no backend, no API, no database, no tests, no CI, no Docker, no packaging.
- The notebook trains four `imblearn` pipelines and `joblib.dump`s them to the **notebook's CWD**.
- `app.py` `joblib.load`s the same four filenames from **its own CWD** at import time.
- The dataset is read via a bare relative filename (`"location_aware_gis_leakage_dataset.csv"`) that only resolves if Streamlit is launched from `data/`.
- The AI assistant instantiates a Groq client at import time using `GROQ_API_KEY`/`AI_MODEL` from `.env`.

## B. Existing features (verified in source, not README)

| Feature (`app.py` page) | What it actually does | Verdict |
|---|---|---|
| Predict Leakage | Form → 1-row DataFrame → `pipeline.predict` + `predict_proba` | Works if pickles exist. `Location_Code` is built as `f"{zone}{block}{pipe}"` → `"Zone_1Block_1Pipe_1"`, which **never matches** the dataset format `Zone_1_Block_1_Pipe_1`; the one-hot encoder silently maps it to all-zeros (`handle_unknown="ignore"`). |
| What-if Analysis | 3 sliders (Pressure, Flow, Temp); other features fixed; plots P(leak) vs Pressure | Useful concept. Uses `Location_Code="Zone_1_Block_1_Pipe_1"` (correct format here, inconsistent with the other page). |
| Zone Map & Geo Analysis | Folium map of every row; "Dead" pipe if `Flow_Rate < 5`; zone bar/pie charts | The dead-pipe rule never fires (dataset min flow = 21.2). Silent fallback to a 3-row fake DataFrame when the CSV path fails. |
| Batch Prediction | CSV upload → row-by-row predict loop → accuracy if label present | O(n) Python loop calling `predict` per row; works. |
| Analytics & Insights | Feature-importance bar chart and 4-model radar chart | **Both are hard-coded literals**, not computed. Radar values (RF 0.99/0.98/0.97/0.98 …) do not match the notebook's own outputs. |
| AI Assistant | Groq chat with dataset summary injected; regex "plot:" hooks | Requires network + key; crashes at import if key is missing (client constructed unconditionally). |
| About | Static text | — |

## C. Dataset structure

`data/location_aware_gis_leakage_dataset.csv` — 5 000 rows, 13 columns, 0 nulls, 0 duplicates, sha256 `9d7758a4b58969da…`.
Fully documented in `docs/DATA_DICTIONARY.md`; quality metrics in `reports/data_quality_report.md`.

Key facts (all measured, see `scripts/data_quality_report.py`):

- Label `Leakage_Flag`: 4 677 negative / 323 positive (**6.46 %**).
- Sensor columns are clean Gaussians: Pressure ~N(60,10), Flow ~N(80,15), Temperature ~N(100,5), Vibration ~N(3,0.5), RPM ~N(2000,300); `Operational_Hours` ~U(1000,10000).
- 5 Zones × 5 Blocks × 5 Pipes = 125 `Location_Code`s, uniformly populated; `Location_Code == Zone_Block_Pipe` for every row.
- Every row has a **unique** lat/lon; coordinates cluster by Zone (σ≈0.005°) around Dubai (25.18 N, 55.25 E).
- **The label is a deterministic rectangle**: every leak has `Flow_Rate ≥ 90.25` and `Pressure ≤ 53.42`, and every row inside that rectangle is a leak (323/323). A depth-2 decision tree on two features achieves 100 % training accuracy.
- No timestamp, no sensor ID, no production schedule, no consumption column.

## D. ML workflow (notebook, reproduced)

1. `train_test_split(test_size=0.2, random_state=42, stratify=y)` → 4 000 / 1 000.
2. `ColumnTransformer(StandardScaler on 8 numeric, OneHotEncoder(handle_unknown="ignore") on 4 categoricals)`.
3. `imblearn.Pipeline(preprocessor → SMOTE(42) → classifier)` — SMOTE correctly inside the pipeline (training fold only). ✔
4. Four estimators with the exact hyper-parameters copied into `ml/train.py`.
5. `joblib.dump` to CWD.

Our re-run (`python -m ml.train`) reproduces the notebook's printed accuracies **exactly**: RF 0.989, DT 0.910, LR 0.890, SVM 0.907 — so the notebook itself is honest; the README (0.98/0.91/0.90/0.89) and the app's radar chart are not.

## E. Frontend architecture

- One 480-line procedural script, top-level `if/elif` per page; no components, no state model beyond `st.session_state.chat_history`.
- Model loading, Groq client construction and page config all happen at import → any failure kills the whole app.
- Duplicated input-construction logic across three pages with inconsistent defaults and `Location_Code` formats.
- Sidebar "System Status: Online" is a static string.

## F. Backend limitations

There is no backend. Everything (ML inference, data access, LLM calls) runs inside the Streamlit process, so there is no API contract, no separation of concerns, no way to add real-time ingestion, websockets or a database without rewriting the UI.

## G. Deployment limitations

- Nothing pinned; `requirements.txt` omits `python-dotenv`, `imbalanced-learn`, `matplotlib`, `seaborn`, `jupyter` although the code imports them.
- Model pickles are git-ignored and produced only by manually running a notebook on a Windows machine (`C:\Users\asus\…` in outputs). A clean clone **cannot run `app.py`** (`FileNotFoundError: random_forest_model.pkl`).
- README says `streamlit run app.py` from the repo root; the file is in `frontend/` and the CSV path only resolves from `data/`.
- No Dockerfile, no compose, no environment documentation beyond two env-var names.

## H. Security issues

| Issue | Severity |
|---|---|
| Groq client created at import; any exception text (including provider errors) is rendered to the UI via `st.error(f"AI API Error: {str(e)}")` | MEDIUM |
| Raw `str(e)` from prediction errors shown to end user (stack-trace-adjacent leakage) | LOW |
| `joblib.load` of untrusted pickles from CWD (arbitrary code execution if a malicious file is dropped) | MEDIUM |
| No secrets committed (✔) — `.env` is ignored | — |

## I. Data-quality concerns

| Concern | Severity |
|---|---|
| Label is a deterministic function of two columns → dataset is synthetic; any metric on it is not evidence of real-world performance | **CRITICAL** (for SU-03 claims) |
| No time dimension, production schedule or consumption → the core SU-03 requirement (production vs. loss) cannot be evaluated | **CRITICAL** |
| Units undocumented; `Temperature` ≈ 100 ± 5 is not plausible °C for water | HIGH |
| 5 000 unique coordinates = 5 000 "pipes" with one reading each; no repeated measurements per asset | HIGH |
| Severe class imbalance (6.5 %) makes accuracy meaningless as a headline metric | HIGH |
| `Vibration`, `RPM`, `Temperature`, `Operational_Hours` carry ~zero signal (corr ≤ 0.02) | MEDIUM |

## J. ML-quality concerns

| Concern | Severity |
|---|---|
| Accuracy reported as the model-selection metric on a 6.5 % positive class | HIGH |
| Decision Tree hyper-parameters (`splitter="random"`, `max_features=3`, `max_depth=3`) yield ROC-AUC 0.49 (random) yet 0.91 accuracy is presented as a result | HIGH |
| `LogisticRegression(C=0.01, max_iter=100)` and `SVC(C=0.01)` are heavily under-regularised-tuned; SVM emits convergence warnings | MEDIUM |
| No cross-validation, no confidence intervals, single split | MEDIUM |
| Feature importances in UI are invented; real RF importances are Flow 0.50 / Pressure 0.48 (config B) | HIGH |
| Location features included as one-hot + lat/lon (see leakage investigation below) | MEDIUM |
| `predict_proba` fallback `except: prob = 0.9` fabricates confidence | HIGH |

### Data-leakage investigation (location shortcuts)

Two configurations were trained with identical protocol (`reports/baseline_model_evaluation.json`):

| Model | A (all 12 features) F1 / ROC-AUC | B (6 sensor features) F1 / ROC-AUC |
|---|---|---|
| random_forest | 0.908 / 1.000 | **0.992 / 1.000** |
| decision_tree | 0.022 / 0.494 | 0.195 / 0.750 |
| logistic_regression | 0.542 / 0.973 | 0.500 / 0.973 |
| svm | 0.579 / 0.972 | 0.570 / 0.973 |

Findings:

1. Location does **not** act as a leakage shortcut in this dataset — leak rate per Zone/Block/Pipe is flat (5.5–7.8 %), lat/lon correlate with the label at |r| ≈ 0.01, and RF importances for all six location columns together sum to ≈ 0.23 only because 125 one-hot columns dilute the split choices.
2. Removing location **improves** the Random Forest (recall 0.83 → 0.98) because the 125 near-useless one-hot columns compete with Flow/Pressure at each `max_features=sqrt` draw. Linear models are unaffected.
3. The reason every flexible model hits ROC-AUC ≈ 1.0 is the deterministic label rule, not location. Therefore neither configuration's headline metrics say anything about real leak detection; they say the dataset is synthetic.
4. Decision: `B_sensor_only/random_forest` is registered as the default model. Location columns are kept in the schema/DB for future localization work but are excluded from classification features.

## K. Hard-coded values

| Location | Value | Severity |
|---|---|---|
| `app.py` Analytics | feature importances `{Pressure:0.3, Flow:0.25, …}` | HIGH |
| `app.py` Analytics | radar-chart metrics for 4 models | HIGH |
| `app.py` `make_prediction` | `prob = 0.9` on exception | HIGH |
| `app.py` map | dead-pipe threshold `Flow_Rate < 5` | LOW |
| `app.py` What-if | fixed Vibration/RPM/Hours/lat/lon | LOW |
| `app.py` Zone/Block/Pipe selectors | 4 zones, 4 blocks, 3 pipes (dataset has 5/5/5) | MEDIUM |
| `app.py` sidebar | "System Status: Online" | LOW |
| README | accuracies 0.98/0.91/0.90/0.89 | MEDIUM |

## L. Missing dependencies

`python-dotenv`, `imbalanced-learn`, `matplotlib`, `seaborn`, `jupyter`/`ipykernel` are imported but absent from `requirements.txt`; nothing is version-pinned. **HIGH**

## M. Missing model artifacts

`random_forest_model.pkl`, `decision_tree_model.pkl`, `logistic_regression_model.pkl`, `svm_model.pkl` are required at import by `app.py`, git-ignored, and produced only by hand-running the notebook. **CRITICAL** — the app cannot start from a clean clone. Resolved in Phase 1 by `ml/train.py` + `ml/model_registry.py` (artifacts regenerated in ~10 s, metadata JSON committed).

## N. Technical debt summary

| # | Debt | Severity |
|---|---|---|
| 1 | No reproducible model artifacts | CRITICAL |
| 2 | Synthetic dataset presented as leak-detection evidence | CRITICAL |
| 3 | Invented metrics/importances in UI | HIGH |
| 4 | Relative-path & CWD coupling | HIGH |
| 5 | Monolithic Streamlit script, no API layer | HIGH |
| 6 | Unpinned/missing deps | HIGH |
| 7 | Inconsistent `Location_Code` construction between pages | MEDIUM |
| 8 | No tests, no CI, no Docker | MEDIUM |
| 9 | Bare `except:` clauses swallowing errors | MEDIUM |
| 10 | Import-time side effects (models, Groq client) | MEDIUM |

## O. Recommended migration strategy (executed in Phase 1)

1. **Freeze the baseline** in `legacy/` for reference; never import from it.
2. **Data**: copy the CSV to `data/raw/` as an immutable input; document it; generate a machine-readable quality report.
3. **ML**: replace the notebook with `ml/{schemas,preprocess,train,evaluate,model_registry,inference}.py`; identical protocol, real metrics, metadata per artifact, deterministic seeds; register `B_sensor_only/random_forest` as default.
4. **Backend**: FastAPI with settings from env, structured JSON logging, uniform error envelope, foundation endpoints + `/api/models` + `/api/predict` (the one legacy capability worth exposing now).
5. **Database**: SQLAlchemy models + Alembic migration for the nine core entities; optional at runtime in Phase 1.
6. **Frontend**: React/Vite/TS/Tailwind shell with the dark-industrial theme, reusable components, four foundation pages, same-origin API proxy.
7. **Ops**: `.env.example`, Dockerfiles, compose (db → migrate → backend → frontend), one-command test runner.
8. Preserve for later phases (not re-implemented now): what-if sweep concept, GIS map, batch prediction, LLM assistant (behind a backend provider abstraction).
