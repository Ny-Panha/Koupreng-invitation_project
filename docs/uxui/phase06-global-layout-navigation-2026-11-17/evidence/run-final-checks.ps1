param([string]$Prefix='post-final',[switch]$SkipDefault)
$ErrorActionPreference = 'Stop'
if ($Prefix -notmatch '^[a-z0-9-]+$') { throw 'Invalid evidence prefix' }
$runner = Join-Path $PSScriptRoot 'run-command.ps1'
$env:VITE_USER_APP_URL = 'http://127.0.0.1:4173'
$commands = @(
    @{ Id='history-zero-recovery-fixed'; Command='node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/probe-history-zero.mjs' },
    @{ Id='post-final-user-build'; Command='npm --prefix apps/frontend-user run build' },
    @{ Id='post-final-admin-build'; Command='npm --prefix apps/frontend-admin run build' },
    @{ Id='post-final-user-units'; Command='npm --prefix apps/frontend-user test' },
    @{ Id='post-final-admin-units'; Command='npm --prefix apps/frontend-admin test' },
    @{ Id='post-final-user-lint'; Command='npm --prefix apps/frontend-user run lint' },
    @{ Id='post-final-admin-lint'; Command='npm --prefix apps/frontend-admin run lint' },
    @{ Id='post-safearea-cross-engine'; Command='npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase06.config.js --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/post-safearea-cross-engine' },
    @{ Id='post-safearea-combined'; Command='npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/post-safearea-combined' },
    @{ Id='post-final-default-concurrency'; Command='npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --reporter=line --output=../../output/playwright/uxui-phase06-2026-11-17/post-final-default-concurrency' },
    @{ Id='final-phase02-unchanged'; Command='npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/final-phase02'; ExpectedExit=1 }
)
foreach ($item in $commands) {
    if ($SkipDefault -and $item.Id -eq 'post-final-default-concurrency') { continue }
    $recordId = "$Prefix-$($item.Id)"
    $command = $item.Command.Replace('post-safearea-cross-engine', "$Prefix-cross-engine").Replace('post-safearea-combined', "$Prefix-combined").Replace('post-final-default-concurrency', "$Prefix-default-concurrency").Replace('/final-phase02', "/$Prefix-phase02")
    & powershell -ExecutionPolicy Bypass -File $runner -Id $recordId -Command $command
    $expected = if ($item.ContainsKey('ExpectedExit')) { $item.ExpectedExit } else { 0 }
    if ($LASTEXITCODE -ne $expected) { throw "$($item.Id) exited $LASTEXITCODE (expected $expected). Inspect retained log before proceeding." }
}
