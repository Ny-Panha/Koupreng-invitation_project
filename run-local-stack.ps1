# Forward to scripts\maintenance\dev.ps1
param(
    [Alias("admin", "admin-only", "Admin")]
    [switch]$AdminOnly,

    [Alias("user", "user-only", "User")]
    [switch]$UserOnly,

    [Alias("ngrok")]
    [switch]$Ngrok,

    [Alias("no-ngrok")]
    [switch]$NoNgrok,

    [Alias("bot")]
    [switch]$Bot,

    [Alias("new-window", "window")]
    [switch]$NewWindow,

    [Alias("h", "?")]
    [switch]$Help
)

& "$PSScriptRoot\scripts\maintenance\dev.ps1" @PSBoundParameters

