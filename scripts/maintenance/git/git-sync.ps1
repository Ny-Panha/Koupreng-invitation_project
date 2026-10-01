#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $PSCommandPath
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
Set-Location $ProjectRoot

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Commit message"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host ""
    Write-Host "Commit message cannot be empty. Usage: .\scripts\maintenance\git-sync.ps1 ""update invitation flow""" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Safe Team Git Sync"
Write-Host "Commit local work, rebase on latest origin/main, then push."
& (Join-Path $ScriptDir "git-push.ps1") $Message
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
