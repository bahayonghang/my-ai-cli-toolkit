# Harmonize evals schema and add routing-negative cases

## Goal

Bring the category's eval files onto one schema and make them actually exercise
routing, so they function as the trigger-quality assets the agent-skill-review
rubric expects (should-trigger, should-not-trigger, near-neighbor).

## Background / evidence

| Skill | evals? | key used | routing-negative cases |
|---|---|---|---|
| `ast-grep` | yes (3) | `expectations` | 0 |
| `archive-planning` | yes (3) | none (`id/prompt/expected_output/files` only) | 0 |
| `goal-meta-skill` | yes (6) | `expectations` | 1 (eval #6) |
| `agents-md-improver` | no | — | — |
| `claude-md-improver` | no | — | — |
| `codex-workflow-recommender` | no | — | — |

Reference schema: `git-github-collaboration/AGENTS.md:32-42` →
`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`,
with ≥2 near-neighbor routing-negative cases per skill.

## Requirements

1. Adopt the schema/key chosen by `06-20-add-dti-agents-md` (default: rename
   `expectations` → `assertions` to match the repo's git-commit schema). Apply to
   `ast-grep`, `goal-meta-skill`, and `archive-planning`.
2. `archive-planning/evals/evals.json`: add an `assertions[]` array to each eval
   (it currently has none).
3. Add ≥2 near-neighbor routing-negative cases to each eval-bearing skill:
   - `ast-grep`: e.g. an exact-string search that should route to `rg`, and a
     rename/type-resolution request that should route to language tooling/LSP.
   - `archive-planning`: e.g. a request to archive nested/unrelated notes (out of
     contract), and a planning-doc *edit* request (not an archive).
   - `goal-meta-skill`: already has #6; add one more (e.g. a request that should
     route to `agents-md-improver` or a plain Codex CLI question).
4. Decide and record whether the 3 eval-less skills get evals now or are listed
   as a deliberate gap in the AGENTS.md. Adding stubs is optional and lower value
   than fixing the existing three.

## Constraints

- Keep prompts in their natural language (ast-grep/goal-meta mix EN/中文 already);
  write `expected_output` and assertions in English to match the house schema.
- Do not weaken or delete existing valid eval cases; only add/normalize.
- Valid JSON; UTF-8.

## Acceptance Criteria

- [ ] `ast-grep`, `archive-planning`, `goal-meta-skill` evals all use the same
      key name agreed in the AGENTS.md.
- [ ] Each of those three has ≥2 near-neighbor routing-negative cases.
- [ ] `archive-planning` evals carry an assertions array per case.
- [ ] All three `evals.json` parse as valid JSON
      (`python -c "import json,glob; [json.load(open(p,encoding='utf-8')) for p in glob.glob('skills/developer-tools-integrations/*/evals/evals.json')]"`).
- [ ] `just ci` clean.

## Notes

- Lightweight task: PRD-only is sufficient.
- CI does not execute evals today; correctness here is schema + coverage, not a
  passing eval run.
