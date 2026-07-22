---
name: codex-bridge
description: Use when the user explicitly asks the current agent to involve Codex CLI by reviewing a plan, implementing code, revising an implementation after review, or verifying extrapolated findings. Supports "让 Codex 审一下", "交给 Codex 实现", and explicit Claude-to-Codex collaboration through portable file-backed bundles. Do not use for ordinary code review, generic multi-agent orchestration, session handoff, or any request that does not explicitly ask Codex to participate.
category: development-workflows
tags:
  - codex
  - collaboration
  - code-review
  - implementation
  - cross-platform
version: 1.0.0
allowed-tools: Read, Write, Glob, Grep, Bash
metadata:
  owner: lyh
  review_cadence: quarterly
---

# Codex Bridge

Package context, run Codex with a fixed sandbox, validate its response, and synthesize verified findings.

> Replace `<skill-dir>` with this skill's literal directory. On Windows, `py -3` may replace `python`.

## Scenarios

| Scenario | Purpose | Sandbox | Default model |
| --- | --- | --- | --- |
| `plan-review` | Review an explicit plan | `read-only` | `gpt-5.6-sol` |
| `codify` | Implement approved work | `workspace-write` | `gpt-5.6-sol` |
| `review-iteration` | Apply focused review; round 2 is final | `workspace-write` | `gpt-5.6-terra` |
| `verification-round` | Verify extrapolated instances | `read-only` | `gpt-5.6-sol` |

Sandbox is code-owned. Only model and effort accept project or CLI overrides.

## Workflow

1. Confirm explicit Codex intent and select one scenario.
2. Create a round: `python "<skill-dir>/scripts/create_bundle.py" <scenario> "<project-root>"`.
3. Distill decisions, rejected approaches, unknowns, and session provenance into `conversation.md`.
4. Copy required sources into `files/` as a `file-backed fixture`.
5. Fill every placeholder in `request.md`. Do not omit referenced plans, conventions, or reviewed files.
6. Set manifest session, previous-round, and verification-purpose fields.
7. Run `python "<skill-dir>/scripts/validate_bundle.py" "<bundle>" --phase preflight`; fix every failure.
8. For workspace-write, preserve unrelated changes and enforce the authorized scope.
9. Run `python "<skill-dir>/scripts/run_bundle.py" "<bundle>"`. Add `--output-schema` only when the active Codex endpoint supports protocol-level schema validation.
10. Run `python "<skill-dir>/scripts/validate_bundle.py" "<bundle>" --phase post-response`.
11. Compare `files_changed` with the working tree; synthesize accepted, rejected, and uncertain points.
12. Record pattern extraction; verify only concrete lateral candidates. Never recurse or create round 3.

Read [workflow detail](references/workflow-detail.md), [bundle conventions](conventions.md), and the scenario `prompt-notes.md` before filling a bundle. Use [checklist.md](checklist.md) before execution and [jsonl-guide.md](jsonl-guide.md) when locating source conversations. Routing review cases live under `evals/` and load only for route evaluation.

## Governance

- `owner`: lyh; `review cadence`: quarterly and whenever the Codex model family changes.
- `input_files`: user-authorized plans, source files, project rules, and distilled conversation fixtures.
- `output contract`: a retained bundle, validated `response.json`, and a primary-agent synthesis with real working-tree verification.
- `rollback boundary`: remove this skill directory, then run `just docs-sync` to remove generated catalog entries.
- `trust report`: `reports/trust-report.md`; output evidence: [reports/output_quality_scorecard.md](reports/output_quality_scorecard.md). Unrun telemetry, live Codex benchmarks, and approval metrics remain `missing evidence`.

Model names evolve. Verify current availability against the official Codex models page before changing `models.json`; do not silently fall back to an obsolete model.
