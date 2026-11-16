# Normalize and backfill development-workflows evals

- Date: 2026-06-20
- Status: Planning
- Priority: P2 (convention drift + coverage gap)
- Task: `.trellis/tasks/06-20-normalize-dev-workflows-evals`

## Goal

Make every `development-workflows` skill's evals use one schema, and backfill the skills missing evals. The repo's documented eval convention (`developer-tools-integrations/AGENTS.md` "Evals") mandates `evals/evals.json` with the git-commit schema using the key **`assertions`** — but this subtree currently mixes `assertions`, `expectations`, and none.

## Confirmed Facts

Eval-item key audit across `skills/development-workflows/*/evals/evals.json`:

| Skill                   | eval-item keys                                                     | Status               |
| ----------------------- | ------------------------------------------------------------------ | -------------------- |
| cold-shower             | `assertions`, expected_output, files, id, prompt                   | ✅ canonical         |
| code-quality-review     | **`expectations`**, expected_output, files, id, prompt             | drift                |
| code-refactor           | **`expectations`**, expected_output, files, id, **`name`**, prompt | drift + stray `name` |
| codex-dynamic-workflows | **`expectations`**, expected_output, files, id, prompt             | drift                |
| goudi                   | **`expectations`**, expected_output, files, id, prompt             | drift                |
| html-artifact           | **`expectations`**, expected_output, files, id, prompt             | drift                |
| code-auditor            | expected_output, files, id, prompt                                 | no assertions array  |
| handoff                 | expected_output, files, id, prompt                                 | no assertions array  |

Missing `evals/` entirely (backfill targets):

- `geju` — notable because its sibling `goudi` has evals (inconsistent pair).
- `implementation-notes` — only ships `SKILL.md`.
- `spark` — ships `tests/` but no `evals/`.

- Convention source: `developer-tools-integrations/AGENTS.md` — key must be `assertions`; include ≥2 routing-negative near-neighbor cases; keep prompts in their natural language, write `expected_output`/`assertions` in English.
- CI does not execute evals (`scripts/check.py` validates only frontmatter); evals are review/regression assets, so this is correctness-of-convention, not a build break.

## Requirements

1. Rename `expectations` → `assertions` in: code-quality-review, code-refactor, codex-dynamic-workflows, goudi, html-artifact. Preserve content/order.
2. Remove the stray `name` key from code-refactor eval items (id is the stable identifier).
3. Add an `assertions` array to code-auditor and handoff eval items (derive from existing `expected_output` intent; keep `expected_output`).
4. Backfill `evals/evals.json` for geju, implementation-notes, spark using the git-commit schema (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`), each with ≥2 routing-negative near-neighbor cases.
5. Do not change SKILL.md routing/behavior; this task only touches `evals/`.
6. Defer to the conventions in task `06-20-dev-workflows-agents-md` if it lands first; otherwise follow the DTI AGENTS.md eval rules directly.

## Acceptance Criteria

- [ ] Every `evals/evals.json` under `development-workflows` uses `assertions` (0 occurrences of `expectations`).
- [ ] No eval item carries a stray `name` key.
- [ ] geju, implementation-notes, and spark each have `evals/evals.json` with ≥2 routing-negative cases.
- [ ] All `evals.json` parse as valid JSON and follow the git-commit schema shape.
- [ ] `just ci` passes (run `just docs-sync` first since adding `evals/` can drift the docs catalog).

## Out of Scope

- Building an eval _runner_ (CI does not execute evals).
- Editing SKILL.md content or triggers.
