---
name: windows-dev-process-cleanup
description: Audit and safely clean Windows development process buildup and UWP background-task pileups. Covers stale node.exe, npm.exe, npx.exe, cmd.exe, and pwsh.exe trees (leftover npm outdated runs, leaked Playwright MCP workers, dev servers, IDE language services) plus backgroundTaskHost.exe pileups from Phone Link (Microsoft.YourPhone) and Dolby Access. Classify process trees first, then terminate only profile-matched targets, with WhatIf preview and JSON or Markdown reports. Use when Task Manager is full of node/npm noise, the machine feels sluggish, orphan process trees linger after closing editors or agents, or dozens of backgroundTaskHost.exe instances appear. 中文触发：Windows 进程堆积、任务管理器一堆 node npm backgroundTaskHost、清理残留开发进程、查杀泄漏的 Playwright MCP、手机连接或杜比后台任务堆积、进程树审计与安全清理。
category: developer-tools-integrations
tags:
  - windows
  - powershell
  - process-cleanup
  - uwp
  - playwright-mcp
version: 1.1.0
---

# Windows Dev Process Cleanup

## Overview

Use this skill to inspect Windows development process trees before killing anything. Prefer classification first, then terminate only the process categories that are clearly safe or that the user explicitly requested.

Both scripts require PowerShell 7 (`pwsh`); they declare `#requires -Version 7.0`. Replace `<skill-dir>` below with this skill's directory path.

Two scripts cover two problem domains:

- `audit-dev-processes.ps1` — development process trees rooted in `node.exe`, `npm.exe`, `npx.exe`, `cmd.exe`, `pwsh.exe`
- `audit-uwp-backgroundtasks.ps1` — UWP/app background tasks, especially `backgroundTaskHost.exe` pileups attributed via `tasklist /apps`

## Workflow

### 1. Audit first

Run the relevant script in audit mode before any cleanup.

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit
```

Use JSON when you need to summarize or post-process the result (`-AsJson` prints JSON to stdout and can be combined with the export options):

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit -AsJson
```

Export a report when you want a file artifact:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit -ExportJson '.\reports\dev-process-audit.json'
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit -ExportMarkdown '.\reports\dev-process-audit.md'
```

If the user reports that Task Manager is very noisy, process enumeration or WMI feels slow, the machine is sluggish, or `backgroundTaskHost.exe` appears dozens or hundreds of times, run the UWP audit:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode audit
```

The UWP script groups `backgroundTaskHost.exe` by associated app. Pay special attention to:

- `Microsoft.YourPhone_*` / Phone Link: often safe to terminate and disable background access when the user does not need phone sync.
- `DolbyLaboratories.DolbyAccess_*` / Dolby Access: a priority-review target because it can pile up into dozens of `backgroundTaskHost.exe` instances. If the user uses Dolby audio, do **not** disable or uninstall Dolby; only terminate leaked `backgroundTaskHost.exe` instances when the user asks for cleanup.
- Other UWP groups (Microsoft Store, StorePurchaseApp, Microsoft To Do, and similar) as they appear in `backgroundTaskHost.exe`-associated rows.

Preview any cleanup without killing anything:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile codex-playwright-safe -StaleMinutes 45 -WhatIf
```

### 2. Read the classification

`audit-dev-processes.ps1` groups processes into trees and classifies each tree into:

- `dev-server`: `npm run dev`, `vite`, or similar workspace dev servers
- `ide-language-service`: TypeScript, Vue, Tailwind, and related editor services
- `npm-outdated`: dependency-check tasks that often linger after the parent exits
- `playwright-mcp`: `npx @playwright/mcp`, `playwright-mcp`, or related browser worker trees
- `generic`: node/npm/npx/cmd/pwsh trees that do not match the known patterns

Each tree also includes:

- `root_pid`, `parent_exists`, `age_minutes`, `workspace_match`, `codex_parent`
- `member_categories`: per-member classification of every command line in the tree
- `mixed_tree`: `true` when the tree contains both cleanup-target members (`npm-outdated`, `playwright-mcp`) and protected members (`dev-server`, `ide-language-service`); mixed trees are forced to `manual-review` and excluded from every cleanup profile
- `safe_to_kill`, `kill_recommendation`, `reason`

`kill_recommendation` values include `safe-cleanup`, `candidate-cleanup`, `stale-codex-playwright` (a `playwright-mcp` tree owned by `codex.exe` that exceeded `-StaleMinutes`; exactly what the `codex-playwright-safe` profile would select), `workspace-target`, `keep`, `review`, and `manual-review`.

`audit-uwp-backgroundtasks.ps1` groups app-associated processes into:

- `phone-link-background`: background tasks associated with Phone Link / `Microsoft.YourPhone`
- `dolby-backgroundtask`: background tasks associated with Dolby Access; priority-review when the count is high
- `uwp-backgroundtask`: every other app-associated group

### 3. Apply the cleanup policy

Use this default cleanup policy:

- Kill `npm-outdated` trees only when the root parent no longer exists
- Keep `dev-server` trees unless the user explicitly asked to stop that workspace
- Keep `ide-language-service` trees unless the user explicitly asked to close the IDE-related services
- Treat `playwright-mcp` as a candidate cleanup category, not an automatic-safe category
- Treat `generic` and `mixed_tree` trees as manual-review items
- Treat Phone Link background-task pileups as cleanup candidates when the user does not need phone sync; optionally disable its background access
- Treat Dolby Access background-task pileups as a priority-review target: terminate leaked `backgroundTaskHost.exe` instances only; never disable or uninstall Dolby when the user uses Dolby audio

### 4. Cleanup profiles

`audit-dev-processes.ps1` profiles (mixed trees are always excluded):

- `safe` — kill only clearly stale `npm-outdated` trees with missing parents
- `playwright-mcp` — kill all `playwright-mcp` trees; use only when the user explicitly asks to clear browser automation workers or they are clearly leaked
- `codex-playwright-safe` — kill only `playwright-mcp` trees whose immediate non-wrapper parent is `codex.exe` and that are older than `-StaleMinutes`
- `safe-plus-codex-playwright` — combine the two conservative passes above
- `workspace-dev-server` — kill only `dev-server` trees whose command lines match `-WorkspacePath`; requires `-WorkspacePath`

`audit-uwp-backgroundtasks.ps1` profiles (cleanup mode requires an explicit `-Profile`; omitting it fails fast):

- `phone-link-background` — terminate Phone Link app-associated processes; add `-DisablePhoneLinkBackground` to also write HKCU background-access registry flags. Use only when the user asks to stop Phone Link background activity.
- `dolby-backgroundtask` — terminate only Dolby Access `backgroundTaskHost.exe` instances; never touches Dolby services, packages, or audio features. Use when the audit reports a high `DolbyLaboratories.DolbyAccess_*` count (especially 10 or more) or the user explicitly asks.

Examples:

```powershell
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile safe
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile codex-playwright-safe -StaleMinutes 45
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile safe-plus-codex-playwright -StaleMinutes 45
pwsh -NoLogo -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile workspace-dev-server -WorkspacePath 'C:\path\to\your\workspace'
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground
pwsh -NoLogo -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile dolby-backgroundtask
```

### 5. Read the cleanup result

The UWP cleanup result reports honestly:

- `details`: per-PID outcomes — `terminated`, `failed` (still alive after the kill attempt), or `not-found` (already gone)
- `result`: `preview` under `-WhatIf`, otherwise `terminated`, `partial`, `failed`, or `no-targets`
- `registry_changed`: whether the Phone Link background-access registry flags were written; a registry change with zero terminations is visible instead of masked

The dev-process cleanup result lists each tree root with `terminated` or `failed` based on the `taskkill` exit code.

## Interpretation Rules

- Prefer tree-level reasoning over single-process reasoning
- A `cmd.exe` wrapper is usually not the real root cause; inspect its `npm.exe`, `npx.exe`, or `node.exe` parent/child chain
- Parent-missing `npm outdated` trees are usually safe to remove
- Long-lived `playwright-mcp` trees under `codex.exe` are often leaked workers, but they can still be active if browser automation is in use
- Prefer `codex-playwright-safe` over `playwright-mcp` when the user wants a conservative cleanup of Codex-created workers
- High CPU or memory alone is not enough to kill a process; always confirm the category
- Never kill a `mixed_tree` tree via a profile; review its members and handle the offending PIDs individually
- Hundreds of `backgroundTaskHost.exe` processes are commonly UWP background-task leaks; attribute them to apps with the UWP audit before killing
- If the app is Phone Link, disabling background access is acceptable only after user confirmation
- If the app is Dolby Access, flag it prominently. Do not disable it by default because it can affect audio features; only terminate leaked background hosts after user confirmation

## Communication Rules

- Report what is normal, what is stale, and what is ambiguous
- If the user asked to check, do not clean anything; say which category would be removed
- If the user asked to clean, use the narrowest profile that satisfies the request
- Use `-WhatIf` first when the cleanup touches anything beyond orphan `npm-outdated`
- When a cleanup is ambiguous, recommend the exact profile and reason before killing
- Quote the per-PID `details` when reporting a UWP cleanup, and call out `registry_changed` explicitly

## Resources

### scripts/

- `scripts/audit-dev-processes.ps1` — audit, classify, and optionally kill dev process trees by profile; export JSON or Markdown reports
- `scripts/audit-uwp-backgroundtasks.ps1` — audit `backgroundTaskHost.exe` and app-associated processes; clean Phone Link or leaked Dolby background hosts with per-PID result reporting

### tests/

- `tests/audit-scripts.test.mjs` — pwsh-backed regression suite (parse gate, kill-path binding, classification fixtures, JSON contract, WhatIf preview); discovered by `just node-test`, skips without Windows + pwsh 7
