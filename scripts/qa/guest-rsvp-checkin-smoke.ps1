$ErrorActionPreference = 'Stop'
$base = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { 'http://localhost:8080' }
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-Api($name, $method, $url, $headers = $null, $body = $null) {
    $params = @{ Uri = $url; Method = $method; SkipHttpErrorCheck = $true; TimeoutSec = 15 }
    if ($headers) { $params.Headers = $headers }
    if ($null -ne $body) { $params.Body = $body; $params.ContentType = 'application/json' }
    try {
        $response = Invoke-WebRequest @params
        $json = $null
        try { $json = $response.Content | ConvertFrom-Json } catch { }
        $detail = if ($json.message) { $json.message } else { $response.StatusDescription }
        $results.Add([pscustomobject]@{ Name=$name; Status=[int]$response.StatusCode; Ok=([int]$response.StatusCode -in 200..299); Detail=$detail })
        [pscustomobject]@{ Response=$response; Json=$json }
    } catch {
        $results.Add([pscustomobject]@{ Name=$name; Status=0; Ok=$false; Detail=$_.Exception.Message })
        $null
    }
}

$login = Invoke-Api 'Setup: login' POST "$base/api/auth/login" $null '{"identifier":"demo@koupreng.local","password":"DemoPass123!"}'
$token = if ($login.Json.accessToken) { $login.Json.accessToken } else { $login.Json.data.accessToken }
if (-not $token) { throw 'Login returned no access token.' }
$headers = @{ Authorization = "Bearer $token" }
$invitations = Invoke-Api 'Setup: invitations' GET "$base/api/v1/invitations/my" $headers
$items = if ($invitations.Json.data.content) { $invitations.Json.data.content } else { $invitations.Json.data }
$invitation = $items | Where-Object slug -eq 'demo-wedding' | Select-Object -First 1
if (-not $invitation) { throw 'Demo invitation is missing.' }
$invitationId = $invitation.id
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$guestBody = @{ guestName="API QA $suffix"; phone='099000001'; email="apiqa$suffix@example.com"; guestGroup='QA'; sideType='GROOM'; seatCount=2; note='temporary API test' } | ConvertTo-Json
$created = Invoke-Api 'Guest POST create' POST "$base/api/v1/invitations/$invitationId/guests" $headers $guestBody
$guestId = $created.Json.data.id
$guestToken = $created.Json.data.inviteToken
Invoke-Api 'Guest GET list' GET "$base/api/v1/invitations/$invitationId/guests" $headers | Out-Null
Invoke-Api 'Guest GET grouped' GET "$base/api/v1/invitations/$invitationId/guests/grouped" $headers | Out-Null
Invoke-Api 'Guest GET send-list' GET "$base/api/v1/invitations/$invitationId/guests/send-list" $headers | Out-Null
Invoke-Api 'Guest GET one' GET "$base/api/v1/invitations/$invitationId/guests/$guestId" $headers | Out-Null
$updateBody = @{ guestName="API QA Updated $suffix"; phone='099000002'; email="apiqa$suffix@example.com"; guestGroup='QA Updated'; sideType='BRIDE'; seatCount=3; note='updated' } | ConvertTo-Json
Invoke-Api 'Guest PUT update' PUT "$base/api/v1/invitations/$invitationId/guests/$guestId" $headers $updateBody | Out-Null
Invoke-Api 'Guest GET search' GET "$base/api/v1/invitations/$invitationId/guests/search?keyword=API%20QA%20Updated" $headers | Out-Null
$importBody = @{ guests=@(@{ guestName="JSON Import $suffix"; email="json$suffix@example.com"; guestGroup='QA'; seatCount=1 }) } | ConvertTo-Json -Depth 5
$imported = Invoke-Api 'Guest POST JSON import' POST "$base/api/v1/invitations/$invitationId/guests/import" $headers $importBody
$importGuestId = $imported.Json.data[0].id

$csvPath = Join-Path $env:TEMP "koupreng-api-$suffix.csv"
Set-Content -LiteralPath $csvPath -Value "guestName,email,guestGroup,seatCount`nCSV Import $suffix,csv$suffix@example.com,QA,1" -Encoding utf8
try {
    $response = Invoke-WebRequest -Uri "$base/api/v1/invitations/$invitationId/guests/import-file" -Method Post -Headers $headers -Form @{ file=Get-Item -LiteralPath $csvPath } -SkipHttpErrorCheck -TimeoutSec 15
    $json = $response.Content | ConvertFrom-Json
    $results.Add([pscustomobject]@{ Name='Guest POST file import'; Status=[int]$response.StatusCode; Ok=([int]$response.StatusCode -in 200..299); Detail=$json.message })
    $csvGuestIds = @($json.data.guests | ForEach-Object id)
} finally { Remove-Item -LiteralPath $csvPath -Force -ErrorAction SilentlyContinue }
Invoke-Api 'Guest GET CSV export' GET "$base/api/v1/invitations/$invitationId/guests/export" $headers | Out-Null

$rsvpBody = @{ guestName="API QA Updated $suffix"; responseStatus='ATTENDING'; attendeeCount=2; message="QA wish $suffix" } | ConvertTo-Json
Invoke-Api 'RSVP POST personalized' POST "$base/api/v1/public/invitations/demo-wedding/guests/$guestToken/rsvp" $null $rsvpBody | Out-Null
Invoke-Api 'RSVP GET public summary' GET "$base/api/v1/public/invitations/demo-wedding/rsvp-summary-public?token=$guestToken" | Out-Null
Invoke-Api 'RSVP GET public wishes' GET "$base/api/v1/public/invitations/demo-wedding/wishes?token=$guestToken" | Out-Null
$rsvpList = Invoke-Api 'RSVP GET list' GET "$base/api/v1/invitations/$invitationId/rsvps" $headers
$rsvp = $rsvpList.Json.data | Where-Object guestId -eq $guestId | Select-Object -First 1
$rsvpId = $rsvp.id
Invoke-Api 'RSVP GET private summary' GET "$base/api/v1/invitations/$invitationId/rsvps/summary" $headers | Out-Null
$patchBody = @{ responseStatus='MAYBE'; attendeeCount=1; message="Updated QA wish $suffix" } | ConvertTo-Json
Invoke-Api 'RSVP PATCH update' PATCH "$base/api/v1/invitations/$invitationId/rsvps/$rsvpId" $headers $patchBody | Out-Null
Invoke-Api 'RSVP GET private wishes' GET "$base/api/v1/invitations/$invitationId/wishes" $headers | Out-Null
$publicBody = @{ guestName="Public API QA $suffix"; email="public$suffix@example.com"; responseStatus='NOT_ATTENDING'; attendeeCount=0; message='Public endpoint QA' } | ConvertTo-Json
$publicRsvp = Invoke-Api 'RSVP POST public' POST "$base/api/v1/public/invitations/demo-wedding/rsvp?accessToken=demo-invitation-access-token" $null $publicBody
$publicRsvpId = $publicRsvp.Json.data.id
$publicGuestId = $publicRsvp.Json.data.guestId

$checkBody = @{ guestName="Checkin QA $suffix"; email="checkin$suffix@example.com"; guestGroup='QA'; seatCount=1 } | ConvertTo-Json
$checkGuest = Invoke-Api 'Setup: check-in guest' POST "$base/api/v1/invitations/$invitationId/guests" $headers $checkBody
$checkGuestId = $checkGuest.Json.data.id
Invoke-Api 'Check-in POST manual' POST "$base/api/v1/invitations/$invitationId/guests/$checkGuestId/check-in" $headers (@{ note='manual QA' } | ConvertTo-Json) | Out-Null
$scanBody = @{ guestName="Scan QA $suffix"; email="scan$suffix@example.com"; guestGroup='QA'; seatCount=1 } | ConvertTo-Json
$scanGuest = Invoke-Api 'Setup: scan guest' POST "$base/api/v1/invitations/$invitationId/guests" $headers $scanBody
$scanGuestId = $scanGuest.Json.data.id
$scanToken = $scanGuest.Json.data.inviteToken
Invoke-Api 'Check-in POST scan' POST "$base/api/v1/invitations/$invitationId/check-in/scan" $headers (@{ token=$scanToken; note='scan QA' } | ConvertTo-Json) | Out-Null
Invoke-Api 'Check-in GET summary' GET "$base/api/v1/invitations/$invitationId/check-in/summary" $headers | Out-Null
Invoke-Api 'Check-in GET list' GET "$base/api/v1/invitations/$invitationId/check-in/list" $headers | Out-Null

if ($rsvpId) { Invoke-Api 'RSVP DELETE' DELETE "$base/api/v1/invitations/$invitationId/rsvps/$rsvpId" $headers | Out-Null }
if ($publicRsvpId) { Invoke-Api 'Cleanup public RSVP DELETE' DELETE "$base/api/v1/invitations/$invitationId/rsvps/$publicRsvpId" $headers | Out-Null }
foreach ($id in @($guestId, $importGuestId, $publicGuestId) + $csvGuestIds + @($checkGuestId, $scanGuestId)) {
    if ($id) { Invoke-Api "Guest DELETE $id" DELETE "$base/api/v1/invitations/$invitationId/guests/$id" $headers | Out-Null }
}

$results | Format-Table -AutoSize
if ($results.Ok -contains $false) { exit 1 }
