$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location -LiteralPath $repo
$runner = Join-Path $PSScriptRoot 'run-command.ps1'
$completion = Join-Path $PSScriptRoot 'commands/final-ready-final-phase02-unchanged.json'
while (-not (Test-Path -LiteralPath $completion)) { Start-Sleep -Seconds 5 }
$prior = Get-Content -Raw -LiteralPath $completion | ConvertFrom-Json
if ($prior.exitCode -ne 1) { throw 'Inspect the legacy suite result before proceeding.' }
function Invoke-Recorded([string]$Id,[string]$Command) {
    & powershell -ExecutionPolicy Bypass -File $runner -Id $Id -Command $Command
    if ($LASTEXITCODE -ne 0) { throw "$Id failed; inspect retained evidence before proceeding." }
}
Invoke-Recorded 'final-ready-renderer-hit-diagnosis' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/diagnose-renderer-hit.mjs'
Invoke-Recorded 'final-ready-captures' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/capture-visual.mjs after'
Invoke-Recorded 'final-ready-performance' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs --after-only'
$raw = Get-Content -Raw -LiteralPath 'output/playwright/uxui-phase06-2026-11-17/lab-results.json' | ConvertFrom-Json
if ($raw.errors.Count -gt 0) { Invoke-Recorded 'final-ready-missing-pairs' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs --retry-errors' }
Invoke-Recorded 'final-ready-performance-summary' 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/summarize-lab.py'
Invoke-Recorded 'final-ready-performance-compare' 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/compare-performance.py'
Invoke-Recorded 'final-ready-performance-diagnostics' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs --diagnostics --restart'
$diagnostic = Get-Content -Raw -LiteralPath 'output/playwright/uxui-phase06-2026-11-17/lab-diagnostic-results.json' | ConvertFrom-Json
if ($diagnostic.errors.Count -gt 0) { Invoke-Recorded 'final-ready-diagnostic-missing-pairs' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs --diagnostics --retry-errors' }
Invoke-Recorded 'final-ready-diagnostic-compare' 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/compare-performance.py --diagnostics'
Invoke-Recorded 'final-ready-performance-conclusions' 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/conclude-performance.py'
Invoke-Recorded 'final-ready-resource-windows' 'python docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/diagnose-resource-windows.py'
Invoke-Recorded 'final-ready-build-inventory' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/inventory-build-assets.mjs'
Invoke-Recorded 'final-ready-shell-probes' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/probe-shells.mjs after'
Invoke-Recorded 'final-ready-special-modes' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/probe-special-modes.mjs'
Invoke-Recorded 'final-ready-renderer-review' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/review-renderers.mjs'
Invoke-Recorded 'final-ready-interaction-profile' 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/interaction-profile.mjs'
Write-Output 'Final evidence collection finished; review artifacts before committing documentation.'
