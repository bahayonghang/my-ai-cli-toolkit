# Workflow Detail

This reference explains the judgment-heavy parts of the compact workflow in `SKILL.md`.

## Role split

The primary agent owns requirement interpretation, authorization, bundle preparation, and final judgment. Codex supplies an independent implementation or review perspective. Codex output is evidence, not an automatic decision: the primary agent must verify file paths, schema fields, tests, working-tree changes, and the user's scope before accepting it.

High-value Codex contributions include:

- exact schema and file references
- edge cases in implementation steps
- missing test coverage
- inconsistencies across documentation and source
- hidden assumptions with a concrete validation route

The primary agent should reject findings that conflict with verified repository facts or expand the approved scope without user authorization.

## Scenario selection

### Plan review

Use only when the user explicitly asks Codex to review a plan. Require findings across four dimensions: rationality, hidden assumptions, project conventions, and scope control. The sandbox is read-only.

### Codify

Use when the user explicitly delegates an approved coding task to Codex. Provide the full definition of done and all relevant local rules. Verify `files_changed` against the real working tree, because a structured claim is not proof.

### Review iteration

Use only after a codify round and a concrete primary-agent review. Inline the first request, first response, current files, and review. Apply the smallest changes that answer the review. Round 2 is final; further work requires a new user decision and a fresh workflow.

### Verification round

Use only after accepted findings produce a reusable pattern and a lateral repository search finds concrete candidates. It is focused validation, not a second full review. It is read-only, points to one non-verification round, and never triggers another verification round.

## Pattern extraction

For each accepted `risk`, `hidden_assumption`, or `disagreement`, ask:

1. Is the finding instance-specific or a repeatable pattern?
2. What search rule would find another instance without overmatching?
3. What evidence would confirm or refute each candidate?

Write the decision to `extracted-patterns.md`, including `no reusable pattern` when appropriate. Run a verification round only when candidates exist. Do not use pattern extraction to justify unrelated cleanup.

## Failure handling

- Preflight failure: repair the bundle; do not run Codex.
- Codex not found, timeout, interruption, or nonzero exit: preserve the bundle and failed manifest, then report the concrete failure.
- Missing or invalid response: keep the bundle for diagnosis; do not treat prose logs as a valid result.
- `files_changed` mismatch: trust the working tree, report the mismatch, and inspect before continuing.
- Verification-round failure: retain the main-round findings and mark lateral verification incomplete; do not invent verdicts.
- Unsatisfactory round 2: stop and ask the user to choose between direct repair, a new round-1 task, or abandonment.

## Output schema compatibility

`run_bundle.py` does not pass `--output-schema` by default because some Codex API proxies reject that option even when the CLI supports it. Local post-response validation remains mandatory. Use `--output-schema` only after confirming the active endpoint supports it; it adds protocol-level validation but does not replace the local validator.

## Model evolution

The defaults in `models.json` are routing choices, not permanent compatibility guarantees. Recheck model availability and scenario output quality at least quarterly. Never substitute a different model silently.

Last verified: 2026-07-22 against <https://developers.openai.com/codex/models>.

Representative live codify quality, latency, cost, and Terra/Luna verification comparisons are `missing evidence` until reproducible runs are recorded.
