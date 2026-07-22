#requires -Version 7.0
[CmdletBinding()]
param(
  [ValidateSet('audit', 'cleanup')]
  [string]$Mode = 'audit',

  [ValidateSet('safe', 'playwright-mcp', 'codex-playwright-safe', 'safe-plus-codex-playwright', 'workspace-dev-server')]
  [string]$Profile = 'safe',

  [string]$WorkspacePath,

  [ValidateRange(1, 525600)]
  [int]$StaleMinutes = 30,

  [string]$ExportJson,

  [string]$ExportMarkdown,

  [switch]$WhatIf,

  [switch]$AsJson
)

$ErrorActionPreference = 'Stop'

function Get-TextHash {
  param([AllowEmptyString()][string]$Text)

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  $hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
  return [Convert]::ToHexString($hash).ToLowerInvariant()
}

function ConvertTo-ProcessTimestamp {
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

function Get-ProcessFingerprint {
  param($Process)

  $createdAt = ConvertTo-ProcessTimestamp $Process.CreationDate
  $material = @(
    [int]$Process.ProcessId
    [string]$Process.Name
    [string]$createdAt
    [string]$Process.CommandLine
  ) -join "`n"
  return Get-TextHash $material
}

function New-ProcessMap {
  param([object[]]$Processes)

  $map = @{}
  foreach ($process in @($Processes)) {
    if ($null -ne $process -and [int]$process.ProcessId -gt 0) {
      $map[[int]$process.ProcessId] = $process
    }
  }
  return $map
}

function New-ChildProcessMap {
  param([object[]]$Processes)

  $map = @{}
  foreach ($process in @($Processes)) {
    $parentPid = [int]$process.ParentProcessId
    if (-not $map.ContainsKey($parentPid)) {
      $map[$parentPid] = [System.Collections.Generic.List[object]]::new()
    }
    $map[$parentPid].Add($process)
  }
  return $map
}

function Get-ProcessDescendants {
  param(
    [int]$RootProcessId,
    [hashtable]$ProcessMap,
    [hashtable]$ChildMap
  )

  if (-not $ProcessMap.ContainsKey($RootProcessId)) {
    return @()
  }

  $visited = @{}
  $queue = [System.Collections.Generic.Queue[int]]::new()
  $queue.Enqueue($RootProcessId)
  $result = [System.Collections.Generic.List[object]]::new()

  while ($queue.Count -gt 0) {
    $currentPid = $queue.Dequeue()
    if ($visited.ContainsKey($currentPid)) {
      continue
    }
    $visited[$currentPid] = $true
    if ($ProcessMap.ContainsKey($currentPid)) {
      $result.Add($ProcessMap[$currentPid])
    }
    if ($ChildMap.ContainsKey($currentPid)) {
      foreach ($child in $ChildMap[$currentPid]) {
        $queue.Enqueue([int]$child.ProcessId)
      }
    }
  }

  return @($result | Sort-Object ProcessId)
}

function Get-ChainRootPid {
  param(
    $Process,
    [hashtable]$ProcessMap,
    [string[]]$CandidateNames = @('node.exe', 'npm.exe', 'npx.exe', 'cmd.exe', 'pwsh.exe')
  )

  $visited = @{}
  $current = $Process
  while ($true) {
    $currentPid = [int]$current.ProcessId
    if ($visited.ContainsKey($currentPid)) {
      return $currentPid
    }
    $visited[$currentPid] = $true
    $parentPid = [int]$current.ParentProcessId
    if (-not $ProcessMap.ContainsKey($parentPid)) {
      return $currentPid
    }
    $parent = $ProcessMap[$parentPid]
    if ([string]$parent.Name -notin $CandidateNames) {
      return $currentPid
    }
    $current = $parent
  }
}

function Get-ImmediateNonWrapperParent {
  param(
    $Process,
    [hashtable]$ProcessMap,
    [string[]]$CandidateNames = @('node.exe', 'npm.exe', 'npx.exe', 'cmd.exe', 'pwsh.exe')
  )

  $visited = @{}
  $current = $Process
  while ($true) {
    $currentPid = [int]$current.ProcessId
    if ($visited.ContainsKey($currentPid)) {
      return $null
    }
    $visited[$currentPid] = $true
    $parentPid = [int]$current.ParentProcessId
    if (-not $ProcessMap.ContainsKey($parentPid)) {
      return $null
    }
    $parent = $ProcessMap[$parentPid]
    if ([string]$parent.Name -notin $CandidateNames) {
      return $parent
    }
    $current = $parent
  }
}

function Get-CategoryFromLines {
  param([string[]]$Lines)

  $joined = ($Lines -join "`n")
  if ($joined -match 'npm(\.exe)?\s+outdated|npm outdated|npm-cli\.js\s+outdated') {
    return 'npm-outdated'
  }
  if ($joined -match '@playwright/mcp|playwright-mcp') {
    return 'playwright-mcp'
  }
  if ($joined -match 'npm(\.exe)?\s+run\s+dev|[\\/](vite)(\.cmd|\.js)?|node_modules[\\/]\.bin[\\/]vite') {
    return 'dev-server'
  }
  if ($joined -match 'tailwindcss-language-server|js-language-service\.js|typingsInstaller\.js|vue-language-tools|typescript-plugin|tsserver\.js') {
    return 'ide-language-service'
  }
  return 'generic'
}

function Get-ProcessRoles {
  param(
    $Process,
    [string[]]$CandidateNames = @('node.exe', 'npm.exe', 'npx.exe', 'cmd.exe', 'pwsh.exe')
  )

  $line = [string]$Process.CommandLine
  $roles = [System.Collections.Generic.List[string]]::new()
  if ($line -match 'npm(\.exe)?\s+outdated|npm outdated|npm-cli\.js\s+outdated') {
    $roles.Add('npm-outdated')
  }
  if ($line -match '@playwright/mcp|playwright-mcp') {
    $roles.Add('playwright-mcp')
  }
  if ($line -match 'npm(\.exe)?\s+run\s+dev|[\\/](vite)(\.cmd|\.js)?|node_modules[\\/]\.bin[\\/]vite') {
    $roles.Add('dev-server')
  }
  if ($line -match 'tailwindcss-language-server|js-language-service\.js|typingsInstaller\.js|vue-language-tools|typescript-plugin|tsserver\.js') {
    $roles.Add('ide-language-service')
  }
  if ($roles.Count -eq 0) {
    if ([string]$Process.Name -in $CandidateNames) {
      $roles.Add('wrapper')
    }
    else {
      $roles.Add('unknown')
    }
  }
  return @($roles | Sort-Object -Unique)
}

function Get-PrimaryCategoryFromRoles {
  param([string[]]$Roles)

  foreach ($category in @('npm-outdated', 'playwright-mcp', 'dev-server', 'ide-language-service')) {
    if ($Roles -contains $category) {
      return $category
    }
  }
  return 'generic'
}

function ConvertTo-NormalizedWindowsPath {
  param([string]$Path)

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return $null
  }
  $trimmed = $Path.Trim().Trim('"').Replace('/', '\')
  $full = [System.IO.Path]::GetFullPath($trimmed)
  $root = [System.IO.Path]::GetPathRoot($full)
  if ($full.Length -gt $root.Length) {
    $full = $full.TrimEnd('\')
  }
  return $full.ToLowerInvariant()
}

function Test-CommandLineWorkspaceMatch {
  param(
    [string]$CommandLine,
    [string]$WorkspacePath
  )

  if ([string]::IsNullOrWhiteSpace($CommandLine) -or [string]::IsNullOrWhiteSpace($WorkspacePath)) {
    return $false
  }
  $normalizedPath = ConvertTo-NormalizedWindowsPath $WorkspacePath
  $normalizedCommand = $CommandLine.Replace('/', '\')
  $prefix = '(?i)(?<![A-Za-z0-9_.-])'
  $suffix = '(?=$|[\\\s"''=,;])'
  return [regex]::IsMatch($normalizedCommand, $prefix + [regex]::Escape($normalizedPath) + $suffix)
}

function Test-IsStaleCodexPlaywright {
  param(
    [string]$Category,
    [bool]$CodexParent,
    [double]$AgeMinutes,
    [int]$StaleMinutes
  )

  return [bool](
    $Category -eq 'playwright-mcp' -and
    $CodexParent -and
    $StaleMinutes -gt 0 -and
    $AgeMinutes -ge $StaleMinutes
  )
}

function Get-Recommendation {
  param(
    [string]$Category,
    [bool]$ParentExists,
    [bool]$WorkspaceMatch,
    [bool]$CodexParent,
    [timespan]$Age,
    [int]$StaleMinutes
  )

  switch ($Category) {
    'npm-outdated' {
      if (-not $ParentExists) {
        return @{ safe_to_kill = $true; recommendation = 'safe-cleanup'; reason = 'orphan npm outdated tree' }
      }
      return @{ safe_to_kill = $false; recommendation = 'review'; reason = 'npm outdated tree still has a live parent' }
    }
    'playwright-mcp' {
      if (Test-IsStaleCodexPlaywright -Category $Category -CodexParent $CodexParent -AgeMinutes $Age.TotalMinutes -StaleMinutes $StaleMinutes) {
        return @{ safe_to_kill = $false; recommendation = 'stale-codex-playwright'; reason = 'stale Codex-owned browser automation worker; matches the codex-playwright-safe profile' }
      }
      return @{ safe_to_kill = $false; recommendation = 'candidate-cleanup'; reason = 'browser automation worker; kill only when explicitly requested' }
    }
    'dev-server' {
      if ($WorkspaceMatch) {
        return @{ safe_to_kill = $false; recommendation = 'workspace-target'; reason = 'workspace dev server' }
      }
      return @{ safe_to_kill = $false; recommendation = 'keep'; reason = 'active dev server' }
    }
    'ide-language-service' {
      return @{ safe_to_kill = $false; recommendation = 'keep'; reason = 'editor language service' }
    }
    default {
      return @{ safe_to_kill = $false; recommendation = 'manual-review'; reason = 'unclassified process tree' }
    }
  }
}

function New-ProcessAuditTrees {
  param(
    [object[]]$Processes,
    [string]$WorkspacePath,
    [ValidateRange(1, 525600)][int]$StaleMinutes = 30,
    [datetime]$Now = (Get-Date)
  )

  $candidateNames = @('node.exe', 'npm.exe', 'npx.exe', 'cmd.exe', 'pwsh.exe')
  $processMap = New-ProcessMap $Processes
  $childMap = New-ChildProcessMap $Processes
  $candidateProcesses = @($Processes | Where-Object { [string]$_.Name -in $candidateNames })
  $grouped = $candidateProcesses | Group-Object { Get-ChainRootPid -Process $_ -ProcessMap $processMap -CandidateNames $candidateNames }

  foreach ($group in $grouped) {
    $rootPid = [int]$group.Name
    $root = $processMap[$rootPid]
    if (-not $root) {
      continue
    }
    $affected = @(Get-ProcessDescendants -RootProcessId $rootPid -ProcessMap $processMap -ChildMap $childMap)
    $members = @(
      foreach ($member in $affected) {
        $roles = @(Get-ProcessRoles -Process $member -CandidateNames $candidateNames)
        $category = Get-PrimaryCategoryFromRoles $roles
        $createdAt = ConvertTo-ProcessTimestamp $member.CreationDate
        $identityComplete = (
          -not [string]::IsNullOrWhiteSpace($createdAt) -and
          -not [string]::IsNullOrWhiteSpace([string]$member.Name) -and
          -not [string]::IsNullOrWhiteSpace([string]$member.CommandLine)
        )
        $protection = if ($roles | Where-Object { $_ -in @('dev-server', 'ide-language-service') }) {
          'protected'
        }
        elseif ($roles -contains 'unknown') {
          'unknown'
        }
        elseif (-not $identityComplete) {
          'identity-missing'
        }
        else {
          'allowed'
        }
        [PSCustomObject]@{
          pid = [int]$member.ProcessId
          parent_pid = [int]$member.ParentProcessId
          name = [string]$member.Name
          command_line = [string]$member.CommandLine
          created_at = $createdAt
          fingerprint = Get-ProcessFingerprint $member
          roles = $roles
          category = $category
          protection = $protection
          identity_complete = $identityComplete
          is_candidate = [bool]([string]$member.Name -in $candidateNames)
        }
      }
    )
    $allRoles = @($members | ForEach-Object { $_.roles } | Sort-Object -Unique)
    $category = Get-PrimaryCategoryFromRoles $allRoles
    $mixedTree = [bool](
      ($allRoles | Where-Object { $_ -in @('npm-outdated', 'playwright-mcp') }) -and
      ($allRoles | Where-Object { $_ -in @('dev-server', 'ide-language-service') })
    )
    $blockedMembers = @($members | Where-Object { $_.protection -ne 'allowed' })
    $blockedReasons = @(
      foreach ($member in $blockedMembers) {
        [PSCustomObject]@{ pid = $member.pid; name = $member.name; reason = $member.protection; roles = $member.roles }
      }
    )
    if ($mixedTree -and -not ($blockedReasons | Where-Object { $_.reason -eq 'mixed-tree' })) {
      $blockedReasons += [PSCustomObject]@{ pid = $rootPid; name = [string]$root.Name; reason = 'mixed-tree'; roles = $allRoles }
    }
    $parentPid = [int]$root.ParentProcessId
    $parentExists = $processMap.ContainsKey($parentPid)
    $nonWrapperParent = Get-ImmediateNonWrapperParent -Process $root -ProcessMap $processMap -CandidateNames $candidateNames
    $codexParent = [bool]($nonWrapperParent -and [string]$nonWrapperParent.Name -ieq 'codex.exe')
    $rootCreatedAt = ConvertTo-ProcessTimestamp $root.CreationDate
    $age = if ($rootCreatedAt) {
      try { $Now.ToUniversalTime() - ([datetime]$rootCreatedAt).ToUniversalTime() } catch { [timespan]::Zero }
    }
    else {
      [timespan]::Zero
    }
    $workspaceMatch = [bool](
      $WorkspacePath -and
      ($members | Where-Object { Test-CommandLineWorkspaceMatch -CommandLine $_.command_line -WorkspacePath $WorkspacePath })
    )
    $decision = Get-Recommendation -Category $category -ParentExists $parentExists -WorkspaceMatch $workspaceMatch -CodexParent $codexParent -Age $age -StaleMinutes $StaleMinutes
    $blocked = [bool]($mixedTree -or $blockedMembers.Count -gt 0)
    if ($blocked) {
      $decision = @{ safe_to_kill = $false; recommendation = 'manual-review'; reason = 'affected tree contains protected, unknown, or incomplete-identity members' }
    }

    [PSCustomObject]@{
      root_pid = $rootPid
      root_name = [string]$root.Name
      root_fingerprint = Get-ProcessFingerprint $root
      category = $category
      member_categories = @($members.category | Sort-Object -Unique)
      member_roles = $allRoles
      mixed_tree = $mixedTree
      blocked = $blocked
      blocked_reasons = $blockedReasons
      parent_process_id = $parentPid
      parent_exists = $parentExists
      process_count = $members.Count
      started_at = $rootCreatedAt
      age_minutes = [math]::Round($age.TotalMinutes, 1)
      workspace_match = $workspaceMatch
      codex_parent = $codexParent
      non_wrapper_parent_pid = if ($nonWrapperParent) { [int]$nonWrapperParent.ProcessId } else { $null }
      non_wrapper_parent_name = if ($nonWrapperParent) { [string]$nonWrapperParent.Name } else { $null }
      safe_to_kill = [bool]$decision.safe_to_kill
      kill_recommendation = [string]$decision.recommendation
      reason = [string]$decision.reason
      root_command = [string]$root.CommandLine
      process_ids = @($members.pid)
      members = $members
    }
  }
}

function Test-TreeProfileIntent {
  param(
    $Tree,
    [string]$Profile,
    [ValidateRange(1, 525600)][int]$StaleMinutes
  )

  switch ($Profile) {
    'safe' { return [bool]($Tree.category -eq 'npm-outdated' -and -not $Tree.parent_exists) }
    'playwright-mcp' { return [bool]($Tree.category -eq 'playwright-mcp') }
    'codex-playwright-safe' {
      return Test-IsStaleCodexPlaywright -Category $Tree.category -CodexParent $Tree.codex_parent -AgeMinutes $Tree.age_minutes -StaleMinutes $StaleMinutes
    }
    'safe-plus-codex-playwright' {
      return [bool](
        ($Tree.category -eq 'npm-outdated' -and -not $Tree.parent_exists) -or
        (Test-IsStaleCodexPlaywright -Category $Tree.category -CodexParent $Tree.codex_parent -AgeMinutes $Tree.age_minutes -StaleMinutes $StaleMinutes)
      )
    }
    'workspace-dev-server' { return [bool]($Tree.category -eq 'dev-server' -and $Tree.workspace_match) }
  }
  return $false
}

function Get-CleanupSelection {
  param(
    [object[]]$Trees,
    [string]$Profile,
    [ValidateRange(1, 525600)][int]$StaleMinutes
  )

  $intended = @($Trees | Where-Object { Test-TreeProfileIntent -Tree $_ -Profile $Profile -StaleMinutes $StaleMinutes })
  return [PSCustomObject]@{
    targets = @($intended | Where-Object { -not $_.blocked })
    blocked_targets = @($intended | Where-Object { $_.blocked })
  }
}

function Test-TreePrecondition {
  param(
    $Tree,
    [object[]]$Processes,
    [ValidateRange(1, 525600)][int]$StaleMinutes = 30
  )

  $actualTree = @(New-ProcessAuditTrees -Processes $Processes -StaleMinutes $StaleMinutes | Where-Object { $_.root_pid -eq $Tree.root_pid } | Select-Object -First 1)
  if ($actualTree.Count -eq 0) {
    return [PSCustomObject]@{ status = 'not-found'; expected_plan = @($Tree.members.fingerprint); actual_plan = @() }
  }
  $actual = $actualTree[0]
  if ($actual.root_fingerprint -ne $Tree.root_fingerprint) {
    return [PSCustomObject]@{ status = 'identity-changed'; expected_plan = @($Tree.members.fingerprint); actual_plan = @($actual.members.fingerprint) }
  }
  $expectedFingerprints = @($Tree.members.fingerprint | Sort-Object)
  $actualFingerprints = @($actual.members.fingerprint | Sort-Object)
  if (($expectedFingerprints -join "`n") -ne ($actualFingerprints -join "`n")) {
    return [PSCustomObject]@{ status = 'descendant-set-changed'; expected_plan = $expectedFingerprints; actual_plan = $actualFingerprints }
  }
  if ($actual.blocked) {
    return [PSCustomObject]@{ status = 'protection-changed'; expected_plan = $expectedFingerprints; actual_plan = $actualFingerprints }
  }
  return [PSCustomObject]@{ status = 'ok'; expected_plan = $expectedFingerprints; actual_plan = $actualFingerprints }
}

function Get-MemberVerification {
  param(
    [object[]]$ExpectedMembers,
    [object[]]$Processes
  )

  $map = New-ProcessMap $Processes
  foreach ($member in $ExpectedMembers) {
    if (-not $map.ContainsKey([int]$member.pid)) {
      [PSCustomObject]@{ pid = $member.pid; name = $member.name; outcome = 'terminated' }
      continue
    }
    $actual = $map[[int]$member.pid]
    if ((Get-ProcessFingerprint $actual) -ne $member.fingerprint) {
      [PSCustomObject]@{ pid = $member.pid; name = $member.name; outcome = 'identity-changed' }
    }
    else {
      [PSCustomObject]@{ pid = $member.pid; name = $member.name; outcome = 'failed' }
    }
  }
}

function Invoke-TreeCleanup {
  param(
    $Tree,
    [scriptblock]$ProcessProvider,
    [scriptblock]$KillAction,
    [ValidateRange(1, 525600)][int]$StaleMinutes = 30,
    [switch]$Preview
  )

  if (-not $ProcessProvider) {
    $ProcessProvider = { @(Get-CimInstance Win32_Process) }
  }
  if (-not $KillAction) {
    $KillAction = {
      param([int]$RootPid)
      $output = cmd /c "taskkill /PID $RootPid /T /F" 2>&1
      [PSCustomObject]@{ exit_code = $LASTEXITCODE; output = ($output -join "`n") }
    }
  }
  if ($Preview) {
    return [PSCustomObject]@{
      root_pid = $Tree.root_pid
      category = $Tree.category
      result = 'preview'
      precondition = [PSCustomObject]@{ status = 'not-run' }
      taskkill_exit_code = $null
      output = 'WhatIf enabled; no processes were terminated.'
      details = @($Tree.members | ForEach-Object { [PSCustomObject]@{ pid = $_.pid; name = $_.name; outcome = 'preview' } })
    }
  }

  $before = @(& $ProcessProvider)
  $precondition = Test-TreePrecondition -Tree $Tree -Processes $before -StaleMinutes $StaleMinutes
  if ($precondition.status -eq 'not-found') {
    return [PSCustomObject]@{
      root_pid = $Tree.root_pid
      category = $Tree.category
      result = 'no-targets'
      precondition = $precondition
      taskkill_exit_code = $null
      output = 'Target tree exited before cleanup.'
      details = @($Tree.members | ForEach-Object { [PSCustomObject]@{ pid = $_.pid; name = $_.name; outcome = 'not-found' } })
    }
  }
  if ($precondition.status -ne 'ok') {
    return [PSCustomObject]@{
      root_pid = $Tree.root_pid
      category = $Tree.category
      result = 'precondition-failed'
      precondition = $precondition
      taskkill_exit_code = $null
      output = 'Process identity or descendant set changed after audit; cleanup was blocked.'
      details = @()
    }
  }

  $killResult = & $KillAction ([int]$Tree.root_pid)
  Start-Sleep -Milliseconds 100
  $after = @(& $ProcessProvider)
  $details = @(Get-MemberVerification -ExpectedMembers $Tree.members -Processes $after)
  $failed = @($details | Where-Object { $_.outcome -in @('failed', 'identity-changed') }).Count
  $terminated = @($details | Where-Object { $_.outcome -eq 'terminated' }).Count
  $aggregate = if ($failed -eq 0) {
    'terminated'
  }
  elseif ($terminated -eq 0) {
    'failed'
  }
  else {
    'partial'
  }
  return [PSCustomObject]@{
    root_pid = $Tree.root_pid
    category = $Tree.category
    result = $aggregate
    precondition = $precondition
    taskkill_exit_code = if ($null -ne $killResult.exit_code) { [int]$killResult.exit_code } else { $null }
    output = [string]$killResult.output
    details = $details
  }
}

function Invoke-Cleanup {
  param(
    [object[]]$TreesToKill,
    [ValidateRange(1, 525600)][int]$StaleMinutes,
    [switch]$Preview
  )

  foreach ($tree in @($TreesToKill)) {
    Invoke-TreeCleanup -Tree $tree -StaleMinutes $StaleMinutes -Preview:$Preview
  }
}

function Get-CleanupAggregateResult {
  param(
    [object[]]$CleanupResults,
    [int]$TargetCount,
    [switch]$Preview
  )

  if ($TargetCount -eq 0) {
    return 'no-targets'
  }
  if ($Preview) {
    return 'preview'
  }
  $states = @($CleanupResults.result)
  if (@($states | Where-Object { $_ -eq 'partial' }).Count -gt 0) {
    return 'partial'
  }
  $uniqueStates = @($states | Sort-Object -Unique)
  if ($uniqueStates.Count -eq 1) {
    return [string]$uniqueStates[0]
  }
  return 'partial'
}

function Get-DevParameterWarnings {
  param(
    [string]$Mode,
    [string]$Profile,
    [string]$WorkspacePath,
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
  if ($Mode -eq 'cleanup' -and $Profile -ne 'workspace-dev-server' -and $BoundParameters.Contains('WorkspacePath')) {
    $warnings += "WorkspacePath is reported but does not narrow the '$Profile' cleanup profile."
  }
  return $warnings
}

function New-CleanupPlanId {
  param(
    [string]$Profile,
    [string]$WorkspacePath,
    [int]$StaleMinutes,
    [object[]]$Trees
  )

  $fingerprints = @($Trees | ForEach-Object { $_.members.fingerprint } | Sort-Object)
  return Get-TextHash (@($Profile, $WorkspacePath, $StaleMinutes, ($fingerprints -join ',')) -join "`n")
}

function ConvertTo-MarkdownTable {
  param([object[]]$Rows)

  $header = '| root_pid | category | blocked | recommendation | process_count | age_minutes | reason |'
  $divider = '| --- | --- | --- | --- | --- | --- | --- |'
  $body = foreach ($row in @($Rows)) {
    $reason = ([string]$row.reason).Replace('|', '\|')
    "| $($row.root_pid) | $($row.category) | $($row.blocked) | $($row.kill_recommendation) | $($row.process_count) | $($row.age_minutes) | $reason |"
  }
  return @($header, $divider) + $body
}

$parameterWarnings = @(Get-DevParameterWarnings -Mode $Mode -Profile $Profile -WorkspacePath $WorkspacePath -WhatIf ([bool]$WhatIf) -BoundParameters $PSBoundParameters)

$normalizedWorkspacePath = if ($WorkspacePath) { ConvertTo-NormalizedWindowsPath $WorkspacePath } else { $null }
$workspacePathStatus = if (-not $WorkspacePath) {
  'not-provided'
}
elseif (Test-Path -LiteralPath $WorkspacePath -PathType Container) {
  'resolved'
}
else {
  'not-found'
}
if ($Mode -eq 'cleanup' -and $Profile -eq 'workspace-dev-server' -and $workspacePathStatus -ne 'resolved') {
  throw 'WorkspacePath must resolve to an existing directory when Profile is workspace-dev-server.'
}

$capturedAt = (Get-Date).ToUniversalTime().ToString('o')
$processes = @(Get-CimInstance Win32_Process)
$trees = @(New-ProcessAuditTrees -Processes $processes -WorkspacePath $normalizedWorkspacePath -StaleMinutes $StaleMinutes)
$selection = if ($Mode -eq 'cleanup') {
  Get-CleanupSelection -Trees $trees -Profile $Profile -StaleMinutes $StaleMinutes
}
else {
  [PSCustomObject]@{ targets = @(); blocked_targets = @() }
}

$result = [PSCustomObject]@{
  mode = $Mode
  profile = $Profile
  captured_at = $capturedAt
  workspace_path = $normalizedWorkspacePath
  workspace_path_status = $workspacePathStatus
  stale_minutes = $StaleMinutes
  what_if = [bool]$WhatIf
  parameter_warnings = $parameterWarnings
  summary = [PSCustomObject]@{
    tree_count = $trees.Count
    blocked_tree_count = @($trees | Where-Object { $_.blocked }).Count
    safe_cleanup_count = @($trees | Where-Object { $_.safe_to_kill }).Count
    playwright_mcp_count = @($trees | Where-Object { $_.category -eq 'playwright-mcp' }).Count
    codex_playwright_stale_count = @($trees | Where-Object { Test-TreeProfileIntent -Tree $_ -Profile 'codex-playwright-safe' -StaleMinutes $StaleMinutes }).Count
    dev_server_count = @($trees | Where-Object { $_.category -eq 'dev-server' }).Count
    ide_language_service_count = @($trees | Where-Object { $_.category -eq 'ide-language-service' }).Count
    npm_outdated_count = @($trees | Where-Object { $_.category -eq 'npm-outdated' }).Count
  }
  trees = $trees
}

if ($Mode -eq 'cleanup') {
  $targets = @($selection.targets)
  $blockedTargets = @($selection.blocked_targets)
  $planId = New-CleanupPlanId -Profile $Profile -WorkspacePath $normalizedWorkspacePath -StaleMinutes $StaleMinutes -Trees $targets
  $cleanupResults = @(Invoke-Cleanup -TreesToKill $targets -StaleMinutes $StaleMinutes -Preview:$WhatIf)
  $result | Add-Member -NotePropertyName plan_id -NotePropertyValue $planId
  $result | Add-Member -NotePropertyName cleanup_targets -NotePropertyValue $targets
  $result | Add-Member -NotePropertyName blocked_targets -NotePropertyValue $blockedTargets
  $result | Add-Member -NotePropertyName cleanup_results -NotePropertyValue $cleanupResults
  $result | Add-Member -NotePropertyName cleanup_summary -NotePropertyValue ([PSCustomObject]@{
    result = Get-CleanupAggregateResult -CleanupResults $cleanupResults -TargetCount $targets.Count -Preview:$WhatIf
    target_count = $targets.Count
    blocked_target_count = $blockedTargets.Count
    terminated_tree_count = @($cleanupResults | Where-Object { $_.result -eq 'terminated' }).Count
    failed_tree_count = @($cleanupResults | Where-Object { $_.result -in @('failed', 'precondition-failed') }).Count
    partial_tree_count = @($cleanupResults | Where-Object { $_.result -eq 'partial' }).Count
  })
  $result.summary | Add-Member -NotePropertyName cleanup_target_count -NotePropertyValue $targets.Count
  $result.summary | Add-Member -NotePropertyName blocked_target_count -NotePropertyValue $blockedTargets.Count
}

if ($ExportJson) {
  $jsonDir = Split-Path -Parent $ExportJson
  if ($jsonDir) { New-Item -ItemType Directory -Force -Path $jsonDir | Out-Null }
  $result | ConvertTo-Json -Depth 10 | Set-Content -Path $ExportJson -Encoding UTF8
}

if ($ExportMarkdown) {
  $mdDir = Split-Path -Parent $ExportMarkdown
  if ($mdDir) { New-Item -ItemType Directory -Force -Path $mdDir | Out-Null }
  $markdown = @(
    '# Windows Dev Process Audit'
    ''
    "CapturedAt: $capturedAt"
    "Mode: $Mode"
    "Profile: $Profile"
    "StaleMinutes: $StaleMinutes"
    "WorkspacePath: $normalizedWorkspacePath"
    "WorkspacePathStatus: $workspacePathStatus"
    "WhatIf: $([bool]$WhatIf)"
    ''
    '## Summary'
    ''
    "- tree_count: $($result.summary.tree_count)"
    "- blocked_tree_count: $($result.summary.blocked_tree_count)"
    "- safe_cleanup_count: $($result.summary.safe_cleanup_count)"
    if ($Mode -eq 'cleanup') { "- cleanup_target_count: $($result.summary.cleanup_target_count)" }
    if ($Mode -eq 'cleanup') { "- blocked_target_count: $($result.summary.blocked_target_count)" }
    ''
    '## Trees'
    ''
  ) | Where-Object { $null -ne $_ }
  $markdown += ConvertTo-MarkdownTable -Rows ($result.trees | Sort-Object category, root_pid)
  if ($Mode -eq 'cleanup') {
    $markdown += @('', '## Cleanup Results', '')
    $markdown += foreach ($item in $result.cleanup_results) {
      "- root_pid=$($item.root_pid), category=$($item.category), result=$($item.result), precondition=$($item.precondition.status)"
    }
  }
  Set-Content -Path $ExportMarkdown -Value $markdown -Encoding UTF8
}

if ($AsJson) {
  $result | ConvertTo-Json -Depth 10
  exit 0
}

foreach ($warning in $parameterWarnings) {
  Write-Warning $warning
}
$result.summary
''
$result.trees |
  Sort-Object category, root_pid |
  Select-Object root_pid, category, blocked, kill_recommendation, process_count, workspace_match, codex_parent, age_minutes, reason |
  Format-Table -AutoSize

if ($Mode -eq 'cleanup') {
  ''
  "Cleanup result: $($result.cleanup_summary.result)"
  $result.cleanup_results | Select-Object root_pid, category, result, taskkill_exit_code | Format-Table -AutoSize
}
