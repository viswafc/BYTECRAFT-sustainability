# Baseline Audit

## A. Existing Architecture
The existing application uses Streamlit as a monolithic frontend and backend, with Machine Learning models loaded directly into memory from `.pkl` files. It relies on a local Jupyter Notebook (`water_leak_detection.ipynb`) for training the models. The application is entirely contained within `app.py`.

## B. Existing Features
- **Predict Leakage**: Single inference using a selected ML model based on user input.
- **What-if Analysis**: Interactive sliders to tweak sensor values and see real-time probability changes for leaks.
- **Zone Map & Geo Analysis**: Interactive map visualizing leaks, active/dead pipes based on the loaded dataset.
- **Batch Prediction**: Upload a CSV to get predictions for multiple rows simultaneously.
- **Analytics & Insights**: Hardcoded feature importance and model comparison charts.
- **AI Assistant**: Integration with Groq's API to answer questions and plot data interactively.

## C. Dataset Structure
The main dataset is `location_aware_gis_leakage_dataset.csv`, consisting of 5,000 records.
Columns: `Pressure`, `Flow_Rate`, `Temperature`, `Vibration`, `RPM`, `Operational_Hours`, `Zone`, `Block`, `Pipe`, `Location_Code`, `Latitude`, `Longitude`, `Leakage_Flag`.

## D. ML Workflow
- The ML workflow consists of a single Jupyter Notebook (`water_leak_detection.ipynb`) which processes the data, trains Random Forest, Decision Tree, Logistic Regression, and SVM models, and exports them as `.pkl` files.
- The Streamlit app loads these `.pkl` files synchronously on startup.

## E. Frontend Architecture
- Streamlit application (`app.py`).
- monolithic design, rendering both logic and UI sequentially.
- Visuals rely on Plotly and Folium for mapping.

## F. Backend Limitations
- No REST or GraphQL API.
- All logic executes synchronously within the UI thread.
- No database connection (loads CSV directly into Pandas).
- Hardcoded metrics and insights instead of dynamic calculation from real model objects or database.

## G. Deployment Limitations
- No Dockerfile or `docker-compose.yml`.
- Relies on manual execution (`streamlit run app.py`).
- No clear configuration management for environments (dev vs prod).

## H. Security Issues
- Using `.env` via `dotenv` in the same directory, but directly instantiating the Groq client in the Streamlit app which could be problematic if this architecture was translated directly to a browser-based frontend.
- API Keys could easily be exposed if the code is shared.

## I. Data-Quality Concerns
- The dataset is relatively small (5,000 rows).
- Need to verify if `Latitude`, `Longitude`, `Zone`, `Block`, `Pipe`, `Location_Code` act as data leaks (i.e. model learns the location of leaks rather than the sensor behavior).
- `Leakage_Flag` is the target variable.

## J. ML-Quality Concerns
- Hardcoded evaluation metrics in the Streamlit app. For example, Random Forest accuracy is manually set to `0.98`.
- Model artifacts (`.pkl`) are missing from the repository (not checked into Git). Running the Streamlit app will fail initially without running the notebook first to generate the models.
- Potential Data Leakage through geographic identifiers.

## K. Hard-coded Values
- Analytics page has completely hard-coded `feat_imp` dictionaries and metric scores for all models.
- "What-if" analysis defaults and sliders are hardcoded.

## L. Missing Dependencies
- `python-dotenv` is used but missing from `requirements.txt`.
- The `app.py` script attempts to load models that are not checked into the repository.

## M. Missing Model Artifacts
- `random_forest_model.pkl`, `decision_tree_model.pkl`, `logistic_regression_model.pkl`, `svm_model.pkl` are all missing from the repo, leading to `FileNotFoundError` on startup.

## N. Technical Debt
- monolithic architecture (Streamlit app handles AI, ML inference, File uploading, and UI).
- Models must be generated locally before the app can run.
- Missing REST API prevents scaling or integrating other frontends.
- Hardcoded metrics are misleading and unscientific.

## O. Recommended Migration Strategy
1. **Separation of Concerns**: Move backend to FastAPI, UI to React/Vite, ML to a structured pipeline (`ml/train.py`, `ml/inference.py`).
2. **Data Pipeline**: Move data handling to PostgreSQL and implement proper DB migrations.
3. **ML Registry**: Store models systematically with metadata to ensure the UI can fetch live metrics instead of hard-coded values.
4. **Environment**: Containerize with Docker and Docker Compose for reproducible builds.
