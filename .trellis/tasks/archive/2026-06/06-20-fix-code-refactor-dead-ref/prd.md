# Fix code-refactor dead skill reference

- Date: 2026-06-20
- Status: Planning
- Priority: P1 (broken routing pointer)
- Task: `.trellis/tasks/06-20-fix-code-refactor-dead-ref`

## Goal

Remove the dead cross-skill reference in `code-refactor`. The skill routes architecture/RFC requests to `improve-codebase-architecture`, but that skill was **deleted from the repo** (commit `981100d`, "移除 improve-codebase-architecture 技能"). The pointer now sends users to a skill that does not exist.

## Confirmed Facts

- `skills/development-workflows/code-refactor/SKILL.md:29` routes "Architecture/RFC request" work to `improve-codebase-architecture`.
- `improve-codebase-architecture` no longer exists anywhere under `skills/` (verified by repo-wide grep; only this one reference remains).
- Git history confirms removal: commit `981100d chore(skills): [AI] 🔧 移除 improve-codebase-architecture 技能`.
- The other cross-skill reference in `code-refactor` — `code-quality-review` (line 28) — is valid and must be preserved.

## Requirements

1. Fix `code-refactor/SKILL.md:29` so it no longer points to a nonexistent skill. Choose the option that best preserves routing intent:
   - Option A (preferred): replace the pointer with a generic boundary, e.g. route deep-module/architecture-RFC work to a dedicated architecture/RFC or planning workflow, without naming a nonexistent skill.
   - Option B: drop the line entirely if the "Architecture/RFC request" branch no longer adds routing value.
2. Keep the valid `code-quality-review` reference (line 28) intact.
3. No behavior change to the refactor workflow itself.

## Acceptance Criteria

- [ ] `grep -rn 'improve-codebase-architecture' skills/` returns 0 matches.
- [ ] `code-refactor/SKILL.md` still routes review-only requests to `code-quality-review`.
- [ ] `just skills-check` passes for `code-refactor`.
- [ ] Diff is limited to the dead-reference line.

## Out of Scope

- Re-creating an `improve-codebase-architecture` skill.
- Broader rewrite of `code-refactor` routing or refactor types.
