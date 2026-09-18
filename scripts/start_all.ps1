Write-Host "AquaRisk AI Native Launcher"
Write-Host "==========================="

Write-Host "Checking Database..."
$dbStatus = & .venv\Scripts\python.exe scripts\check_environment.py
if ($dbStatus -match "OFFLINE") {
    Write-Host ""
    Write-Host "WARNING: XAMPP MySQL is not running!" -ForegroundColor Red
    Write-Host "Open XAMPP Control Panel and start MySQL."
    Write-Host "Then run this command again."
    Write-Host ""
    exit
}

Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File scripts\start_backend.ps1"

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File scripts\start_frontend.ps1"

Write-Host "All services launched in separate windows!"
