$ErrorActionPreference='Stop'
$runner=Join-Path $PSScriptRoot 'run-command.ps1'
$env:VITE_USER_APP_URL='http://127.0.0.1:4173'
$checks=@(
 @{Id='final-ready-cross-engine-content-ready-resumed';Command='npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase06.config.js --workers=2 --reporter=line --output=../../output/playwright/uxui-phase06-2026-11-17/final-ready-cross-engine-content-ready-resumed';Expected=0},
 @{Id='final-ready-post-safearea-combined';Command='npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line --output=../../output/playwright/uxui-phase06-2026-11-17/final-ready-combined';Expected=0},
 @{Id='final-ready-final-phase02-unchanged';Command='npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line --output=../../output/playwright/uxui-phase06-2026-11-17/final-ready-phase02';Expected=1}
)
foreach($check in $checks){
 & powershell -ExecutionPolicy Bypass -File $runner -Id $check.Id -Command $check.Command
 if($LASTEXITCODE -ne $check.Expected){throw "$($check.Id) failed unexpectedly. Inspect retained evidence."}
}
