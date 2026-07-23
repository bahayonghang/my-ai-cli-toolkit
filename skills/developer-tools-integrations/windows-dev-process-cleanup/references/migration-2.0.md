# Migration To 2.0

Version 2.0.0 intentionally changes `-DisablePhoneLinkBackground` from an HKCU mutation to a hard compatibility error.

## Required Change

Remove this unsupported invocation:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground
```

Use audit and preview first, then run the terminate-only profile if explicitly requested:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode audit -AsJson
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile phone-link-background -WhatIf -AsJson
```

To change persistent background activity, use Windows Settings under `System > Power & battery > Battery usage > Manage background activity`. The script does not automate or claim to verify that setting.

Existing profile names, other parameters, and prior JSON fields remain. New plan, blocker, identity, precondition, and verified-result fields are additive.
