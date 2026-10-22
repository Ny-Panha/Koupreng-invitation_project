#!/usr/bin/env pwsh
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

# ─────────────────────────────────────────────────────────────────────────────
# git-pull.ps1 — Safe team Git pull script for Koupreng (Windows)
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

$TARGET_REMOTE = "origin"
$DEFAULT_BRANCH = "main"

# ─────────────────────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────────────────────

function Stop-Script {
    param([string]$Text)

    Write-Host ""
    Write-Host "Error: $Text" -ForegroundColor Red
    exit 1
}

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

function Test-HasLocalChanges {
    $status = (& git status --porcelain 2>$null)
    return (-not [string]::IsNullOrWhiteSpace(($status -join "`n")))
}

function Test-OriginBranchExists {
    param(
        [string]$RemoteName,
        [string]$BranchName
    )

    & git rev-parse --verify --quiet "refs/remotes/$RemoteName/$BranchName" *> $null
    if ($LASTEXITCODE -eq 0) {
        return $true
    }

    & git ls-remote --exit-code --heads $RemoteName $BranchName *> $null
    return ($LASTEXITCODE -eq 0)
}

function Show-UnfinishedHelp {
    Write-Host ""
    Write-Host "A rebase or merge is already in progress." -ForegroundColor Red
    Write-Host ""
    Write-Host "To continue:" -ForegroundColor Yellow
    Write-Host "  git status"
    Write-Host "  git rebase --continue"
    Write-Host ""
    Write-Host "To abort:" -ForegroundColor Yellow
    Write-Host "  git rebase --abort"
    Write-Host "  git merge --abort"
}

function Show-PullConflictHelp {
    Write-Host ""
    Write-Host "Pull stopped because collaborator code conflicts with your local work." -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "  git status"
    Write-Host "  Edit conflicted files (look for <<<<<<< markers)"
    Write-Host "  git add ."
    Write-Host "  git rebase --continue"
    Write-Host ""
    Write-Host "To cancel:" -ForegroundColor Yellow
    Write-Host "  git rebase --abort"
}

function Show-StashConflictHelp {
    Write-Host ""
    Write-Host "Your saved local changes conflicted with the latest code." -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "  git status"
    Write-Host "  Edit conflicted files (look for <<<<<<< markers)"
    Write-Host "  git add ."
    Write-Host '  git commit -m "resolve local conflict"'
    Write-Host ""
    Write-Host "Your stash is kept as backup." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To check:" -ForegroundColor Yellow
    Write-Host "  git stash list"
    Write-Host ""
    Write-Host "To drop after verification:" -ForegroundColor Yellow
    Write-Host '  git stash drop stash@{0}'
}

function Invoke-SafePull {
    param(
        [string]$Branch,
        [string]$PullMode,
        [string]$Remote,
        [string]$RemoteBranch
    )

    $stashCreated = $false
    $stashRef = "stash@{0}"

    if (Test-HasLocalChanges) {
        Write-Host "Stashing local changes..." -ForegroundColor Yellow
        $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        & git stash push --include-untracked -m "safe-pull auto-stash $Branch $now"
        if ($LASTEXITCODE -eq 0) {
            $stashCreated = $true
            Write-Host "$CHECK Local changes stashed" -ForegroundColor Green
        }
    }

    Write-Host "Pulling and rebasing..." -ForegroundColor Blue

    if ($PullMode -eq "upstream") {
        & git pull --rebase
    }
    else {
        & git pull --rebase $Remote $RemoteBranch
    }

    if ($LASTEXITCODE -ne 0) {
        Show-PullConflictHelp
        if ($stashCreated) {
            Write-Host ""
            Write-Host "Your uncommitted changes are still saved in the auto-stash." -ForegroundColor Cyan
            Write-Host "Check it with: git stash list" -ForegroundColor Cyan
        }
        exit 1
    }

    if ($stashCreated) {
        Write-Host "Restoring local changes..." -ForegroundColor Blue
        & git stash apply $stashRef
        if ($LASTEXITCODE -ne 0) {
            Show-StashConflictHelp
            exit 1
        }
        & git stash drop $stashRef
        Write-Host "$CHECK Local changes restored" -ForegroundColor Green
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Main script logic
# ─────────────────────────────────────────────────────────────────────────────

& git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Script "Not inside a Git repository."
}

if ((Test-GitPathExists "rebase-merge") -or (Test-GitPathExists "rebase-apply") -or (Test-GitPathExists "MERGE_HEAD")) {
    Show-UnfinishedHelp
    exit 1
}

$branch = (& git symbolic-ref --quiet --short HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    $branch = (& git branch --show-current 2>$null)
}

if ([string]::IsNullOrWhiteSpace($branch)) {
    Stop-Script "You are in detached HEAD mode. Checkout a branch before pulling."
}
$branch = $branch.Trim()

# Detect remote tracking branch, fallback to default (main)
$upstreamRef = (& git rev-parse --abbrev-ref "$($branch)@{upstream}" 2>$null)
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstreamRef)) {
    $upstreamClean = $upstreamRef.Trim()
    $slashPos = $upstreamClean.IndexOf('/')
    if ($slashPos -ge 0) {
        $TARGET_BRANCH = $upstreamClean.Substring($slashPos + 1)
    }
    else {
        $TARGET_BRANCH = $upstreamClean
    }
}
else {
    Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host "No upstream tracking branch for '$branch'. Using $TARGET_REMOTE/$DEFAULT_BRANCH as base."
    $TARGET_BRANCH = $DEFAULT_BRANCH
}

Write-Host ""
Write-Host $BORDER -ForegroundColor Cyan
Write-Host "  Koupreng Safe Team Git Pull" -ForegroundColor Cyan
Write-Host $BORDER -ForegroundColor Cyan
Write-Host "Current branch: " -ForegroundColor Green -NoNewline
Write-Host $branch -ForegroundColor Yellow
Write-Host "Pull target:    " -ForegroundColor Green -NoNewline
Write-Host "$TARGET_REMOTE/$TARGET_BRANCH" -ForegroundColor Yellow
if ($TARGET_BRANCH -ne $DEFAULT_BRANCH) {
    Write-Host "Base sync:      " -ForegroundColor Green -NoNewline
    Write-Host "$TARGET_REMOTE/$DEFAULT_BRANCH (rebase on top)" -ForegroundColor Yellow
}
Write-Host "Pull mode:      " -ForegroundColor Green -NoNewline
Write-Host "rebase" -ForegroundColor Yellow
Write-Host ""

Write-Host "Fetching latest changes from $TARGET_REMOTE..." -ForegroundColor Blue
& git fetch $TARGET_REMOTE --prune --progress

if (-not (Test-OriginBranchExists $TARGET_REMOTE $TARGET_BRANCH)) {
    Stop-Script "$TARGET_REMOTE/$TARGET_BRANCH was not found."
}

Write-Host "Checking local repository status..." -ForegroundColor Blue
Invoke-SafePull -Branch $branch -PullMode "explicit" -Remote $TARGET_REMOTE -RemoteBranch $TARGET_BRANCH

# ── Step 2: Rebase on origin/main to get latest teammate commits ──────────────
$FORCE_PUSHED = 0
if ($TARGET_BRANCH -ne $DEFAULT_BRANCH -and (Test-OriginBranchExists $TARGET_REMOTE $DEFAULT_BRANCH)) {
    Write-Host "Syncing latest $TARGET_REMOTE/$DEFAULT_BRANCH commits into branch..." -ForegroundColor Blue
    $syncStashed = $false

    if (Test-HasLocalChanges) {
        Write-Host "Stashing local changes for base-sync..." -ForegroundColor Yellow
        $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        & git stash push --include-untracked -m "base-sync auto-stash $branch $now"
        if ($LASTEXITCODE -eq 0) {
            $syncStashed = $true
        }
    }

    & git rebase "$TARGET_REMOTE/$DEFAULT_BRANCH"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
        Write-Host "Conflict while rebasing on $TARGET_REMOTE/$DEFAULT_BRANCH!" -ForegroundColor Red
        Write-Host "Fix conflicts then run: " -ForegroundColor Yellow -NoNewline
        Write-Host "git rebase --continue"
        if ($syncStashed) {
            Write-Host "Your local changes are in stash. Check: git stash list" -ForegroundColor Cyan
        }
        exit 1
    }

    if ($syncStashed) {
        Write-Host "Restoring local changes..." -ForegroundColor Blue
        & git stash apply "stash@{0}"
        if ($LASTEXITCODE -ne 0) {
            Show-StashConflictHelp
            exit 1
        }
        & git stash drop "stash@{0}"
        Write-Host "$CHECK Local changes restored" -ForegroundColor Green
    }
    Write-Host "$CHECK Branch is up to date with $TARGET_REMOTE/$DEFAULT_BRANCH" -ForegroundColor Green

    # ── Step 3: Force-push rebased branch to remote ───────────────────────────
    Write-Host "Force-pushing rebased branch to $TARGET_REMOTE..." -ForegroundColor Blue
    & git push --force-with-lease $TARGET_REMOTE $branch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$CHECK Force-push successful -- remote branch is now in sync" -ForegroundColor Green
        $FORCE_PUSHED = 1
    }
    else {
        Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
        Write-Host "Force-push failed! Someone may have pushed to this branch." -ForegroundColor Red
        Write-Host "Run manually: git push --force-with-lease $TARGET_REMOTE $branch" -ForegroundColor Yellow
        $FORCE_PUSHED = 0
    }
}

Write-Host ""
Write-Host $BORDER -ForegroundColor Green
Write-Host "$CHECK Pull completed successfully!" -ForegroundColor Green
Write-Host "$CHECK Branch '$branch' is up to date with $TARGET_REMOTE/$TARGET_BRANCH" -ForegroundColor Green
if ($TARGET_BRANCH -ne $DEFAULT_BRANCH) {
    Write-Host "$CHECK Latest $TARGET_REMOTE/$DEFAULT_BRANCH commits included" -ForegroundColor Green
}
if ($FORCE_PUSHED -eq 1) {
    Write-Host "$CHECK Remote branch updated (force-pushed)" -ForegroundColor Green
}
Write-Host $BORDER -ForegroundColor Green
Write-Host ""
