#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message
)

$ErrorActionPreference = "Stop"
$TargetRemote = "origin"
$TargetBranch = "main"

$ScriptDir = Split-Path -Parent $PSCommandPath
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
Set-Location $ProjectRoot

function Stop-Script {
    param([string]$Text)

    Write-Host ""
    Write-Host $Text -ForegroundColor Red
    exit 1
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)

    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        Stop-Script "git $($GitArgs -join ' ') failed."
    }
}

function Get-GitOutput {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "SilentlyContinue"
        $output = & git @GitArgs 2>$null
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -ne 0) {
        return $null
    }

    return ($output -join "`n").Trim()
}

function Test-GitPathExists {
    param([string]$PathName)

    $path = Get-GitOutput rev-parse --git-path $PathName
    return ($path -and (Test-Path $path))
}

function Test-LocalChanges {
    $status = & git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        Stop-Script "Could not read git status."
    }

    return -not [string]::IsNullOrWhiteSpace(($status -join "`n"))
}

function Test-OriginBranchExists {
    param(
        [string]$RemoteName,
        [string]$BranchName
    )

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "SilentlyContinue"
        & git ls-remote --exit-code --heads $RemoteName $BranchName *> $null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Write-PullConflictHelp {
    Write-Host ""
    Write-Host "Pull stopped because collaborator code conflicts with your local work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix:"
    Write-Host "git status"
    Write-Host "Open conflicted files and fix conflict markers:"
    Write-Host "<<<<<<<"
    Write-Host "======="
    Write-Host ">>>>>>>"
    Write-Host "git add ."
    Write-Host "git rebase --continue"
    Write-Host ""
    Write-Host "Cancel:"
    Write-Host "git rebase --abort"
}

function Write-StashConflictHelp {
    Write-Host ""
    Write-Host "Your saved local changes conflicted after pull." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix:"
    Write-Host "git status"
    Write-Host "Edit conflicted files"
    Write-Host "git add ."
    Write-Host 'git commit -m "resolve conflict"'
    Write-Host ""
    Write-Host "Your stash was kept as a backup."
    Write-Host "Check it with:"
    Write-Host "git stash list"
    Write-Host ""
    Write-Host "Drop it only after you verify everything:"
    Write-Host 'git stash drop stash@{0}'
}

function Invoke-SafeRebasePull {
    param(
        [string]$Branch,
        [string]$PullMode,
        [string]$Remote,
        [string]$RemoteBranch
    )

    $stashCreated = $false
    $stashRef = "stash@{0}"

    if (Test-LocalChanges) {
        $stashMessage = "safe-push auto-stash before pulling $Branch $(Get-Date -Format s)"
        Write-Host "Saving uncommitted changes in a temporary stash."
        Invoke-Git stash push --include-untracked -m $stashMessage
        $stashCreated = $true
    }

    Write-Host "Pulling latest code with rebase."
    if ($PullMode -eq "upstream") {
        & git pull --rebase
    }
    else {
        & git pull --rebase $Remote $RemoteBranch
    }

    if ($LASTEXITCODE -ne 0) {
        Write-PullConflictHelp
        if ($stashCreated) {
            Write-Host ""
            Write-Host "Your uncommitted changes are still saved in the auto-stash."
            Write-Host "Check it with:"
            Write-Host "git stash list"
        }
        exit 1
    }

    if ($stashCreated) {
        Write-Host "Restoring saved local changes."
        & git stash apply $stashRef
        if ($LASTEXITCODE -ne 0) {
            Write-StashConflictHelp
            exit 1
        }

        Invoke-Git stash drop $stashRef
    }
}

Write-Host ""
Write-Host "Safe Team Git Push"
Write-Host "Target: $TargetRemote/$TargetBranch"
Write-Host ""

Write-Host "[1/6] Checking repository"
& git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Script "Not inside a Git repository."
}

if ((Test-GitPathExists "rebase-merge") -or (Test-GitPathExists "rebase-apply")) {
    Stop-Script "A rebase is already in progress. Run git status, then git rebase --continue or git rebase --abort."
}

if (Test-GitPathExists "MERGE_HEAD") {
    Stop-Script "A merge is already in progress. Run git status, then finish the merge or use git merge --abort."
}

Write-Host ""
Write-Host "[2/6] Checking branch"
$branch = Get-GitOutput branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    Stop-Script "You are in detached HEAD mode. Checkout a branch before pushing."
}

Write-Host "Current branch: $branch"
if ($branch -ne $TargetBranch) {
    Stop-Script "This script only pushes from the $TargetBranch branch to $TargetRemote/$TargetBranch. Run: git checkout $TargetBranch"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Commit message"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Stop-Script "Commit message cannot be empty. Usage: .\git-push.ps1 ""update login page"""
}

Write-Host ""
Write-Host "[3/6] Fetching latest code"
Invoke-Git fetch $TargetRemote --prune

if (-not (Test-OriginBranchExists $TargetRemote $TargetBranch)) {
    Stop-Script "$TargetRemote/$TargetBranch was not found."
}

Write-Host ""
Write-Host "[4/6] Pulling latest $TargetRemote/$TargetBranch safely"
Write-Host "Pull target: $TargetRemote/$TargetBranch"
Invoke-SafeRebasePull -Branch $branch -PullMode "explicit" -Remote $TargetRemote -RemoteBranch $TargetBranch

Write-Host ""
Write-Host "[5/6] Creating commit"
if (Test-LocalChanges) {
    Invoke-Git add -A
    Invoke-Git commit -m $Message
}
else {
    Write-Host "No local file changes to commit."
}

Write-Host ""
Write-Host "[6/6] Pushing to $TargetRemote/$TargetBranch"
Invoke-Git push $TargetRemote "HEAD:$TargetBranch"

Write-Host ""
Write-Host "Pushed successfully to $TargetRemote/$TargetBranch"
