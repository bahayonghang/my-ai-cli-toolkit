# Audit - windows-dev-process-cleanup (2026-07-22)

## Scope and Method

- Read the complete package, scoped `AGENTS.md`, repo skill-authoring guide, previous 2026-07-07 Trellis task, and relevant git history.
- Applied yao-meta `Governed` criteria because the package terminates processes and can mutate HKCU.
- Ran only read-only/live-audit or `WhatIf` checks. No process was terminated and no registry value was changed.
- External/local references:
  - Microsoft Learn `tasklist`, last page update 2023-02-03: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tasklist
  - Microsoft Learn `taskkill`, last page update 2024-11-01: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill
  - Windows 11 local `tasklist /?` and `taskkill /?`, verified 2026-07-22
  - Previous task `.trellis/tasks/archive/2026-07/07-07-optimize-windows-dev-process-cleanup/`

## Baseline Evidence

- `node --test skills/developer-tools-integrations/windows-dev-process-cleanup/tests/audit-scripts.test.mjs`: 9 passed, 0 failed.
- `python scripts/check.py skills/developer-tools-integrations/windows-dev-process-cleanup`: `[OK]`.
- Read-only dev audit: 51 trees; `-StaleMinutes -1` was accepted and serialized as `-1`.
- Read-only UWP audit: valid JSON, 2 app-associated target rows on this host.
- `tasklist /apps /fo csv /nh` returned four quoted columns (`image`, `pid`, `memory`, `package`) with an untruncated package identity.
- `git status --porcelain=v1 -uall` was clean before task creation.

Passing baseline checks are not evidence that cleanup is safe. The current suite asserts parseability, selected JSON keys and a few isolated functions, but not the complete side-effect contract.

## Findings

### P0 - `/T` side effects exceed the inspected graph

Evidence:

- `audit-dev-processes.ps1:21-23` builds `$processMap` only from `node.exe`, `npm.exe`, `npx.exe`, `cmd.exe`, and `pwsh.exe`.
- `audit-dev-processes.ps1:271` calls `taskkill /PID <root> /T /F`.
- Microsoft and local Windows help define `/T` as ending the specified process and all child processes it started.
- Output stores only `root_command`, `process_ids`, and a deduplicated `member_categories`; it does not expose every affected descendant command/identity.

Impact:

The mixed-tree guard can only reason about selected executable names, while `taskkill /T` can end browser processes, other runtimes, helpers, or protected workloads absent from the audited graph. The skill cannot currently prove that its cleanup target set matches its side effects.

Required fix:

Build the target graph from the full process census, output the complete affected closure, and block automatic cleanup if the closure contains unknown/protected/new members. Revalidate immediately before the side effect.

### P0 - Workspace selection accepts sibling prefixes

Evidence:

- `audit-dev-processes.ps1:221` uses `IndexOf($WorkspacePath) -ge 0`.
- Reproduction: target `C:\work\app` matched command `node C:\work\app-copy\node_modules\.bin\vite` (`current_match: true`).

Impact:

`workspace-dev-server` can terminate a different workspace whose path merely shares the requested prefix.

Required fix:

Normalize paths and match path segments/argument boundaries. Cover quotes, trailing separators, case, sibling prefixes and nonexistent paths with fixtures.

### P1 - Non-positive stale values split recommendation from cleanup

Evidence:

- Parameter `StaleMinutes` has no `ValidateRange` (`audit-dev-processes.ps1:12`).
- Recommendation requires `$StaleMinutes -gt 0` (`:142`).
- cleanup selectors use `age_minutes -ge $StaleMinutes` without that guard (`:299`, `:306`).
- summary uses the same unguarded comparison (`:332`).
- A live read-only audit accepted `-StaleMinutes -1`.

Impact:

With a Codex-owned Playwright tree present, a non-positive value can select targets that the audit recommendation did not label stale.

Required fix:

Reject non-positive values and centralize one selection predicate reused by recommendation, summary and cleanup.

### P1 - Cleanup has no identity/target-set precondition

Evidence:

- The scripts select numeric PIDs from a mutable snapshot and later terminate by PID.
- dev cleanup reports success from `$LASTEXITCODE` only (`audit-dev-processes.ps1:271-278`).
- UWP `Stop-Pids` rechecks existence but not whether a reused PID still belongs to the audited app.

Impact:

PID reuse or a changed descendant set can turn an approved audit into a different side effect. A zero exit code is not proof that all planned targets exited or that no unplanned descendants were affected.

Required fix:

Store an identity fingerprint (PID, name, creation/start time, command/package), recapture before cleanup, fail on drift, and verify per planned member afterwards.

### P1 - UWP parsing relies on display text despite a structured format

Evidence:

- `audit-uwp-backgroundtasks.ps1:20-67` parses default table output by whitespace and regex.
- Local `tasklist /apps /fo csv /nh` works and returns stable quoted columns without headers.
- The live default-table audit returned visibly truncated package identifiers, while CSV returned full identities.

Impact:

Locale, spacing, truncation or output-format drift can skip/misgroup rows. Cleanup selection should not be derived from an unvalidated display table.

Required fix:

Use CSV with explicit column names, validate the command exit code and schema, and make parse failure produce zero targets.

### P1 - Phone Link registry behavior has no current support or rollback evidence

Evidence:

- `Disable-PhoneLinkBackgroundAccess` writes two values to a hard-coded HKCU path (`audit-uwp-backgroundtasks.ps1:116-121`).
- The write occurs before process cleanup (`:204-208`) and only a boolean `registry_changed` is returned.
- No bundled reference cites a current Microsoft contract for these values; no previous-state snapshot or restore test exists.

Impact:

The package claims it can disable Phone Link background access without evidence that the registry contract remains supported. A partial failure leaves persistent state with no tool-supported restoration path.

Required fix:

Apply the PRD evidence gate. Preserve the capability only with current support evidence, before/after state and restore coverage; otherwise deprecate the mutation and stop making the claim.

### P1 - The previous mixed-tree acceptance criterion is not actually locked

Evidence:

- The archived 2026-07-07 plan marks a fixture for mixed-tree exclusion complete.
- Current tests assert first-match classification, JSON field presence, and recommendation labels, but never construct a mixed tree and prove it is excluded from every cleanup profile.

Impact:

The central 2026-07-07 safety repair can regress while all 9 tests still pass.

Required fix:

Extract deterministic graph/selection functions and test every profile against mixed, unknown and protected descendants.

### P2 - Routing contract regressed without executable evaluation

Evidence:

- Commit `eb643f1` shortened the description and removed Phone Link, Dolby, `npx.exe`, orphan/slow-machine and safety-output details.
- The package has no `evals/` directory and no yao trigger cases/semantic config.

Impact:

There is no evidence that the lighter description still routes UWP-specific requests or rejects near neighbors.

Required fix:

Keep a compact description, but prove positives/negatives/near-neighbors with a domain-specific trigger eval. Add repo evals for behavior/output quality.

### P2 - Entrypoint and package governance do not match risk

Evidence:

- yao resource boundary: `2725 > 1300`, with `2649` estimated SKILL body tokens and no deferred references.
- yao validate: missing interface compatibility, activation, execution and trust fields.
- yao governance: missing manifest, score `30/100` (`draft`).
- yao trust: failure on missing trust metadata, but more importantly `script_count: 0` because `trust_check_scripts.py:23` scans only `scripts/*.py`.

Impact:

The skill is oversized on every activation and lacks ownership, review cadence, permission policy, reliable trust inventory, output evidence and rollback boundary. Automated trust output is misleading for a PowerShell-only package unless its blind spot is called out.

Required fix:

Refactor long policy into references, add the Governed manifest/interface/security/report contracts, and supplement automated gates with PowerShell-specific evidence. Label unavailable automated PowerShell trust coverage `missing evidence`.

## What Not To Do

- Do not treat the current 9/9 tests or repo validator as a safety pass.
- Do not solve the `/T` mismatch by only adding more executable names to `$processNames`; the side-effect closure remains open-ended.
- Do not add folders/reports that are not referenced by `SKILL.md` or declared in `manifest.json`.
- Do not claim the yao trust checker scanned PowerShell scripts.
- Do not validate cleanup by killing live user processes or changing registry state.

## Proposed Priority

1. P0 graph closure + workspace boundary + execution precondition.
2. P1 shared predicates, structured UWP parser, truthful verification, Phone Link evidence gate, deterministic fixtures.
3. P2 lean entrypoint, routing/output evals, Governed manifest/interface/security/reports, docs/version sync.
