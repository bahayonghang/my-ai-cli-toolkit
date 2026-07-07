---
name: windows-dev-process-cleanup
description: Audit and clean Windows development process buildup involving node.exe, npm.exe, npx.exe, cmd.exe, and related wrappers. Use when Codex needs to inspect Task Manager noise, identify orphan or leaked process trees, distinguish normal dev servers and IDE language services from cleanup candidates, or safely terminate stale npm/npx/Playwright MCP workers on Windows.
---

# Windows Dev Process Cleanup

## Overview

Use this skill to inspect Windows development process trees before killing anything. Prefer classification first, then terminate only the process categories that are clearly safe or that the user explicitly requested.

Run the bundled PowerShell script for both audit and cleanup:

- `scripts/audit-dev-processes.ps1 -Mode audit`
- `scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe`
- `scripts/audit-dev-processes.ps1 -Mode cleanup -Profile codex-playwright-safe`
- `scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe-plus-codex-playwright`

For Windows UWP/App background-task pileups, especially `backgroundTaskHost.exe`, treat these as重点筛查目标:

- Phone Link / 手机连接 / `Microsoft.YourPhone`
- Dolby Access / 杜比音效 / `DolbyLaboratories.DolbyAccess`
- Microsoft Store / StorePurchaseApp / Microsoft To Do and other smaller UWP groups

- `scripts/audit-uwp-backgroundtasks.ps1 -Mode audit`
- `scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground`
- `scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask`

## Workflow

### 1. Audit first

Run the script in audit mode before any cleanup.

Default command:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit
```

Use JSON when you need to summarize or post-process the result:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit -AsJson
```

Export a report when you want a file artifact:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit -ExportJson '.\reports\dev-process-audit.json'
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit -ExportMarkdown '.\reports\dev-process-audit.md'
```

If the user reports that Task Manager is very noisy, process enumeration/WMI is slow, the machine feels卡顿, or `backgroundTaskHost.exe` appears dozens or hundreds of times, run:

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode audit
```

This script groups `backgroundTaskHost.exe` by associated app using `tasklist /apps`. Always pay special attention to:

- `Microsoft.YourPhone_*` / Phone Link: often safe to terminate and disable background access when the user does not need phone sync.
- `DolbyLaboratories.DolbyAccess_*` / Dolby Access: a重点筛查项 because it can pile up into dozens of `backgroundTaskHost.exe` instances. If the user uses Dolby audio, do **not** disable/uninstall Dolby; only terminate leaked `backgroundTaskHost.exe` instances when the user asks to查杀/清理.

Preview a cleanup without killing anything:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile codex-playwright-safe -StaleMinutes 45 -WhatIf
```

### 2. Read the classification

The script groups processes into trees and classifies them into:

- `dev-server`: `npm run dev`, `vite`, or similar workspace dev servers
- `ide-language-service`: TypeScript, Vue, Tailwind, and related editor services
- `npm-outdated`: dependency-check tasks that often linger after the parent exits
- `playwright-mcp`: `npx @playwright/mcp`, `playwright-mcp`, or related browser worker trees
- `generic`: node/npm/npx/cmd trees that do not match the known patterns
- `phone-link-background`: UWP background tasks associated with Phone Link / `Microsoft.YourPhone`
- `dolby-backgroundtask`: UWP background tasks associated with Dolby Access;重点筛查 for repeated/leaked `backgroundTaskHost.exe`

Each tree also includes:

- `root_pid`
- `parent_exists`
- `safe_to_kill`
- `kill_recommendation`
- `workspace_match`

### 3. Apply the cleanup policy

Use this default cleanup policy:

- Kill `npm-outdated` trees only when the root parent no longer exists
- Keep `dev-server` trees unless the user explicitly asked to stop that workspace
- Keep `ide-language-service` trees unless the user explicitly asked to close the IDE-related services
- Treat `playwright-mcp` as a candidate cleanup category, not an automatic-safe category
- Treat `generic` trees as manual-review items
- Treat Phone Link / `Microsoft.YourPhone` background-task pileups as cleanup candidates when the user does not need phone sync; optionally disable its background access.
- Treat Dolby Access / `DolbyLaboratories.DolbyAccess` background-task pileups as a重点筛查目标. They are cleanup candidates only for terminating leaked `backgroundTaskHost.exe` instances; do not disable or uninstall Dolby when the user uses Dolby audio.

### 4. Cleanup profiles

Use these cleanup profiles:

- `safe`
  - Kill only clearly stale `npm-outdated` trees with missing parents
- `playwright-mcp`
  - Kill all `playwright-mcp` trees
  - Use only when the user explicitly asks to clear Codex/browser automation workers or when they are clearly leaked and no active browser automation is needed
- `codex-playwright-safe`
  - Kill only `playwright-mcp` trees whose immediate non-wrapper parent is `codex.exe`
  - Require that the tree has been alive longer than the stale threshold
  - Use when the user asks to clear long-lived Codex Playwright workers without touching every browser worker
- `safe-plus-codex-playwright`
  - Kill orphan `npm-outdated` trees
  - Also kill stale `playwright-mcp` trees owned by `codex.exe`
  - Use when the user wants one conservative cleanup pass for the most common leftovers
- `workspace-dev-server`
  - Kill only `dev-server` trees whose command lines match `-WorkspacePath`
  - Use when the user asks to stop a specific project dev server
- UWP `phone-link-background`
  - Command: `pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground`
  - Terminates Phone Link / `Microsoft.YourPhone` associated app processes and writes HKCU background-access registry flags.
  - Use only when the user asks to disable Phone Link background running or kill Phone Link related processes.
- UWP `dolby-backgroundtask`
  - Command: `pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask`
  - Terminates only Dolby Access `backgroundTaskHost.exe` instances.
  - Does not disable Dolby Access, services, packages, or audio features.
  - Use when audit reports `DolbyLaboratories.DolbyAccess_*` count is high, especially `>= 10`, or when the user explicitly asks to查杀杜比相关堆积.

Examples:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile playwright-mcp
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile codex-playwright-safe -StaleMinutes 45
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe-plus-codex-playwright -StaleMinutes 45
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile workspace-dev-server -WorkspacePath 'C:\path\to\your\workspace'
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask
```

## Interpretation Rules

- Prefer tree-level reasoning over single-process reasoning
- A `cmd.exe` wrapper is usually not the real root cause; inspect its `npm.exe`, `npx.exe`, or `node.exe` parent/child chain
- Parent-missing `npm outdated` trees are usually safe to remove
- Long-lived `playwright-mcp` trees under `codex.exe` are often leaked workers, but they can still be active if browser automation is in use
- Prefer `codex-playwright-safe` over `playwright-mcp` when the user wants a conservative cleanup of Codex-created workers
- High CPU or memory alone is not enough to kill a process; always confirm the category
- Hundreds of `backgroundTaskHost.exe` processes are commonly UWP background-task leaks. Use `tasklist /apps` or `audit-uwp-backgroundtasks.ps1` to attribute them to apps before killing.
- If the app is Phone Link / `Microsoft.YourPhone`, disabling background access is usually acceptable only after user confirmation.
- If the app is Dolby Access, flag it prominently in the report. Do not disable it by default because it can affect audio features; only terminate leaked background hosts after user confirmation.

## Communication Rules

- Report what is normal, what is stale, and what is ambiguous
- If the user asked to “check”, do not clean anything without saying which category would be removed
- If the user asked to “clean”, use the narrowest profile that satisfies the request
- Use `-WhatIf` first when the cleanup touches anything beyond orphan `npm-outdated`
- When a cleanup is ambiguous, recommend the exact profile and reason before killing

## Resources

### scripts/

- `scripts/audit-dev-processes.ps1`
  - Audit relevant process trees
  - Classify them
  - Optionally kill only the tree roots that match a cleanup profile
  - Export JSON or Markdown reports for later review
- `scripts/audit-uwp-backgroundtasks.ps1`
  - Audit `backgroundTaskHost.exe` and app-associated processes via `tasklist /apps`
  - Classify Phone Link / `Microsoft.YourPhone` and Dolby Access background-task pileups
  - Optionally clean Phone Link processes and disable its background access
  - Optionally terminate only Dolby Access leaked `backgroundTaskHost.exe` instances without disabling Dolby
