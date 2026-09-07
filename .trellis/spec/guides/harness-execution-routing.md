# Harness Execution Routing

> Assign planning and review to a strong model on the matching host. Assign
> only frozen, exclusive, checkable work to a cheaper model. Return to the
> strong model when input, permission, or failure cause is not frozen.

## Scope

This guide covers Claude Code, Codex, Grok Build, Kimi Code CLI, and OMP
(Oh My Pi). The guide is role routing. The guide is not a performance ranking,
a price ranking, or a model registry. Do not add an availability checker.

Five-host capability facts live in [`docs/harnesses.md`](../../../docs/harnesses.md)
([English](../../../docs/en/harnesses.md)). Do not copy that matrix here.

Goal start, management, and completion facts live in
[`skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md`](../../../skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md).
Do not copy that lifecycle table here. Do not edit that skill unless a later
task proves a defect in it.

Codex native subagent roles live in
[`platforms/codex/agents/README.md`](../../../platforms/codex/agents/README.md).
Confirm current-session availability and the user's model preference. Do not
pin a model name in `platforms/codex/agents/*.toml` unless the task requires a
pin. Product-side Codex efficiency roles may exist in a given session; those
names are session facts, not this repository's templates.

Host brand is not model capability. A strong model on one host is not a rank
against another host.

## Strong-model duties versus cheap-model work

A strong model owns planning, root-cause review, permission and sandbox
bounds, and the final conclusion. A cheaper model may run a sub-item only
when every input is frozen, the file bound is exclusive, and a named check
can fail the change.

| Host | Strong-model duties | Cheap-model executable sub-items |
| --- | --- | --- |
| Claude Code | Native hook contract. `CLAUDE.md` `@` import and nested load. Do not apply Codex per-layer `AGENTS.md` selection to Claude. | Confirmed text or field edits, fixtures, and small scoped implementation inside the frozen bound. |
| Codex | Cross-file root cause. Deterministic tests. Native subagent handoff and independent acceptance. Shared `AGENTS.md` versus source-template bounds. | Frozen exclusive-file implementation and fixtures after the orchestrator or main session freezes the bound. |
| Grok Build | Native project-rule, plan, and Goal seams. Grok may load `AGENTS.md`, `CLAUDE.md`, and rules together; keep shared rules in `AGENTS.md` only. | Confirmed text or field edits after the native-rule bound is frozen. |
| Kimi Code CLI | Narrow tasks bound to the installed Kimi Code CLI product version. Verify subagent semantics against that version. Do not substitute old kimi-cli docs. | Frozen exclusive-file edits after the product-version bound is confirmed. |
| OMP | ExtensionAPI, task subagent, and permission or deny bounds. Headless `yolo` removes a mode interactive gate; that mode does not bypass explicit per-tool deny. | Frozen exclusive-file edits after the permission bound is confirmed. |

Cheap-model work is the same shape on every host: confirmed text or field
edits, fixtures, and small scoped implementation. Cheap-model work is not
planning, permission design, or unexplained failure triage.

## Return to the strong model

Stop the cheap-model sub-item and return to the main-session strong model when
any of the following is true:

- The remaining input is not frozen (new requirement, new file, or new
  interpretation).
- A new permission, sandbox, approval, or host-protocol question appears.
- The failure cause is unclear after the named check.

Do not retry the same cheap-model sub-item as a substitute for root-cause
review.

## Commands are not model work

Run repository commands for generation, lint, and tests. Do not assign those
steps to a model as original work:

- `just docs-sync` / `just docs-check`
- `just skills-check`
- `just python-check`
- `just python-test`
- `just install-projects-test`
- `just node-test`
- `git diff --check`
- `just ci` when the parent or finish gate owns that run

`just python-check` compiles Python files. Compile is not event-protocol
testing. Hook stdin, exit codes, and session isolation require
`just python-test` or the owning unittest suite. See
[Quality Guidelines](../backend/quality-guidelines.md) and
[Error Handling](../backend/error-handling.md).

## Evidence bounds

- A path in docs, an installer dest map, or `hooks.json` on disk is a repo
  contract. That path is not host discovery.
- A local fixture or unittest is a deterministic package contract. That
  fixture is not provider behavior.
- Unrun client start, live hook registration, and a new-SHA hosted matrix
  stay `UNVERIFIED`. Do not mark those rows `PASS`.

Read [`docs/harnesses.md`](../../../docs/harnesses.md) for the five-host
matrix, evidence labels, and dated sources.
