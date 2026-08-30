[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-ReviewArchiveRoot {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$RepoRoot,

    [Parameter(Mandatory)]
    [string]$ArchiveRelativePath
  )

  $expectedRoot = [IO.Path]::GetFullPath((Join-Path $RepoRoot $ArchiveRelativePath))
  $unresolvedRootItem = Get-Item -LiteralPath $expectedRoot -Force -ErrorAction Stop
  if (($unresolvedRootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw 'external archive root is a reparse point'
  }

  $resolvedRoot = (Resolve-Path -LiteralPath $expectedRoot -ErrorAction Stop).Path
  if (-not [String]::Equals($resolvedRoot, $expectedRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'external archive canonical root drift'
  }

  return $resolvedRoot
}

function Invoke-ReviewArchiveEnumerationProbe {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$RepoRoot,

    [Parameter(Mandatory)]
    [string]$ArchiveRelativePath
  )

  $resolvedRoot = Resolve-ReviewArchiveRoot -RepoRoot $RepoRoot -ArchiveRelativePath $ArchiveRelativePath
  $script:EnumerationAttempts += 1
  $null = Get-ChildItem -LiteralPath $resolvedRoot -Force -Recurse -ErrorAction Stop
  return $resolvedRoot
}

$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$tempPrefix = $tempBase.TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$fixtureRoot = [IO.Path]::GetFullPath((Join-Path $tempBase ('skill-review-root-guard-' + [Guid]::NewGuid().ToString('N'))))
if (-not $fixtureRoot.StartsWith($tempPrefix, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'fixture root escaped the system temp directory'
}

$realRoot = Join-Path $fixtureRoot 'real-archive'
$junctionRoot = Join-Path $fixtureRoot 'junction-archive'
$normalCanonical = $false
$junctionRejected = $false
$junctionIsReparse = $false
$junctionRejectedBeforeEnumeration = $false

try {
  $null = New-Item -ItemType Directory -Path $realRoot -Force -ErrorAction Stop

  $script:EnumerationAttempts = 0
  $resolvedNormal = Invoke-ReviewArchiveEnumerationProbe -RepoRoot $fixtureRoot -ArchiveRelativePath 'real-archive'
  $normalCanonical = [String]::Equals(
    $resolvedNormal,
    [IO.Path]::GetFullPath($realRoot),
    [StringComparison]::OrdinalIgnoreCase
  ) -and $script:EnumerationAttempts -eq 1

  $null = New-Item -ItemType Junction -Path $junctionRoot -Target $realRoot -ErrorAction Stop
  $junctionItem = Get-Item -LiteralPath $junctionRoot -Force -ErrorAction Stop
  $junctionIsReparse = ($junctionItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0

  $script:EnumerationAttempts = 0
  try {
    $null = Invoke-ReviewArchiveEnumerationProbe -RepoRoot $fixtureRoot -ArchiveRelativePath 'junction-archive'
  }
  catch {
    $junctionRejected = $_.Exception.Message -eq 'external archive root is a reparse point'
  }
  $junctionRejectedBeforeEnumeration = $junctionRejected -and $script:EnumerationAttempts -eq 0

  if (-not $normalCanonical -or -not $junctionIsReparse -or -not $junctionRejectedBeforeEnumeration) {
    throw 'external archive root guard fixture failed'
  }

  [ordered]@{
    normal_canonical = $normalCanonical
    junction_is_reparse = $junctionIsReparse
    junction_rejected = $junctionRejected
    junction_rejected_before_enumeration = $junctionRejectedBeforeEnumeration
  } | ConvertTo-Json -Compress
}
finally {
  if (Test-Path -LiteralPath $junctionRoot) {
    Remove-Item -LiteralPath $junctionRoot -Force -ErrorAction Stop
  }
  if (Test-Path -LiteralPath $realRoot) {
    Remove-Item -LiteralPath $realRoot -Force -ErrorAction Stop
  }
  if (Test-Path -LiteralPath $fixtureRoot) {
    Remove-Item -LiteralPath $fixtureRoot -Force -ErrorAction Stop
  }
}
