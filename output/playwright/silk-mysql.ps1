$ErrorActionPreference = 'Stop'
$silkContainerName = 'koupreng-silk-qa-' + [guid]::NewGuid().ToString('N').Substring(0,12)
$env:MYSQL_ROOT_PASSWORD = [guid]::NewGuid().ToString('N')
$env:FLYWAY_TEST_DB_PASSWORD = $env:MYSQL_ROOT_PASSWORD
$env:FLYWAY_TEST_DB_USERNAME = 'root'
$env:RUN_FLYWAY_INTEGRATION = 'true'
$silkContainerId = ''
try {
    $silkContainerId = (& docker run --rm -d --name $silkContainerName -p '127.0.0.1::3306' -e MYSQL_ROOT_PASSWORD -e MYSQL_DATABASE=koupreng_silk_qa mysql:8.0 2> output/playwright/silk-mysql-container.log | Select-Object -Last 1)
    if ($LASTEXITCODE -ne 0 -or $silkContainerId -notmatch '^[a-f0-9]{64}$') { throw 'Isolated MySQL container did not start' }
    $silkPort = (& docker port $silkContainerId 3306/tcp).Split(':')[-1]
    if ($silkPort -notmatch '^\d+$') { throw 'Invalid isolated MySQL port' }
    $env:FLYWAY_TEST_DB_URL = "jdbc:mysql://127.0.0.1:$silkPort/koupreng_silk_qa?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
    $silkReady = $false
    for ($silkAttempt = 0; $silkAttempt -lt 45; $silkAttempt++) {
        & docker exec $silkContainerId mysqladmin ping --silent > $null 2>&1
        if ($LASTEXITCODE -eq 0) { $silkReady = $true; break }
        Start-Sleep -Seconds 2
    }
    if (-not $silkReady) { throw 'Isolated MySQL readiness timed out' }
    Write-Output 'Isolated MySQL 8 is ready; running fresh/upgrade/catalog verification.'
    Push-Location apps/backend
    try {
        $ErrorActionPreference = 'Continue'
        & .\mvnw.cmd test '-Dtest=FreshDatabaseMigrationTests,MigrationUpgradeMySqlTests,SilkHeritageMigrationMySqlTests,TemplateCheckoutPolicyTests' > ../../output/playwright/silk-mysql-tests.log 2>&1
        $silkMavenExit = $LASTEXITCODE
    } finally { Pop-Location }
    if ($silkMavenExit -ne 0) { throw "Maven integration tests exited $silkMavenExit" }
    Write-Output 'Isolated MySQL verification passed.'
} finally {
    if ($silkContainerId -match '^[a-f0-9]{64}$') {
        & docker stop $silkContainerId > $null
        Write-Output 'Removed the isolated MySQL test container.'
    }
    Remove-Item Env:MYSQL_ROOT_PASSWORD,Env:FLYWAY_TEST_DB_PASSWORD,Env:FLYWAY_TEST_DB_USERNAME,Env:FLYWAY_TEST_DB_URL,Env:RUN_FLYWAY_INTEGRATION -ErrorAction SilentlyContinue
}
