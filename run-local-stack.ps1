# Forward to scripts\maintenance\dev\dev.ps1
param(
    [Alias("admin", "admin-only")]
    [switch]$AdminOnly,

    [Alias("user", "user-only")]
    [switch]$UserOnly,

    [switch]$Ngrok,

    [switch]$NoNgrok,

    [switch]$Bot,

    [Alias("window")]
    [switch]$NewWindow,

    [Alias("h", "?")]
    [switch]$Help
)

& "$PSScriptRoot\scripts\maintenance\dev\dev.ps1" @PSBoundParameters @args

