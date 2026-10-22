<#
.SYNOPSIS
    Verify and install all bundled Koupreng AI skills for Codex and Claude Code.
.DESCRIPTION
    Requires Python 3.10+. Defaults to project scope and both agents.
    See docs/development/AI_SKILLS_SETUP.md for team onboarding and examples.
.PARAMETER Agent
    all (default), codex, or claude.
.PARAMETER Scope
    project (default), or user for personal skills available across repositories.
.PARAMETER VerifyOnly
    Validate repository skills and routing without installing or changing files.
.PARAMETER Force
    Back up and replace conflicting installed copies. Never repairs source skills.
#>
[CmdletBinding()]
param(
    [ValidateSet('all', 'codex', 'claude')]
    [string]$Agent = 'all',
    [ValidateSet('project', 'user')]
    [string]$Scope = 'project',
    [switch]$VerifyOnly,
    [switch]$Force,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'
$installer = Join-Path $PSScriptRoot 'setup_ai_skills.py'
$installerArgs = @($installer, '--agent', $Agent.ToLowerInvariant(), '--scope', $Scope.ToLowerInvariant())
if ($VerifyOnly) { $installerArgs += '--verify-only' }
if ($Force) { $installerArgs += '--force' }
if ($Help) { $installerArgs += '--help' }

# Probe interpreters; Windows' Store aliases may exist without a usable Python.
foreach ($candidate in @('py', 'python3', 'python')) {
    $command = Get-Command $candidate -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $command) { continue }
    $prefixArgs = @()
    if ($candidate -eq 'py') { $prefixArgs = @('-3') }
    $probeSucceeded = $false
    try {
        # Windows PowerShell 5.1 treats native stderr as an error even when redirected.
        $ErrorActionPreference = 'SilentlyContinue'
        & $command.Source @prefixArgs -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' >$null 2>$null
        $probeSucceeded = $? -and ($LASTEXITCODE -eq 0)
    } catch {
        $probeSucceeded = $false
    } finally {
        $ErrorActionPreference = 'Stop'
    }
    if ($probeSucceeded) {
        & $command.Source @prefixArgs @installerArgs
        exit $LASTEXITCODE
    }
}

Write-Error 'Python 3.10+ is required. Install Python, enable its launcher/PATH, reopen the terminal, and rerun this script.'
exit 1
