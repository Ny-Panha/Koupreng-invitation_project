#!/usr/bin/env pwsh
# ==============================================================================
# Koupreng Project - Full Stack Windows Dev Orchestrator
# Author: Nha & Antigravity
# Environment: Windows (PowerShell 5.1+ / PowerShell Core)
# Runs: Backend (:8080) + Frontend User (:5173) + Frontend Admin (:5174)
# ==============================================================================

param (
    [Alias("admin", "admin-only", "Admin")]
    [switch]$AdminOnly,

    [Alias("user", "user-only", "User")]
    [switch]$UserOnly,

    [Alias("ngrok")]
    [switch]$Ngrok,

    [Alias("no-ngrok", "nongrok")]
    [switch]$NoNgrok,

    [Alias("bot")]
    [switch]$Bot,

    [Alias("new-window", "window")]
    [switch]$NewWindow,

    [Alias("h", "?")]
    [switch]$Help
)

$ErrorActionPreference = "Continue"

# Parse raw args in case flags were passed in Linux style (--admin, --ngrok, etc.)
foreach ($arg in $args) {
    switch ($arg) {
        "--admin"       { $AdminOnly = $true; $UserOnly = $false }
        "--admin-only"  { $AdminOnly = $true; $UserOnly = $false }
        "--user"        { $UserOnly = $true; $AdminOnly = $false }
        "--user-only"   { $UserOnly = $true; $AdminOnly = $false }
        "--ngrok"       { $Ngrok = $true }
        "--no-ngrok"    { $NoNgrok = $true }
        "--bot"         { $Bot = $true }
        "--new-window"  { $NewWindow = $true }
        "--help"        { $Help = $true }
        "-h"            { $Help = $true }
    }
}

if ($Help) {
    Write-Host "Usage: .\scripts\maintenance\dev.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Admin, -AdminOnly, --admin      Run Backend + Frontend Admin only"
    Write-Host "  -User, -UserOnly, --user         Run Backend + Frontend User only"
    Write-Host "  -Ngrok, --ngrok                  Launch ngrok tunnel for Frontend (:5173)"
    Write-Host "  -NoNgrok, --no-ngrok             Run locally without tunnel (default)"
    Write-Host "  -Bot, --bot                      Launch Telegram Bot service (:8000)"
    Write-Host "  -NewWindow                       Launch each service in a separate terminal window"
    Write-Host "  -Help, -h, --help                Show this help message"
    exit 0
}

# Resolve root directory
$ScriptDir = Split-Path -Parent $PSCommandPath
if (-not $ScriptDir) { $ScriptDir = $PSScriptRoot }
$RootDir = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
Set-Location $RootDir

# Mode configuration
$RunUser = $true
$RunAdmin = $true

if ($AdminOnly) {
    $RunAdmin = $true
    $RunUser = $false
}
if ($UserOnly) {
    $RunUser = $true
    $RunAdmin = $false
}

$EnableNgrok = [bool]($Ngrok -and (-not $NoNgrok))
$EnableBot = [bool]$Bot

# Load .env if present
$EnvFile = Join-Path $RootDir ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match '^\s*([^#=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
        }
    }
}

if (-not $env:SPRING_PROFILES_ACTIVE) {
    $env:SPRING_PROFILES_ACTIVE = "dev"
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   ⚜️  KOUPRENG FULL STACK DEV RUNNER (WINDOWS) ⚜️" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# Function to free busy port
function Free-Port {
    param([int]$Port)
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($conn in $conns) {
                if ($conn.OwningProcess -and $conn.OwningProcess -gt 4) {
                    Write-Host "  ⚡ Freeing busy port :$Port (PID $($conn.OwningProcess))..." -ForegroundColor Yellow
                    Start-Process -FilePath "taskkill.exe" -ArgumentList "/PID $($conn.OwningProcess) /T /F" -NoNewWindow -Wait -ErrorAction SilentlyContinue 2>$null
                }
            }
            Start-Sleep -Milliseconds 500
        }
    } catch {
        $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING\s+(\d+)"
        foreach ($line in $lines) {
            $pidMatch = $line.Matches[0].Groups[1].Value
            if ($pidMatch -and [int]$pidMatch -gt 4) {
                Write-Host "  ⚡ Freeing busy port :$Port (PID $pidMatch)..." -ForegroundColor Yellow
                Start-Process -FilePath "taskkill.exe" -ArgumentList "/PID $pidMatch /T /F" -NoNewWindow -Wait -ErrorAction SilentlyContinue 2>$null
            }
        }
    }
}

# 1. Database Check & Start
Write-Host "`n[1/4] Checking Database Service..." -ForegroundColor White
$isPortOpen = $false
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $asyncResult = $tcpClient.BeginConnect("127.0.0.1", 3306, $null, $null)
    $waitHandle = $asyncResult.AsyncWaitHandle.WaitOne(1000, $false)
    if ($waitHandle -and $tcpClient.Connected) {
        $isPortOpen = $true
        $tcpClient.EndConnect($asyncResult)
    }
    $tcpClient.Close()
} catch {
    $isPortOpen = $false
}

if ($isPortOpen) {
    Write-Host "  ✓ MariaDB/MySQL service is active on port 3306" -ForegroundColor Green
} else {
    $dbService = Get-Service -Name "MySQL*", "MariaDB*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" }
    if ($dbService) {
        Write-Host "  ✓ Database service is active ($($dbService[0].DisplayName))" -ForegroundColor Green
    } else {
        $stoppedService = Get-Service -Name "MySQL*", "MariaDB*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -ne "Running" } | Select-Object -First 1
        if ($stoppedService) {
            Write-Host "  ⚡ Starting database service ($($stoppedService.Name))..." -ForegroundColor Yellow
            Start-Service -Name $stoppedService.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Host "  ✓ Database started" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Port 3306 is not open. Ensure MariaDB/MySQL or XAMPP/Laragon is started." -ForegroundColor Yellow
        }
    }
}

# Track child process IDs for graceful shutdown
$ProcessIds = [System.Collections.Generic.List[int]]::new()

function Cleanup {
    Write-Host "`n`n🛑 Shutting down all Koupreng dev services..." -ForegroundColor Yellow
    foreach ($procId in $ProcessIds) {
        if ($procId) {
            Start-Process -FilePath "taskkill.exe" -ArgumentList "/PID $procId /T /F" -NoNewWindow -Wait -ErrorAction SilentlyContinue 2>$null
        }
    }
    Free-Port 8080
    if ($RunUser) { Free-Port 5173 }
    if ($RunAdmin) { Free-Port 5174 }
    if ($EnableBot) { Free-Port 8000 }
    Write-Host "✓ All services stopped cleanly.`n" -ForegroundColor Green
}

# Helper to start process
function Start-DevProcess {
    param(
        [string]$Title,
        [string]$WorkingDir,
        [string]$Command
    )

    if ($NewWindow) {
        $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/k title $Title && $Command" -WorkingDirectory $WorkingDir -PassThru
    } else {
        $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c $Command" -WorkingDirectory $WorkingDir -PassThru -NoNewWindow
    }
    if ($proc -and $proc.Id) {
        $ProcessIds.Add($proc.Id)
    }
    return $proc
}

try {
    # 2. Start Backend (Spring Boot :8080)
    Free-Port 8080
    Write-Host "`n[2/4] Starting Backend (Spring Boot on :8080)..." -ForegroundColor White
    $backendDir = Join-Path $RootDir "apps\backend"
    $backendCmd = "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=$($env:SPRING_PROFILES_ACTIVE)"
    $null = Start-DevProcess -Title "[Koupreng] Backend API" -WorkingDir $backendDir -Command $backendCmd

    Write-Host "  Waiting for Backend to initialize..." -ForegroundColor Cyan
    for ($i = 1; $i -le 35; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8080/actuator/health/readiness" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                Write-Host "  ✓ Backend is READY at http://localhost:8080" -ForegroundColor Green
                break
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    # 3. Start Frontend User (:5173)
    if ($RunUser) {
        Free-Port 5173
        Write-Host "`n[3/4] Starting Frontend User (React on :5173)..." -ForegroundColor White
        $userDir = Join-Path $RootDir "apps\frontend-user"
        $userCmd = "npm.cmd run dev -- --host --port 5173"
        $null = Start-DevProcess -Title "[Koupreng] Frontend User" -WorkingDir $userDir -Command $userCmd

        Write-Host "  Waiting for Frontend User to initialize..." -ForegroundColor Cyan
        for ($i = 1; $i -le 30; $i++) {
            try {
                $resp = Invoke-WebRequest -Uri "http://127.0.0.1:5173/login" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
                if ($resp.StatusCode -eq 200) {
                    Write-Host "  ✓ Frontend User is READY at http://localhost:5173" -ForegroundColor Green
                    break
                }
            } catch {
                Start-Sleep -Seconds 1
            }
        }
    }

    # 4. Start Frontend Admin (:5174)
    if ($RunAdmin) {
        Free-Port 5174
        Write-Host "`n[4/4] Starting Frontend Admin (React on :5174)..." -ForegroundColor White
        $adminDir = Join-Path $RootDir "apps\frontend-admin"
        $adminCmd = "npm.cmd run dev -- --host --port 5174"
        $null = Start-DevProcess -Title "[Koupreng] Frontend Admin" -WorkingDir $adminDir -Command $adminCmd
    }

    # Optional: Telegram Bot (:8000)
    $botDir = Join-Path $RootDir "apps\telegram-bot"
    if ($EnableBot -and (Test-Path $botDir)) {
        Free-Port 8000
        Write-Host "`n[Bot] Starting Telegram Bot (FastAPI on :8000)..." -ForegroundColor White
        $botPython = if (Test-Path (Join-Path $botDir ".venv\Scripts\python.exe")) {
            ".venv\Scripts\python.exe"
        } else {
            "python"
        }
        $botCmd = "$botPython -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
        $null = Start-DevProcess -Title "[Koupreng] Telegram Bot" -WorkingDir $botDir -Command $botCmd
    }

    # Optional: Ngrok Tunnel
    if ($EnableNgrok) {
        Write-Host "`n[Tunnel] Starting Ngrok for :5173..." -ForegroundColor White
        $null = Start-DevProcess -Title "[Koupreng] Ngrok Tunnel" -WorkingDir $RootDir -Command "ngrok http 5173"
    }

    # Status Banner
    Write-Host "`n======================================================" -ForegroundColor Green
    Write-Host "   ✨ ALL SERVICES RUNNING SUCCESSFULLY! ✨" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
    if ($RunUser) {
        Write-Host "  🌐 Frontend User:   http://localhost:5173" -ForegroundColor Cyan
    }
    if ($RunAdmin) {
        Write-Host "  👑 Frontend Admin:  http://localhost:5174" -ForegroundColor Cyan
    }
    Write-Host "  ⚙️  Backend API:     http://localhost:8080" -ForegroundColor Cyan
    if ($EnableBot) {
        Write-Host "  🤖 Telegram Bot:    http://localhost:8000" -ForegroundColor Cyan
    }
    Write-Host "------------------------------------------------------"
    Write-Host "  Press [Ctrl + C] anytime to stop all services." -ForegroundColor Yellow
    Write-Host "======================================================`n"

    # Keep alive until user interrupts with Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Cleanup
}
