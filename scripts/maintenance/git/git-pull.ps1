#!/usr/bin/env pwsh
[CmdletBinding()]
param()

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

function Write-UnfinishedGitHelp {
    Write-Host ""
    Write-Host "A rebase or merge is already in progress." -ForegroundColor Red
    Write-Host ""
    Write-Host "git status"
    Write-Host "git rebase --continue"
    Write-Host "git rebase --abort"
    Write-Host "git merge --abort"
}

function Write-PullConflictHelp {
    Write-Host ""
    Write-Host "Pull stopped because collaborator code conflicts with your local work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix:"
    Write-Host "git status"
    Write-Host "Edit conflicted files"
    Write-Host "git add ."
    Write-Host "git rebase --continue"
    Write-Host ""
    Write-Host "Cancel:"
    Write-Host "git rebase --abort"
}

function Write-StashConflictHelp {
    Write-Host ""
    Write-Host "Your saved local changes conflicted with the latest code." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix:"
    Write-Host "git status"
    Write-Host "Edit conflicted files"
    Write-Host "git add ."
    Write-Host 'git commit -m "resolve local conflict"'
    Write-Host ""
    Write-Host "Your stash is kept as backup."
    Write-Host ""
    Write-Host "Check:"
    Write-Host "git stash list"
    Write-Host ""
    Write-Host "Drop after verification:"
    Write-Host 'git stash drop stash@{0}'
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

    if (Test-LocalChanges) {
        $stashMessage = "safe-pull auto-stash $Branch $(Get-Date -Format s)"
        Write-Host "Saving uncommitted changes in a temporary stash."
        Invoke-Git stash push --include-untracked -m $stashMessage
        $stashCreated = $true
    }

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
Write-Host "Safe Team Git Pull"
Write-Host "Target: $TargetRemote/$TargetBranch"
Write-Host ""

Write-Host "[1/4] Checking repository"
& git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Script "Not inside a Git repository."
}

if ((Test-GitPathExists "rebase-merge") -or (Test-GitPathExists "rebase-apply") -or (Test-GitPathExists "MERGE_HEAD")) {
    Write-UnfinishedGitHelp
    exit 1
}

$branch = Get-GitOutput branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    Stop-Script "You are in detached HEAD mode. Checkout a branch before pulling."
}

Write-Host "Current branch: $branch"
if ($branch -ne $TargetBranch) {
    Stop-Script "This script only pulls into the $TargetBranch branch. Run: git checkout $TargetBranch"
}

Write-Host ""
Write-Host "[2/4] Fetching latest code"
Invoke-Git fetch $TargetRemote --prune

Write-Host ""
Write-Host "[3/4] Selecting pull target"
if (-not (Test-OriginBranchExists $TargetRemote $TargetBranch)) {
    Stop-Script "$TargetRemote/$TargetBranch was not found."
}
Write-Host "Pull target: $TargetRemote/$TargetBranch"

Write-Host ""
Write-Host "[4/4] Pulling latest code safely"
Invoke-SafePull -Branch $branch -PullMode "explicit" -Remote $TargetRemote -RemoteBranch $TargetBranch

Write-Host ""
Write-Host "Pull completed successfully."
Write-Host "Your current branch has the latest $TargetRemote/$TargetBranch code."
