# Review-Remediation Contract

Load this reference only when the requested outcome combines a named scan,
review, audit, report, or finding ledger with implementation that must converge.
It does not apply to read-only review, ordinary bug fixing without a scan source,
or Goal lifecycle management.

The skill remains a compiler. It produces reviewable text through
`compile -> lint -> present -> stop`; it does not activate the Goal, dispatch an
agent, or implement the payload. "One completion" means one externally approved
Prompt and one user launch action, with bounded internal implementation and
independent checking. It never means skipping verification.

## 1. Detection

Select the review-remediation profile only when both are true:

1. The input names a scan/review/audit/report/finding source, including
   扫描、审阅、审计、报告或 finding ledger.
2. The requested outcome is to repair, implement, or converge those results.

A Trellis task path alone does not select this profile. A request to review or
report without edits remains read-only. Once selected, lint the generated inline
or persisted contract with `--review-remediation`; do not ask the linter to infer
the profile from vague prose.

## 2. Freeze the scan envelope

Before the first product write, the generated execution contract freezes these
fields:

```text
scanner: authoritative command or named entrypoint
scanner_identity: version, commit, or UNVERIFIED
config: path/hash plus material flags
inputs: window/corpus/session IDs or a stable enumeration source
targets: paths, modules, or files
baseline_report: path or artifact ID
git_baseline: branch + HEAD + dirty-scope summary
```

Repository-readable facts are discovered by the executor. A value that cannot
be stabilized is labeled `UNVERIFIED`, bounded by repeated runs, and paired with
a second evidence source. If scanner, config, inputs, targets, or corpus changes
materially, the executor must establish a new baseline or enter `BLOCKED`; a
drifted result cannot be called clean or compared as if it used the old envelope.

## 3. Stable finding ledger

The main session owns one ledger for the whole Goal:

```text
id, severity, path_or_scope, issue, fix_required, test_required,
status(open|fixed|wontfix|blocked), evidence
```

IDs remain stable across rounds. Merge duplicate root causes while preserving
their sources. Same-scope findings discovered by the checker or the final scan
are appended to this ledger, not converted into another user handoff. `wontfix`
requires source or contract evidence. `blocked` is reserved for new authority,
external-state change, or a user-owned product decision.

## 4. Internal feedback edge

The execution state machine is:

```text
PREPARE -> QUESTION_BLOCKED | IMPLEMENT -> CHECK_TARGETED
CHECK_TARGETED -> PASS | FINDINGS | BLOCKED
FINDINGS -> LEDGER_MERGE -> IMPLEMENT
PASS -> RESCAN_SAME_ENVELOPE -> FINAL_GATE -> CLOSEOUT -> COMPLETE
BLOCKED -> STOP_REPORT
```

For the default Trellis path, `trellis-implement` writes product changes and
`trellis-check` independently returns exactly `PASS`, `FINDINGS`, or `BLOCKED`.
The main session deduplicates `FINDINGS`, feeds actionable same-scope entries
back to implementation in the same task, and asks the checker to recheck. If a
host cannot reuse a worker, a replacement worker receives the same task
artifacts, scan envelope, and full ledger. It must not require the user to
create, paste, or approve a second repair Prompt.

Explicit subagent opt-out and verified inline fallback use the project inline
shape, but preserve the same ledger, independent check, feedback, and rescan
semantics.

## 5. The only question gate

Before the first product write, separate:

1. facts answerable from the repository;
2. implementation choices inside approved contracts and authority;
3. user-owned decisions that materially change scope, risk, cost, public
   behavior, or authorization.

Only an unresolved third-category decision may use a structured question tool.
Claude Code names `AskUserQuestion`; another host uses its actual equivalent,
and a host without one asks one concise question. Typical legal questions cover
expanded write scope, public API/compatibility/product semantics, a dependency,
remote/production/paid/credential/publish/push/destructive work, overwrite, or
mutually exclusive product policy.

Do not ask for ordinary implementation details, permission to fix an already
approved finding, permission to rerun the frozen scan, per-batch approval, or
merely because a new same-scope finding appeared. This requirement belongs to
the generated execution text; it does not grant `AskUserQuestion` to
`goal-meta-skill` itself.

## 6. Bounded convergence

Allow at most three focused repair rounds. If the same finding signature shows
no progress for two consecutive rounds, or any actionable finding remains open
after round three, enter `BLOCKED` and report the residual ledger. Never mark the
Goal complete and never emit another repair Prompt in that state.

`COMPLETE` is conjunctive and requires all of the following:

1. `open actionable findings = 0` inside the frozen target set;
2. the original scanner reruns with the same envelope and succeeds;
3. focused regression checks and the named final gate (for this repository,
   normally `just ci`) pass;
4. diff and status evidence prove no scope escape;
5. missing provider, human, field, or telemetry evidence remains explicitly
   labeled rather than inferred from fixtures.

Only after this gate may a Trellis contract enter its existing current-task
product-and-planning commit, history confirmation, and separate archive cadence.

## 7. Evidence labels

- `validated advantage`: supported by current local deterministic checks.
- `recorded_fixture`: reviewable static output/eval evidence only.
- `hypothesis`: plausible behavior not observed in a live provider run.
- `missing evidence`: provider execution, blind human review, fresh-Agent
  handoff, or telemetry that was not run.

Static lint and fixtures prove the generated contract shape. They do not prove
that a future host follows it or that real repair-Prompt counts improve.

## 8. Fail-closed field ownership

The deterministic profile validates each inline `/goal` block independently;
wrapper prose or another language mirror cannot supply missing clauses. Put the
structured envelope records in `Verification` (or persisted `Required reading
and current context`), the question and no-second-Prompt gates in `Constraints`,
the stable ledger/checker feedback/round cap in `Iteration policy`, the
conjunctive zero-open rescan gate in `Stop when` / `Completion conditions`, and
drift/stall/residual-ledger termination in `Pause if` / `Pause / stop
conditions`.

Field names without concrete values, duplicated envelope records, a glossary of
keywords in the wrong field, or simultaneous prohibition and authorization of
a new repair Prompt fail `--review-remediation`. This structure is for
deterministic validation; the semantic rules above remain authoritative.
