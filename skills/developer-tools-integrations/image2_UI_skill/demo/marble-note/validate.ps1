$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

function Assert-True($condition, $message) {
  if (-not $condition) {
    throw $message
  }
}

function Get-FreeTcpPort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  $selectedPort = $listener.LocalEndpoint.Port
  $listener.Stop()
  return $selectedPort
}

function Invoke-ChromeScreenshot([string]$chromePath, [string[]]$arguments, [string]$targetPath) {
  if (Test-Path -LiteralPath $targetPath) {
    Remove-Item -LiteralPath $targetPath -Force -ErrorAction SilentlyContinue
  }

  for ($attempt = 1; $attempt -le 3; $attempt++) {
    & $chromePath @arguments *> $null
    Start-Sleep -Milliseconds (500 * $attempt)
    if ((Test-Path -LiteralPath $targetPath) -and ((Get-Item -LiteralPath $targetPath).Length -gt 10000)) {
      return
    }
  }

  throw "Chrome screenshot failed"
}

$port = Get-FreeTcpPort
$url = "http://127.0.0.1:$port/"

Assert-True (Test-Path -LiteralPath (Join-Path $root "index.html")) "Missing index.html"
Assert-True (Test-Path -LiteralPath (Join-Path $root "styles.css")) "Missing styles.css"
Assert-True (Test-Path -LiteralPath (Join-Path $root "script.js")) "Missing script.js"
Assert-True (Test-Path -LiteralPath $chrome) "Chrome not found at $chrome"

$html = Get-Content -LiteralPath (Join-Path $root "index.html") -Raw
Assert-True (-not ($html -match "https?://")) "Demo should not depend on remote URLs"
Assert-True (($html -match "data-go=`"home`"") -and ($html -match "data-go=`"meeting`"")) "Missing expected click paths"
Assert-True (($html -match "data-view=`"search`"") -and ($html -match "data-view=`"create`"") -and ($html -match "data-view=`"schedule`"") -and ($html -match "data-view=`"settings`"")) "Missing logical app pages"
Assert-True (($html -match "dynamic-island")) "Missing iOS Dynamic Island frame detail"
Assert-True (-not ($html -match '<span class="status-icons"><i>')) "Status icons should use explicit SVG/geometry, not ambiguous CSS glyphs"

$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($existing) {
  $existing | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

$server = Start-Process -FilePath python -ArgumentList @("-m", "http.server", "$port", "--bind", "127.0.0.1") -WorkingDirectory $root -WindowStyle Hidden -PassThru
$chromeProcess = $null

try {
  Start-Sleep -Seconds 2
  $status = (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10).StatusCode
  Assert-True ($status -eq 200) "Preview server did not return 200"

  $screenshots = Join-Path $root "screenshots"
  New-Item -ItemType Directory -Force -Path $screenshots | Out-Null
  $desktopShot = Join-Path $screenshots "validate-desktop.png"
  $screenshotArgs = @("--headless=new", "--disable-gpu", "--disable-extensions", "--disable-component-extensions-with-background-pages", "--hide-scrollbars", "--window-size=1280,960", "--screenshot=$desktopShot", $url)
  Invoke-ChromeScreenshot $chrome $screenshotArgs $desktopShot

  $profile = Join-Path $env:TEMP ("marble-note-validate-cdp-" + [Guid]::NewGuid().ToString("N"))
  $cdpPort = Get-FreeTcpPort
  $chromeProcess = Start-Process -FilePath $chrome -ArgumentList @("--headless=new", "--disable-gpu", "--disable-extensions", "--disable-component-extensions-with-background-pages", "--remote-debugging-port=$cdpPort", "--user-data-dir=$profile", "--window-size=390,860", $url) -WindowStyle Hidden -PassThru

  $targets = $null
  for ($attempt = 1; $attempt -le 10; $attempt++) {
    try {
      $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$cdpPort/json" -TimeoutSec 5
      if ($targets) { break }
    }
    catch {
      Start-Sleep -Milliseconds 500
    }
  }
  Assert-True $targets "Chrome CDP target list was not available"
  $page = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1
  Assert-True $page "No Chrome page target found"

  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $null = $ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $script:cdpId = 0

  function Receive-CdpMessage {
    $buffer = New-Object byte[] 1048576
    $chunks = [System.Collections.Generic.List[byte]]::new()
    do {
      $seg = [ArraySegment[byte]]::new($buffer)
      $result = $script:ws.ReceiveAsync($seg, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      for ($i = 0; $i -lt $result.Count; $i++) {
        $chunks.Add($buffer[$i])
      }
    } while (-not $result.EndOfMessage)
    return ([Text.Encoding]::UTF8.GetString($chunks.ToArray()) | ConvertFrom-Json)
  }

  function Send-Cdp($method, $params = $null) {
    $script:cdpId++
    $payload = @{ id = $script:cdpId; method = $method }
    if ($null -ne $params) {
      $payload.params = $params
    }
    $json = $payload | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $null = $script:ws.SendAsync([ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    while ($true) {
      $msg = Receive-CdpMessage
      if ($null -ne $msg -and $msg.id -eq $script:cdpId) {
        return $msg
      }
    }
  }

  function Eval-Js([string]$expr) {
    $response = Send-Cdp "Runtime.evaluate" @{ expression = $expr; awaitPromise = $true; returnByValue = $true }
    if ($response.result.exceptionDetails) {
      throw "JS failed: $expr"
    }
    return $response.result.result.value
  }

  function Wait-ForJs([string]$expr, [string]$message) {
    for ($attempt = 1; $attempt -le 20; $attempt++) {
      $response = Send-Cdp "Runtime.evaluate" @{ expression = $expr; awaitPromise = $true; returnByValue = $true }
      if (-not $response.result.exceptionDetails -and $response.result.result.value) {
        return
      }
      Start-Sleep -Milliseconds 250
    }
    throw $message
  }

  Send-Cdp "Runtime.enable" | Out-Null
  Wait-ForJs 'document.readyState === "complete" && !!document.querySelector(".phone.is-active") && !!document.querySelector(".app-view.is-visible")' "Marble Note DOM did not become ready"
  $initial = Eval-Js 'document.querySelector(".phone.is-active").dataset.screen'
  $afterHome = Eval-Js 'document.querySelector("[data-screen=cover] [data-go=home]").click(), document.querySelector(".phone.is-active").dataset.screen'
  $afterSearch = Eval-Js 'document.querySelector("[data-view-target=search]").click(), document.querySelector(".app-view.is-visible").dataset.view'
  $afterCreate = Eval-Js 'document.querySelector(".dock [data-view-target=create]").click(), document.querySelector(".app-view.is-visible").dataset.view'
  $afterSchedule = Eval-Js 'document.querySelector(".dock [data-view-target=home]").click(), document.querySelector(".schedule").click(), document.querySelector(".app-view.is-visible").dataset.view'
  $afterSettings = Eval-Js 'document.querySelector(".dock [data-view-target=settings]").click(), document.querySelector(".app-view.is-visible").dataset.view'
  $afterFolder = Eval-Js 'document.querySelector("[data-view=settings] [data-view-target=home]").click(), document.querySelector(".folder-card").click(), document.querySelector(".app-view.is-visible").dataset.view'
  $afterMeeting = Eval-Js 'document.querySelector("[data-view=folder] [data-go=meeting]").click(), document.querySelector(".phone.is-active").dataset.screen'
  $brokenImages = Eval-Js 'Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).length'
  $dynamicIslands = Eval-Js 'document.querySelectorAll(".dynamic-island").length'
  $statusSvgCount = Eval-Js 'document.querySelectorAll(".status-icons svg").length'
  $appViewCount = Eval-Js 'document.querySelectorAll(".app-view").length'

  Assert-True ($initial -eq "cover") "Initial screen should be cover"
  Assert-True ($afterHome -eq "home") "Cover -> home click failed"
  Assert-True ($afterSearch -eq "search") "Home -> search click failed"
  Assert-True ($afterCreate -eq "create") "Dock -> create click failed"
  Assert-True ($afterSchedule -eq "schedule") "Home -> schedule click failed"
  Assert-True ($afterSettings -eq "settings") "Dock -> settings click failed"
  Assert-True ($afterFolder -eq "folder") "Home -> folder click failed"
  Assert-True ($afterMeeting -eq "meeting") "Folder -> meeting click failed"
  Assert-True ($brokenImages -eq 0) "Found broken images"
  Assert-True ($dynamicIslands -eq 3) "Expected three iOS Dynamic Island elements"
  Assert-True ($statusSvgCount -eq 9) "Expected SVG signal/Wi-Fi/battery icons in each status bar"
  Assert-True ($appViewCount -ge 6) "Expected expanded logical app pages"

  $null = $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", [Threading.CancellationToken]::None).GetAwaiter().GetResult()

  [pscustomobject]@{
    Ok = $true
    Url = $url
    Screenshot = $desktopShot
    Initial = $initial
    AfterHome = $afterHome
    AfterSearch = $afterSearch
    AfterCreate = $afterCreate
    AfterSchedule = $afterSchedule
    AfterSettings = $afterSettings
    AfterFolder = $afterFolder
    AfterMeeting = $afterMeeting
    BrokenImages = $brokenImages
    DynamicIslands = $dynamicIslands
    StatusSvgCount = $statusSvgCount
    AppViewCount = $appViewCount
  }
}
finally {
  if ($chromeProcess) {
    Stop-Process -Id $chromeProcess.Id -Force -ErrorAction SilentlyContinue
  }
  if ($profile -and (Test-Path -LiteralPath $profile)) {
    Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
  }
  if ($server) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  }
}
