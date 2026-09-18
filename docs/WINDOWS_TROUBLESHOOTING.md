# Windows Troubleshooting Guide

## Python not found
Ensure Python is added to your PATH during installation.
Test by running `python --version` in a new PowerShell window.

## npm not found
Ensure Node.js is installed. If installed, restart your terminal or computer so the PATH changes take effect.
Test by running `npm --version`.

## PowerShell execution-policy issue
If you see an error about scripts being disabled, run:
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force`
This enables scripts for the current terminal session without permanently modifying system security.

## XAMPP MySQL not starting
Port 3306 might be occupied by another MySQL instance on your machine.
Open XAMPP Control Panel -> Config -> my.ini and change the port, OR stop the conflicting service via Windows Services (`services.msc`).

## MySQL authentication failure
By default, XAMPP MySQL uses the username `root` with a blank password.
If you set a password, update `DATABASE_PASSWORD` in your `.env` file.

## Port 8000 occupied
If FastAPI fails to start because port 8000 is occupied, you can change the port in `scripts/start_backend.ps1` to 8080, and update `VITE_API_BASE_URL` in your `.env`.

## Port 5173 occupied
Vite will automatically fall back to 5174 if 5173 is occupied.

## CORS error
Ensure your `VITE_API_BASE_URL` exactly matches the backend address (e.g. `http://127.0.0.1:8000`).
The backend allows CORS exclusively for `http://localhost:5173` and `http://127.0.0.1:5173`.

## Missing Python package
Run: `& .venv\Scripts\python.exe -m pip install -r requirements.txt`

## Missing Node package
Run: `cd frontend; npm install`

## Missing ML model
Ensure you have executed the baseline/intelligence evaluation scripts from Phase 4/5 which generate the `.joblib` models in `ml/baseline/models/` and `ml/intelligence/models/`.
