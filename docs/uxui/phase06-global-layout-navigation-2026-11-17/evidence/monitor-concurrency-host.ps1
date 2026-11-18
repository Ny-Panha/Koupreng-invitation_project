param([string]$CompletionId='post-final-default-recheck')
$ErrorActionPreference = 'Continue'
$rows = New-Object System.Collections.Generic.List[object]
$done = Join-Path $PSScriptRoot "commands/$CompletionId.json"
do {
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'" -ErrorAction SilentlyContinue
    $browsers = @(Get-Process -Name 'chrome-headless-shell' -ErrorAction SilentlyContinue)
    $rows.Add([ordered]@{ at=[DateTime]::UtcNow.ToString('o'); freePhysicalKiB=$os.FreePhysicalMemory; totalPhysicalKiB=$os.TotalVisibleMemorySize; cpuPercent=$cpu.PercentProcessorTime; browserProcesses=$browsers.Count; browserWorkingSetBytes=($browsers | Measure-Object WorkingSet64 -Sum).Sum; browserCpuSeconds=($browsers | Measure-Object CPU -Sum).Sum })
    if (Test-Path -LiteralPath $done) { break }
    Start-Sleep -Seconds 2
} while ($true)
ConvertTo-Json -InputObject ([ordered]@{ completionId=$CompletionId; method='Read-only WMI OS/CPU + owned Playwright headless browser process aggregates, sampled approximately every two seconds'; limits='Sampling is observational and adds minor host overhead; CPU correlation alone is not source causality'; rows=@($rows.ToArray()) }) -Depth 6 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $PSScriptRoot 'concurrency-host-metrics.json')
Write-Output "Retained $($rows.Count) host resource observations"
