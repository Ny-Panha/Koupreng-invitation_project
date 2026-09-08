# ==============================================================================
# Koupreng - Safe Git Pull (Windows PowerShell)
# Features: Pre-check incoming commits, collision warning, safe auto-stash,
#           rebase pull, stash restore with conflict detection & undo guide.
# ==============================================================================

$ErrorActionPreference = "Stop"

$Branch = & git branch --show-current 2>$null
if (-not $Branch) {
    Write-Host "X Not inside a valid git repository or no branch found!" -ForegroundColor Red
    exit 1
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   KOUPRENG - SAFE GIT PULL" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Branch: $Branch" -ForegroundColor Green

# Step 1: Pre-fetch & inspection
Write-Host "`n[1/4] Checking updates from GitHub (origin/$Branch)..." -ForegroundColor White
& git fetch origin $Branch --quiet 2>$null

$Behind = (& git rev-list --count "HEAD..origin/$Branch" 2>$null)
if (-not $Behind) { $Behind = 0 } else { $Behind = [int]$Behind.Trim() }

$LocalStatus = & git status --porcelain 2>$null
$HasLocalDirty = [bool]$LocalStatus

if ($Behind -eq 0) {
    Write-Host "  [Up-to-date] No new commits on origin/$Branch!" -ForegroundColor Green
    if (-not $HasLocalDirty) {
        Write-Host "  Clean tree. Everything is up-to-date." -ForegroundColor Cyan
        Write-Host "`n[SUCCESS] Local repository is already latest!`n" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "  Local has uncommitted changes, but remote has no new code." -ForegroundColor Yellow
        Write-Host "  No pull needed.`n" -ForegroundColor Green
        exit 0
    }
}

Write-Host "  Incoming commits from teammates ($Behind commits):" -ForegroundColor Yellow
& git log "HEAD..origin/$Branch" --pretty=format:"    * %h - %s (%an, %ar)" -n 5
Write-Host ""

# Collision warning
if ($HasLocalDirty) {
    $LocalFiles = & git status --porcelain | ForEach-Object { ($_ -split '\s+')[-1] }
    $RemoteFiles = & git diff --name-only "HEAD" "origin/$Branch" 2>$null
    $Overlap = @($LocalFiles | Where-Object { $RemoteFiles -contains $_ })

    if ($Overlap.Count -gt 0) {
        Write-Host "  [WARNING] Potential conflict detected on files:" -ForegroundColor Red
        foreach ($file in $Overlap) {
            Write-Host "    X $file" -ForegroundColor Red
        }
        Write-Host "  Don't worry, local changes will be stashed safely before pull!" -ForegroundColor Yellow
    }
}

# Step 2: Auto-stash
Write-Host "`n[2/4] Saving local changes (Auto-Stash)..." -ForegroundColor White
$Stashed = $false
if ($HasLocalDirty) {
    $stashOut = & git stash push -u -m "koupreng-pull-powershell" 2>&1
    $Stashed = $true
    Write-Host "  Local changes saved into Stash safely." -ForegroundColor Green
} else {
    Write-Host "  No local changes to stash (Clean tree)." -ForegroundColor Cyan
}

# Step 3: Pull with rebase
Write-Host "`n[3/4] Pulling latest code from origin/$Branch..." -ForegroundColor White
try {
    & git pull --rebase origin $Branch
    Write-Host "  Pull & Rebase successful." -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Conflict during pull rebase!" -ForegroundColor Red
    Write-Host "  Solution:" -ForegroundColor Yellow
    Write-Host "    1. Abort rebase: git rebase --abort" -ForegroundColor Cyan
    if ($Stashed) {
        Write-Host "    2. Restore your stash: git stash pop" -ForegroundColor Cyan
    }
    exit 1
}

# Step 4: Restore stash
Write-Host "`n[4/4] Restoring local changes..." -ForegroundColor White
if ($Stashed) {
    $popResult = & git stash pop 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Local changes restored smoothly without conflict." -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] Conflict occurred while restoring your local changes!" -ForegroundColor Red
        Write-Host "  To resolve:" -ForegroundColor Yellow
        Write-Host "    1. Open conflicting files and fix <<< and >>> conflict markers" -ForegroundColor Cyan
        Write-Host "    2. Run: git add <file>" -ForegroundColor Cyan
        Write-Host "    3. Run: git stash drop" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "  Nothing to restore." -ForegroundColor Cyan
}

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "   PULL COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  To undo (revert to before pull):" -ForegroundColor Yellow
Write-Host "    git reset --hard ORIG_HEAD" -ForegroundColor Cyan
Write-Host "======================================================`n" -ForegroundColor Green
