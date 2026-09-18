# Ensure execution policy allows running scripts
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "Aquarisk AI Native Windows Setup"
Write-Host "================================="

# 1. Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Found Python."
} else {
    Write-Host "Python is not installed or not in PATH."
    exit
}

# 2. Check Node
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Found npm."
} else {
    Write-Host "Node.js/npm is not installed or not in PATH."
    exit
}

# 3. Create venv
if (-Not (Test-Path -Path ".venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
}

# 4. Install backend dependencies
Write-Host "Installing Python dependencies..."
& .venv\Scripts\python.exe -m pip install -r requirements.txt

# 5. Install frontend dependencies
Write-Host "Installing Frontend dependencies..."
Set-Location frontend
npm install
Set-Location ..

Write-Host "================================="
Write-Host "Setup complete!"
Write-Host "Run .\scripts\start_all.ps1 to launch the application."
