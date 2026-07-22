# Windows Dev Process Cleanup

[中文](./README.md) | English

A PowerShell 7 toolkit for auditing and safely cleaning stale Windows development process trees and UWP background-task buildup. It builds a complete plan, blocks uncertain targets, revalidates immediately before cleanup, and verifies every PID afterward.

## What it audits

- Dev trees rooted in `node.exe`, `npm.exe`, `npx.exe`, `cmd.exe`, or `pwsh.exe`, including orphan `npm outdated`, Playwright MCP, dev servers, and IDE language services.
- UWP-associated processes from `tasklist /apps /fo csv /nh`, with focused handling for Phone Link, Dolby Access, and `backgroundTaskHost.exe` pileups.

## Quick start

Use an absolute script path from outside this skill directory. These examples assume the current directory is the skill directory.

```powershell
# Read-only audits
pwsh -NoLogo -NoProfile -File scripts/audit-dev-processes.ps1 -Mode audit -AsJson
pwsh -NoLogo -NoProfile -File scripts/audit-uwp-backgroundtasks.ps1 -Mode audit -AsJson

# Preview only; no process termination
pwsh -NoLogo -NoProfile -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe -WhatIf -AsJson
pwsh -NoLogo -NoProfile -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson
```

Remove `-WhatIf` only when the user explicitly requested cleanup, the plan has no blocked target, and the preview remains accurate.

## Dev profiles

- `safe`: selects only `npm-outdated` trees whose parent is absent.
- `playwright-mcp`: selects Playwright MCP trees and requires explicit cleanup intent.
- `codex-playwright-safe`: selects Codex-owned Playwright MCP trees older than a positive `-StaleMinutes` threshold.
- `safe-plus-codex-playwright`: combines the two conservative predicates.
- `workspace-dev-server`: selects dev servers whose normalized paths match `-WorkspacePath` on a directory-segment boundary; cleanup requires an existing directory.

The script enumerates each root and every descendant. A mixed tree, protected member, unknown member, missing identity, or newly discovered descendant blocks the entire tree. Before termination it rechecks PID identity and descendant closure. Afterward it reports `terminated`, `not-found`, `failed`, or `identity-changed` per member. A zero `taskkill` exit code is not proof of termination.

## UWP profiles

- `phone-link-background`: selects full `Microsoft.YourPhone_*` package identities and expected Phone Link processes.
- `dolby-backgroundtask`: selects only Dolby Access-associated `backgroundTaskHost` processes; it never disables, uninstalls, or changes Dolby audio features.

Invalid CSV columns, PID, package identity, or command status fail the audit and block cleanup.

## Version 2.0 migration

`-DisablePhoneLinkBackground` is deprecated and fails closed. It no longer writes HKCU because no current Microsoft authority was found for a stable, verifiable, and reversible contract for the former values.

For a persistent change, use Windows Settings: `System > Power & battery > Battery usage > Manage background activity`, then choose `Never` when the app exposes that control. See [migration-2.0.md](references/migration-2.0.md) and [windows-command-contracts.md](references/windows-command-contracts.md).

## Output and rollback boundary

JSON, console, and Markdown derive from the same fact model: normalized inputs, complete members, roles and protection reasons, blocked targets, `plan_id`, preconditions, and per-PID results. Process termination is irreversible; planning, confirmation, and revalidation are the prevention controls. Report files are local and removable. Version 2.0 performs no registry mutation.

See [safety-policy.md](references/safety-policy.md) for the full policy.

## Requirements and tests

- Windows
- PowerShell 7
- Built-in Windows `tasklist` and `taskkill`
- CIM/WMI process queries

```powershell
node --test tests/audit-scripts.test.mjs
```

Tests use file-backed fixtures and injected shims. They do not terminate real processes or write the registry.

## License

MIT
