#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromPipeline = $true)]
    [string]$Message
)

$ErrorActionPreference = "Continue"

# ─────────────────────────────────────────────────────────────────────────────
# git-sync.ps1 — Safe team Git sync script for Koupreng (Windows)
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir = Split-Path -Parent $PSCommandPath
$gitRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($gitRoot)) {
    Set-Location $gitRoot.Trim()
}
else {
    Set-Location (Resolve-Path (Join-Path $ScriptDir "..\..\..\..")).Path
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "Commit message: " -ForegroundColor Cyan -NoNewline
    $Message = Read-Host
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host ""
    Write-Host "Commit message cannot be empty. Usage: .\scripts\maintenance\git\sync\git-sync.ps1 `"update invitation flow`"" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Safe Team Git Sync" -ForegroundColor Cyan
Write-Host "Commit local work, rebase on latest origin/main, then push." -ForegroundColor Yellow
Write-Host ""

$pushScript = Join-Path $ScriptDir "..\push\git-push.ps1"
& $pushScript $Message
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
