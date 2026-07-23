#requires -Version 7.0
[CmdletBinding()]
param(
  [ValidateSet('audit', 'cleanup')]
  [string]$Mode = 'audit',

  [ValidateSet('none', 'phone-link-background', 'dolby-backgroundtask')]
  [string]$Profile = 'none',

  [switch]$DisablePhoneLinkBackground,

  [switch]$WhatIf,

  [switch]$AsJson
)

$ErrorActionPreference = 'Stop'

function ConvertTo-UwpProcessTimestamp {
  param($Value)

  if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) {
    return $null
  }
  try {
    return ([datetime]$Value).ToUniversalTime().ToString('o')
  }
  catch {
    return $null
  }
}

function Read-StrictCsvFields {
  param([string]$Line)

  $reader = [System.IO.StringReader]::new($Line)
  $parser = [Microsoft.VisualBasic.FileIO.TextFieldParser]::new($reader)
  try {
    $parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
    $parser.SetDelimiters(',')
    $parser.HasFieldsEnclosedInQuotes = $true
    $fields = $parser.ReadFields()
    if ($null -eq $fields -or $fields.Count -ne 4 -or -not $parser.EndOfData) {
      throw 'tasklist /apps CSV row must contain exactly four fields.'
    }
    return ,$fields
  }
  finally {
    $parser.Dispose()
    $reader.Dispose()
  }
}

function ConvertFrom-AppTaskListCsv {
  param([string[]]$Lines)

  foreach ($line in @($Lines)) {
    if ([string]::IsNullOrWhiteSpace($line)) {
      continue
    }
    $fields = Read-StrictCsvFields $line
    $parsedPid = 0
    if (-not [int]::TryParse($fields[1], [ref]$parsedPid) -or $parsedPid -le 0) {
      throw "Invalid tasklist /apps PID in row: $line"
    }
    $package = [string]$fields[3]
    if ([string]::IsNullOrWhiteSpace($package)) {
      throw "Missing tasklist /apps package identity in row: $line"
    }
    $image = [string]$fields[0]
    if ($image -notmatch '^(?<name>[^\s(]+)') {
      throw "Invalid tasklist /apps image name in row: $line"
    }
    $processName = $matches.name -replace '\.exe$', ''
    $memoryDigits = ([string]$fields[2]) -replace '[^0-9]', ''
    $memoryKb = if ($memoryDigits) { [double]$memoryDigits } else { 0 }
    [PSCustomObject]@{
      pid = $parsedPid
      process_name = $processName
      app = $package
      memory_mb = [math]::Round($memoryKb / 1024, 1)
      started_at = $null
      raw = $line
    }
  }
}

function Get-AppAssociatedTaskListRows {
  param(
    [scriptblock]$TaskListAction,
    [scriptblock]$ProcessLookup
  )

  if (-not $TaskListAction) {
    $TaskListAction = {
      $lines = @(cmd /c "tasklist /apps /fo csv /nh" 2>&1)
      [PSCustomObject]@{ exit_code = $LASTEXITCODE; lines = $lines }
    }
  }
  if (-not $ProcessLookup) {
    $ProcessLookup = {
      param([int]$ProcessId)
      Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    }
  }

  $commandResult = & $TaskListAction
  if ($null -eq $commandResult -or [int]$commandResult.exit_code -ne 0) {
    $code = if ($null -ne $commandResult) { [int]$commandResult.exit_code } else { -1 }
    throw "tasklist /apps failed with exit code $code."
  }
  $parsed = @(ConvertFrom-AppTaskListCsv -Lines @($commandResult.lines))
  $relevant = @($parsed | Where-Object {
    $_.process_name -in @('backgroundTaskHost', 'PhoneExperienceHost', 'YourPhoneAppProxy', 'YourPhone') -or
    $_.app -like 'Microsoft.YourPhone_*' -or
    $_.app -like 'DolbyLaboratories.DolbyAccess_*'
  })
  foreach ($row in $relevant) {
    $process = & $ProcessLookup ([int]$row.pid)
    $startedAt = if ($process) { ConvertTo-UwpProcessTimestamp $process.StartTime } else { $null }
    $processName = if ($process) { [string]$process.ProcessName } else { $row.process_name }
    [PSCustomObject]@{
      pid = $row.pid
      process_name = $processName
      app = $row.app
      memory_mb = if ($process) { [math]::Round($process.WorkingSet64 / 1MB, 1) } else { $row.memory_mb }
      started_at = $startedAt
      identity_complete = [bool](
        -not [string]::IsNullOrWhiteSpace($processName) -and
        -not [string]::IsNullOrWhiteSpace($startedAt)
      )
      raw = $row.raw
    }
  }
}

function Get-UwpBackgroundTaskGroups {
  param([object[]]$Rows)

  $Rows |
    Group-Object app |
    ForEach-Object {
      $totalMb = ($_.Group | Measure-Object memory_mb -Sum).Sum
      $category = 'uwp-backgroundtask'
      $recommendation = 'review'
      $reason = 'UWP/app-associated background process group.'

      if ($_.Name -like 'Microsoft.YourPhone_*') {
        $category = 'phone-link-background'
        if ($_.Count -ge 10) {
          $recommendation = 'candidate-cleanup'
          $reason = 'Phone Link background-task pileup. Terminate only after confirming background phone sync is not needed.'
        }
        else {
          $recommendation = 'keep-or-review'
          $reason = 'Phone Link process count is small.'
        }
      }
      elseif ($_.Name -like 'DolbyLaboratories.DolbyAccess_*') {
        $category = 'dolby-backgroundtask'
        if ($_.Count -ge 10) {
          $recommendation = 'candidate-cleanup-no-disable'
          $reason = 'Dolby Access backgroundTaskHost pileup. Terminate leaked hosts only; do not disable Dolby.'
        }
        else {
          $recommendation = 'keep'
          $reason = 'Dolby Access process count is small.'
        }
      }

      [PSCustomObject]@{
        app = $_.Name
        category = $category
        count = $_.Count
        total_memory_mb = [math]::Round($totalMb, 1)
        oldest = ($_.Group | Where-Object { $_.started_at } | Sort-Object started_at | Select-Object -First 1).started_at
        newest = ($_.Group | Where-Object { $_.started_at } | Sort-Object started_at -Descending | Select-Object -First 1).started_at
        recommendation = $recommendation
        reason = $reason
        pids = @($_.Group.pid)
      }
    } |
    Sort-Object count -Descending
}

function Test-UwpTargetIdentity {
  param(
    $Target,
    $Actual
  )

  $expectedStartedAt = ConvertTo-UwpProcessTimestamp $Target.started_at
  if (
    [string]::IsNullOrWhiteSpace([string]$Target.process_name) -or
    [string]::IsNullOrWhiteSpace($expectedStartedAt)
  ) {
    return 'identity-missing'
  }
  if (-not $Actual) {
    return 'not-found'
  }
  if ([string]$Actual.ProcessName -ine [string]$Target.process_name) {
    return 'identity-changed'
  }
  $actualStartedAt = ConvertTo-UwpProcessTimestamp $Actual.StartTime
  if ([string]::IsNullOrWhiteSpace($actualStartedAt)) {
    return 'identity-missing'
  }
  if ($expectedStartedAt -ne $actualStartedAt) {
    return 'identity-changed'
  }
  return 'ok'
}

function Stop-Pids {
  param(
    [int[]]$TargetPids,
    [object[]]$Targets,
    [scriptblock]$KillAction,
    [scriptblock]$IdentityAction,
    [switch]$Preview
  )

  $legacyShimMode = [bool]($KillAction -and (-not $Targets -or $Targets.Count -eq 0))
  if (-not $Targets -or $Targets.Count -eq 0) {
    $Targets = @($TargetPids | Where-Object { $_ } | Sort-Object -Unique | ForEach-Object {
      [PSCustomObject]@{ pid = [int]$_; process_name = $null; started_at = $null }
    })
  }
  else {
    $Targets = @($Targets | Sort-Object pid -Unique)
  }
  if (-not $KillAction) {
    $KillAction = {
      param([int]$ProcessId)
      Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    }
  }
  if (-not $IdentityAction) {
    $IdentityAction = {
      param([int]$ProcessId)
      Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    }
  }

  $details = @(
    foreach ($target in $Targets) {
      $targetPid = [int]$target.pid
      if ($Preview) {
        [PSCustomObject]@{ pid = $targetPid; outcome = 'preview'; precondition = 'not-run' }
        continue
      }
      if ($legacyShimMode) {
        [PSCustomObject]@{ pid = $targetPid; outcome = (& $KillAction $targetPid); precondition = 'legacy-shim' }
        continue
      }

      $before = & $IdentityAction $targetPid
      $precondition = Test-UwpTargetIdentity -Target $target -Actual $before
      if ($precondition -ne 'ok') {
        [PSCustomObject]@{ pid = $targetPid; outcome = $precondition; precondition = $precondition }
        continue
      }
      try {
        & $KillAction $targetPid | Out-Null
      }
      catch {
        [PSCustomObject]@{ pid = $targetPid; outcome = 'failed'; precondition = 'ok'; error = $_.Exception.Message }
        continue
      }
      Start-Sleep -Milliseconds 100
      $after = & $IdentityAction $targetPid
      $afterIdentity = Test-UwpTargetIdentity -Target $target -Actual $after
      $outcome = switch ($afterIdentity) {
        'not-found' { 'terminated' }
        'identity-changed' { 'identity-changed' }
        default { 'failed' }
      }
      [PSCustomObject]@{ pid = $targetPid; outcome = $outcome; precondition = 'ok' }
    }
  )

  $result = if ($Preview) {
    'preview'
  }
  elseif ($Targets.Count -eq 0) {
    'no-targets'
  }
  else {
    $failedCount = @($details | Where-Object { $_.outcome -in @('failed', 'identity-changed', 'identity-missing') }).Count
    $successCount = @($details | Where-Object { $_.outcome -in @('terminated', 'not-found') }).Count
    if ($failedCount -eq 0) { 'terminated' }
    elseif ($successCount -eq 0) { 'failed' }
    else { 'partial' }
  }

  return [PSCustomObject]@{
    count = $Targets.Count
    pids = @($Targets.pid)
    result = $result
    details = $details
  }
}

function Get-UwpCleanupSelection {
  param(
    [object[]]$Rows,
    [string]$Profile
  )

  $expectedPhoneLinkProcesses = @('backgroundTaskHost', 'PhoneExperienceHost', 'YourPhoneAppProxy', 'YourPhone')
  $intended = if ($Profile -eq 'phone-link-background') {
    @($Rows | Where-Object {
      $_.app -like 'Microsoft.YourPhone_*' -and
      $_.process_name -in $expectedPhoneLinkProcesses
    })
  }
  else {
    @($Rows | Where-Object {
      $_.app -like 'DolbyLaboratories.DolbyAccess_*' -and
      $_.process_name -ieq 'backgroundTaskHost'
    })
  }

  $blockedTargets = @(
    $intended | Where-Object { -not $_.identity_complete } | ForEach-Object {
      [PSCustomObject]@{
        pid = $_.pid
        process_name = $_.process_name
        app = $_.app
        reason = 'identity-missing'
      }
    }
  )
  return [PSCustomObject]@{
    targets = @($intended | Where-Object { $_.identity_complete })
    blocked_targets = $blockedTargets
  }
}

function New-UwpCleanupPlanId {
  param(
    [string]$Profile,
    [object[]]$Targets
  )

  $targetMaterial = @(
    $Targets | Sort-Object pid | ForEach-Object {
      @($_.pid, $_.process_name, $_.app, $_.started_at) -join '|'
    }
  )
  $material = @($Profile, ($targetMaterial -join "`n")) -join "`n"
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($material)
  $hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
  return [Convert]::ToHexString($hash).ToLowerInvariant()
}

function Get-UwpParameterWarnings {
  param(
    [string]$Mode,
    [bool]$WhatIf,
    [System.Collections.IDictionary]$BoundParameters
  )

  $warnings = @()
  if ($Mode -eq 'audit' -and $BoundParameters.Contains('Profile')) {
    $warnings += 'Profile does not select targets in audit mode.'
  }
  if ($Mode -eq 'audit' -and $WhatIf) {
    $warnings += 'WhatIf has no effect in audit mode because audit is already read-only.'
  }
  return $warnings
}

if ($DisablePhoneLinkBackground) {
  throw 'DisablePhoneLinkBackground is no longer supported. Use Windows Settings > System > Power & battery > Battery usage > Manage background activity, then choose Never for supported apps.'
}
if ($Mode -eq 'cleanup' -and $Profile -eq 'none') {
  throw 'Profile is required when Mode is cleanup. Use phone-link-background or dolby-backgroundtask.'
}

$parameterWarnings = @(Get-UwpParameterWarnings -Mode $Mode -WhatIf ([bool]$WhatIf) -BoundParameters $PSBoundParameters)

$capturedAt = (Get-Date).ToUniversalTime().ToString('o')
$auditStatus = 'ok'
$auditError = $null
$rows = @()
try {
  $rows = @(Get-AppAssociatedTaskListRows)
}
catch {
  $auditStatus = 'failed'
  $auditError = $_.Exception.Message
}
$groups = if ($auditStatus -eq 'ok') { @(Get-UwpBackgroundTaskGroups -Rows $rows) } else { @() }
$phoneLinkGroup = @($groups | Where-Object { $_.category -eq 'phone-link-background' })
$dolbyGroup = @($groups | Where-Object { $_.category -eq 'dolby-backgroundtask' })
$phoneLinkCount = @($phoneLinkGroup | ForEach-Object { $_.pids }).Count
$dolbyBackgroundTaskCount = @($dolbyGroup | ForEach-Object { $_.pids }).Count

$result = [PSCustomObject]@{
  mode = $Mode
  profile = $Profile
  captured_at = $capturedAt
  audit_status = $auditStatus
  audit_error = $auditError
  what_if = [bool]$WhatIf
  parameter_warnings = $parameterWarnings
  registry_changed = $false
  registry_status = 'unsupported-use-windows-settings'
  summary = [PSCustomObject]@{
    total_app_associated_count = $rows.Count
    background_task_host_count = @($rows | Where-Object { $_.process_name -ieq 'backgroundTaskHost' }).Count
    phone_link_count = $phoneLinkCount
    dolby_backgroundtask_count = $dolbyBackgroundTaskCount
  }
  groups = $groups
}

if ($Mode -eq 'cleanup') {
  if ($auditStatus -ne 'ok') {
    throw "UWP audit failed; cleanup was blocked. $auditError"
  }
  $selection = Get-UwpCleanupSelection -Rows $rows -Profile $Profile
  $cleanupTargets = @($selection.targets)
  $blockedTargets = @($selection.blocked_targets)
  $cleanup = Stop-Pids -Targets $cleanupTargets -Preview:$WhatIf
  $cleanup | Add-Member -NotePropertyName registry_changed -NotePropertyValue $false
  $cleanup | Add-Member -NotePropertyName plan_id -NotePropertyValue (New-UwpCleanupPlanId -Profile $Profile -Targets $cleanupTargets)
  $cleanup | Add-Member -NotePropertyName cleanup_target_count -NotePropertyValue $cleanupTargets.Count
  $cleanup | Add-Member -NotePropertyName blocked_target_count -NotePropertyValue $blockedTargets.Count
  $cleanup | Add-Member -NotePropertyName blocked_targets -NotePropertyValue $blockedTargets
  $result | Add-Member -NotePropertyName cleanup -NotePropertyValue $cleanup
}

if ($AsJson) {
  $result | ConvertTo-Json -Depth 8
  if ($auditStatus -ne 'ok') { exit 1 }
  exit 0
}

foreach ($warning in $parameterWarnings) {
  Write-Warning $warning
}
$result.summary
if ($auditStatus -ne 'ok') {
  Write-Error $auditError
}
''
'UWP/app-associated background groups:'
$result.groups | Select-Object app, category, count, total_memory_mb, recommendation, reason | Format-Table -AutoSize

if ($Mode -eq 'cleanup') {
  ''
  'Cleanup:'
  $result.cleanup | Format-List
}
