# Design - Governed hardening for windows-dev-process-cleanup

## Scope Boundary

Primary source changes stay in:

- `skills/developer-tools-integrations/windows-dev-process-cleanup/`
- generated docs produced by `just docs-sync`
- this Trellis task's research/evaluation evidence

Do not change yao-meta to support PowerShell. Do not create a generalized Windows process-management library.

## Package Shape

The package remains one skill with two self-contained PowerShell entrypoints. The additions must earn their place:

- `SKILL.md`: trigger surface, audit-first skeleton, safe defaults, branch selection, output contract; Governed initial load <=1300 tokens.
- `references/safety-policy.md`: profile semantics, protected/unknown rules, confirmation and communication rules.
- `references/windows-command-contracts.md`: `tasklist /apps`, `taskkill /T`, CIM identity limits and Phone Link evidence, each with `Last verified` metadata.
- `scripts/*.ps1`: deterministic snapshot, normalization, classification, planning, precondition and execution logic.
- `tests/fixtures/`: `file-backed fixture` inputs for process graphs, UWP CSV and registry states.
- `tests/audit-scripts.test.mjs`: parser and safety regression suite with injected side effects.
- `evals/evals.json`: repo behavior/output fixtures, including routing negatives.
- `evals/output/`: without-skill/with-skill cases for cleanup-plan quality; only if referenced by the output scorecard.
- `manifest.json`: owner, quarterly review, Governed lifecycle, contracts and factory components.
- `security/permission_policy.json`: declared local capabilities and review expiry.
- `reports/security_trust_report.md`: `trust report`, including the `.ps1` scanner blind spot.
- `reports/output_quality_scorecard.md`: assertion-grade output evidence and `missing evidence` disclosures.
- `reports/output-risk-profile.md`: predicted false cleanup, unsupported mutation and dishonest-result failures.
- `agents/interface.yaml`, README files and generated docs: aligned public contract.

No folder is added unless `SKILL.md`/manifest references it and a validation or review step consumes it.

## Runtime Data Flow

```text
full process/app snapshot
        |
        v
normalize identities and paths
        |
        v
classify every affected member
        |
        v
build immutable cleanup plan + blocked reasons
        |
        +---- audit / WhatIf -> render only
        |
        v
recapture + compare identity and descendant closure
        |
   drift? ---- yes ----> precondition-failed, zero side effects
        |
        no
        v
execute injected side effect
        |
        v
verify every planned target + render aggregate result
```

The plan is the single fact model for JSON, Markdown and console output. Selection predicates must not be duplicated between recommendation, summary and cleanup.

## Dev Process Graph

### Snapshot

- Query `Win32_Process` once for the full local process census.
- Identify candidate roots from known dev wrappers/tools, but calculate ancestors and descendants from the full map.
- For every affected member retain PID, PPID, name, command line, creation/start time when readable, and a stable identity fingerprint.
- Missing command/start information is a conservative blocker for automatic cleanup, not an empty generic value that can pass.

### Classification

- Return a set of member roles instead of one first-match label. Roles include target (`npm-outdated`, `playwright-mcp`, workspace dev server), protected (`dev-server`, IDE/language service), allowed wrapper, and unknown.
- A tree can have multiple roles. `mixed_tree` is derived from role sets and remains an additive compatibility field.
- Automatic profiles require a closed affected set: target roles plus explicitly allowed wrappers only. Protected/unknown members set `blocked=true` with member-specific reasons.

### Workspace Matching

- Normalize the requested path with Windows path semantics and a consistent trailing separator policy.
- Extract/normalize path-like command tokens when feasible; use escaped segment-boundary matching as a fallback.
- Never treat a raw substring as a workspace identity.
- A nonexistent path is allowed only in audit mode with an explicit `workspace_path_status`; cleanup requires a resolvable/canonical target or fails closed.

### Staleness

- Use a bounded positive integer parameter.
- Implement one pure predicate for Codex ownership + age threshold + complete identity evidence.
- Recommendation, counters and cleanup filters call the same predicate.

## Cleanup Plan and Execution

The plan contains:

- `plan_id`: deterministic hash of profile, normalized inputs and ordered target fingerprints.
- `captured_at`, `profile`, normalized arguments.
- `targets`: full roots and affected members.
- `blocked_targets`: PID/member/reason.
- `preconditions`: identity and descendant-set facts to recapture.

Before cleanup, recapture each root and descendant closure. Any changed/missing identity or unplanned descendant returns `precondition-failed`; this is not silently converted to `not-found` unless the whole target exited before execution and no replacement identity exists.

`taskkill /T /F` may remain only after the full closure is approved and revalidated. Side effects stay injectable in tests. Afterwards, query every planned PID/fingerprint and report per member; `$LASTEXITCODE` is evidence but not the final truth source.

## UWP/App Parsing

- Execute `tasklist /apps /fo csv /nh` and capture exit code/stderr.
- Parse CSV with explicit four-column headers, independent of localized display headers and memory formatting.
- Separate executable display suffix from process image name without using it as package identity.
- Validate positive PID and non-empty package identity before grouping.
- A command or schema error produces `audit_status=failed`, an empty target set, and a diagnostic; cleanup must not continue.

Phone Link and Dolby selection use normalized package family prefixes plus expected process identities. Dolby remains terminate-only; no package/service/audio mutation is introduced.

## Phone Link Decision Gate

Implementation first records authoritative evidence for the current Windows contract.

- If supported: keep the existing flag, add before/after registry state, restore behavior/command, fixtures and explicit partial-failure semantics.
- If unsupported or unverifiable: deprecate the mutation, make the flag fail with an actionable compatibility message (or run as audit-only during a documented transition), remove claims that it disables background access, and point to supported Windows Settings guidance if available.

This gate is deliberately asymmetric: lack of evidence chooses the safer behavior.

## Output Contract

Audit output returns:

- snapshot status and timestamp
- normalized arguments
- complete tree/group/member facts
- recommendations and blocked reasons
- cleanup plan/plan_id when applicable
- `missing evidence` markers for unreadable identity fields

Cleanup output additionally returns:

- precondition result
- side-effect command status
- per-member verified outcome
- aggregate `preview`, `terminated`, `partial`, `failed`, `precondition-failed`, or `no-targets`
- registry before/after/rollback facts only if the supported mutation path remains

Existing fields remain. New fields are additive. Console and Markdown derive from the same result object.

## Governed Contracts

`manifest.json` declares:

- owner `lyh`, quarterly review, active Governed lifecycle
- `input_files`: test/eval snapshots classified literally as `file-backed fixture`
- `output contract`: complete plan, blocked reasons, precondition and verified result; never call an unverified kill successful
- `rollback boundary`: process termination is irreversible; only prevention/precondition exists. Report files are local/reversible. Registry mutation is either removed or paired with explicit before-state recovery.
- `trust report`: `reports/security_trust_report.md`

Permission policy declares capabilities without claiming runtime enforcement:

- process/CIM read
- local subprocess (`tasklist`, `taskkill`)
- process termination
- report file write
- conditional registry read/write only if the evidence gate passes

The yao trust check runs, but its `scripts/*.py` inventory limitation is recorded as `missing evidence`; PowerShell parse tests, AST-based side-effect tests, permission review and manual script inventory supply the actual trust evidence.

## Trigger and Output Evaluation

Trigger cases include:

- positives: stale Playwright MCP, orphan npm, workspace dev server cleanup, Phone Link/Dolby `backgroundTaskHost` pileups, Chinese Task Manager noise.
- should-not-trigger: generic Windows slowness, malware suspicion/incident response, service disable/uninstall, non-Windows process cleanup.
- near-neighbors: task-manager explanation without cleanup, general performance profiling, package/app removal.

Use a domain-specific semantic config. Do not reuse yao's default skill-creation config.

Output cases grade material safety behavior:

- full affected-member plan
- blocked unknown/protected member
- invalid stale/path rejection
- precondition drift
- truthful partial/failure result
- Phone Link evidence/rollback disclosure

Static fixtures do not count as model-executed evidence. Provider-backed runs, human blind review and telemetry remain `missing evidence` unless actually collected.

## Compatibility and Versioning

- Preserve profile names, parameter names and existing JSON fields.
- Add fields/result values without deleting old fields.
- If Phone Link mutation remains compatible and only safety checks tighten, target `1.2.0`.
- If the mutation flag is removed or made hard-failing without a compatibility period, target `2.0.0` and add a migration note.
- Safety-driven fail-closed changes are intentional, but must be documented.

## Rollback Boundary

- Source/package changes roll back through git before release.
- Process termination cannot be rolled back; correctness depends on plan closure and precondition checks.
- Report/fixture files are local and removable.
- Registry change must have a tested restore path or not ship.
- No real cleanup or registry mutation is allowed during validation.
