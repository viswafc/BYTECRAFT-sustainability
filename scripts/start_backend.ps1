Write-Host "Starting AquaRisk AI Backend..."
& .venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
