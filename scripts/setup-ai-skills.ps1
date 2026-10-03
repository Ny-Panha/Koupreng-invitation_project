<#
.SYNOPSIS
    Reproducible setup and verification script for team AI Agent Skills in the E-Invitation Project.

.DESCRIPTION
    Verifies and restores project-local AI agent skills according to ai-skills.lock.json.
    - Pins all skills to exact verified Git commits.
    - Validates SHA-256 hashes of all installed skill files.
    - Never modifies application source code, package.json, pom.xml, or database migrations.
    - Never accesses secrets or network credentials.
    - Never commits or pushes to Git.

.PARAMETER VerifyOnly
    Only validates the installed skills against ai-skills.lock.json without making changes.

.PARAMETER Force
    Allows restoring/overwriting skills if checksum mismatches are detected.
#>
param(
    [switch]$VerifyOnly,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$lockFilePath = Join-Path $projectRoot "ai-skills.lock.json"
$skillsDir = Join-Path $projectRoot ".agents\skills"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   E-Invitation Project - AI Agent Skills Setup & Verification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot"
Write-Host "Skills Directory: $skillsDir"
Write-Host "Lockfile: $lockFilePath"

if (-not (Test-Path $lockFilePath)) {
    Write-Error "ai-skills.lock.json not found at $lockFilePath! Aborting."
    exit 1
}

$lockJson = Get-Content -Path $lockFilePath -Raw | ConvertFrom-Json
Write-Host "Loaded lockfile version $($lockJson.version) (Schema: $($lockJson.schemaVersion))`n" -ForegroundColor Green

$allValid = $true
$verifiedCount = 0
$mismatchCount = 0
$missingCount = 0

foreach ($skillEntry in $lockJson.skills) {
    $skillName = $skillEntry.skill
    $targetSkillDir = Join-Path $skillsDir $skillName
    Write-Host "Checking [$($skillEntry.category)] $skillName..." -ForegroundColor White
    
    if (-not (Test-Path $targetSkillDir)) {
        Write-Host "  [-] Skill directory missing: $targetSkillDir" -ForegroundColor Red
        $missingCount++
        $allValid = $false
        continue
    }

    $skillFilesValid = $true
    foreach ($fileEntry in $skillEntry.files) {
        $localFilePath = Join-Path $targetSkillDir $fileEntry.path.Replace("/", "\")
        if (-not (Test-Path $localFilePath)) {
            Write-Host "    [x] Missing file: $($fileEntry.path)" -ForegroundColor Red
            $skillFilesValid = $false
            $missingCount++
            continue
        }

        $currentHash = (Get-FileHash -Path $localFilePath -Algorithm SHA256).Hash.ToLower()
        if ($currentHash -ne $fileEntry.sha256.ToLower()) {
            Write-Host "    [!] Checksum mismatch for $($fileEntry.path):" -ForegroundColor Yellow
            Write-Host "        Expected: $($fileEntry.sha256)" -ForegroundColor DarkGray
            Write-Host "        Found:    $currentHash" -ForegroundColor DarkGray
            $skillFilesValid = $false
            $mismatchCount++
        }
    }

    if ($skillFilesValid) {
        Write-Host "  [+] Verified ($($skillEntry.files.Count) files) [Commit: $($skillEntry.commit.Substring(0, 8))]" -ForegroundColor Green
        $verifiedCount++
    } else {
        $allValid = $false
    }
}

Write-Host "`n----------------------------------------------------------"
Write-Host "Verification Summary:" -ForegroundColor Cyan
Write-Host "  Verified Skills : $verifiedCount / $($lockJson.skills.Count)"
Write-Host "  Missing Files   : $missingCount"
Write-Host "  Checksum Errors : $mismatchCount"

if ($allValid) {
    Write-Host "`nAll team AI Agent Skills are fully verified and intact!" -ForegroundColor Green
    exit 0
} else {
    if ($VerifyOnly) {
        Write-Host "`nVerification failed. Run without -VerifyOnly to investigate." -ForegroundColor Red
        exit 1
    }
    Write-Warning "One or more skills require attention. To re-fetch from pinned commits, verify network access and use -Force."
    exit 1
}
