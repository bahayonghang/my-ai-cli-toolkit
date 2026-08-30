[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Library', 'SelfTest', 'Prepare', 'Execute')]
    [string]$Mode,

    [ValidateSet('Backup', 'Removal', 'All')]
    [string]$SelfTestScope = 'All',

    [string]$RepoRoot,
    [string]$BackupRoot,
    [string]$ExpectedSourceSha256,
    [string]$ExpectedPhysicalSourceSha256,
    [string]$ExpectedFinalSha256,
    [string]$ExpectedPhysicalFinalSha256
)

$script:ReviewTaskName = '08-29-consolidate-skill-review'
$script:ReviewSourceRelativeParent = 'skills/developer-tools-integrations'
$script:ReviewSourceNames = @('skill-doctor', 'update-skill')
$script:ReviewExpectedGovernedSourceCount = 14
$script:ReviewExpectedPhysicalSourceCount = 17
$script:ReviewExpectedGovernedFinalCount = 28
$script:ReviewExpectedPhysicalFinalCount = 34

function Test-ReviewOrdinalEqual {
    param(
        [Parameter(Mandatory)][string]$Left,
        [Parameter(Mandatory)][string]$Right
    )

    [StringComparer]::Ordinal.Equals($Left, $Right)
}

function Get-ReviewNormalizedFullPath {
    param([Parameter(Mandatory)][string]$Path)

    [IO.Path]::TrimEndingDirectorySeparator([IO.Path]::GetFullPath($Path))
}

function Assert-ReviewDirectoryRoot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Root,
        [string]$Label = 'path'
    )

    $resolved = (Resolve-Path -LiteralPath $Root -ErrorAction Stop).Path
    $rootItem = Get-Item -LiteralPath $resolved -Force -ErrorAction Stop
    if (($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "$Label root is a reparse point"
    }
    if (-not $rootItem.PSIsContainer) {
        throw "$Label root is not a directory"
    }

    Get-ReviewNormalizedFullPath -Path $resolved
}

function Assert-ReviewNoReparse {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Root,
        [string]$Label = 'path'
    )

    $resolved = Assert-ReviewDirectoryRoot -Root $Root -Label $Label

    $reparseItems = @(Get-ChildItem -LiteralPath $resolved -Recurse -Force -ErrorAction Stop |
        Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 })
    if ($reparseItems.Count -ne 0) {
        throw "$Label subtree contains a reparse point"
    }

    $resolved
}

function Assert-ReviewDirectChild {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Parent,
        [Parameter(Mandatory)][string]$Child,
        [Parameter(Mandatory)][string]$ExpectedName,
        [string]$Label = 'path'
    )

    $parentFull = Get-ReviewNormalizedFullPath -Path $Parent
    $childFull = Get-ReviewNormalizedFullPath -Path $Child
    if (-not (Test-ReviewOrdinalEqual -Left ([IO.Path]::GetDirectoryName($childFull)) -Right $parentFull)) {
        throw "$Label escaped its approved parent"
    }
    if (-not (Test-ReviewOrdinalEqual -Left ([IO.Path]::GetFileName($childFull)) -Right $ExpectedName)) {
        throw "$Label name mismatch"
    }
    $childFull
}

function Get-ReviewPathProbe {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Path,
        [ValidateSet('Any', 'Container', 'Leaf')][string]$PathType = 'Any'
    )

    try {
        $present = if ($PathType -eq 'Any') {
            Test-Path -LiteralPath $Path -ErrorAction Stop
        }
        else {
            Test-Path -LiteralPath $Path -PathType $PathType -ErrorAction Stop
        }
        [pscustomobject]@{
            status = if ($present) { 'present' } else { 'missing' }
            probe_category = $null
        }
    }
    catch {
        [pscustomobject]@{
            status = 'unknown'
            probe_category = $_.Exception.GetType().FullName
        }
    }
}

function Test-ReviewPathPresent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Path,
        [ValidateSet('Any', 'Container', 'Leaf')][string]$PathType = 'Any'
    )

    $probe = Get-ReviewPathProbe -Path $Path -PathType $PathType
    if ($probe.status -eq 'unknown') {
        throw [IO.IOException]::new('path existence probe failed')
    }
    $probe.status -eq 'present'
}

function Enter-ReviewMutationLock {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$BackupParent)

    $resolvedParent = Assert-ReviewDirectoryRoot -Root $BackupParent -Label 'mutation lock parent'
    $lockPath = Assert-ReviewDirectChild -Parent $resolvedParent `
        -Child (Join-Path $resolvedParent ".$($script:ReviewTaskName).mutation.lock") `
        -ExpectedName ".$($script:ReviewTaskName).mutation.lock" -Label 'mutation lock'
    $probe = Get-ReviewPathProbe -Path $lockPath
    if ($probe.status -eq 'unknown') { throw [IO.IOException]::new('mutation lock probe failed') }
    if ($probe.status -eq 'present') {
        $lockItem = Get-Item -LiteralPath $lockPath -Force -ErrorAction Stop
        if (($lockItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $lockItem.PSIsContainer) {
            throw 'mutation lock path is not a regular file'
        }
    }
    try {
        $handle = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    }
    catch {
        throw [IO.IOException]::new('task mutation lock is already held or unavailable', $_.Exception)
    }
    try {
        $lockItem = Get-Item -LiteralPath $lockPath -Force -ErrorAction Stop
        if (($lockItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $lockItem.PSIsContainer) {
            throw 'mutation lock path changed identity'
        }
        $lease = [pscustomobject]@{
            Handle = $handle
            LockPath = $lockPath
            IsDisposed = $false
            CleanupSucceeded = $false
        }
        $lease | Add-Member -MemberType ScriptMethod -Name Dispose -Value {
            if ($this.IsDisposed) { return }
            $this.Handle.Dispose()
            $this.IsDisposed = $true
            try {
                $probe = Get-ReviewPathProbe -Path $this.LockPath
                if ($probe.status -eq 'unknown') { return }
                if ($probe.status -eq 'present') {
                    $item = Get-Item -LiteralPath $this.LockPath -Force -ErrorAction Stop
                    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $item.PSIsContainer) { return }
                    Remove-Item -LiteralPath $this.LockPath -Force -ErrorAction Stop
                }
                $this.CleanupSucceeded = -not (Test-ReviewPathPresent -Path $this.LockPath)
            }
            catch {
                $this.CleanupSucceeded = $false
            }
        }
        $lease
    }
    catch {
        $handle.Dispose()
        throw
    }
}

function Get-CanonicalReviewInventory {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyCollection()][object[]]$Entries)

    $hashByPath = [Collections.Generic.Dictionary[string, string]]::new([StringComparer]::Ordinal)
    foreach ($entry in $Entries) {
        $path = [string]$entry.Path
        $hash = ([string]$entry.Hash).ToLowerInvariant()
        if ([string]::IsNullOrWhiteSpace($path) -or
            [IO.Path]::IsPathRooted($path) -or
            $path.Contains('\') -or
            $path -eq '..' -or
            $path.StartsWith('../', [StringComparison]::Ordinal) -or
            $path.Contains('/../', [StringComparison]::Ordinal)) {
            throw 'invalid inventory path'
        }
        if ($hash -notmatch '\A[0-9a-f]{64}\z') {
            throw 'invalid inventory hash'
        }
        if (-not $hashByPath.TryAdd($path, $hash)) {
            throw 'duplicate inventory path'
        }
    }

    [string[]]$paths = @($hashByPath.Keys)
    [Array]::Sort($paths, [StringComparer]::Ordinal)
    [string[]]$lines = @($paths | ForEach-Object { "$($hashByPath[$_])  $_" })
    $canonicalText = if ($lines.Count -eq 0) { '' } else { ($lines -join "`n") + "`n" }
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($canonicalText)
    $collectionHash = [Convert]::ToHexString(
        [Security.Cryptography.SHA256]::HashData($bytes)
    ).ToLowerInvariant()

    [pscustomobject]@{
        Count = $paths.Count
        Sha256 = $collectionHash
        Entries = @($paths | ForEach-Object {
            [pscustomobject]@{ Path = $_; Hash = $hashByPath[$_] }
        })
    }
}

function Get-ReviewInventorySet {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Root)

    $resolvedRoot = Assert-ReviewNoReparse -Root $Root -Label 'inventory'
    $physicalEntries = @(Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File -Force -ErrorAction Stop |
        ForEach-Object {
            $relativePath = [IO.Path]::GetRelativePath($resolvedRoot, $_.FullName).Replace('\', '/')
            [pscustomobject]@{
                Path = $relativePath
                Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
            }
        })
    $governedEntries = @($physicalEntries | Where-Object {
        ($_.Path -split '/') -notcontains '__pycache__'
    })
    $excludedEntries = @($physicalEntries | Where-Object {
        ($_.Path -split '/') -contains '__pycache__'
    })

    $excludedPaths = [string[]]@($excludedEntries.Path)
    [Array]::Sort($excludedPaths, [StringComparer]::Ordinal)
    [pscustomobject]@{
        Physical = Get-CanonicalReviewInventory -Entries $physicalEntries
        Governed = Get-CanonicalReviewInventory -Entries $governedEntries
        ExcludedPaths = $excludedPaths
    }
}

function Get-ReviewInventory {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Root)

    (Get-ReviewInventorySet -Root $Root).Governed
}

function Get-ReviewNamedTreeInventorySet {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ParentRoot,
        [Parameter(Mandatory)][string[]]$Names
    )

    $resolvedParent = Assert-ReviewDirectoryRoot -Root $ParentRoot -Label 'source parent'
    $physicalEntries = [Collections.Generic.List[object]]::new()
    foreach ($name in $Names) {
        if ([string]::IsNullOrWhiteSpace($name) -or
            $name.Contains('/') -or
            $name.Contains('\') -or
            $name -in @('.', '..')) {
            throw 'invalid source name'
        }
        $candidate = Assert-ReviewDirectChild -Parent $resolvedParent -Child (Join-Path $resolvedParent $name) -ExpectedName $name -Label 'source'
        $resolvedSource = Assert-ReviewNoReparse -Root $candidate -Label "source $name"
        if (-not (Test-ReviewOrdinalEqual -Left $resolvedSource -Right $candidate)) {
            throw 'source path mismatch'
        }
        foreach ($item in @(Get-ChildItem -LiteralPath $resolvedSource -Recurse -File -Force -ErrorAction Stop)) {
            $relative = [IO.Path]::GetRelativePath($resolvedSource, $item.FullName).Replace('\', '/')
            $physicalEntries.Add([pscustomobject]@{
                Path = "$name/$relative"
                Hash = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
            })
        }
    }

    $allPhysical = @($physicalEntries)
    $allGoverned = @($allPhysical | Where-Object { ($_.Path -split '/') -notcontains '__pycache__' })
    $allExcluded = [string[]]@($allPhysical | Where-Object {
        ($_.Path -split '/') -contains '__pycache__'
    } | ForEach-Object { $_.Path })
    [Array]::Sort($allExcluded, [StringComparer]::Ordinal)
    [pscustomobject]@{
        Physical = Get-CanonicalReviewInventory -Entries $allPhysical
        Governed = Get-CanonicalReviewInventory -Entries $allGoverned
        ExcludedPaths = $allExcluded
    }
}

function Test-ReviewInventoryIdentity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][object]$InventorySet,
        [Parameter(Mandatory)][int]$GovernedCount,
        [Parameter(Mandatory)][string]$GovernedSha256,
        [Parameter(Mandatory)][int]$PhysicalCount,
        [Parameter(Mandatory)][string]$PhysicalSha256
    )

    $InventorySet.Governed.Count -eq $GovernedCount -and
        (Test-ReviewOrdinalEqual -Left $InventorySet.Governed.Sha256 -Right $GovernedSha256.ToLowerInvariant()) -and
        $InventorySet.Physical.Count -eq $PhysicalCount -and
        (Test-ReviewOrdinalEqual -Left $InventorySet.Physical.Sha256 -Right $PhysicalSha256.ToLowerInvariant())
}

function Assert-ReviewInventoryIdentity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][object]$InventorySet,
        [Parameter(Mandatory)][int]$GovernedCount,
        [Parameter(Mandatory)][string]$GovernedSha256,
        [Parameter(Mandatory)][int]$PhysicalCount,
        [Parameter(Mandatory)][string]$PhysicalSha256,
        [string]$Label = 'inventory'
    )

    if (-not (Test-ReviewInventoryIdentity -InventorySet $InventorySet `
            -GovernedCount $GovernedCount -GovernedSha256 $GovernedSha256 `
            -PhysicalCount $PhysicalCount -PhysicalSha256 $PhysicalSha256)) {
        throw "$Label identity mismatch"
    }
}

function New-ReviewIdentitySummary {
    param(
        [Parameter(Mandatory)][object]$SourceSet,
        [AllowNull()][object]$FinalSet
    )

    [ordered]@{
        governed_source_count = $SourceSet.Governed.Count
        governed_source_sha256 = $SourceSet.Governed.Sha256
        physical_source_count = $SourceSet.Physical.Count
        physical_source_sha256 = $SourceSet.Physical.Sha256
        governed_final_count = if ($null -eq $FinalSet) { $null } else { $FinalSet.Governed.Count }
        governed_final_sha256 = if ($null -eq $FinalSet) { $null } else { $FinalSet.Governed.Sha256 }
        physical_final_count = if ($null -eq $FinalSet) { $null } else { $FinalSet.Physical.Count }
        physical_final_sha256 = if ($null -eq $FinalSet) { $null } else { $FinalSet.Physical.Sha256 }
    }
}

function Get-ReviewValidatedRepoSources {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$RepoRoot,
        [string[]]$SourceNames = $script:ReviewSourceNames
    )

    $repoFull = Get-ReviewNormalizedFullPath -Path $RepoRoot
    $resolvedRepo = Assert-ReviewDirectoryRoot -Root $repoFull -Label 'repo'
    if (-not (Test-ReviewOrdinalEqual -Left $resolvedRepo -Right $repoFull)) {
        throw 'repo root path mismatch'
    }
    $sourceParentExpected = Get-ReviewNormalizedFullPath -Path (Join-Path $resolvedRepo $script:ReviewSourceRelativeParent)
    $sourceParent = Assert-ReviewDirectoryRoot -Root $sourceParentExpected -Label 'source parent'
    if (-not (Test-ReviewOrdinalEqual -Left $sourceParent -Right $sourceParentExpected)) {
        throw 'source parent path mismatch'
    }
    if ($SourceNames.Count -ne $script:ReviewSourceNames.Count) {
        throw 'source name set mismatch'
    }
    for ($index = 0; $index -lt $script:ReviewSourceNames.Count; $index++) {
        if (-not (Test-ReviewOrdinalEqual -Left $SourceNames[$index] -Right $script:ReviewSourceNames[$index])) {
            throw 'source name set mismatch'
        }
    }
    $sourceSet = Get-ReviewNamedTreeInventorySet -ParentRoot $sourceParent -Names $SourceNames
    [pscustomobject]@{
        RepoRoot = $resolvedRepo
        SourceParent = $sourceParent
        SourceSet = $sourceSet
    }
}

function Get-ReviewValidatedBackupPaths {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$BackupRoot,
        [switch]$CreateParent
    )

    $backupFull = Get-ReviewNormalizedFullPath -Path $BackupRoot
    $backupParentFull = [IO.Path]::GetDirectoryName($backupFull)
    $null = Assert-ReviewDirectChild -Parent $backupParentFull -Child $backupFull -ExpectedName $script:ReviewTaskName -Label 'backup'

    if ($CreateParent -and -not (Test-ReviewPathPresent -Path $backupParentFull -PathType Container)) {
        $parentOfParent = [IO.Path]::GetDirectoryName($backupParentFull)
        $resolvedParentOfParent = Assert-ReviewDirectoryRoot -Root $parentOfParent -Label 'backup ancestor'
        if (-not (Test-ReviewOrdinalEqual -Left $resolvedParentOfParent -Right $parentOfParent)) {
            throw 'backup ancestor path mismatch'
        }
        $null = New-Item -ItemType Directory -Path $backupParentFull -ErrorAction Stop
    }

    $resolvedBackupParent = Assert-ReviewDirectoryRoot -Root $backupParentFull -Label 'backup parent'
    if (-not (Test-ReviewOrdinalEqual -Left $resolvedBackupParent -Right $backupParentFull)) {
        throw 'backup parent path mismatch'
    }
    [pscustomobject]@{
        Parent = $resolvedBackupParent
        Root = $backupFull
    }
}

function Get-ReviewFixedBackupRoot {
    [CmdletBinding()]
    param()

    if ([string]::IsNullOrWhiteSpace($env:USERPROFILE)) { throw 'USERPROFILE is required' }
    Get-ReviewNormalizedFullPath -Path (Join-Path $env:USERPROFILE ".claude-skill-backup/$($script:ReviewTaskName)")
}

function Assert-ReviewFixedBackupFinalIdentity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ExpectedFinalSha256,
        [Parameter(Mandatory)][string]$ExpectedPhysicalFinalSha256,
        [AllowNull()][object]$MutationLock
    )

    $ownedLock = $null
    try {
        $fixedRoot = Get-ReviewFixedBackupRoot
        $paths = Get-ReviewValidatedBackupPaths -BackupRoot $fixedRoot
        if ($null -eq $MutationLock) {
            $ownedLock = Enter-ReviewMutationLock -BackupParent $paths.Parent
        }
        else {
            $expectedLockPath = Assert-ReviewDirectChild -Parent $paths.Parent `
                -Child (Join-Path $paths.Parent ".$($script:ReviewTaskName).mutation.lock") `
                -ExpectedName ".$($script:ReviewTaskName).mutation.lock" -Label 'provided mutation lock'
            if ($MutationLock.IsDisposed -or -not $MutationLock.Handle.CanRead -or
                -not (Test-ReviewOrdinalEqual -Left (Get-ReviewNormalizedFullPath -Path $MutationLock.LockPath) -Right $expectedLockPath)) {
                throw 'provided mutation lock is not active for the fixed backup'
            }
        }
        $resolvedRoot = Assert-ReviewNoReparse -Root $paths.Root -Label 'fixed backup'
        if (-not (Test-ReviewOrdinalEqual -Left $resolvedRoot -Right $fixedRoot)) {
            throw 'fixed backup path mismatch'
        }
        $set = Get-ReviewInventorySet -Root $resolvedRoot
        Assert-ReviewInventoryIdentity -InventorySet $set `
            -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $ExpectedFinalSha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $ExpectedPhysicalFinalSha256 `
            -Label 'fixed backup final'
        [pscustomobject]@{
            governed_final_count = $set.Governed.Count
            governed_final_sha256 = $set.Governed.Sha256
            physical_final_count = $set.Physical.Count
            physical_final_sha256 = $set.Physical.Sha256
        }
    }
    finally {
        if ($null -ne $ownedLock) { $ownedLock.Dispose() }
    }
}

function Initialize-ReviewBackup {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$RepoRoot,
        [Parameter(Mandatory)][string]$BackupRoot,
        [string[]]$SourceNames = $script:ReviewSourceNames,
        [scriptblock]$CopyTree = {
            param($Source, $DestinationParent)
            Copy-Item -LiteralPath $Source -Destination $DestinationParent -Recurse -Force -ErrorAction Stop
        }
    )

    $phase = 'validation'
    $ownedStaging = $null
    $sourceSet = $null
    $mutationLock = $null
    try {
        $backupPaths = Get-ReviewValidatedBackupPaths -BackupRoot $BackupRoot -CreateParent
        $phase = 'mutation-lock'
        $mutationLock = Enter-ReviewMutationLock -BackupParent $backupPaths.Parent
        $phase = 'validation'
        $sourceContext = Get-ReviewValidatedRepoSources -RepoRoot $RepoRoot -SourceNames $SourceNames
        $sourceSet = $sourceContext.SourceSet
        Assert-ReviewInventoryIdentity -InventorySet $sourceSet `
            -GovernedCount $script:ReviewExpectedGovernedSourceCount `
            -GovernedSha256 $sourceSet.Governed.Sha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalSourceCount `
            -PhysicalSha256 $sourceSet.Physical.Sha256 `
            -Label 'source'

        if (Test-ReviewPathPresent -Path $backupPaths.Root) {
            $existingRoot = Assert-ReviewNoReparse -Root $backupPaths.Root -Label 'backup'
            if (-not (Test-ReviewOrdinalEqual -Left $existingRoot -Right $backupPaths.Root)) {
                throw 'backup path mismatch'
            }
            $existingSet = Get-ReviewInventorySet -Root $existingRoot
            Assert-ReviewInventoryIdentity -InventorySet $existingSet `
                -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
                -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256 `
                -Label 'existing backup'
            $summary = New-ReviewIdentitySummary -SourceSet $sourceSet -FinalSet $null
            return [pscustomobject]($summary + [ordered]@{
                state = 'backup-verified-reused'
                failure_phase = $null
                failure_category = $null
                owned_staging_clean = $true
            })
        }

        $phase = 'create-staging'
        $stagingName = ".$($script:ReviewTaskName).staging-$([Guid]::NewGuid().ToString('N'))"
        $ownedStaging = Assert-ReviewDirectChild -Parent $backupPaths.Parent -Child (Join-Path $backupPaths.Parent $stagingName) -ExpectedName $stagingName -Label 'staging'
        $null = New-Item -ItemType Directory -Path $ownedStaging -ErrorAction Stop
        $null = Assert-ReviewNoReparse -Root $ownedStaging -Label 'staging'

        $phase = 'copy'
        foreach ($name in $SourceNames) {
            $source = Assert-ReviewDirectChild -Parent $sourceContext.SourceParent -Child (Join-Path $sourceContext.SourceParent $name) -ExpectedName $name -Label 'source'
            $null = & $CopyTree $source $ownedStaging
        }

        $phase = 'verify-staging'
        $stagingSet = Get-ReviewInventorySet -Root $ownedStaging
        Assert-ReviewInventoryIdentity -InventorySet $stagingSet `
            -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
            -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256 `
            -Label 'staging'

        $phase = 'finalize'
        Move-Item -LiteralPath $ownedStaging -Destination $backupPaths.Root -ErrorAction Stop
        $ownedStaging = $null
        $finalRoot = Assert-ReviewNoReparse -Root $backupPaths.Root -Label 'backup'
        if (-not (Test-ReviewOrdinalEqual -Left $finalRoot -Right $backupPaths.Root)) {
            throw 'backup final path mismatch'
        }
        $finalSet = Get-ReviewInventorySet -Root $finalRoot
        Assert-ReviewInventoryIdentity -InventorySet $finalSet `
            -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
            -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256 `
            -Label 'final backup'
        $summary = New-ReviewIdentitySummary -SourceSet $sourceSet -FinalSet $null
        [pscustomobject]($summary + [ordered]@{
            state = 'backup-prepared'
            failure_phase = $null
            failure_category = $null
            owned_staging_clean = $true
        })
    }
    catch {
        $category = $_.Exception.GetType().FullName
        $stagingClean = $true
        if ($null -ne $ownedStaging -and (Test-ReviewPathPresent -Path $ownedStaging)) {
            try {
                $backupParent = [IO.Path]::GetDirectoryName($ownedStaging)
                $expectedStaging = Assert-ReviewDirectChild -Parent $backupParent -Child $ownedStaging -ExpectedName ([IO.Path]::GetFileName($ownedStaging)) -Label 'owned staging'
                $null = Assert-ReviewNoReparse -Root $expectedStaging -Label 'owned staging'
                Remove-Item -LiteralPath $expectedStaging -Recurse -Force -ErrorAction Stop
            }
            catch {
                $stagingClean = $false
            }
        }
        $empty = [pscustomobject]@{
            Governed = [pscustomobject]@{ Count = $null; Sha256 = $null }
            Physical = [pscustomobject]@{ Count = $null; Sha256 = $null }
        }
        $summary = New-ReviewIdentitySummary -SourceSet $(if ($null -eq $sourceSet) { $empty } else { $sourceSet }) -FinalSet $null
        [pscustomobject]($summary + [ordered]@{
            state = 'backup-preparation-recovery-required'
            failure_phase = $phase
            failure_category = $category
            owned_staging_clean = $stagingClean
        })
    }
    finally {
        if ($null -ne $mutationLock) { $mutationLock.Dispose() }
    }
}

function Invoke-ReviewSourceRemoval {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$RepoRoot,
        [Parameter(Mandatory)][string]$BackupRoot,
        [Parameter(Mandatory)][string]$ExpectedSourceSha256,
        [Parameter(Mandatory)][string]$ExpectedPhysicalSourceSha256,
        [Parameter(Mandatory)][string]$ExpectedFinalSha256,
        [Parameter(Mandatory)][string]$ExpectedPhysicalFinalSha256,
        [string[]]$SourceNames = $script:ReviewSourceNames,
        [scriptblock]$CopyTree = {
            param($Source, $DestinationParent)
            Copy-Item -LiteralPath $Source -Destination $DestinationParent -Recurse -Force -ErrorAction Stop
        },
        [scriptblock]$RemoveTree = {
            param($Target)
            Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
        },
        [scriptblock]$PostDeleteProbe = {
            param($Target)
            Get-ReviewPathProbe -Path $Target
        }
    )

    $phase = 'validation'
    $failedSourceIndex = $null
    $copyMode = $null
    $sourceContext = $null
    $sourceSet = $null
    $finalSet = $null
    $removedPath = $null
    $ownedRemovedStaging = $null
    $removedStagingClean = $true
    $mutationLock = $null
    try {
        $backupPaths = Get-ReviewValidatedBackupPaths -BackupRoot $BackupRoot
        $phase = 'mutation-lock'
        $mutationLock = Enter-ReviewMutationLock -BackupParent $backupPaths.Parent
        $phase = 'validation'
        $sourceContext = Get-ReviewValidatedRepoSources -RepoRoot $RepoRoot -SourceNames $SourceNames
        $sourceSet = $sourceContext.SourceSet
        Assert-ReviewInventoryIdentity -InventorySet $sourceSet `
            -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
            -Label 'source'

        $backupResolved = Assert-ReviewNoReparse -Root $backupPaths.Root -Label 'backup'
        if (-not (Test-ReviewOrdinalEqual -Left $backupResolved -Right $backupPaths.Root)) {
            throw 'backup path mismatch'
        }
        $removedPath = Assert-ReviewDirectChild -Parent $backupResolved -Child (Join-Path $backupResolved '.removed') -ExpectedName '.removed' -Label 'removed evidence'

        if (Test-ReviewPathPresent -Path $removedPath) {
            $phase = 'verify-reused-removed'
            $null = Assert-ReviewNoReparse -Root $removedPath -Label 'removed evidence'
            $finalSet = Get-ReviewInventorySet -Root $backupResolved
            Assert-ReviewInventoryIdentity -InventorySet $finalSet `
                -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $ExpectedFinalSha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $ExpectedPhysicalFinalSha256 `
                -Label 'reused final backup'
            $removedSet = Get-ReviewInventorySet -Root $removedPath
            Assert-ReviewInventoryIdentity -InventorySet $removedSet `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
                -Label 'removed evidence'
            $copyMode = 'verified-reused'
        }
        else {
            $phase = 'verify-initial-backup'
            $initialBackupSet = Get-ReviewInventorySet -Root $backupResolved
            Assert-ReviewInventoryIdentity -InventorySet $initialBackupSet `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
                -Label 'initial backup'

            $phase = 'prepare-removed-staging'
            $removedStagingName = ".removed.staging-$([Guid]::NewGuid().ToString('N'))"
            $ownedRemovedStaging = Assert-ReviewDirectChild -Parent $backupResolved `
                -Child (Join-Path $backupResolved $removedStagingName) -ExpectedName $removedStagingName `
                -Label 'removed staging'
            $null = New-Item -ItemType Directory -Path $ownedRemovedStaging -ErrorAction Stop
            $null = Assert-ReviewNoReparse -Root $ownedRemovedStaging -Label 'removed staging'
            try {
                foreach ($name in $SourceNames) {
                    $source = Assert-ReviewDirectChild -Parent $sourceContext.SourceParent -Child (Join-Path $sourceContext.SourceParent $name) -ExpectedName $name -Label 'source'
                    $null = & $CopyTree $source $ownedRemovedStaging
                }
                $stagedRemovedSet = Get-ReviewInventorySet -Root $ownedRemovedStaging
                Assert-ReviewInventoryIdentity -InventorySet $stagedRemovedSet `
                    -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
                    -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
                    -Label 'removed staging'
                if (Test-ReviewPathPresent -Path $removedPath) { throw 'removed evidence appeared during preparation' }
                Move-Item -LiteralPath $ownedRemovedStaging -Destination $removedPath -ErrorAction Stop
                $ownedRemovedStaging = $null
                $null = Assert-ReviewNoReparse -Root $removedPath -Label 'removed evidence'
                $finalSet = Get-ReviewInventorySet -Root $backupResolved
                Assert-ReviewInventoryIdentity -InventorySet $finalSet `
                    -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $ExpectedFinalSha256 `
                    -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $ExpectedPhysicalFinalSha256 `
                    -Label 'prepared final backup'
                $copyMode = 'prepared'
            }
            catch {
                try {
                    if ($null -ne $ownedRemovedStaging -and (Test-ReviewPathPresent -Path $ownedRemovedStaging)) {
                        $null = Assert-ReviewNoReparse -Root $ownedRemovedStaging -Label 'owned removed staging'
                        Remove-Item -LiteralPath $ownedRemovedStaging -Recurse -Force -ErrorAction Stop
                    }
                }
                catch {
                    $removedStagingClean = $false
                }
                throw
            }
        }

        $phase = 'delete'
        for ($index = 0; $index -lt $SourceNames.Count; $index++) {
            $failedSourceIndex = $index
            $name = $SourceNames[$index]
            $source = Assert-ReviewDirectChild -Parent $sourceContext.SourceParent -Child (Join-Path $sourceContext.SourceParent $name) -ExpectedName $name -Label 'source'
            $null = & $RemoveTree $source
            if (Test-ReviewPathPresent -Path $source) {
                throw 'source removal did not complete'
            }
        }
        $failedSourceIndex = $null

        $phase = 'post-delete-check'
        foreach ($name in $SourceNames) {
            $postDeleteProbeResult = & $PostDeleteProbe (Join-Path $sourceContext.SourceParent $name)
            if ($null -eq $postDeleteProbeResult -or $postDeleteProbeResult.status -notin @('present', 'missing')) {
                throw [IO.IOException]::new('post-delete probe returned an invalid state')
            }
            if ($postDeleteProbeResult.status -eq 'present') {
                throw 'source remained after removal'
            }
        }
        $finalSet = Get-ReviewInventorySet -Root $backupResolved
        Assert-ReviewInventoryIdentity -InventorySet $finalSet `
            -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $ExpectedFinalSha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $ExpectedPhysicalFinalSha256 `
            -Label 'post-removal backup'
        $summary = New-ReviewIdentitySummary -SourceSet $sourceSet -FinalSet $finalSet
        [pscustomobject]($summary + [ordered]@{
            state = 'removed'
            removed_copy_mode = $copyMode
            failed_source_index = $null
            failure_phase = $null
            failure_category = $null
            owned_removed_staging_clean = $true
            source_presence = @($SourceNames | ForEach-Object {
                [pscustomobject]@{ source = $_; status = 'missing' }
            })
        })
    }
    catch {
        $originalException = $_.Exception
        $originalCategory = $originalException.GetType().FullName
        $failurePhase = $phase
        $removedProbe = if ($null -eq $removedPath) {
            [pscustomobject]@{ status = 'unknown'; probe_category = 'removed-path-unavailable' }
        }
        else {
            Get-ReviewPathProbe -Path $removedPath
        }
        if ($failurePhase -in @('delete', 'post-delete-check') -and $removedProbe.status -eq 'present') {
            $phase = 'recovery-validation'
            try {
                $backupResolved = Assert-ReviewNoReparse -Root $BackupRoot -Label 'recovery backup'
                $finalSet = Get-ReviewInventorySet -Root $backupResolved
                Assert-ReviewInventoryIdentity -InventorySet $finalSet `
                    -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $ExpectedFinalSha256 `
                    -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $ExpectedPhysicalFinalSha256 `
                    -Label 'recovery final backup'
                $removedSet = Get-ReviewInventorySet -Root $removedPath
                Assert-ReviewInventoryIdentity -InventorySet $removedSet `
                    -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
                    -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
                    -Label 'recovery evidence'

                $phase = 'restore'
                foreach ($name in $SourceNames) {
                    $target = Assert-ReviewDirectChild -Parent $sourceContext.SourceParent -Child (Join-Path $sourceContext.SourceParent $name) -ExpectedName $name -Label 'restore target'
                    if (Test-ReviewPathPresent -Path $target) {
                        $null = Assert-ReviewNoReparse -Root $target -Label 'restore target'
                        Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
                    }
                    $restoreSource = Assert-ReviewDirectChild -Parent $removedPath -Child (Join-Path $removedPath $name) -ExpectedName $name -Label 'restore source'
                    $null = Assert-ReviewNoReparse -Root $restoreSource -Label 'restore source'
                    $null = & $CopyTree $restoreSource $sourceContext.SourceParent
                }
                $phase = 'verify-restored'
                $restoredSet = Get-ReviewNamedTreeInventorySet -ParentRoot $sourceContext.SourceParent -Names $SourceNames
                Assert-ReviewInventoryIdentity -InventorySet $restoredSet `
                    -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $ExpectedSourceSha256 `
                    -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $ExpectedPhysicalSourceSha256 `
                    -Label 'restored source'
                $summary = New-ReviewIdentitySummary -SourceSet $restoredSet -FinalSet $finalSet
                return [pscustomobject]($summary + [ordered]@{
                    state = 'source_removal_failed_recovered'
                    removed_copy_mode = $copyMode
                    failed_source_index = $failedSourceIndex
                    failure_phase = $failurePhase
                    failure_category = $originalCategory
                    owned_removed_staging_clean = $removedStagingClean
                    source_presence = @($SourceNames | ForEach-Object {
                        [pscustomobject]@{ source = $_; status = 'present' }
                    })
                })
            }
            catch {
                $originalCategory = $_.Exception.GetType().FullName
            }
        }

        $presence = @()
        if ($null -ne $sourceContext) {
            foreach ($name in $SourceNames) {
                $sourceProbe = Get-ReviewPathProbe -Path (Join-Path $sourceContext.SourceParent $name)
                $presence += [pscustomobject]@{
                    source = $name
                    status = $sourceProbe.status
                    probe_category = $sourceProbe.probe_category
                }
            }
        }
        $empty = [pscustomobject]@{
            Governed = [pscustomobject]@{ Count = $null; Sha256 = $null }
            Physical = [pscustomobject]@{ Count = $null; Sha256 = $null }
        }
        $summary = New-ReviewIdentitySummary -SourceSet $(if ($null -eq $sourceSet) { $empty } else { $sourceSet }) -FinalSet $finalSet
        [pscustomobject]($summary + [ordered]@{
            state = 'source_removal_recovery_required'
            removed_copy_mode = $copyMode
            failed_source_index = $failedSourceIndex
            failure_phase = $phase
            failure_category = $originalCategory
            source_presence = $presence
            removed_probe_status = $removedProbe.status
            removed_probe_category = $removedProbe.probe_category
            owned_removed_staging_clean = $removedStagingClean
        })
    }
    finally {
        if ($null -ne $mutationLock) { $mutationLock.Dispose() }
    }
}

function Write-ReviewFixtureFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content
    )

    $parent = [IO.Path]::GetDirectoryName($Path)
    if (-not (Test-ReviewPathPresent -Path $parent -PathType Container)) {
        $null = New-Item -ItemType Directory -Path $parent -Force -ErrorAction Stop
    }
    [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function New-ReviewSelfTestRepository {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Root)

    $repo = Join-Path $Root 'repo'
    $sourceParent = Join-Path $repo $script:ReviewSourceRelativeParent
    $doctor = Join-Path $sourceParent 'skill-doctor'
    $update = Join-Path $sourceParent 'update-skill'
    $null = New-Item -ItemType Directory -Path $doctor -Force -ErrorAction Stop
    $null = New-Item -ItemType Directory -Path $update -Force -ErrorAction Stop

    for ($index = 1; $index -le 12; $index++) {
        Write-ReviewFixtureFile -Path (Join-Path $doctor ("governed-{0:d2}.txt" -f $index)) -Content "doctor-$index"
    }
    Write-ReviewFixtureFile -Path (Join-Path $update 'SKILL.md') -Content 'update-skill'
    Write-ReviewFixtureFile -Path (Join-Path $update 'reference.md') -Content 'update-reference'
    for ($index = 1; $index -le 3; $index++) {
        Write-ReviewFixtureFile -Path (Join-Path $doctor ("scripts/__pycache__/cache-$index.pyc")) -Content "cache-$index"
    }
    (Get-ReviewValidatedRepoSources -RepoRoot $repo)
}

function New-ReviewVirtualFinalInventory {
    [CmdletBinding()]
    param([Parameter(Mandatory)][object]$SourceSet)

    $governedEntries = @($SourceSet.Governed.Entries | ForEach-Object {
        $_
        [pscustomobject]@{ Path = ".removed/$($_.Path)"; Hash = $_.Hash }
    })
    $physicalEntries = @($SourceSet.Physical.Entries | ForEach-Object {
        $_
        [pscustomobject]@{ Path = ".removed/$($_.Path)"; Hash = $_.Hash }
    })
    [pscustomobject]@{
        Governed = Get-CanonicalReviewInventory -Entries $governedEntries
        Physical = Get-CanonicalReviewInventory -Entries $physicalEntries
    }
}

function Invoke-ReviewBackupSelfTest {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$FixtureRoot)

    $context = New-ReviewSelfTestRepository -Root $FixtureRoot
    $sourceSet = $context.SourceSet
    $results = [ordered]@{
        first_copy_failure_clean = $false
        second_copy_failure_clean = $false
        success_prepared = $false
        verified_reused = $false
        unexpected_pycache_physical_drift_rejected = $false
        first_copy_call_count_exact = $false
        second_copy_call_count_exact = $false
        source_identity_preserved = $true
        prepared_identity_verified = $false
        reused_identity_verified = $false
        lock_contention_rejected = $false
        lock_cleanup_verified = $false
    }

    foreach ($failureAt in @(1, 2)) {
        $parent = Join-Path $FixtureRoot "backup-failure-$failureAt"
        $null = New-Item -ItemType Directory -Path $parent -ErrorAction Stop
        $target = Join-Path $parent $script:ReviewTaskName
        $state = [pscustomobject]@{ Calls = 0 }
        $shim = {
            param($Source, $DestinationParent)
            $state.Calls++
            if ($state.Calls -eq $failureAt) { throw "injected copy failure $failureAt" }
            Copy-Item -LiteralPath $Source -Destination $DestinationParent -Recurse -Force -ErrorAction Stop
        }.GetNewClosure()
        $outcome = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $target -CopyTree $shim
        $staging = @(Get-ChildItem -LiteralPath $parent -Force -ErrorAction Stop |
            Where-Object { $_.Name.StartsWith(".$($script:ReviewTaskName).staging-", [StringComparison]::Ordinal) })
        $clean = $outcome.state -eq 'backup-preparation-recovery-required' -and
            -not (Test-ReviewPathPresent -Path $target) -and $staging.Count -eq 0 -and $outcome.owned_staging_clean
        $currentSource = Get-ReviewNamedTreeInventorySet -ParentRoot $context.SourceParent -Names $script:ReviewSourceNames
        $results.source_identity_preserved = $results.source_identity_preserved -and
            (Test-ReviewInventoryIdentity -InventorySet $currentSource `
                -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
                -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256)
        if ($failureAt -eq 1) {
            $results.first_copy_failure_clean = $clean
            $results.first_copy_call_count_exact = $state.Calls -eq 1
        }
        else {
            $results.second_copy_failure_clean = $clean
            $results.second_copy_call_count_exact = $state.Calls -eq 2
        }
    }

    $successParent = Join-Path $FixtureRoot 'backup-success'
    $null = New-Item -ItemType Directory -Path $successParent -ErrorAction Stop
    $successTarget = Join-Path $successParent $script:ReviewTaskName
    $prepared = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $successTarget
    $results.success_prepared = $prepared.state -eq 'backup-prepared'
    $preparedSet = Get-ReviewInventorySet -Root $successTarget
    $results.prepared_identity_verified = Test-ReviewInventoryIdentity -InventorySet $preparedSet `
        -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
        -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256
    $reused = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $successTarget
    $results.verified_reused = $reused.state -eq 'backup-verified-reused'
    $reusedSet = Get-ReviewInventorySet -Root $successTarget
    $results.reused_identity_verified = Test-ReviewInventoryIdentity -InventorySet $reusedSet `
        -GovernedCount $sourceSet.Governed.Count -GovernedSha256 $sourceSet.Governed.Sha256 `
        -PhysicalCount $sourceSet.Physical.Count -PhysicalSha256 $sourceSet.Physical.Sha256

    $lockParent = Join-Path $FixtureRoot 'backup-lock-contention'
    $null = New-Item -ItemType Directory -Path $lockParent -ErrorAction Stop
    $lockTarget = Join-Path $lockParent $script:ReviewTaskName
    $heldLock = Enter-ReviewMutationLock -BackupParent $lockParent
    try {
        $contended = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $lockTarget
        $results.lock_contention_rejected = $contended.state -eq 'backup-preparation-recovery-required' -and
            $contended.failure_phase -eq 'mutation-lock' -and -not (Test-ReviewPathPresent -Path $lockTarget)
    }
    finally {
        $heldLock.Dispose()
    }
    $results.lock_cleanup_verified = $heldLock.CleanupSucceeded -and
        -not (Test-ReviewPathPresent -Path $heldLock.LockPath)

    $driftPath = Join-Path $successTarget 'skill-doctor/scripts/__pycache__/unexpected.bin'
    Write-ReviewFixtureFile -Path $driftPath -Content 'unexpected'
    $driftSet = Get-ReviewInventorySet -Root $successTarget
    $driftedOnlyPhysically = $driftSet.Governed.Sha256 -eq $sourceSet.Governed.Sha256 -and
        $driftSet.Physical.Sha256 -ne $sourceSet.Physical.Sha256
    $driftOutcome = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $successTarget
    $results.unexpected_pycache_physical_drift_rejected = $driftedOnlyPhysically -and
        $driftOutcome.state -eq 'backup-preparation-recovery-required'
    [pscustomobject]$results
}

function New-ReviewPreparedRemovalFixture {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Root)

    $context = New-ReviewSelfTestRepository -Root $Root
    $backupParent = Join-Path $Root 'backup'
    $null = New-Item -ItemType Directory -Path $backupParent -ErrorAction Stop
    $backupRoot = Join-Path $backupParent $script:ReviewTaskName
    $prepared = Initialize-ReviewBackup -RepoRoot $context.RepoRoot -BackupRoot $backupRoot
    if ($prepared.state -ne 'backup-prepared') { throw 'self-test backup preparation failed' }
    $virtual = New-ReviewVirtualFinalInventory -SourceSet $context.SourceSet
    [pscustomobject]@{
        Context = $context
        BackupRoot = $backupRoot
        SourceSet = $context.SourceSet
        VirtualFinal = $virtual
    }
}

function Invoke-ReviewRemovalSelfTest {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$FixtureRoot)

    $results = [ordered]@{
        first_failure_recovered = $false
        second_failure_recovered = $false
        verified_reused_retry = $true
        unexpected_pycache_physical_drift_rejected = $false
        removed_reuse_drift_rejected = $false
        recovery_acceptance_drift_rejected = $false
        cleanup_proof_drift_rejected = $false
        shim_call_counts_exact = $true
        restored_source_identity_verified = $true
        backup_final_identity_verified = $true
        removed_identity_verified = $true
        source_absence_verified = $true
        removed_staging_clean = $true
        removed_copy_failure_staging_clean = $false
        removal_lock_contention_rejected = $false
        removal_lock_contention_source_identity_unchanged = $false
        removal_lock_contention_final_identity_unchanged = $false
        removal_lock_contention_staging_unchanged = $false
        removal_lock_cleanup_verified = $false
        retry_chain_verified = $true
        post_delete_probe_failure_recovered = $false
    }

    $copyFailureFixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot 'removed-copy-failure')
    $copyFailureArgs = @{
        RepoRoot = $copyFailureFixture.Context.RepoRoot
        BackupRoot = $copyFailureFixture.BackupRoot
        ExpectedSourceSha256 = $copyFailureFixture.SourceSet.Governed.Sha256
        ExpectedPhysicalSourceSha256 = $copyFailureFixture.SourceSet.Physical.Sha256
        ExpectedFinalSha256 = $copyFailureFixture.VirtualFinal.Governed.Sha256
        ExpectedPhysicalFinalSha256 = $copyFailureFixture.VirtualFinal.Physical.Sha256
    }
    $copyFailureState = [pscustomobject]@{ Calls = 0 }
    $copyFailureShim = {
        param($Source, $DestinationParent)
        $copyFailureState.Calls++
        if ($copyFailureState.Calls -eq 2) { throw 'injected removed staging copy failure' }
        Copy-Item -LiteralPath $Source -Destination $DestinationParent -Recurse -Force -ErrorAction Stop
    }.GetNewClosure()
    $copyFailureOutcome = Invoke-ReviewSourceRemoval @copyFailureArgs -CopyTree $copyFailureShim
    $copyFailureStaging = @(Get-ChildItem -LiteralPath $copyFailureFixture.BackupRoot -Force -ErrorAction Stop |
        Where-Object { $_.Name.StartsWith('.removed.staging-', [StringComparison]::Ordinal) })
    $copyFailureSource = Get-ReviewNamedTreeInventorySet -ParentRoot $copyFailureFixture.Context.SourceParent -Names $script:ReviewSourceNames
    $copyFailureBackup = Get-ReviewInventorySet -Root $copyFailureFixture.BackupRoot
    $results.removed_copy_failure_staging_clean = $copyFailureOutcome.state -eq 'source_removal_recovery_required' -and
        $copyFailureOutcome.owned_removed_staging_clean -and $copyFailureState.Calls -eq 2 -and
        $copyFailureStaging.Count -eq 0 -and -not (Test-ReviewPathPresent -Path (Join-Path $copyFailureFixture.BackupRoot '.removed')) -and
        (Test-ReviewInventoryIdentity -InventorySet $copyFailureSource `
            -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $copyFailureFixture.SourceSet.Governed.Sha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $copyFailureFixture.SourceSet.Physical.Sha256) -and
        (Test-ReviewInventoryIdentity -InventorySet $copyFailureBackup `
            -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $copyFailureFixture.SourceSet.Governed.Sha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $copyFailureFixture.SourceSet.Physical.Sha256)

    $lockFixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot 'removal-lock-contention')
    $lockArgs = @{
        RepoRoot = $lockFixture.Context.RepoRoot
        BackupRoot = $lockFixture.BackupRoot
        ExpectedSourceSha256 = $lockFixture.SourceSet.Governed.Sha256
        ExpectedPhysicalSourceSha256 = $lockFixture.SourceSet.Physical.Sha256
        ExpectedFinalSha256 = $lockFixture.VirtualFinal.Governed.Sha256
        ExpectedPhysicalFinalSha256 = $lockFixture.VirtualFinal.Physical.Sha256
    }
    $prepareRemovedFailure = { param($Target); throw 'prepare verified removal evidence without deleting source' }
    $preparedRemoved = Invoke-ReviewSourceRemoval @lockArgs -RemoveTree $prepareRemovedFailure
    if ($preparedRemoved.state -ne 'source_removal_failed_recovered') {
        throw 'removal lock self-test could not prepare verified removed evidence'
    }
    $lockSourceBefore = Get-ReviewNamedTreeInventorySet -ParentRoot $lockFixture.Context.SourceParent -Names $script:ReviewSourceNames
    $lockFinalBefore = Get-ReviewInventorySet -Root $lockFixture.BackupRoot
    $lockRemovedBefore = Get-ReviewInventorySet -Root (Join-Path $lockFixture.BackupRoot '.removed')
    $lockStagingBefore = @(
        Get-ChildItem -LiteralPath $lockFixture.BackupRoot -Force -ErrorAction Stop |
            Where-Object { $_.Name.StartsWith('.removed.staging-', [StringComparison]::Ordinal) } |
            ForEach-Object { $_.Name }
    )
    $lockParent = [IO.Path]::GetDirectoryName($lockFixture.BackupRoot)
    $heldRemovalLock = Enter-ReviewMutationLock -BackupParent $lockParent
    try {
        $contendedRemoval = Invoke-ReviewSourceRemoval @lockArgs
        $lockSourceAfter = Get-ReviewNamedTreeInventorySet -ParentRoot $lockFixture.Context.SourceParent -Names $script:ReviewSourceNames
        $lockFinalAfter = Get-ReviewInventorySet -Root $lockFixture.BackupRoot
        $lockRemovedAfter = Get-ReviewInventorySet -Root (Join-Path $lockFixture.BackupRoot '.removed')
        $lockStagingAfter = @(
            Get-ChildItem -LiteralPath $lockFixture.BackupRoot -Force -ErrorAction Stop |
                Where-Object { $_.Name.StartsWith('.removed.staging-', [StringComparison]::Ordinal) } |
                ForEach-Object { $_.Name }
        )
        $results.removal_lock_contention_rejected =
            $contendedRemoval.state -eq 'source_removal_recovery_required' -and
            $contendedRemoval.failure_phase -eq 'mutation-lock'
        $results.removal_lock_contention_source_identity_unchanged =
            (Test-ReviewInventoryIdentity -InventorySet $lockSourceBefore `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $lockFixture.SourceSet.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $lockFixture.SourceSet.Physical.Sha256) -and
            $lockSourceAfter.Governed.Sha256 -eq $lockSourceBefore.Governed.Sha256 -and
            $lockSourceAfter.Physical.Sha256 -eq $lockSourceBefore.Physical.Sha256
        $results.removal_lock_contention_final_identity_unchanged =
            (Test-ReviewInventoryIdentity -InventorySet $lockFinalBefore `
                -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $lockFixture.VirtualFinal.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $lockFixture.VirtualFinal.Physical.Sha256) -and
            $lockFinalAfter.Governed.Sha256 -eq $lockFinalBefore.Governed.Sha256 -and
            $lockFinalAfter.Physical.Sha256 -eq $lockFinalBefore.Physical.Sha256 -and
            (Test-ReviewInventoryIdentity -InventorySet $lockRemovedAfter `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $lockRemovedBefore.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $lockRemovedBefore.Physical.Sha256)
        $results.removal_lock_contention_staging_unchanged =
            $lockStagingBefore.Count -eq 0 -and $lockStagingAfter.Count -eq 0
    }
    finally {
        $heldRemovalLock.Dispose()
    }
    $results.removal_lock_cleanup_verified = $heldRemovalLock.CleanupSucceeded -and
        -not (Test-ReviewPathPresent -Path $heldRemovalLock.LockPath)

    foreach ($failureAt in @(1, 2)) {
        $fixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot "remove-failure-$failureAt")
        $state = [pscustomobject]@{ Calls = 0 }
        $shim = {
            param($Target)
            $state.Calls++
            if ($state.Calls -eq $failureAt) { throw "injected remove failure $failureAt" }
            Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
        }.GetNewClosure()
        $args = @{
            RepoRoot = $fixture.Context.RepoRoot
            BackupRoot = $fixture.BackupRoot
            ExpectedSourceSha256 = $fixture.SourceSet.Governed.Sha256
            ExpectedPhysicalSourceSha256 = $fixture.SourceSet.Physical.Sha256
            ExpectedFinalSha256 = $fixture.VirtualFinal.Governed.Sha256
            ExpectedPhysicalFinalSha256 = $fixture.VirtualFinal.Physical.Sha256
        }
        $failed = Invoke-ReviewSourceRemoval @args -RemoveTree $shim
        $restoredSet = Get-ReviewNamedTreeInventorySet -ParentRoot $fixture.Context.SourceParent -Names $script:ReviewSourceNames
        $finalSet = Get-ReviewInventorySet -Root $fixture.BackupRoot
        $removedSet = Get-ReviewInventorySet -Root (Join-Path $fixture.BackupRoot '.removed')
        $restored = $failed.state -eq 'source_removal_failed_recovered' -and
            $failed.failed_source_index -eq ($failureAt - 1) -and
            $failed.removed_copy_mode -eq 'prepared' -and
            (Test-ReviewPathPresent -Path (Join-Path $fixture.BackupRoot '.removed'))
        $results.shim_call_counts_exact = $results.shim_call_counts_exact -and $state.Calls -eq $failureAt
        $results.restored_source_identity_verified = $results.restored_source_identity_verified -and
            (Test-ReviewInventoryIdentity -InventorySet $restoredSet `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $fixture.SourceSet.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $fixture.SourceSet.Physical.Sha256)
        $results.backup_final_identity_verified = $results.backup_final_identity_verified -and
            (Test-ReviewInventoryIdentity -InventorySet $finalSet `
                -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $fixture.VirtualFinal.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $fixture.VirtualFinal.Physical.Sha256)
        $results.removed_identity_verified = $results.removed_identity_verified -and
            (Test-ReviewInventoryIdentity -InventorySet $removedSet `
                -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $fixture.SourceSet.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $fixture.SourceSet.Physical.Sha256)
        if ($failureAt -eq 1) { $results.first_failure_recovered = $restored }
        else { $results.second_failure_recovered = $restored }

        $retry = Invoke-ReviewSourceRemoval @args
        $retryFinal = Get-ReviewInventorySet -Root $fixture.BackupRoot
        $retryMissing = $true
        foreach ($name in $script:ReviewSourceNames) {
            $retryMissing = $retryMissing -and -not (Test-ReviewPathPresent -Path (Join-Path $fixture.Context.SourceParent $name))
        }
        $retryVerified = $retry.state -eq 'removed' -and $retry.removed_copy_mode -eq 'verified-reused' -and
            $retryMissing -and (Test-ReviewInventoryIdentity -InventorySet $retryFinal `
                -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $fixture.VirtualFinal.Governed.Sha256 `
                -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $fixture.VirtualFinal.Physical.Sha256)
        $results.verified_reused_retry = $results.verified_reused_retry -and $retryVerified
        $results.retry_chain_verified = $results.retry_chain_verified -and $retryVerified
        $results.source_absence_verified = $results.source_absence_verified -and $retryMissing
        $removedStaging = @(Get-ChildItem -LiteralPath $fixture.BackupRoot -Force -ErrorAction Stop |
            Where-Object { $_.Name.StartsWith('.removed.staging-', [StringComparison]::Ordinal) })
        $results.removed_staging_clean = $results.removed_staging_clean -and $removedStaging.Count -eq 0
    }

    $probeFixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot 'post-delete-probe')
    $probeArgs = @{
        RepoRoot = $probeFixture.Context.RepoRoot
        BackupRoot = $probeFixture.BackupRoot
        ExpectedSourceSha256 = $probeFixture.SourceSet.Governed.Sha256
        ExpectedPhysicalSourceSha256 = $probeFixture.SourceSet.Physical.Sha256
        ExpectedFinalSha256 = $probeFixture.VirtualFinal.Governed.Sha256
        ExpectedPhysicalFinalSha256 = $probeFixture.VirtualFinal.Physical.Sha256
    }
    $probeShim = { param($Target); throw [IO.IOException]::new('injected post-delete probe failure') }
    $probeOutcome = Invoke-ReviewSourceRemoval @probeArgs -PostDeleteProbe $probeShim
    $probeRestored = Get-ReviewNamedTreeInventorySet -ParentRoot $probeFixture.Context.SourceParent -Names $script:ReviewSourceNames
    $probeFinal = Get-ReviewInventorySet -Root $probeFixture.BackupRoot
    $results.post_delete_probe_failure_recovered = $probeOutcome.state -eq 'source_removal_failed_recovered' -and
        $probeOutcome.failure_phase -eq 'post-delete-check' -and
        (Test-ReviewInventoryIdentity -InventorySet $probeRestored `
            -GovernedCount $script:ReviewExpectedGovernedSourceCount -GovernedSha256 $probeFixture.SourceSet.Governed.Sha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalSourceCount -PhysicalSha256 $probeFixture.SourceSet.Physical.Sha256) -and
        (Test-ReviewInventoryIdentity -InventorySet $probeFinal `
            -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $probeFixture.VirtualFinal.Governed.Sha256 `
            -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $probeFixture.VirtualFinal.Physical.Sha256)

    $driftFixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot 'removed-drift')
    $driftArgs = @{
        RepoRoot = $driftFixture.Context.RepoRoot
        BackupRoot = $driftFixture.BackupRoot
        ExpectedSourceSha256 = $driftFixture.SourceSet.Governed.Sha256
        ExpectedPhysicalSourceSha256 = $driftFixture.SourceSet.Physical.Sha256
        ExpectedFinalSha256 = $driftFixture.VirtualFinal.Governed.Sha256
        ExpectedPhysicalFinalSha256 = $driftFixture.VirtualFinal.Physical.Sha256
    }
    $removed = Join-Path $driftFixture.BackupRoot '.removed'
    $null = New-Item -ItemType Directory -Path $removed -ErrorAction Stop
    foreach ($name in $script:ReviewSourceNames) {
        Copy-Item -LiteralPath (Join-Path $driftFixture.Context.SourceParent $name) -Destination $removed -Recurse -Force -ErrorAction Stop
    }
    Write-ReviewFixtureFile -Path (Join-Path $removed 'skill-doctor/scripts/__pycache__/unexpected.bin') -Content 'unexpected'
    $driftSet = Get-ReviewInventorySet -Root $driftFixture.BackupRoot
    $governedSame = $driftSet.Governed.Sha256 -eq $driftFixture.VirtualFinal.Governed.Sha256
    $physicalChanged = $driftSet.Physical.Sha256 -ne $driftFixture.VirtualFinal.Physical.Sha256
    $driftOutcome = Invoke-ReviewSourceRemoval @driftArgs
    $results.removed_reuse_drift_rejected = $driftOutcome.state -eq 'source_removal_recovery_required'
    $results.cleanup_proof_drift_rejected = -not (Test-ReviewInventoryIdentity -InventorySet $driftSet `
        -GovernedCount $script:ReviewExpectedGovernedFinalCount -GovernedSha256 $driftFixture.VirtualFinal.Governed.Sha256 `
        -PhysicalCount $script:ReviewExpectedPhysicalFinalCount -PhysicalSha256 $driftFixture.VirtualFinal.Physical.Sha256)

    $recoveryFixture = New-ReviewPreparedRemovalFixture -Root (Join-Path $FixtureRoot 'recovery-drift')
    $recoveryArgs = @{
        RepoRoot = $recoveryFixture.Context.RepoRoot
        BackupRoot = $recoveryFixture.BackupRoot
        ExpectedSourceSha256 = $recoveryFixture.SourceSet.Governed.Sha256
        ExpectedPhysicalSourceSha256 = $recoveryFixture.SourceSet.Physical.Sha256
        ExpectedFinalSha256 = $recoveryFixture.VirtualFinal.Governed.Sha256
        ExpectedPhysicalFinalSha256 = $recoveryFixture.VirtualFinal.Physical.Sha256
    }
    $recoveryState = [pscustomobject]@{ Calls = 0 }
    $recoveryShim = {
        param($Target)
        $recoveryState.Calls++
        if ($recoveryState.Calls -eq 1) {
            Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
            $unexpectedPath = Join-Path $recoveryFixture.BackupRoot '.removed/skill-doctor/scripts/__pycache__/unexpected.bin'
            [IO.File]::WriteAllText($unexpectedPath, 'unexpected', [Text.UTF8Encoding]::new($false))
            throw 'injected drift before recovery'
        }
        Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
    }.GetNewClosure()
    $recoveryOutcome = Invoke-ReviewSourceRemoval @recoveryArgs -RemoveTree $recoveryShim
    $results.recovery_acceptance_drift_rejected = $recoveryOutcome.state -eq 'source_removal_recovery_required'
    $results.unexpected_pycache_physical_drift_rejected = $governedSame -and $physicalChanged -and
        $results.removed_reuse_drift_rejected -and $results.recovery_acceptance_drift_rejected -and
        $results.cleanup_proof_drift_rejected
    [pscustomobject]$results
}

function Invoke-ReviewSelfTest {
    [CmdletBinding()]
    param([Parameter(Mandatory)][ValidateSet('Backup', 'Removal', 'All')][string]$Scope)

    $tempParent = Get-ReviewNormalizedFullPath -Path (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath()) -ErrorAction Stop).Path
    $fixtureName = "skill-review-helper-$([Guid]::NewGuid().ToString('N'))"
    $fixtureRoot = Assert-ReviewDirectChild -Parent $tempParent -Child (Join-Path $tempParent $fixtureName) -ExpectedName $fixtureName -Label 'self-test fixture'
    $null = New-Item -ItemType Directory -Path $fixtureRoot -ErrorAction Stop
    try {
        $result = [ordered]@{ scope = $Scope }
        $backup = $null
        $removal = $null
        $backupPass = $true
        $removalPass = $true
        if ($Scope -in @('Backup', 'All')) {
            $backup = Invoke-ReviewBackupSelfTest -FixtureRoot (Join-Path $fixtureRoot 'backup-scope')
            foreach ($property in $backup.PSObject.Properties) {
                if ($property.Value -isnot [bool] -or -not $property.Value) { $backupPass = $false }
            }
            $result.backup = $backup
        }
        if ($Scope -in @('Removal', 'All')) {
            $removal = Invoke-ReviewRemovalSelfTest -FixtureRoot (Join-Path $fixtureRoot 'removal-scope')
            foreach ($property in $removal.PSObject.Properties) {
                if ($property.Value -isnot [bool] -or -not $property.Value) { $removalPass = $false }
            }
            $result.removal = $removal
        }
        if ($null -ne $backup) {
            foreach ($property in $backup.PSObject.Properties) { $result[$property.Name] = $property.Value }
        }
        if ($null -ne $removal) {
            foreach ($property in $removal.PSObject.Properties) {
                if ($property.Name -ne 'unexpected_pycache_physical_drift_rejected') {
                    $result[$property.Name] = $property.Value
                }
            }
        }
        if ($Scope -eq 'All') {
            $result.unexpected_pycache_physical_drift_rejected =
                $backup.unexpected_pycache_physical_drift_rejected -and
                $removal.unexpected_pycache_physical_drift_rejected
        }
        elseif ($Scope -eq 'Removal') {
            $result.unexpected_pycache_physical_drift_rejected = $removal.unexpected_pycache_physical_drift_rejected
        }
        $result.backup_all_passed = if ($null -eq $backup) { $null } else { $backupPass }
        $result.removal_all_passed = if ($null -eq $removal) { $null } else { $removalPass }
        $result.all_passed = $backupPass -and $removalPass
        [pscustomobject]$result
    }
    finally {
        if (Test-ReviewPathPresent -Path $fixtureRoot) {
            $resolvedFixture = Assert-ReviewNoReparse -Root $fixtureRoot -Label 'self-test fixture'
            if (-not (Test-ReviewOrdinalEqual -Left ([IO.Path]::GetDirectoryName($resolvedFixture)) -Right $tempParent)) {
                throw 'self-test cleanup escaped temp parent'
            }
            Remove-Item -LiteralPath $resolvedFixture -Recurse -Force -ErrorAction Stop
        }
    }
}

if ($Mode -eq 'Library') {
    return
}

$exitCode = 0
try {
    switch ($Mode) {
        'SelfTest' {
            $output = Invoke-ReviewSelfTest -Scope $SelfTestScope
            if (-not $output.all_passed) { $exitCode = 1 }
        }
        'Prepare' {
            if ([string]::IsNullOrWhiteSpace($RepoRoot)) { throw 'RepoRoot is required for Prepare' }
            if ([string]::IsNullOrWhiteSpace($env:USERPROFILE)) { throw 'USERPROFILE is required for Prepare' }
            $productionBackupRoot = Get-ReviewNormalizedFullPath -Path (Join-Path $env:USERPROFILE ".claude-skill-backup/$($script:ReviewTaskName)")
            if (-not [string]::IsNullOrWhiteSpace($BackupRoot) -and
                -not (Test-ReviewOrdinalEqual -Left (Get-ReviewNormalizedFullPath -Path $BackupRoot) -Right $productionBackupRoot)) {
                throw 'BackupRoot does not match the approved production target'
            }
            $output = Initialize-ReviewBackup -RepoRoot $RepoRoot -BackupRoot $productionBackupRoot
            if ($output.state -eq 'backup-preparation-recovery-required') { $exitCode = 1 }
        }
        'Execute' {
            foreach ($required in @('RepoRoot', 'BackupRoot', 'ExpectedSourceSha256', 'ExpectedPhysicalSourceSha256', 'ExpectedFinalSha256', 'ExpectedPhysicalFinalSha256')) {
                if ([string]::IsNullOrWhiteSpace((Get-Variable -Name $required -ValueOnly))) {
                    throw "$required is required for Execute"
                }
            }
            if ([string]::IsNullOrWhiteSpace($env:USERPROFILE)) { throw 'USERPROFILE is required for Execute' }
            $approvedBackupRoot = Get-ReviewNormalizedFullPath -Path (Join-Path $env:USERPROFILE ".claude-skill-backup/$($script:ReviewTaskName)")
            if (-not (Test-ReviewOrdinalEqual -Left (Get-ReviewNormalizedFullPath -Path $BackupRoot) -Right $approvedBackupRoot)) {
                throw 'BackupRoot does not match the approved production target'
            }
            $output = Invoke-ReviewSourceRemoval `
                -RepoRoot $RepoRoot -BackupRoot $BackupRoot `
                -ExpectedSourceSha256 $ExpectedSourceSha256 `
                -ExpectedPhysicalSourceSha256 $ExpectedPhysicalSourceSha256 `
                -ExpectedFinalSha256 $ExpectedFinalSha256 `
                -ExpectedPhysicalFinalSha256 $ExpectedPhysicalFinalSha256
            if ($output.state -ne 'removed') { $exitCode = 1 }
        }
    }
}
catch {
    $output = [pscustomobject]@{
        state = 'helper_failed'
        failure_phase = $Mode.ToLowerInvariant()
        failure_category = $_.Exception.GetType().FullName
    }
    $exitCode = 1
}

$output | ConvertTo-Json -Depth 8 -Compress
exit $exitCode
