---
name: agents-md-improver
description: Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation. Use for effective-chain audits, nested conflicts, stale commands, scoped-guidance gaps, approved updates, 优化 AGENTS.md, 审计 Codex 项目指导, 更新 AGENTS.md, or 生成 code_map.md. Exclude Claude-only guidance, general Codex workflow advice, explanations, ordinary code/docs review, and implicit fully specified trivial edits.
version: 1.2.0
category: developer-tools-integrations
tags:
  - codex
  - agents-md
  - repository-guidance
  - codex-cli
  - codex-app
  - audit
  - documentation
argument-hint: "[audit-or-update-goal]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git *), Bash(rg *)
---

# AGENTS.md Improver

Produce lean repository guidance grounded in the Codex instruction chain that
applies to the launch context.

## Action Boundary

- Audit/optimize/plan: inspect and return an evidence-first report with proposed
  diffs; do not write.
- Approved plan or explicit scoped change/fix: edit local in-scope files and
  validate without another approval round.
- Fully specified trivial edit: implicit routing stays with direct editing;
  explicit skill invocation uses a minimal check, edit, validation, then stops.
- Confirm user-global, external, destructive, costly, or scope-expanding work.
  Never write Codex-home guidance unless requested.

## Workflow

1. Resolve project root, launch CWD, candidates, and effective config evidence.
   Read [Codex discovery semantics](references/codex-agents-discovery.md) before
   declaring files active. Prefer structured tools; use one-line
   `rg --files --hidden` with include/exclude globs as the shell fallback.
2. Build the root-to-CWD chain, shadows, empty-file and byte-budget state.
   Inventory off-chain files separately; unavailable config is `missing evidence`.
3. Verify commands, paths, ownership, boundaries, and recurring failures. Apply
   [quality criteria](references/quality-criteria.md); decide durable instruction
   need independently from navigation need.
4. Use [the report contract](references/report-format.md) for audits. For edits,
   follow [update guidelines](references/update-guidelines.md) and evidence-backed
   [templates](references/templates.md).
5. Run the smallest checks proving the changed claims, then stop.

## Evidence Rules

- Separate facts, defaults, inference, and missing evidence; retry suspiciously
  empty reads once or twice.
- Treat `evals/` as release evidence, not model or human proof.
- Preserve human/managed content. Change both sibling fenced `code_map.md`
  templates only when their shared contract changes.
- Audit existing overrides; create one only for an explicit temporary or strong
  override need.

## Output Contract

Audit output: prioritized findings/evidence/impact/diffs/confidence, conditional
chain/shadows, separate AGENTS/map decisions, validation, and risk. Edit output:
changed files/outcome/preservation and passed/failed/skipped checks. Omit empty
sections; evidence outranks scores.
