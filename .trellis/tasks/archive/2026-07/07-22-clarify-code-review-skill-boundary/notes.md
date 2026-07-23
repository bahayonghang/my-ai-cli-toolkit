# Execution notes — clarify-code-review-skill-boundary

## Changes (R1–R3)

- **R1** `skills/development-workflows/code-quality-review/SKILL.md` (When to Use, body):
  bare `code review` → `code review focused on quality/maintainability`.
  Frontmatter `description` left unchanged (already maintainability-scoped, no
  `audit`/`全维度` triggers), so no `docs-sync` was required.
- **R2** `skills/development-workflows/code-quality-review/evals/evals.json`:
  added two near-neighbor routing-negatives — `#7` full-spectrum/多维审计 → code-auditor
  (mirrors code-auditor `#5`), `#8` "直接重构/落地改动" → code-refactor. This brings the
  suite (`AGENTS.md`) ≥2 routing-negative convention from 0 → 2. JSON validated, ids 1..8
  contiguous.
- **R3** `skills/development-workflows/AGENTS.md`: new "Routing: code-auditor vs
  code-quality-review" section covering purpose / triggers-routing / output-contract, and
  the deliberate design decisions (do not merge; keep severity vocabularies separate).

## Verification

- `just ci` — **green** (2026-07-22): docs-check "catalog up to date (31 skills, 69 files)"
  - vitepress build OK; skills-check all `[OK]`; python-check 42 files; node-test 130 pass /
    2 skip / 0 fail; `git diff --check` only a benign LF→CRLF line-ending warning.

## Missing evidence

- Acceptance item "跑 `trigger_eval.py` 路由回归 (yao-meta)": **script not available**. Not in
  this repo and not under `~/.claude` (yao-meta is not bundled here). Evals are static
  regression fixtures that CI does not execute (`AGENTS.md` Evals section). The added `#7`/`#8`
  routing-negatives are ready to be exercised whenever a routing-eval harness is present.
