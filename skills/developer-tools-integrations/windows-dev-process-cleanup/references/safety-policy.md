# Safety Policy

Last reviewed: 2026-07-22

## Safety Invariants

- Audit and render a plan before every cleanup.
- The audit scope must equal the side-effect scope. Because `taskkill /T` affects a root and all descendants, every descendant must appear in `members`.
- Automatic cleanup requires complete process identity: positive PID, name, command line, and creation timestamp.
- Protected, unknown, identity-missing, mixed, or newly discovered members block the whole tree.
- Revalidate root identity, member fingerprints, and descendant closure immediately before termination.
- Verify every planned PID after the command. Command exit status is supporting evidence, not final state.

## Dev Profiles

| Profile | Selects | Additional boundary |
| --- | --- | --- |
| `safe` | Orphan `npm-outdated` trees | Parent must be absent and closure unblocked |
| `playwright-mcp` | Playwright MCP trees | Explicit user request; closure unblocked |
| `codex-playwright-safe` | Stale Codex-owned Playwright MCP trees | Positive `StaleMinutes`; complete identity |
| `safe-plus-codex-playwright` | `safe` plus stale Codex Playwright | Each tree independently passes its predicate |
| `workspace-dev-server` | Dev-server trees in one workspace | Existing directory; normalized path-segment match |

`member_categories` is the unique category set for the tree. Per-member facts live in `members[].category`, `members[].roles`, and `members[].protection`.

Workspace matching is case-insensitive and normalizes slash direction, quotes, and trailing separators. A sibling prefix such as `C:\work\app-copy` never matches `C:\work\app`. Audit may describe a nonexistent path, but workspace cleanup rejects it before enumeration.

## UWP Profiles

- `phone-link-background` selects full `Microsoft.YourPhone_*` package identities and expected Phone Link process identities.
- `dolby-backgroundtask` selects only `backgroundTaskHost` rows associated with `DolbyLaboratories.DolbyAccess_*`.
- Malformed CSV, invalid PID, missing package identity, or nonzero `tasklist` status sets the audit to failed and produces no cleanup targets.
- `-DisablePhoneLinkBackground` is a compatibility error in 2.0.0 and performs no registry read or write.

## Confirmation Boundary

Read-only audit and `-WhatIf` are non-destructive. Running cleanup without `-WhatIf` requires an explicit user request naming or clearly implying the selected scope. A request to inspect, diagnose, explain, or preview never authorizes termination.

Stop and request review when:

- any target is blocked or cannot be classified;
- the plan changes after preview;
- a PID identity or descendant set drifts;
- the requested action includes service changes, package removal, registry edits, malware response, or generic process termination.

## Result Semantics

- `preview`: no side effect attempted.
- `terminated`: every planned identity is absent after cleanup.
- `not-found`: a target exited before the action.
- `identity-changed`: the PID now refers to another identity.
- `failed`: a planned identity still exists or the action threw.
- `partial`: some members terminated and some failed or changed.
- `precondition-failed`: the audited plan was stale; no kill action ran.
- `no-targets`: nothing remained eligible.

## Rollback Boundary

Process termination cannot be rolled back. Prevention, complete planning, confirmation, and precondition checks are the controls. JSON/Markdown exports are local and removable. Version 2.0 has no registry mutation to restore.
