# Windows Dev Process Cleanup

[中文](./README.md) | English

A Codex skill and PowerShell toolkit for **auditing and safely cleaning stale Windows development process trees** and **UWP background-task pileups**.

The core principle is: **classify first, then clean up**. By default, it avoids killing active dev servers, editor language services, and ambiguous process trees.

## What it detects

### 1. Development process trees

`scripts/audit-dev-processes.ps1` audits Windows development-related processes:

- `node.exe`
- `npm.exe`
- `npx.exe`
- `cmd.exe`
- `pwsh.exe`

It classifies process trees as:

- `npm-outdated`
- `playwright-mcp`
- `dev-server`
- `ide-language-service`
- `generic`

### 2. UWP background-task pileups

`scripts/audit-uwp-backgroundtasks.ps1` audits app-associated `backgroundTaskHost.exe` processes via `tasklist /apps`, with focused handling for:

- Phone Link / `Microsoft.YourPhone`
- Dolby Access / `DolbyLaboratories.DolbyAccess`
- Microsoft Store / StorePurchaseApp / Microsoft To Do and other UWP background tasks

## Quick start

Audit development process trees:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit
```

Preview conservative cleanup without terminating processes:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe -WhatIf
```

Clean orphan `npm outdated` process trees:

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe
```

Audit UWP/app background tasks:

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode audit
```

Disable Phone Link background access and terminate related processes:

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground
```

Terminate leaked Dolby Access `backgroundTaskHost.exe` instances without disabling Dolby Access:

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask
```

## Cleanup profiles

### `audit-dev-processes.ps1`

- `safe`: terminate only clearly stale orphan `npm-outdated` process trees.
- `playwright-mcp`: terminate Playwright MCP process trees. Use only when browser automation workers are known to be stale.
- `codex-playwright-safe`: terminate stale Playwright MCP process trees owned by Codex after the stale threshold.
- `safe-plus-codex-playwright`: combine orphan `npm-outdated` cleanup with stale Codex Playwright cleanup.
- `workspace-dev-server`: terminate only dev servers whose command lines match `-WorkspacePath`.

### `audit-uwp-backgroundtasks.ps1`

- `phone-link-background`: terminate Phone Link / `Microsoft.YourPhone` app-associated processes. Use `-DisablePhoneLinkBackground` to write HKCU background-access flags.
- `dolby-backgroundtask`: terminate only Dolby Access `backgroundTaskHost.exe` instances. It does not disable, uninstall, or change Dolby Access audio features.

## Safety notes

- Always audit first.
- Prefer `-WhatIf` before non-trivial cleanup.
- Do not kill `dev-server`, `ide-language-service`, or `generic` process trees without user confirmation.
- Do not disable Dolby Access by default because it may affect audio features.
- Disable Phone Link background access only when the user does not need background phone sync.

## Codex skill usage

`SKILL.md` describes when and how Codex should use these scripts.

## Requirements

- Windows
- PowerShell 7 recommended
- Built-in Windows commands: `tasklist`, `taskkill`
- CIM/WMI availability for process tree inspection

## License

MIT
