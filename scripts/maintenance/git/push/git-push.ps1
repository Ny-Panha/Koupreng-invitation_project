#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromPipeline = $true)]
    [string]$Message
)

$ErrorActionPreference = "Continue"

# ─────────────────────────────────────────────────────────────────────────────
# git-push.ps1 — Interactive menu-driven Git push script for Koupreng (Windows)
# ─────────────────────────────────────────────────────────────────────────────

$BORDER = "=" * 51
$CHECK = "$([char]0x2713)"

$ScriptDir = Split-Path -Parent $PSCommandPath
$gitRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($gitRoot)) {
    Set-Location $gitRoot.Trim()
}
else {
    Set-Location (Resolve-Path (Join-Path $ScriptDir "..\..\..\..")).Path
}

# ─────────────────────────────────────────────────────────────────────────────
# Commit message templates
# ─────────────────────────────────────────────────────────────────────────────
function Show-Menu {
    Write-Host ""
    Write-Host $BORDER -ForegroundColor Cyan
    Write-Host "  Koupreng Git Push Menu" -ForegroundColor Cyan
    Write-Host $BORDER -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Backend (Spring Boot)" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "1) " -ForegroundColor Yellow -NoNewline; Write-Host " Update backend API endpoints"
    Write-Host "  " -NoNewline; Write-Host "2) " -ForegroundColor Yellow -NoNewline; Write-Host " Fix backend bug"
    Write-Host "  " -NoNewline; Write-Host "3) " -ForegroundColor Yellow -NoNewline; Write-Host " Add backend feature"
    Write-Host "  " -NoNewline; Write-Host "4) " -ForegroundColor Yellow -NoNewline; Write-Host " Update backend security/auth"
    Write-Host "  " -NoNewline; Write-Host "5) " -ForegroundColor Yellow -NoNewline; Write-Host " Update database schema/migration"
    Write-Host ""

    Write-Host "Frontend User" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "6) " -ForegroundColor Yellow -NoNewline; Write-Host " Update user interface/UI"
    Write-Host "  " -NoNewline; Write-Host "7) " -ForegroundColor Yellow -NoNewline; Write-Host " update chat bot"
    Write-Host "  " -NoNewline; Write-Host "8) " -ForegroundColor Yellow -NoNewline; Write-Host " update page page"
    Write-Host "  " -NoNewline; Write-Host "9) " -ForegroundColor Yellow -NoNewline; Write-Host " Fix frontend-user bug"
    Write-Host "  " -NoNewline; Write-Host "10)" -ForegroundColor Yellow -NoNewline; Write-Host " Add user-facing feature"
    Write-Host "  " -NoNewline; Write-Host "11)" -ForegroundColor Yellow -NoNewline; Write-Host " Update invitation templates"
    Write-Host ""

    Write-Host "Frontend Admin" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "12)" -ForegroundColor Yellow -NoNewline; Write-Host " Update admin dashboard"
    Write-Host "  " -NoNewline; Write-Host "13)" -ForegroundColor Yellow -NoNewline; Write-Host " Fix admin panel bug"
    Write-Host "  " -NoNewline; Write-Host "14)" -ForegroundColor Yellow -NoNewline; Write-Host " Add admin feature"
    Write-Host ""

    Write-Host "Telegram Bot" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "15)" -ForegroundColor Yellow -NoNewline; Write-Host " Update telegram bot"
    Write-Host "  " -NoNewline; Write-Host "16)" -ForegroundColor Yellow -NoNewline; Write-Host " Fix telegram bot webhook"
    Write-Host "  " -NoNewline; Write-Host "17)" -ForegroundColor Yellow -NoNewline; Write-Host " Add telegram bot feature"
    Write-Host ""

    Write-Host "Infrastructure & Configuration" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "18)" -ForegroundColor Yellow -NoNewline; Write-Host " Update environment configuration"
    Write-Host "  " -NoNewline; Write-Host "19)" -ForegroundColor Yellow -NoNewline; Write-Host " Update dependencies"
    Write-Host "  " -NoNewline; Write-Host "20)" -ForegroundColor Yellow -NoNewline; Write-Host " Update dev scripts (dev.sh, setup.sh)"
    Write-Host "  " -NoNewline; Write-Host "21)" -ForegroundColor Yellow -NoNewline; Write-Host " Update documentation"
    Write-Host ""

    Write-Host "Payment Integration" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "22)" -ForegroundColor Yellow -NoNewline; Write-Host " Update payment flow"
    Write-Host "  " -NoNewline; Write-Host "23)" -ForegroundColor Yellow -NoNewline; Write-Host " Fix payment bug"
    Write-Host "  " -NoNewline; Write-Host "24)" -ForegroundColor Yellow -NoNewline; Write-Host " Add payment feature (ABA PayWay, etc.)"
    Write-Host ""

    Write-Host "General" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "25)" -ForegroundColor Yellow -NoNewline; Write-Host " Refactor code"
    Write-Host "  " -NoNewline; Write-Host "26)" -ForegroundColor Yellow -NoNewline; Write-Host " Update tests"
    Write-Host "  " -NoNewline; Write-Host "27)" -ForegroundColor Yellow -NoNewline; Write-Host " Performance improvements"
    Write-Host "  " -NoNewline; Write-Host "28)" -ForegroundColor Yellow -NoNewline; Write-Host " Security updates"
    Write-Host "  " -NoNewline; Write-Host "29)" -ForegroundColor Yellow -NoNewline; Write-Host " General bug fixes"
    Write-Host "  " -NoNewline; Write-Host "30)" -ForegroundColor Yellow -NoNewline; Write-Host " Work in progress (WIP)"
    Write-Host ""

    Write-Host "Quick Actions" -ForegroundColor Green
    Write-Host "  " -NoNewline; Write-Host "31)" -ForegroundColor Yellow -NoNewline; Write-Host " Quick commit (default message)"
    Write-Host "  " -NoNewline; Write-Host "32)" -ForegroundColor Yellow -NoNewline; Write-Host " Custom commit message"
    Write-Host ""

    Write-Host "  " -NoNewline; Write-Host "0) " -ForegroundColor Red -NoNewline; Write-Host " Cancel and exit"
    Write-Host ""
    Write-Host $BORDER -ForegroundColor Cyan
}

# ─────────────────────────────────────────────────────────────────────────────
# Main script logic
# ─────────────────────────────────────────────────────────────────────────────

if (-not [string]::IsNullOrWhiteSpace($Message)) {
    $MSG = $Message
}
else {
    Show-Menu
    Write-Host ""
    Write-Host "Select an option [0-32]: " -ForegroundColor Cyan -NoNewline
    $CHOICE = Read-Host

    if ([string]::IsNullOrWhiteSpace($CHOICE)) {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }

    switch ($CHOICE.Trim()) {
        "1"  { $MSG = "Update backend API endpoints" }
        "2"  { $MSG = "Fix backend bug" }
        "3"  { $MSG = "Add backend feature" }
        "4"  { $MSG = "Update backend security/auth" }
        "5"  { $MSG = "Update database schema/migration" }
        "6"  { $MSG = "Update user interface/UI" }
        "7"  { $MSG = "update chat bot" }
        "8"  { $MSG = "update page page" }
        "9"  { $MSG = "Fix frontend-user bug" }
        "10" { $MSG = "Add user-facing feature" }
        "11" { $MSG = "Update invitation templates" }
        "12" { $MSG = "Update admin dashboard" }
        "13" { $MSG = "Fix admin panel bug" }
        "14" { $MSG = "Add admin feature" }
        "15" { $MSG = "Update telegram bot" }
        "16" { $MSG = "Fix telegram bot webhook" }
        "17" { $MSG = "Add telegram bot feature" }
        "18" { $MSG = "Update environment configuration" }
        "19" { $MSG = "Update dependencies" }
        "20" { $MSG = "Update dev scripts" }
        "21" { $MSG = "Update documentation" }
        "22" { $MSG = "Update payment flow" }
        "23" { $MSG = "Fix payment bug" }
        "24" { $MSG = "Add payment feature" }
        "25" { $MSG = "Refactor code" }
        "26" { $MSG = "Update tests" }
        "27" { $MSG = "Performance improvements" }
        "28" { $MSG = "Security updates" }
        "29" { $MSG = "General bug fixes" }
        "30" { $MSG = "WIP: Work in progress" }
        "31" { $MSG = "Update project" }
        "32" {
            Write-Host "Enter custom commit message: " -ForegroundColor Cyan -NoNewline
            $MSG = Read-Host
            if ([string]::IsNullOrWhiteSpace($MSG)) {
                Write-Host "Error: Commit message cannot be empty" -ForegroundColor Red
                exit 1
            }
        }
        "0" {
            Write-Host "Cancelled." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Invalid choice. Exiting." -ForegroundColor Red
            exit 1
        }
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Git operations
# ─────────────────────────────────────────────────────────────────────────────

function Test-GitPathExists {
    param([string]$PathName)

    $gitPath = (& git rev-parse --git-path $PathName 2>$null)
    if ($gitPath) {
        $trimmed = $gitPath.Trim()
        if (-not [string]::IsNullOrWhiteSpace($trimmed) -and (Test-Path $trimmed)) {
            return $true
        }
    }
    return $false
}

function Show-RebaseConflictHelp {
    Write-Host "Rebase failed. Resolve conflicts, then continue manually." -ForegroundColor Red
    Write-Host "Run:" -ForegroundColor Yellow
    Write-Host "  git status"
    Write-Host "  git add ."
    Write-Host "  git rebase --continue"
    Write-Host "Or cancel with:" -ForegroundColor Yellow
    Write-Host "  git rebase --abort"
}

Write-Host ""
Write-Host "Checking repository state..." -ForegroundColor Blue

& git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Not inside a Git repository." -ForegroundColor Red
    exit 1
}

if ((Test-GitPathExists "rebase-merge") -or (Test-GitPathExists "rebase-apply") -or (Test-GitPathExists "MERGE_HEAD")) {
    Write-Host "Error: A rebase or merge is already in progress." -ForegroundColor Red
    Write-Host "Run git status, then finish or abort the current operation." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking current branch..." -ForegroundColor Blue
$CURRENT_BRANCH = (& git symbolic-ref --quiet --short HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($CURRENT_BRANCH)) {
    $CURRENT_BRANCH = (& git branch --show-current 2>$null)
}

if ([string]::IsNullOrWhiteSpace($CURRENT_BRANCH)) {
    Write-Host "Error: You are in detached HEAD mode. Checkout main before pushing." -ForegroundColor Red
    exit 1
}
$CURRENT_BRANCH = $CURRENT_BRANCH.Trim()

Write-Host "Current branch: $CURRENT_BRANCH" -ForegroundColor Green
Write-Host "Target branch:  main (origin/main)" -ForegroundColor Green

Write-Host ""
Write-Host "Fetching latest changes from origin/main..." -ForegroundColor Blue
& git fetch origin main --prune

Write-Host ""
Write-Host "Checking for changes..." -ForegroundColor Blue

# Stage all changes, including deletes and renames.
& git add -A

$null = & git diff --cached --quiet 2>$null
$HAS_CHANGES = ($LASTEXITCODE -ne 0)

if (-not $HAS_CHANGES) {
    Write-Host "No uncommitted changes to stage." -ForegroundColor Yellow

    # If on another branch, merge into main and push
    if ($CURRENT_BRANCH -ne "main") {
        Write-Host "Switching to main and merging branch '$CURRENT_BRANCH'..." -ForegroundColor Blue
        & git checkout main
        if ($LASTEXITCODE -ne 0) { exit 1 }

        & git pull --rebase origin main
        if ($LASTEXITCODE -ne 0) {
            Show-RebaseConflictHelp
            exit 1
        }

        & git merge $CURRENT_BRANCH -m "Merge branch '$CURRENT_BRANCH' into main"
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }

    $LOCAL = (& git rev-parse HEAD 2>$null)
    if ($LOCAL) { $LOCAL = $LOCAL.Trim() }

    $REMOTE = (& git rev-parse origin/main 2>$null)
    if ($REMOTE) { $REMOTE = $REMOTE.Trim() }

    if ($LOCAL -eq $REMOTE) {
        Write-Host "$CHECK Already up to date with origin/main" -ForegroundColor Green
        exit 0
    }

    Write-Host "Rebasing existing local commits on origin/main..." -ForegroundColor Blue
    & git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) {
        Show-RebaseConflictHelp
        exit 1
    }

    Write-Host "Pushing existing local commits to origin/main..." -ForegroundColor Blue
    & git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "$CHECK Up to date with origin/main" -ForegroundColor Green
    exit 0
}

# Show what will be committed
Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Cyan
$diffLines = @(& git diff --cached --name-status)
foreach ($line in $diffLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line -split "`t", 2
    $status = $parts[0].Trim()
    $file = ""
    if ($parts.Count -gt 1) {
        $file = $parts[1].Trim()
    }
    switch -Regex ($status) {
        '^A' {
            Write-Host "  " -NoNewline
            Write-Host "[Added]    " -ForegroundColor Green -NoNewline
            Write-Host $file
        }
        '^M' {
            Write-Host "  " -NoNewline
            Write-Host "[Modified] " -ForegroundColor Yellow -NoNewline
            Write-Host $file
        }
        '^D' {
            Write-Host "  " -NoNewline
            Write-Host "[Deleted]  " -ForegroundColor Red -NoNewline
            Write-Host $file
        }
        default {
            Write-Host "  [$status]      $file"
        }
    }
}

Write-Host ""
Write-Host "Commit message: " -ForegroundColor Cyan -NoNewline
Write-Host $MSG -ForegroundColor Magenta
Write-Host ""

# Ask for confirmation
Write-Host "Proceed with commit and push to origin/main? [Y/n]: " -ForegroundColor Yellow -NoNewline
$CONFIRM = Read-Host

if ($CONFIRM -match '^[Nn]') {
    Write-Host "Cancelled by user." -ForegroundColor Yellow
    & git reset *> $null
    exit 0
}

# Commit
Write-Host "Committing changes..." -ForegroundColor Blue
& git commit -m "$MSG"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed." -ForegroundColor Red
    exit 1
}

# If on another branch, checkout main and merge
if ($CURRENT_BRANCH -ne "main") {
    Write-Host "Switching to main and merging branch '$CURRENT_BRANCH'..." -ForegroundColor Blue
    & git checkout main
    if ($LASTEXITCODE -ne 0) { exit 1 }

    Write-Host "Rebasing main on origin/main..." -ForegroundColor Blue
    & git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) {
        Show-RebaseConflictHelp
        exit 1
    }

    Write-Host "Merging '$CURRENT_BRANCH' into main..." -ForegroundColor Blue
    & git merge $CURRENT_BRANCH -m "Merge branch '$CURRENT_BRANCH' into main"
    if ($LASTEXITCODE -ne 0) { exit 1 }
}
else {
    # On main: rebase directly
    Write-Host "Rebasing on origin/main..." -ForegroundColor Blue
    & git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) {
        Show-RebaseConflictHelp
        exit 1
    }
}

# Push directly to main branch
Write-Host "Pushing to origin/main..." -ForegroundColor Blue
& git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host $BORDER -ForegroundColor Green
Write-Host "$CHECK Successfully pushed to origin/main!" -ForegroundColor Green
Write-Host "$CHECK Commit: $MSG" -ForegroundColor Green
Write-Host $BORDER -ForegroundColor Green
Write-Host ""
