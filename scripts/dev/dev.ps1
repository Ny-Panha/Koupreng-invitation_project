# ==============================================================================
# Koupreng Project - Windows Full Stack Dev Runner (PowerShell)
# Author: Nha & Antigravity
# Environment: Windows 10/11
# Runs: Backend (:8080) + Frontend User (:5173) + Frontend Admin (:5174)
# ==============================================================================

param (
    [switch]$Ngrok,
    [switch]$Bot,
    [switch]$AdminOnly,
    [switch]$UserOnly,
    [switch]$Help
)

$ErrorActionPreference = "Continue"
$RootDir = (Get-Item "$PSScriptRoot\..\..").FullName
Set-Location $RootDir

if ($Help) {
    Write-Host "Usage: .\scripts\dev\dev.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -AdminOnly    Run Backend + Frontend Admin only"
    Write-Host "  -UserOnly     Run Backend + Frontend User only"
    Write-Host "  -Ngrok        Launch ngrok tunnel for Frontend (:5173)"
    Write-Host "  -Bot          Launch Telegram Bot service (:8000)"
    Write-Host "  -Help         Show this help message"
    exit 0
}

# Load .env
if (Test-Path "$RootDir\.env") {
    Get-Content "$RootDir\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Koupreng FULL STACK DEV RUNNER (WINDOWS)" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# Function: Free busy port
function Free-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "  Freeing busy port :$Port..." -ForegroundColor Yellow
        $conn | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 500
    }
}

# Track started processes for cleanup
$jobs = @()

# 1. Check Database
Write-Host "`n[1/4] Checking Database Service..." -ForegroundColor White
$dbService = Get-Service -Name "MySQL*", "MariaDB*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" }
if ($dbService) {
    Write-Host "  Database running: $($dbService.DisplayName)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: MySQL/MariaDB not running. Start it via XAMPP, Laragon, or Services." -ForegroundColor Yellow
}

# 2. Start Backend (Spring Boot :8080)
Free-Port 8080
Write-Host "`n[2/4] Starting Backend (Spring Boot on :8080)..." -ForegroundColor White

$backendDir = "$RootDir\apps\backend"
if (Test-Path "$backendDir\mvnw.cmd") {
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & .\mvnw.cmd spring-boot:run 2>&1
    } -ArgumentList $backendDir
} elseif (Test-Path "$backendDir\gradlew.bat") {
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & .\gradlew.bat bootRun 2>&1
    } -ArgumentList $backendDir
} else {
    Write-Host "  ERROR: No mvnw.cmd or gradlew.bat found in apps/backend" -ForegroundColor Red
    exit 1
}
$jobs += $backendJob

# Wait for backend to start
Write-Host "  Waiting for Backend to initialize..." -ForegroundColor Cyan
for ($i = 1; $i -le 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health/readiness" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  Backend is READY at http://localhost:8080" -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}

# 3. Start Frontend User (:5173)
if (-not $AdminOnly) {
    Free-Port 5173
    Write-Host "`n[3/4] Starting Frontend User (React on :5173)..." -ForegroundColor White
    $userJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & npm run dev -- --host --port 5173 2>&1
    } -ArgumentList "$RootDir\apps\frontend-user"
    $jobs += $userJob

    Write-Host "  Waiting for Frontend User to initialize..." -ForegroundColor Cyan
    for ($i = 1; $i -le 30; $i++) {
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:5173/login" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "  Frontend User is READY at http://localhost:5173" -ForegroundColor Green
            break
        } catch {
            Start-Sleep -Seconds 1
        }
    }
}

# 4. Start Frontend Admin (:5174)
if (-not $UserOnly) {
    Free-Port 5174
    Write-Host "`n[4/4] Starting Frontend Admin (React on :5174)..." -ForegroundColor White
    $adminJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & npm run dev -- --host --port 5174 2>&1
    } -ArgumentList "$RootDir\apps\frontend-admin"
    $jobs += $adminJob
}

# Optional: Ngrok Tunnel
if ($Ngrok) {
    Write-Host "`n[Tunnel] Starting Ngrok for :5173..." -ForegroundColor White
    $ngrokJob = Start-Job -ScriptBlock { & ngrok http 5173 2>&1 }
    $jobs += $ngrokJob
}

# Optional: Telegram Bot
if ($Bot) {
    Write-Host "`n[Bot] Starting Telegram Bot (FastAPI on :8000)..." -ForegroundColor White
    $botJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & python -m uvicorn app.main:app --port 8000 --reload 2>&1
    } -ArgumentList "$RootDir\apps\telegram-bot"
    $jobs += $botJob
}

# Status Banner
Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "   ALL SERVICES RUNNING SUCCESSFULLY!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
if (-not $AdminOnly) {
    Write-Host "  Frontend User:   http://localhost:5173" -ForegroundColor Cyan
}
if (-not $UserOnly) {
    Write-Host "  Frontend Admin:  http://localhost:5174 (admin@koupreng.com / admin123)" -ForegroundColor Cyan
}
Write-Host "  Backend API:     http://localhost:8080" -ForegroundColor Cyan
if ($Bot) { Write-Host "  Telegram Bot:    http://localhost:8000" -ForegroundColor Cyan }
Write-Host "------------------------------------------------------"
Write-Host "  Press [Ctrl + C] to stop, or close this window." -ForegroundColor Yellow
Write-Host "======================================================`n"

# Keep script alive and stream logs
try {
    while ($true) {
        foreach ($job in $jobs) {
            if ($job.State -ne "Running") { continue }
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) { $output | ForEach-Object { Write-Host $_ } }
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping all Koupreng dev services..." -ForegroundColor Yellow
    $jobs | ForEach-Object { Stop-Job -Job $_ -ErrorAction SilentlyContinue; Remove-Job -Job $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "All services stopped cleanly." -ForegroundColor Green
}
