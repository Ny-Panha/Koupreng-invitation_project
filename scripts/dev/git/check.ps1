# ==============================================================================
# Koupreng - Team Git Radar & Status Inspector (Windows PowerShell)
# Purpose: Check local vs remote status, see teammates' commits, and detect conflicts
# ==============================================================================

$ErrorActionPreference = "Continue"

$Branch = & git branch --show-current 2>$null
if (-not $Branch) {
    Write-Host "X Not inside a valid git repository or no branch found!" -ForegroundColor Red
    exit 1
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   KOUPRENG - TEAM GIT RADAR & CONFLICT CHECK" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Current Branch: $Branch" -ForegroundColor Green
Write-Host "  Fetching remote status from origin/$Branch..." -ForegroundColor Gray

& git fetch origin $Branch --quiet 2>$null

$Behind = (& git rev-list --count "HEAD..origin/$Branch" 2>$null)
if (-not $Behind) { $Behind = 0 } else { $Behind = [int]$Behind.Trim() }

$Ahead = (& git rev-list --count "origin/$Branch..HEAD" 2>$null)
if (-not $Ahead) { $Ahead = 0 } else { $Ahead = [int]$Ahead.Trim() }

$LocalStatus = & git status --porcelain 2>$null
$HasLocalDirty = [bool]$LocalStatus

Write-Host "`n[1] Sync Overview (Khmer & English):" -ForegroundColor White
if ($Behind -eq 0 -and $Ahead -eq 0) {
    Write-Host "  [Up-to-date] Local and GitHub are fully synced!" -ForegroundColor Green
} else {
    if ($Behind -gt 0) {
        Write-Host "  [Behind] Teammates pushed $Behind commit(s) to GitHub not yet pulled!" -ForegroundColor Yellow
    }
    if ($Ahead -gt 0) {
        Write-Host "  [Ahead] You have $Ahead local commit(s) ready to push!" -ForegroundColor Cyan
    }
}

# Show teammates' commits
if ($Behind -gt 0) {
    Write-Host "`n[2] Incoming commits from Teammates on GitHub ($Behind commits):" -ForegroundColor White
    & git log "HEAD..origin/$Branch" --pretty=format:"  * %h - %s (%an, %ar)" -n 10
    Write-Host ""
}

# Show outgoing local commits
if ($Ahead -gt 0) {
    Write-Host "`n[3] Outgoing local commits ready to push ($Ahead commits):" -ForegroundColor White
    & git log "origin/$Branch..HEAD" --pretty=format:"  * %h - %s (%ar)" -n 10
    Write-Host ""
}

# Show local modified files
if ($HasLocalDirty) {
    Write-Host "`n[4] Local modified files:" -ForegroundColor White
    & git status -s
}

# Collision detection
Write-Host "`n[5] Collision & Conflict Detection:" -ForegroundColor White
if ($Behind -gt 0 -and $HasLocalDirty) {
    $LocalFiles = & git status --porcelain | ForEach-Object { ($_ -split '\s+')[-1] }
    $RemoteFiles = & git diff --name-only "HEAD" "origin/$Branch" 2>$null

    $Overlap = @($LocalFiles | Where-Object { $RemoteFiles -contains $_ })

    if ($Overlap.Count -gt 0) {
        Write-Host "  [ALERT] Conflict Risk! (Koe code knea)" -ForegroundColor Red
        Write-Host "  The following files were edited by both you and teammates:" -ForegroundColor Yellow
        foreach ($file in $Overlap) {
            Write-Host "    X $file" -ForegroundColor Red
        }
        Write-Host "  Solution: Run .\scripts\dev\git\pull.ps1 to safely pull and merge!" -ForegroundColor Cyan
    } else {
        Write-Host "  [SAFE] No file collisions detected! Safe to pull/push." -ForegroundColor Green
    }
} elseif ($Behind -gt 0) {
    Write-Host "  [SAFE] Local working tree is clean. Safe to pull." -ForegroundColor Green
} else {
    Write-Host "  [SAFE] In sync with remote. No conflict risk." -ForegroundColor Green
}

# Conflict markers check
$ConflictMarkers = & git grep -n "^<<<<<<< " 2>$null
if ($ConflictMarkers) {
    Write-Host "`n[CRITICAL WARNING] Conflict markers (<<<<<<<) found in files:" -ForegroundColor Red
    Write-Host $ConflictMarkers -ForegroundColor Red
    Write-Host "Please resolve conflict markers before pushing!" -ForegroundColor Yellow
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "  Team Git Commands:" -ForegroundColor Yellow
Write-Host "    Check:  .\scripts\dev\git\check.ps1" -ForegroundColor Cyan
Write-Host "    Pull:   .\scripts\dev\git\pull.ps1" -ForegroundColor Cyan
Write-Host "    Push:   .\scripts\dev\git\push.ps1 -Message `"your message`"" -ForegroundColor Cyan
Write-Host "    Menu:   .\scripts\dev\git\menu.ps1" -ForegroundColor Cyan
Write-Host "======================================================`n" -ForegroundColor Cyan
