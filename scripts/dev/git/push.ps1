# ==============================================================================
# Koupreng - Safe Anti-Collision Git Push (Windows PowerShell)
# Features: Conflict marker blocker, secret file blocker, remote collision radar,
#           auto-sync with teammates' commits, commit prompt, clean push & undo guide.
# ==============================================================================

param (
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

$Branch = & git branch --show-current 2>$null
if (-not $Branch) {
    Write-Host "X Not inside a valid git repository or no branch found!" -ForegroundColor Red
    exit 1
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   KOUPRENG - SAFE ANTI-COLLISION GIT PUSH" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Branch: $Branch" -ForegroundColor Green

# STEP 1: Safety checks
Write-Host "`n[1/5] Running Safety Pre-flight Checks..." -ForegroundColor White
$ConflictMarkers = & git grep -l "^<<<<<<< " 2>$null
if ($ConflictMarkers) {
    Write-Host "  [CRITICAL ERROR] Conflict markers (<<<<<<<) found in files:" -ForegroundColor Red
    Write-Host $ConflictMarkers -ForegroundColor Red
    Write-Host "  Aborting push! Please clean conflict markers before pushing." -ForegroundColor Yellow
    exit 1
}

$SensitiveFiles = & git status --porcelain 2>$null | Select-String '\.env$|\.env\.local$|\.pem$|\.key$'
if ($SensitiveFiles) {
    Write-Host "  [WARNING] Sensitive secret file detected in git status:" -ForegroundColor Red
    Write-Host $SensitiveFiles -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure you want to push sensitive files? [y/N]"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Cyan
        exit 1
    }
}
Write-Host "  [PASS] No conflict markers or sensitive files detected." -ForegroundColor Green

# STEP 2: Collision Radar
Write-Host "`n[2/5] Checking Remote for Teammate updates (Collision Radar)..." -ForegroundColor White
& git fetch origin $Branch --quiet 2>$null

$Behind = (& git rev-list --count "HEAD..origin/$Branch" 2>$null)
if (-not $Behind) { $Behind = 0 } else { $Behind = [int]$Behind.Trim() }

if ($Behind -gt 0) {
    Write-Host "  [WARNING] Teammates pushed $Behind new commit(s) to GitHub!" -ForegroundColor Red
    Write-Host "  Pushing now would be rejected or cause collisions." -ForegroundColor Yellow
    Write-Host "  Teammates' commits:" -ForegroundColor Cyan
    & git log "HEAD..origin/$Branch" --pretty=format:"    * %h - %s (%an, %ar)" -n 5
    Write-Host ""

    $doSync = Read-Host "Do you want to safely pull & sync teammates' code first? [Y/n]"
    if ($doSync -ne 'n' -and $doSync -ne 'N') {
        Write-Host "`n  Syncing remote code safely..." -ForegroundColor Cyan
        $dirty = & git status --porcelain 2>$null
        $stashed = $false
        if ($dirty) {
            & git stash push -u -m "pre-push-sync-powershell" --quiet
            $stashed = $true
        }

        try {
            & git pull --rebase origin $Branch
            Write-Host "  Teammates' code pulled and rebased successfully." -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Conflict while pulling teammate's code!" -ForegroundColor Red
            Write-Host "  Run 'git rebase --abort' and coordinate with teammates." -ForegroundColor Yellow
            exit 1
        }

        if ($stashed) {
            $pop = & git stash pop --quiet 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Your local changes restored cleanly." -ForegroundColor Green
            } else {
                Write-Host "  [CONFLICT] Conflict with teammate's code!" -ForegroundColor Red
                Write-Host "  Fix conflict markers in files before pushing." -ForegroundColor Yellow
                exit 1
            }
        }
    } else {
        Write-Host "Push cancelled to avoid code collision." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [PASS] Remote is clean. No collision risk." -ForegroundColor Green
}

# STEP 3: Stage & Commit
Write-Host "`n[3/5] Staging & Committing..." -ForegroundColor White
& git add -A

$diff = & git diff --cached --quiet 2>&1; $hasStaged = $LASTEXITCODE -ne 0
$Ahead = (& git rev-list --count "origin/$Branch..HEAD" 2>$null)
if (-not $Ahead) { $Ahead = 0 } else { $Ahead = [int]$Ahead.Trim() }

if ($hasStaged) {
    if (-not $Message) {
        Write-Host "  Uncommitted files:" -ForegroundColor Cyan
        & git status -s
        $inputMsg = Read-Host "Enter Commit Message"
        if ($inputMsg) { $Message = $inputMsg }
        else { $Message = "update: changes from $($env:COMPUTERNAME) at $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    }
    & git commit -m $Message
    Write-Host "  Committed: `"$Message`"" -ForegroundColor Green
} else {
    if ($Ahead -gt 0) {
        Write-Host "  No new file edits, but $Ahead local commit(s) ready to push." -ForegroundColor Cyan
    } else {
        Write-Host "  Nothing to commit or push (Everything up to date).`n" -ForegroundColor Green
        exit 0
    }
}

# STEP 4: Push
Write-Host "`n[4/5] Pushing to origin/$Branch..." -ForegroundColor White
try {
    & git push origin $Branch
    Write-Host "  Pushed to origin/$Branch successfully." -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Push failed. Remote may have received new commits." -ForegroundColor Red
    Write-Host "  Run .\scripts\dev\git\pull.ps1 and try again." -ForegroundColor Yellow
    exit 1
}

# STEP 5: Summary
$lastSha = (& git rev-parse --short HEAD).Trim()
Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "   PUSH COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  Commit SHA: $lastSha" -ForegroundColor Cyan
Write-Host "  To undo last push: .\scripts\dev\git\undo-push.ps1" -ForegroundColor Yellow
Write-Host "======================================================`n" -ForegroundColor Green
