---
name: windows-dev-process-cleanup
description: Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe. Use for Task Manager node/npm noise, Windows process buildup, 进程堆积, 清理残留开发进程, 泄漏的 Playwright MCP, 手机连接或杜比后台任务堆积. Do not use for generic performance profiling, malware response, Windows service management, app uninstall, or non-Windows cleanup.
category: developer-tools-integrations
tags:
  - windows
  - powershell
  - process-cleanup
  - uwp
  - playwright-mcp
version: 2.0.0
---

# Windows Dev Process Cleanup

Audit first and use the narrowest profile. Requires Windows and PowerShell 7; replace `<skill-dir>` with the loaded skill directory.

## Workflow

1. Audit without side effects:

```powershell
pwsh -NoLogo -NoProfile -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit -AsJson
pwsh -NoLogo -NoProfile -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode audit -AsJson
```

2. Treat `blocked`, `mixed_tree`, `unknown`, `identity-missing`, protected members, and `audit_status: failed` as manual review.

3. Select one profile:

- Dev: `safe`, `playwright-mcp`, `codex-playwright-safe`, `safe-plus-codex-playwright`, or `workspace-dev-server` with an existing `-WorkspacePath`.
- UWP: `phone-link-background` or `dolby-backgroundtask`. Dolby cleanup terminates only matching `backgroundTaskHost` instances.

4. Preview the exact plan before cleanup:

```powershell
pwsh -NoLogo -NoProfile -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile codex-playwright-safe -StaleMinutes 45 -WhatIf -AsJson
pwsh -NoLogo -NoProfile -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson
```

Run without `-WhatIf` only after an explicit cleanup request and an unblocked plan. The scripts recheck identity and affected members; drift fails the precondition.

## Phone Link 2.0 Change

`-DisablePhoneLinkBackground` is deprecated and fails closed. It never writes the registry. Microsoft documents the supported per-app control in Windows Settings under `System > Power & battery > Battery usage > Manage background activity`. See [migration-2.0.md](references/migration-2.0.md).

## Output Contract

Report normalized inputs, affected PIDs/fingerprints, roles/protection, blocked reasons, `plan_id`, target counts, preconditions, command status, and per-member outcomes. A zero `taskkill` exit code is not proof of termination.

Process termination is irreversible. Report exports are local files. No registry rollback exists because version 2.0 performs no registry mutation.

## Boundaries And Resources

Read [safety-policy.md](references/safety-policy.md) for profiles and confirmation, and [windows-command-contracts.md](references/windows-command-contracts.md) for platform evidence. Tests use `file-backed fixture` inputs and side-effect shims; never validate with real cleanup or registry writes.

Do not use this skill to disable services, uninstall apps, investigate malware, or terminate arbitrary processes. Mark unavailable runtime telemetry, provider benchmarks, and independent human review as `missing evidence`.
