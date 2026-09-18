# XAMPP Database Setup Instructions

AquaRisk AI uses XAMPP to natively run MySQL/MariaDB for local development.

## Step 1: Install XAMPP
If you haven't already, download and install XAMPP for Windows.

## Step 2: Open XAMPP Control Panel
Launch the `XAMPP Control Panel` as Administrator (optional but recommended).

## Step 3: Start Services
Click **Start** next to both **Apache** and **MySQL**.
Ensure they turn green in the control panel.

## Step 4: Open phpMyAdmin
Open your browser and navigate to:
[http://localhost/phpmyadmin](http://localhost/phpmyadmin)

## Step 5: Create the Database
1. Click on the **Databases** tab at the top.
2. In the "Create database" field, type exactly: `aurarisk_ai`
3. Click **Create**.

## Step 6: Initialize the Schema
Open a new PowerShell terminal, navigate to the project root, and activate the virtual environment:
```powershell
.venv\Scripts\Activate.ps1
python scripts\init_database.py
```
This will automatically connect to MySQL on `localhost:3306` (using the default `root` user with no password) and create all necessary tables.

## Step 7: Launch!
Run the `start_all.ps1` script to launch both the FastAPI backend and React frontend native processes simultaneously.
