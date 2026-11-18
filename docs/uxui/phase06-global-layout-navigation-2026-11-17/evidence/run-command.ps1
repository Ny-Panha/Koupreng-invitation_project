param([Parameter(Mandatory=$true)][string]$Id, [Parameter(Mandatory=$true)][string]$Command)
$ErrorActionPreference = 'Continue'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location -LiteralPath $repo
$artifactDir = Join-Path $repo 'output/playwright/uxui-phase06-2026-11-17/commands'
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$started = [DateTime]::UtcNow
$sha = git rev-parse HEAD
$dirty = @(git status --short)
$logFile = Join-Path $artifactDir "$Id.log"
New-Item -ItemType File -Force -Path $logFile | Out-Null
try {
    Invoke-Expression "$Command 2>&1" | ForEach-Object { $_.ToString() } | Tee-Object -FilePath $logFile
    $result = $LASTEXITCODE
} catch {
    $_.ToString() | Tee-Object -FilePath $logFile -Append
    $result = 1
}
$record = [ordered]@{ id=$Id; command=$Command; startedAt=$started.ToString('o'); durationSeconds=([DateTime]::UtcNow-$started).TotalSeconds; exitCode=$result; sourceSha=$sha; dirty=$dirty; previewOrigin=$env:VITE_USER_APP_URL; log="output/playwright/uxui-phase06-2026-11-17/commands/$Id.log" }
$ledger = Join-Path $PSScriptRoot 'qa-command-results.json'
$commandDir = Join-Path $PSScriptRoot 'commands'
New-Item -ItemType Directory -Force -Path $commandDir | Out-Null
ConvertTo-Json -InputObject $record -Depth 10 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $commandDir "$Id.json")
python (Join-Path $PSScriptRoot 'merge-commands.py')
exit $result
