[CmdletBinding()]
param(
  [ValidateSet('audit', 'cleanup')]
  [string]$Mode = 'audit',

  [ValidateSet('safe', 'playwright-mcp', 'codex-playwright-safe', 'safe-plus-codex-playwright', 'workspace-dev-server')]
  [string]$Profile = 'safe',

  [string]$WorkspacePath,

  [int]$StaleMinutes = 30,

  [string]$ExportJson,

  [string]$ExportMarkdown,

  [switch]$WhatIf,

  [switch]$AsJson
)

$ErrorActionPreference = 'Stop'

$processNames = @('node.exe', 'npm.exe', 'npx.exe', 'cmd.exe', 'pwsh.exe')
$processes = Get-CimInstance Win32_Process | Where-Object { $processNames -contains $_.Name }
$processMap = @{}

foreach ($process in $processes) {
  $processMap[$process.ProcessId] = $process
}

function Test-ParentExists {
  param([uint32]$ParentProcessId)

  if (-not $ParentProcessId) {
    return $false
  }

  return [bool]$processMap[$ParentProcessId] -or [bool](Get-Process -Id $ParentProcessId -ErrorAction SilentlyContinue)
}

function Get-ProcessStartTime {
  param([int]$ProcessId)

  try {
    return (Get-Process -Id $ProcessId -ErrorAction Stop).StartTime
  }
  catch {
    return $null
  }
}

function Get-ChainRootPid {
  param($Process)

  $current = $Process
  while ($true) {
    $parent = $processMap[$current.ParentProcessId]
    if (-not $parent) {
      return [int]$current.ProcessId
    }
    if ($parent.Name -notin $processNames) {
      return [int]$current.ProcessId
    }
    $current = $parent
  }
}

function Get-CategoryFromLines {
  param([string[]]$Lines)

  $joined = ($Lines -join "`n")

  if ($joined -match 'npm(\.exe)?\s+outdated|npm outdated') {
    return 'npm-outdated'
  }
  if ($joined -match '@playwright/mcp|playwright-mcp') {
    return 'playwright-mcp'
  }
  if ($joined -match 'npm(\.exe)?\s+run\s+dev|[\\/](vite)(\.cmd|\.js)?|node_modules[\\/]\.bin[\\/]vite') {
    return 'dev-server'
  }
  if ($joined -match 'tailwindcss-language-server|js-language-service\.js|typingsInstaller\.js|vue-language-tools|typescript-plugin') {
    return 'ide-language-service'
  }

  return 'generic'
}

function Get-ImmediateNonWrapperParent {
  param($Process)

  $current = $Process
  while ($true) {
    $parent = $processMap[$current.ParentProcessId]
    if (-not $parent -and $current.ParentProcessId) {
      $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($current.ParentProcessId)" -ErrorAction SilentlyContinue
    }
    if (-not $parent) {
      return $null
    }
    if ($parent.Name -notin $processNames) {
      return $parent
    }
    $current = $parent
  }
}

function Get-Recommendation {
  param(
    [string]$Category,
    [bool]$ParentExists,
    [bool]$WorkspaceMatch,
    [bool]$CodexParent,
    [timespan]$Age
  )

  switch ($Category) {
    'npm-outdated' {
      if (-not $ParentExists) {
        return @{
          safe_to_kill = $true
          recommendation = 'safe-cleanup'
          reason = 'orphan npm outdated tree'
        }
      }

      return @{
        safe_to_kill = $false
        recommendation = 'review'
        reason = 'npm outdated tree still has a live parent'
      }
    }
    'playwright-mcp' {
      return @{
        safe_to_kill = $false
        recommendation = 'candidate-cleanup'
        reason = 'browser automation worker; kill only when explicitly requested'
      }
    }
    'dev-server' {
      if ($WorkspaceMatch) {
        return @{
          safe_to_kill = $false
          recommendation = 'workspace-target'
          reason = 'workspace dev server'
        }
      }

      return @{
        safe_to_kill = $false
        recommendation = 'keep'
        reason = 'active dev server'
      }
    }
    'ide-language-service' {
      return @{
        safe_to_kill = $false
        recommendation = 'keep'
        reason = 'editor language service'
      }
    }
    default {
      return @{
        safe_to_kill = $false
        recommendation = 'manual-review'
        reason = 'unclassified or mixed process tree'
      }
    }
  }
}

function ConvertTo-MarkdownTable {
  param([object[]]$Rows)

  $header = '| root_pid | category | parent_exists | safe_to_kill | recommendation | process_count | codex_parent | age_minutes | reason |'
  $divider = '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'
  $body = foreach ($row in $Rows) {
    "| $($row.root_pid) | $($row.category) | $($row.parent_exists) | $($row.safe_to_kill) | $($row.kill_recommendation) | $($row.process_count) | $($row.codex_parent) | $($row.age_minutes) | $($row.reason) |"
  }

  return @($header, $divider) + $body
}

$grouped = $processes | Group-Object { Get-ChainRootPid $_ }
$trees = foreach ($group in $grouped) {
  $members = $group.Group | Sort-Object ProcessId
  $root = $members | Where-Object { $_.ProcessId -eq [int]$group.Name } | Select-Object -First 1
  if (-not $root) {
    $root = $members[0]
  }

  $commandLines = @($members | ForEach-Object { $_.CommandLine })
  $category = Get-CategoryFromLines -Lines $commandLines
  $parentExists = Test-ParentExists -ParentProcessId $root.ParentProcessId
  $nonWrapperParent = Get-ImmediateNonWrapperParent -Process $root
  $rootStartTime = Get-ProcessStartTime -ProcessId $root.ProcessId
  $age = if ($rootStartTime) { (Get-Date) - $rootStartTime } else { [timespan]::Zero }
  $workspaceMatch = $false
  if ($WorkspacePath) {
    $workspaceMatch = [bool]($commandLines | Where-Object { $_ -like "*$WorkspacePath*" })
  }
  $codexParent = [bool]($nonWrapperParent -and $nonWrapperParent.Name -ieq 'codex.exe')

  $decision = Get-Recommendation -Category $category -ParentExists $parentExists -WorkspaceMatch $workspaceMatch -CodexParent $codexParent -Age $age

  [PSCustomObject]@{
    root_pid = [int]$root.ProcessId
    root_name = $root.Name
    category = $category
    parent_process_id = [int]$root.ParentProcessId
    parent_exists = $parentExists
    process_count = $members.Count
    started_at = $rootStartTime
    age_minutes = [math]::Round($age.TotalMinutes, 1)
    workspace_match = $workspaceMatch
    codex_parent = $codexParent
    non_wrapper_parent_pid = if ($nonWrapperParent) { [int]$nonWrapperParent.ProcessId } else { $null }
    non_wrapper_parent_name = if ($nonWrapperParent) { $nonWrapperParent.Name } else { $null }
    safe_to_kill = $decision.safe_to_kill
    kill_recommendation = $decision.recommendation
    reason = $decision.reason
    root_command = $root.CommandLine
    process_ids = @($members.ProcessId)
  }
}

function Invoke-Cleanup {
  param([object[]]$TreesToKill)

  $results = foreach ($tree in $TreesToKill) {
    if ($WhatIf) {
      [PSCustomObject]@{
        root_pid = $tree.root_pid
        category = $tree.category
        result = 'preview'
        output = 'WhatIf enabled; no processes were terminated.'
      }
      continue
    }

    $output = cmd /c "taskkill /PID $($tree.root_pid) /T /F" 2>&1
    [PSCustomObject]@{
      root_pid = $tree.root_pid
      category = $tree.category
      result = if ($LASTEXITCODE -eq 0) { 'terminated' } else { 'failed' }
      output = ($output -join "`n")
    }
  }

  return $results
}

$cleanupTargets = @()
if ($Mode -eq 'cleanup') {
  switch ($Profile) {
    'safe' {
      $cleanupTargets = $trees | Where-Object {
        $_.category -eq 'npm-outdated' -and -not $_.parent_exists
      }
    }
    'playwright-mcp' {
      $cleanupTargets = $trees | Where-Object { $_.category -eq 'playwright-mcp' }
    }
    'codex-playwright-safe' {
      $cleanupTargets = $trees | Where-Object {
        $_.category -eq 'playwright-mcp' -and
        $_.codex_parent -and
        $_.age_minutes -ge $StaleMinutes
      }
    }
    'safe-plus-codex-playwright' {
      $cleanupTargets = $trees | Where-Object {
        ($_.category -eq 'npm-outdated' -and -not $_.parent_exists) -or
        ($_.category -eq 'playwright-mcp' -and $_.codex_parent -and $_.age_minutes -ge $StaleMinutes)
      }
    }
    'workspace-dev-server' {
      if (-not $WorkspacePath) {
        throw 'WorkspacePath is required when Profile is workspace-dev-server.'
      }
      $cleanupTargets = $trees | Where-Object {
        $_.category -eq 'dev-server' -and $_.workspace_match
      }
    }
  }
}

$result = [PSCustomObject]@{
  mode = $Mode
  profile = $Profile
  workspace_path = $WorkspacePath
  stale_minutes = $StaleMinutes
  what_if = [bool]$WhatIf
  summary = [PSCustomObject]@{
    tree_count = @($trees).Count
    safe_cleanup_count = @($trees | Where-Object { $_.safe_to_kill }).Count
    playwright_mcp_count = @($trees | Where-Object { $_.category -eq 'playwright-mcp' }).Count
    codex_playwright_stale_count = @($trees | Where-Object {
      $_.category -eq 'playwright-mcp' -and $_.codex_parent -and $_.age_minutes -ge $StaleMinutes
    }).Count
    dev_server_count = @($trees | Where-Object { $_.category -eq 'dev-server' }).Count
    ide_language_service_count = @($trees | Where-Object { $_.category -eq 'ide-language-service' }).Count
    npm_outdated_count = @($trees | Where-Object { $_.category -eq 'npm-outdated' }).Count
  }
  trees = @($trees)
}

if ($Mode -eq 'cleanup') {
  $result | Add-Member -NotePropertyName cleanup_targets -NotePropertyValue @($cleanupTargets)
  $result.summary | Add-Member -NotePropertyName cleanup_target_count -NotePropertyValue @($cleanupTargets).Count
  $result | Add-Member -NotePropertyName cleanup_results -NotePropertyValue @(Invoke-Cleanup -TreesToKill $cleanupTargets)
}

if ($AsJson) {
  $result | ConvertTo-Json -Depth 6
  exit 0
}

if ($ExportJson) {
  $jsonDir = Split-Path -Parent $ExportJson
  if ($jsonDir) {
    New-Item -ItemType Directory -Force -Path $jsonDir | Out-Null
  }
  $result | ConvertTo-Json -Depth 6 | Set-Content -Path $ExportJson -Encoding UTF8
}

if ($ExportMarkdown) {
  $mdDir = Split-Path -Parent $ExportMarkdown
  if ($mdDir) {
    New-Item -ItemType Directory -Force -Path $mdDir | Out-Null
  }
  $markdown = @(
    '# Windows Dev Process Audit'
    ''
    "Mode: $Mode"
    "Profile: $Profile"
    "StaleMinutes: $StaleMinutes"
    "WhatIf: $([bool]$WhatIf)"
    if ($WorkspacePath) { "WorkspacePath: $WorkspacePath" }
    ''
    '## Summary'
    ''
    "- tree_count: $($result.summary.tree_count)"
    "- safe_cleanup_count: $($result.summary.safe_cleanup_count)"
    "- playwright_mcp_count: $($result.summary.playwright_mcp_count)"
    "- codex_playwright_stale_count: $($result.summary.codex_playwright_stale_count)"
    "- dev_server_count: $($result.summary.dev_server_count)"
    "- ide_language_service_count: $($result.summary.ide_language_service_count)"
    "- npm_outdated_count: $($result.summary.npm_outdated_count)"
    if ($Mode -eq 'cleanup') { "- cleanup_target_count: $($result.summary.cleanup_target_count)" }
    ''
    '## Trees'
    ''
  ) | Where-Object { $_ -ne $null }

  $markdown += ConvertTo-MarkdownTable -Rows ($result.trees | Sort-Object category, root_pid)

  if ($Mode -eq 'cleanup') {
    $markdown += @(
      ''
      '## Cleanup Targets'
      ''
    )
    $markdown += ConvertTo-MarkdownTable -Rows ($result.cleanup_targets | Sort-Object category, root_pid)
    $markdown += @(
      ''
      '## Cleanup Results'
      ''
    )
    $markdown += foreach ($item in $result.cleanup_results) {
      "- root_pid=$($item.root_pid), category=$($item.category), result=$($item.result)"
    }
  }

  Set-Content -Path $ExportMarkdown -Value $markdown -Encoding UTF8
}

$result.summary
''
$result.trees |
  Sort-Object category, root_pid |
  Select-Object root_pid, category, parent_exists, safe_to_kill, kill_recommendation, process_count, workspace_match, codex_parent, age_minutes, reason |
  Format-Table -AutoSize

if ($Mode -eq 'cleanup') {
  ''
  'Cleanup results:'
  $result.cleanup_results | Format-Table -AutoSize
}
