param(
    [string]$Ref = "",
    [string]$Repository = "",
    [string]$RawBase = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:DefaultRepository = "bahayonghang/my-claude-code-settings"
$script:Repository =
    if (-not [string]::IsNullOrWhiteSpace($Repository)) {
        $Repository
    } elseif (-not [string]::IsNullOrWhiteSpace($env:SKILLS_INSTALL_REPO)) {
        $env:SKILLS_INSTALL_REPO
    } else {
        $script:DefaultRepository
    }
$script:RepositoryRef =
    if (-not [string]::IsNullOrWhiteSpace($Ref)) {
        $Ref
    } elseif (-not [string]::IsNullOrWhiteSpace($env:SKILLS_INSTALL_REF)) {
        $env:SKILLS_INSTALL_REF
    } else {
        "main"
    }
$script:RawBase =
    if (-not [string]::IsNullOrWhiteSpace($RawBase)) {
        $RawBase.TrimEnd("/")
    } elseif (-not [string]::IsNullOrWhiteSpace($env:SKILLS_INSTALL_RAW_BASE)) {
        $env:SKILLS_INSTALL_RAW_BASE.TrimEnd("/")
    } else {
        "https://raw.githubusercontent.com/$($script:Repository)/$($script:RepositoryRef)"
    }
$script:FirstPartySource = "$($script:Repository)/content/skills"

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "== $Title =="
}

function Fail {
    param([string]$Message)
    throw $Message
}

function Get-ResolvedCommand {
    param([string[]]$Candidates)

    foreach ($candidate in $Candidates) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($null -ne $command) {
            return $command.Name
        }
    }

    return $null
}

function Assert-Prerequisites {
    $nodeCommand = Get-ResolvedCommand @("node")
    if (-not $nodeCommand) {
        Fail "node is required because the installer uses npx skills."
    }

    $npxCommand = Get-ResolvedCommand @("npx.cmd", "npx")
    if (-not $npxCommand) {
        Fail "npx is required because the installer uses npx skills."
    }

    return $npxCommand
}

function Select-InstallScope {
    while ($true) {
        Write-Section "Install Scope"
        Write-Host "1. Project (current working directory: $(Get-Location))"
        Write-Host "2. Global"
        $choice = Read-Host "Choose scope [1-2]"
        switch ($choice) {
            "1" { return "project" }
            "2" { return "global" }
            default { Write-Host "Please enter 1 or 2." }
        }
    }
}

function Select-InstallMode {
    while ($true) {
        Write-Section "Install Mode"
        Write-Host "1. Install first-party skills from GitHub source"
        Write-Host "2. Install third-party skills from external-skills registry"
        $choice = Read-Host "Choose mode [1-2]"
        switch ($choice) {
            "1" { return "first_party" }
            "2" { return "external" }
            default { Write-Host "Please enter 1 or 2." }
        }
    }
}

function Get-InstalledSkillNames {
    param(
        [string]$NpxCommand,
        [string]$Scope
    )

    $args = @("-y", "skills", "ls", "--json")
    if ($Scope -eq "global") {
        $args += "-g"
    }

    $output = & $NpxCommand @args 2>&1
    if ($LASTEXITCODE -ne 0) {
        $text = ($output | Out-String).Trim()
        Fail "Failed to inspect installed skills for scope '$Scope'.`n$text"
    }

    try {
        $parsed = @($output | Out-String | ConvertFrom-Json)
    } catch {
        Fail "Failed to parse npx skills ls JSON: $($_.Exception.Message)"
    }

    $names = [System.Collections.Generic.List[string]]::new()
    foreach ($item in $parsed) {
        if ($null -ne $item -and $item.PSObject.Properties.Name -contains "name") {
            $name = [string]$item.name
            if (-not [string]::IsNullOrWhiteSpace($name)) {
                $names.Add($name.Trim())
            }
        }
    }

    return $names
}

function Show-InstalledSummary {
    param([System.Collections.Generic.List[string]]$InstalledNames)

    Write-Section "Installed Skills Detected"
    Write-Host "Count: $($InstalledNames.Count)"
    if ($InstalledNames.Count -eq 0) {
        Write-Host "No installed skills found in the selected scope."
        return
    }

    $limit = [Math]::Min(10, $InstalledNames.Count)
    for ($i = 0; $i -lt $limit; $i++) {
        Write-Host " - $($InstalledNames[$i])"
    }

    if ($InstalledNames.Count -gt $limit) {
        Write-Host " ... and $($InstalledNames.Count - $limit) more"
    }
}

function Normalize-Text {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return ""
    }

    return (($Value -replace "\s+", " ").Trim())
}

function Get-RemoteText {
    param([string]$RelativePath)

    $path = $RelativePath.TrimStart("/")
    $url = "$($script:RawBase)/$path"

    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
    } catch {
        Fail "Failed to download '$url': $($_.Exception.Message)"
    }

    if ($response.Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($response.Content)
    }

    return [string]$response.Content
}

function Unescape-TomlString {
    param([string]$Value)

    return $Value.Replace('\n', "`n").Replace('\t', "`t").Replace('\"', '"')
}

function Get-TomlBlocks {
    param(
        [string]$Content,
        [string]$TableName
    )

    $escaped = [regex]::Escape($TableName)
    $pattern = "(?ms)^\[\[$escaped\]\]\s*(.*?)(?=^\[\[[^\]]+\]\]\s*$|\z)"
    $matches = [regex]::Matches($Content, $pattern)
    $blocks = @()
    foreach ($match in $matches) {
        $blocks += $match.Groups[1].Value.Trim()
    }
    return $blocks
}

function Get-TomlStringValue {
    param(
        [string]$Block,
        [string]$Key
    )

    $escaped = [regex]::Escape($Key)
    $pattern = '(?m)^' + $escaped + '\s*=\s*"((?:\\.|[^"])*)"\s*$'
    $match = [regex]::Match($Block, $pattern)
    if (-not $match.Success) {
        return ""
    }
    return Unescape-TomlString $match.Groups[1].Value
}

function Get-TomlBooleanValue {
    param(
        [string]$Block,
        [string]$Key,
        [bool]$Default = $false
    )

    $escaped = [regex]::Escape($Key)
    $pattern = '(?m)^' + $escaped + '\s*=\s*(true|false)\s*$'
    $match = [regex]::Match($Block, $pattern)
    if (-not $match.Success) {
        return $Default
    }
    return $match.Groups[1].Value -eq "true"
}

function Split-InlineTomlFields {
    param([string]$Content)

    $parts = [System.Collections.Generic.List[string]]::new()
    $current = [System.Text.StringBuilder]::new()
    $inQuote = $false
    $escape = $false

    foreach ($char in $Content.ToCharArray()) {
        if ($escape) {
            [void]$current.Append($char)
            $escape = $false
            continue
        }

        if ($char -eq '\') {
            [void]$current.Append($char)
            $escape = $true
            continue
        }

        if ($char -eq '"') {
            [void]$current.Append($char)
            $inQuote = -not $inQuote
            continue
        }

        if ($char -eq ',' -and -not $inQuote) {
            $part = $current.ToString().Trim()
            if ($part) {
                $parts.Add($part)
            }
            $current.Clear() | Out-Null
            continue
        }

        [void]$current.Append($char)
    }

    $tail = $current.ToString().Trim()
    if ($tail) {
        $parts.Add($tail)
    }

    return $parts
}

function Get-TomlInlineTable {
    param(
        [string]$Block,
        [string]$Key
    )

    $escaped = [regex]::Escape($Key)
    $pattern = '(?m)^' + $escaped + '\s*=\s*\{(.*)\}\s*$'
    $match = [regex]::Match($Block, $pattern)
    if (-not $match.Success) {
        return @{}
    }

    $result = @{}
    foreach ($segment in Split-InlineTomlFields $match.Groups[1].Value) {
        $pair = [regex]::Match($segment, '^([A-Za-z0-9_-]+)\s*=\s*(.+)$')
        if (-not $pair.Success) {
            continue
        }

        $field = $pair.Groups[1].Value
        $rawValue = $pair.Groups[2].Value.Trim()
        if ($rawValue -match '^"(.*)"$') {
            $result[$field] = Unescape-TomlString $Matches[1]
        } else {
            $result[$field] = $rawValue
        }
    }

    return $result
}

function Get-FirstPartyCandidates {
    param([System.Collections.Generic.HashSet[string]]$InstalledSet)

    $catalogContent = Get-RemoteText -RelativePath "content/skills/catalog.json"

    try {
        $catalog = $catalogContent | ConvertFrom-Json
    } catch {
        Fail "Failed to parse content/skills/catalog.json: $($_.Exception.Message)"
    }

    if ($null -eq $catalog -or $null -eq $catalog.skills) {
        Fail "Expected content/skills/catalog.json to contain a skills array."
    }

    $candidates = [System.Collections.Generic.List[object]]::new()
    foreach ($item in @($catalog.skills)) {
        $name = [string]$item.name
        if ([string]::IsNullOrWhiteSpace($name) -or $InstalledSet.Contains($name)) {
            continue
        }

        $candidates.Add([pscustomobject]@{
            Key         = $name
            Kind        = "first_party"
            Name        = $name
            Category    = Normalize-Text ([string]$item.category)
            Description = Normalize-Text ([string]$item.description)
            PackageRef  = ""
            SkillFlag   = ""
            ProjectOnly = $false
        })
    }

    return $candidates
}

function Get-ExternalCandidates {
    param(
        [string]$Scope,
        [System.Collections.Generic.HashSet[string]]$InstalledSet
    )

    $indexContent = Get-RemoteText -RelativePath "content/skills/external-skills/index.toml"
    $categoryBlocks = Get-TomlBlocks -Content $indexContent -TableName "categories"
    $candidates = [System.Collections.Generic.List[object]]::new()

    foreach ($categoryBlock in $categoryBlocks) {
        $categoryId = Get-TomlStringValue -Block $categoryBlock -Key "id"
        $categoryLabel = Get-TomlStringValue -Block $categoryBlock -Key "label"
        $categoryFile = Get-TomlStringValue -Block $categoryBlock -Key "file"
        if ([string]::IsNullOrWhiteSpace($categoryId) -or [string]::IsNullOrWhiteSpace($categoryFile)) {
            continue
        }

        $fragmentContent = Get-RemoteText -RelativePath ("content/skills/external-skills/{0}" -f $categoryFile)
        $skillBlocks = Get-TomlBlocks -Content $fragmentContent -TableName "skills"

        foreach ($skillBlock in $skillBlocks) {
            $name = Get-TomlStringValue -Block $skillBlock -Key "name"
            $projectOnly = Get-TomlBooleanValue -Block $skillBlock -Key "project_only" -Default $false
            $install = Get-TomlInlineTable -Block $skillBlock -Key "install"
            $packageRef = [string]($install["package_ref"])
            $skillFlag = ""
            if ($install.ContainsKey("skill_flag")) {
                $skillFlag = [string]$install["skill_flag"]
            }

            $key = if ([string]::IsNullOrWhiteSpace($skillFlag)) { $name } else { $skillFlag }

            if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($packageRef) -or [string]::IsNullOrWhiteSpace($key)) {
                continue
            }

            if ($Scope -eq "global" -and $projectOnly) {
                continue
            }

            if ($InstalledSet.Contains($key)) {
                continue
            }

            $candidates.Add([pscustomobject]@{
                Key         = $key
                Kind        = "external"
                Name        = $name
                Category    = if ([string]::IsNullOrWhiteSpace($categoryLabel)) { $categoryId } else { $categoryLabel }
                Description = Normalize-Text (Get-TomlStringValue -Block $skillBlock -Key "description")
                PackageRef  = $packageRef
                SkillFlag   = $skillFlag
                ProjectOnly = $projectOnly
            })
        }
    }

    return $candidates
}

function Add-CandidateIndices {
    param([object[]]$Candidates)

    $indexed = [System.Collections.Generic.List[object]]::new()
    for ($i = 0; $i -lt $Candidates.Count; $i++) {
        $item = $Candidates[$i]
        $indexed.Add([pscustomobject]@{
            Index       = $i + 1
            Key         = $item.Key
            Kind        = $item.Kind
            Name        = $item.Name
            Category    = $item.Category
            Description = $item.Description
            PackageRef  = $item.PackageRef
            SkillFlag   = $item.SkillFlag
            ProjectOnly = $item.ProjectOnly
        })
    }
    return $indexed
}

function Show-CandidatePreview {
    param([object[]]$Candidates)

    Write-Section "Available Candidates"
    $limit = [Math]::Min(15, $Candidates.Count)
    for ($i = 0; $i -lt $limit; $i++) {
        $item = $Candidates[$i]
        if ($item.Kind -eq "external") {
            Write-Host ("{0,2}. [{1}] {2} / {3} ({4})" -f $item.Index, $item.Kind, $item.Category, $item.Name, $item.PackageRef)
        } else {
            Write-Host ("{0,2}. [{1}] {2} / {3}" -f $item.Index, $item.Kind, $item.Category, $item.Name)
        }
    }

    if ($Candidates.Count -gt $limit) {
        Write-Host " ... and $($Candidates.Count - $limit) more"
    }
}

function Select-Candidates {
    param([object[]]$Candidates)

    $outGridView = Get-Command Out-GridView -ErrorAction SilentlyContinue
    if ($null -ne $outGridView) {
        try {
            $selection = @(
                $Candidates |
                    Select-Object Index, Kind, Category, Name, Description, PackageRef, SkillFlag, ProjectOnly, Key |
                    Out-GridView -Title "Select skills to install" -PassThru
            )
            return $selection | Sort-Object Index
        } catch {
            Write-Host "Out-GridView is unavailable in this session. Falling back to console selection."
        }
    }

    Write-Section "Select Skills"
    foreach ($item in $Candidates) {
        if ($item.Kind -eq "external") {
            Write-Host ("{0,3}. [{1}] {2} / {3} ({4})" -f $item.Index, $item.Kind, $item.Category, $item.Name, $item.PackageRef)
        } else {
            Write-Host ("{0,3}. [{1}] {2} / {3}" -f $item.Index, $item.Kind, $item.Category, $item.Name)
        }
        if (-not [string]::IsNullOrWhiteSpace($item.Description)) {
            Write-Host "     $($item.Description)"
        }
    }

    $input = Read-Host "Enter comma-separated numbers, or press Enter to cancel"
    if ([string]::IsNullOrWhiteSpace($input)) {
        return @()
    }

    $numbers = @()
    foreach ($part in ($input -split '[,\s]+')) {
        if ([string]::IsNullOrWhiteSpace($part)) {
            continue
        }
        $number = 0
        if (-not [int]::TryParse($part, [ref]$number)) {
            Fail "Invalid selection '$part'."
        }
        if ($number -lt 1 -or $number -gt $Candidates.Count) {
            Fail "Selection '$number' is out of range."
        }
        if ($numbers -notcontains $number) {
            $numbers += $number
        }
    }

    return @($Candidates | Where-Object { $numbers -contains $_.Index } | Sort-Object Index)
}

function Show-SelectedSummary {
    param([object[]]$SelectedCandidates)

    Write-Section "Selected Skills"
    foreach ($item in $SelectedCandidates) {
        if ($item.Kind -eq "external") {
            Write-Host " - $($item.Category) / $($item.Name) ($($item.PackageRef))"
        } else {
            Write-Host " - $($item.Category) / $($item.Name)"
        }
    }
}

function Build-FirstPartyCommand {
    param(
        [string]$Scope,
        [object[]]$SelectedCandidates
    )

    $args = [System.Collections.Generic.List[string]]::new()
    foreach ($part in @("-y", "skills", "add", $script:FirstPartySource)) {
        $args.Add($part)
    }

    if ($Scope -eq "global") {
        $args.Add("-g")
    }

    foreach ($candidate in $SelectedCandidates) {
        $args.Add("--skill")
        $args.Add($candidate.Name)
    }

    $args.Add("-y")
    return @($args.ToArray())
}

function Build-ExternalCommandSpecs {
    param([object[]]$SelectedCandidates)

    $groups = [ordered]@{}
    foreach ($candidate in $SelectedCandidates) {
        if (-not $groups.Contains($candidate.PackageRef)) {
            $groups[$candidate.PackageRef] = [pscustomobject]@{
                PackageRef  = $candidate.PackageRef
                SkillFlags  = [System.Collections.Generic.List[string]]::new()
                FullInstall = $false
            }
        }

        $group = $groups[$candidate.PackageRef]
        if ([string]::IsNullOrWhiteSpace($candidate.SkillFlag)) {
            $group.FullInstall = $true
            continue
        }

        if (-not $group.FullInstall -and -not $group.SkillFlags.Contains($candidate.SkillFlag)) {
            $group.SkillFlags.Add($candidate.SkillFlag)
        }
    }

    return @($groups.Values)
}

function Build-ExternalCommandArgs {
    param(
        [string]$Scope,
        [object]$CommandSpec
    )

    $args = [System.Collections.Generic.List[string]]::new()
    foreach ($part in @("-y", "skills", "add", $CommandSpec.PackageRef)) {
        $args.Add($part)
    }

    if ($Scope -eq "global") {
        $args.Add("-g")
    }

    if (-not $CommandSpec.FullInstall) {
        foreach ($flag in $CommandSpec.SkillFlags) {
            $args.Add("--skill")
            $args.Add([string]$flag)
        }
    }

    $args.Add("-y")
    return @($args.ToArray())
}

function Format-CommandDisplay {
    param([string[]]$Args)

    $parts = foreach ($arg in $Args) {
        if ($arg -match '\s') {
            '"' + ($arg -replace '"', '\"') + '"'
        } else {
            $arg
        }
    }

    return "$($script:NpxCommand) $($parts -join ' ')"
}

function Invoke-SkillsCommand {
    param(
        [string]$NpxCommand,
        [string[]]$Args
    )

    Write-Section "Executing Command"
    Write-Host (Format-CommandDisplay -Args $Args)

    & $NpxCommand @Args
    return ($LASTEXITCODE -eq 0)
}

$script:NpxCommand = Assert-Prerequisites
$scope = Select-InstallScope
$installedNames = Get-InstalledSkillNames -NpxCommand $script:NpxCommand -Scope $scope
Show-InstalledSummary -InstalledNames $installedNames

$installedSet = [System.Collections.Generic.HashSet[string]]::new()
foreach ($name in $installedNames) {
    [void]$installedSet.Add($name)
}

$mode = Select-InstallMode

$candidates = @(
    if ($mode -eq "external") {
        Get-ExternalCandidates -Scope $scope -InstalledSet $installedSet
    } else {
        Get-FirstPartyCandidates -InstalledSet $installedSet
    }
)

$candidates = @($candidates | Sort-Object Category, Name)
$candidates = @(Add-CandidateIndices -Candidates $candidates)

if ($candidates.Count -eq 0) {
    Write-Section "Nothing To Install"
    Write-Host "No installable candidates remain for mode=$mode scope=$scope."
    exit 0
}

Show-CandidatePreview -Candidates $candidates
$selectedCandidates = @(Select-Candidates -Candidates $candidates)

if ($selectedCandidates.Count -eq 0) {
    Write-Section "No Selection"
    Write-Host "No skills selected. Nothing to do."
    exit 0
}

Show-SelectedSummary -SelectedCandidates $selectedCandidates

$failures = [System.Collections.Generic.List[string]]::new()

if ($mode -eq "first_party") {
    $args = Build-FirstPartyCommand -Scope $scope -SelectedCandidates $selectedCandidates
    if (-not (Invoke-SkillsCommand -NpxCommand $script:NpxCommand -Args $args)) {
        $failures.Add("first-party GitHub install")
    }
} else {
    $commandSpecs = Build-ExternalCommandSpecs -SelectedCandidates $selectedCandidates
    foreach ($spec in $commandSpecs) {
        $args = Build-ExternalCommandArgs -Scope $scope -CommandSpec $spec
        if (-not (Invoke-SkillsCommand -NpxCommand $script:NpxCommand -Args $args)) {
            $failures.Add($spec.PackageRef)
        }
    }
}

Write-Section "Install Summary"
if ($failures.Count -eq 0) {
    Write-Host "All selected installs completed successfully."
    exit 0
}

Write-Host "Completed with $($failures.Count) failure(s):"
foreach ($failure in $failures) {
    Write-Host " - $failure"
}

exit 1
