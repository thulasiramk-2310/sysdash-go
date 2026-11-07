#!/usr/bin/env pwsh
# SysDash - Start All Services
# This script starts the Go backend, Python collector, and React dashboard

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  SysDash - System Monitoring Dashboard" -ForegroundColor Cyan
Write-Host "  Starting All Services..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Go
try {
    $goVersion = go version
    Write-Host "  ✓ Go installed: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Go not found! Please install Go 1.21+" -ForegroundColor Red
    Write-Host "    Download from: https://go.dev/dl/" -ForegroundColor Yellow
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "  ✓ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.9+" -ForegroundColor Red
    Write-Host "    Download from: https://python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    Write-Host "    Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Install dependencies if needed
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow


Write-Host "  Installing Python dependencies..." -ForegroundColor Cyan
Set-Location python
$pythonDepsError = $false
try {
    pip install -r requirements.txt -q
} catch {
    $pythonDepsError = $true
    Write-Host "  ✗ Error installing Python dependencies" -ForegroundColor Red
}
Set-Location ..
if ($pythonDepsError -eq $false -and $LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
}
if ($pythonDepsError -eq $false -and $LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install Python dependencies" -ForegroundColor Red
}


Write-Host "  Installing Go dependencies..." -ForegroundColor Cyan
Set-Location backend
$goDepsError = $false
try {
    go mod download
} catch {
    $goDepsError = $true
    Write-Host "  ✗ Error installing Go dependencies" -ForegroundColor Red
}
Set-Location ..
if ($goDepsError -eq $false -and $LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Go dependencies installed" -ForegroundColor Green
}
if ($goDepsError -eq $false -and $LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install Go dependencies" -ForegroundColor Red
}


if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing Node.js dependencies..." -ForegroundColor Cyan
    $nodeDepsError = $false
    try {
        npm install -q
    } catch {
        $nodeDepsError = $true
        Write-Host "  ✗ Error installing Node.js dependencies" -ForegroundColor Red
    }
    if ($nodeDepsError -eq $false -and $LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Node.js dependencies installed" -ForegroundColor Green
    }
    if ($nodeDepsError -eq $false -and $LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to install Node.js dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "  ✓ Node.js dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Start services
Write-Host "[3/6] Starting Go Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '=== Go Backend Server ===' -ForegroundColor Cyan; go run ."
Start-Sleep -Seconds 3

# Check if backend is running
Write-Host "  Waiting for backend to start..." -ForegroundColor Cyan
$backendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 2
        if ($response.status -eq "healthy") {
            Write-Host "  ✓ Backend is healthy and ready" -ForegroundColor Green
            $backendReady = $true
            break
        }
    } catch {
        Write-Host "  Attempt $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "  ⚠ Backend may not be ready, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

Write-Host "[4/6] Starting Python Metrics Collector..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\python'; Write-Host '=== Python Metrics Collector ===' -ForegroundColor Cyan; python collector.py --interval 2 --backend http://localhost:8080"
Write-Host "  ✓ Collector started" -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""

Write-Host "[5/6] Starting React Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '=== React Dashboard ===' -ForegroundColor Cyan; npm run dev"
Write-Host "  ✓ Dashboard starting..." -ForegroundColor Green
Start-Sleep -Seconds 5

Write-Host ""

Write-Host "[6/6] Opening Dashboard in Browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
Write-Host "  ✓ Browser opened" -ForegroundColor Green

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ✓ All Services Started Successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running:" -ForegroundColor White
Write-Host "  • Go Backend:       http://localhost:8080" -ForegroundColor Cyan
Write-Host "  • React Dashboard:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • WebSocket:        ws://localhost:8080/ws" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  Close all PowerShell windows or press Ctrl+C in each" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
