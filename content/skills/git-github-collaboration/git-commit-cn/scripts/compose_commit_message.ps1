$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pyScript = Join-Path $scriptDir "compose_commit_message.py"
$nativeErrorPreference = Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue

$candidates = @(
  @{ Command = "python3"; PrefixArgs = @() },
  @{ Command = "python"; PrefixArgs = @() },
  @{ Command = "py"; PrefixArgs = @("-3") },
  @{ Command = "py"; PrefixArgs = @() }
)

if ($nativeErrorPreference) {
  $PSNativeCommandUseErrorActionPreference = $false
}

try {
  foreach ($candidate in $candidates) {
    $commandInfo = Get-Command $candidate.Command -ErrorAction SilentlyContinue
    if (-not $commandInfo) {
      continue
    }

    $commandPath = if ($commandInfo.Source) { $commandInfo.Source } else { $commandInfo.Path }
    if ($commandPath -and $commandPath.ToLowerInvariant().Contains("\windowsapps\")) {
      continue
    }

    & $candidate.Command @($candidate.PrefixArgs + @("-c", "import sys")) *> $null
    if ($LASTEXITCODE -ne 0) {
      continue
    }

    & $candidate.Command @($candidate.PrefixArgs + @($pyScript) + $args)
    exit $LASTEXITCODE
  }
}
finally {
  if ($nativeErrorPreference) {
    $PSNativeCommandUseErrorActionPreference = $nativeErrorPreference.Value
  }
}

Write-Error "Unable to find a Python interpreter. Tried: python3, python, py."
exit 127
