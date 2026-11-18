param([string]$CompletionId='post-auth-aligned-final-performance',[string]$Prefix='post-auth')
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location -LiteralPath $repo
$runner = Join-Path $PSScriptRoot 'run-command.ps1'
$completion = Join-Path $PSScriptRoot "commands/$CompletionId.json"
while (-not (Test-Path -LiteralPath $completion)) { Start-Sleep -Seconds 5 }
$benchmark = Get-Content -Raw -LiteralPath $completion | ConvertFrom-Json
if ($benchmark.exitCode -ne 0) { throw 'Final benchmark process failed; inspect its log.' }
function Invoke-Recorded([string]$Id,[string]$Command) {
    & powershell -ExecutionPolicy Bypass -File $runner -Id $Id -Command $Command
    if ($LASTEXITCODE -ne 0) { throw "$Id failed; inspect retained evidence before proceeding." }
}
$raw = Get-Content -Raw -LiteralPath 'output/playwright/uxui-phase06-2026-11-17/lab-results.json' | ConvertFrom-Json
if ($raw.errors.Count -gt 0) { Invoke-Recorded "$Prefix-final-missing-pairs" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs --retry-errors' }
Invoke-Recorded "$Prefix-summarize-performance" 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/summarize-lab.py'
Invoke-Recorded "$Prefix-compare-performance" 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/compare-performance.py'
Invoke-Recorded "$Prefix-performance-conclusions" 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/conclude-performance.py'
Invoke-Recorded "$Prefix-build-inventory" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/inventory-build-assets.mjs'
Invoke-Recorded "$Prefix-shell-probes" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/probe-shells.mjs after'
Invoke-Recorded "$Prefix-special-modes" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/probe-special-modes.mjs'
Invoke-Recorded "$Prefix-renderer-review" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/review-renderers.mjs'
Invoke-Recorded "$Prefix-interaction-profile" 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/interaction-profile.mjs'
& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'run-final-checks.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Final frontend checks failed; inspect retained logs.' }
Write-Output 'Final sequential verification completed; inspect counts and review items before documentation sign-off.'
