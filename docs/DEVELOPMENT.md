# Development Guide

## Native Windows Development

AquaRisk AI uses a native Windows stack powered by **XAMPP (MySQL/MariaDB)**, **Python Virtual Environments**, and **Node.js/npm**. 

### 1. Database (XAMPP)
Please refer to [XAMPP_SETUP.md](XAMPP_SETUP.md) for instructions on installing XAMPP, starting MySQL, and creating the `aurarisk_ai` database via phpMyAdmin.

### 2. Full Application Startup
Once XAMPP MySQL is running, simply execute the automated startup script from the root directory:

```powershell
.\scripts\start_all.ps1
```

This will automatically:
1. Verify Python and Node environments.
2. Verify XAMPP MySQL connectivity.
3. Launch the FastAPI backend on port 8000.
4. Launch the React Vite frontend on port 5173.

### Troubleshooting
Please see [WINDOWS_TROUBLESHOOTING.md](WINDOWS_TROUBLESHOOTING.md) if you encounter any port conflicts, Python path issues, or missing dependencies.

## Backend
The backend uses FastAPI and SQLAlchemy.
```bash
python -m pip install -r backend/requirements.txt
python database/seeds/seed.py
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
The frontend uses Vite, React, and Tailwind CSS.
```bash
cd frontend
npm install
npm run dev
```

## Docker Environment
To run the full stack (Frontend, Backend, PostgreSQL) consistently:
```bash
docker compose up --build
```
