# Recovery for the failed, unreleased V39 on the Windows development database.
# Inspection is the default. -Apply backs up the database before removing only the failed entry.
[CmdletBinding()]
param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$settings = @{}
$envFile = Join-Path $projectRoot '.env'
if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile -Encoding utf8 | ForEach-Object {
        if ($_ -match '^\s*(DB_URL|DB_USERNAME|DB_PASSWORD)\s*=(.*)$') {
            $settings[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
        }
    }
}
foreach ($name in @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD')) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if ($null -ne $value) { $settings[$name] = $value }
}
$dbUrl = if ($settings.ContainsKey('DB_URL')) { $settings['DB_URL'] } else { 'jdbc:mysql://localhost:3306/koupreng_db' }
if ($dbUrl -notmatch '^jdbc:mysql://(localhost|127\.0\.0\.1)(:3306)?/koupreng_db(\?.*)?$') {
    throw 'This recovery supports only localhost:3306/koupreng_db. It cannot repair remote or other schemas.'
}
$dbUser = if ($settings.ContainsKey('DB_USERNAME')) { $settings['DB_USERNAME'] } else { 'root' }
$dbPassword = if ($settings.ContainsKey('DB_PASSWORD')) { $settings['DB_PASSWORD'] } else { 'change_me' }
$mysql = (Get-Command mysql.exe -ErrorAction Stop).Source
$previousPassword = [Environment]::GetEnvironmentVariable('MYSQL_PWD', 'Process')
$env:MYSQL_PWD = $dbPassword

function Invoke-LocalSql([string]$Query) {
    $rows = & $mysql --host=127.0.0.1 --port=3306 --user=$dbUser --database=koupreng_db --batch --skip-column-names --execute=$Query
    if ($LASTEXITCODE -ne 0) { throw 'Local MySQL query failed; no further recovery will run.' }
    return $rows
}

try {
    $failed = [int](Invoke-LocalSql 'SELECT COUNT(*) FROM flyway_schema_history WHERE success=0;')
    $succeeded = [int](Invoke-LocalSql "SELECT COUNT(*) FROM flyway_schema_history WHERE version='39' AND success=1;")
    if ($succeeded -gt 0) {
        Write-Output 'V39 is already successful. No changes made; never rewrite or repair a successfully applied V39.'
        return
    }
    if ($failed -eq 0) {
        Write-Output 'No failed migration exists. No changes made.'
        return
    }
    $expected = [int](Invoke-LocalSql "SELECT COUNT(*) FROM flyway_schema_history WHERE version='39' AND success=0 AND type='SQL' AND script='V39__cascade_invitation_ticket_design_cleanup.sql' AND checksum=1721223858;")
    if ($failed -ne 1 -or $expected -ne 1) { throw 'History differs from the known failed V39; manual inspection is required.' }
    $migration = Join-Path $projectRoot 'apps/backend/src/main/resources/db/migration/V39__cascade_invitation_ticket_design_cleanup.sql'
    if ((Get-Content -LiteralPath $migration -Raw) -notmatch 'ADD CONSTRAINT fk_ticket_designs_invitation_cascade\s') {
        throw 'Install the corrected, unapplied V39 before removing its failed entry.'
    }
    $fk = [int](Invoke-LocalSql "SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS r JOIN information_schema.KEY_COLUMN_USAGE k ON k.CONSTRAINT_SCHEMA=r.CONSTRAINT_SCHEMA AND k.CONSTRAINT_NAME=r.CONSTRAINT_NAME AND k.TABLE_NAME=r.TABLE_NAME WHERE r.CONSTRAINT_SCHEMA=DATABASE() AND r.TABLE_NAME='invitation_ticket_designs' AND r.CONSTRAINT_NAME='fk_ticket_designs_invitation' AND r.DELETE_RULE IN ('NO ACTION','RESTRICT') AND k.COLUMN_NAME='invitation_id' AND k.REFERENCED_TABLE_NAME='invitations' AND k.REFERENCED_COLUMN_NAME='invitation_id';")
    $orphans = [int](Invoke-LocalSql 'SELECT COUNT(*) FROM invitation_ticket_designs t LEFT JOIN invitations i ON i.invitation_id=t.invitation_id WHERE i.invitation_id IS NULL;')
    if ($fk -ne 1 -or $orphans -ne 0) { throw 'The schema is not the unchanged V38 state. Stop and inspect partial DDL first.' }
    Write-Output 'Confirmed: only V39 failed, the V38 foreign key is intact, and no orphan ticket designs exist.'
    if (-not $Apply) {
        Write-Output 'Inspection only. Use -Apply to back up this local database and remove only its failed V39 entry.'
        return
    }
    if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) {
        throw 'Stop the local backend on port 8080 before repairing its migration history.'
    }
    $backupTool = (Get-Command mysqldump.exe -ErrorAction Stop).Source
    $backupDirectory = Join-Path $projectRoot ('.cache/local-v39-recovery/' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $backupDirectory | Out-Null
    $backupFile = Join-Path $backupDirectory 'koupreng_db.sql'
    $historyBefore = @(Invoke-LocalSql 'SELECT installed_rank,version,description,type,script,checksum,installed_by,installed_on,execution_time,success FROM flyway_schema_history WHERE success=1 ORDER BY installed_rank;')
    $historyBefore | Set-Content -LiteralPath (Join-Path $backupDirectory 'successful-history.tsv') -Encoding utf8
    & $backupTool --host=127.0.0.1 --port=3306 --user=$dbUser --single-transaction --routines --triggers --no-tablespaces --set-gtid-purged=OFF --column-statistics=0 --hex-blob --result-file=$backupFile koupreng_db
    if ($LASTEXITCODE -ne 0 -or (Get-Item -LiteralPath $backupFile).Length -eq 0) {
        throw 'Backup failed. The failed history entry has not been removed.'
    }
    Get-FileHash -LiteralPath $backupFile -Algorithm SHA256 | Select-Object Hash | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDirectory 'backup-sha256.json') -Encoding utf8
    $removed = [int](Invoke-LocalSql "DELETE FROM flyway_schema_history WHERE version='39' AND success=0 AND type='SQL' AND script='V39__cascade_invitation_ticket_design_cleanup.sql' AND checksum=1721223858; SELECT ROW_COUNT();")
    if ($removed -ne 1) { throw 'Expected exactly one failed V39 entry to be removed.' }
    $historyAfter = @(Invoke-LocalSql 'SELECT installed_rank,version,description,type,script,checksum,installed_by,installed_on,execution_time,success FROM flyway_schema_history WHERE success=1 ORDER BY installed_rank;')
    if (($historyBefore -join "`n") -cne ($historyAfter -join "`n")) { throw 'Successful history changed unexpectedly; inspect the backup before starting the backend.' }
    Write-Output "Backup saved privately in $backupDirectory"
    Write-Output 'Removed exactly one failed V39 entry. Every successful history row is unchanged.'
    Write-Output 'Start .\run-local-stack.ps1 to apply the corrected V39 with normal Flyway validation enabled.'
} finally {
    [Environment]::SetEnvironmentVariable('MYSQL_PWD', $previousPassword, 'Process')
}
