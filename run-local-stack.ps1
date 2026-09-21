# Forward to scripts\dev\dev.ps1
param(
    [switch]$Ngrok,
    [switch]$Bot,
    [switch]$AdminOnly,
    [switch]$UserOnly,
    [switch]$Help
)

& "$PSScriptRoot\scripts\dev\dev.ps1" @PSBoundParameters

