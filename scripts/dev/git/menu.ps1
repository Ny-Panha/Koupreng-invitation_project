# ==============================================================================
# Koupreng - Team Git Interactive Dashboard (Windows PowerShell)
# Author: Nha & Antigravity
# ==============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

while ($true) {
    $Branch = & git branch --show-current 2>$null
    if (-not $Branch) { $Branch = "unknown" }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "   KOUPRENG - TEAM GIT MANAGER (Windows)" -ForegroundColor Yellow
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "  Current Branch: $Branch" -ForegroundColor Green
    Write-Host "------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "  [1] Check Radar    - Inspect teammates' commits & conflict risk" -ForegroundColor White
    Write-Host "  [2] Safe Pull      - Pull latest code safely (Auto-stash & Safe)" -ForegroundColor White
    Write-Host "  [3] Safe Push      - Push code safely (Anti-collision checks)" -ForegroundColor White
    Write-Host "  [4] Full Sync      - Safe Pull + Safe Push in one command" -ForegroundColor White
    Write-Host "  [5] Undo Push      - Undo last commit/push" -ForegroundColor White
    Write-Host "  [6] Branch Menu    - Switch or create new branch" -ForegroundColor White
    Write-Host "  [0] Exit" -ForegroundColor White
    Write-Host "======================================================" -ForegroundColor Cyan

    $Choice = Read-Host "Choose an option [0-6]"

    switch ($Choice) {
        "1" {
            & "$ScriptDir\check.ps1"
        }
        "2" {
            & "$ScriptDir\pull.ps1"
        }
        "3" {
            & "$ScriptDir\push.ps1"
        }
        "4" {
            Write-Host "`n>>> Step 1: Pulling latest code..." -ForegroundColor Cyan
            & "$ScriptDir\pull.ps1"
            Write-Host "`n>>> Step 2: Pushing your changes..." -ForegroundColor Cyan
            & "$ScriptDir\push.ps1"
        }
        "5" {
            & "$ScriptDir\undo-push.ps1"
        }
        "6" {
            Write-Host "`n--- Current Branches ---" -ForegroundColor Cyan
            & git branch -a
            $bAction = Read-Host "Select [1] Switch Branch or [2] Create New Branch [1/2/cancel]"
            if ($bAction -eq "1") {
                $target = Read-Host "Enter branch name to checkout"
                if ($target) { & git checkout $target }
            } elseif ($bAction -eq "2") {
                $newBranch = Read-Host "Enter new branch name (e.g. feature/my-work)"
                if ($newBranch) { & git checkout -b $newBranch }
            }
        }
        "0" {
            Write-Host "Goodbye! Happy coding with Koupreng Team!`n" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "Invalid option. Please choose 0 to 6." -ForegroundColor Red
        }
    }

    Read-Host "Press [Enter] to continue..."
}
