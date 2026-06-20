# Neutralize out-of-repo skill references in handoff and implementation-notes

- Date: 2026-06-20
- Status: Planning
- Priority: P3 (self-containment / portability; refs resolve at runtime here)
- Task: `.trellis/tasks/06-20-neutralize-out-of-repo-skill-refs`

## Goal

Make `handoff` and `implementation-notes` self-contained by not hard-depending on skills that do not ship in this repository. They reference `writing-plans` and `subagent-driven-development`, which are **not first-party skills** in this catalog. In the current environment these names resolve at runtime (provided by an external plugin), so nothing breaks today — but the dependency breaks if the catalog is installed standalone, and it contradicts the repo's established self-containment direction.

## Confirmed Facts

- `writing-plans` and `subagent-driven-development` do not exist under `skills/` (verified). `git-commit`, `code-auditor`, `code-quality-review` DO exist in-repo.
- Out-of-repo references:
  - `handoff/SKILL.md:125` → `writing-plans`.
  - `implementation-notes/SKILL.md:32` → `writing-plans` as a **hard control-flow instruction**: "If no written spec exists yet, stop and invoke `writing-plans` first."
  - `implementation-notes/SKILL.md:107` → `writing-plans` (×2 on the line).
  - `implementation-notes/SKILL.md:108` → `subagent-driven-development`.
- These names appear in the session's available-skills list, i.e. they are supplied by an external plugin, not this repo.
- Precedent for caring about self-containment:
  - Archived task `06-06-geju-skill-optimization` explicitly required "Delete references to nonexistent skills" and "Do not reference this repository's other skills."
  - `goudi/SKILL.md` already uses generic phrasing ("hand off to the available testing workflow", "use the available planning workflow") instead of naming a specific skill — this is the model to follow.
- In-repo references (`git-commit`, `code-auditor`, `code-quality-review`, `handoff`, `implementation-notes` cross-links) are valid and should be preserved.

## Decision Needed

Confirm intent before editing: keep the connected-family naming (do nothing), or neutralize for self-containment (this task). Recommended: neutralize, matching goudi and the geju precedent.

## Requirements

1. Replace out-of-repo skill names with generic capability phrasing (e.g. "a planning workflow such as the one your environment provides", "your environment's subagent workflow"), or soften to "if available" fallback language — mirroring goudi's style.
2. For the hard instruction at `implementation-notes/SKILL.md:32`, keep the intent (a written spec/plan should exist first) but do not mandate invoking a specific non-bundled skill.
3. Preserve all in-repo references (`git-commit`, `code-auditor`, `code-quality-review`, mutual handoff/implementation-notes links).
4. No behavior change beyond reference phrasing.

## Acceptance Criteria

- [ ] `grep -rn 'writing-plans\|subagent-driven-development' skills/development-workflows/` returns 0 matches (or only inside clearly-marked "if your environment provides" fallback phrasing, named as optional).
- [ ] `implementation-notes` no longer hard-instructs invoking a non-bundled skill.
- [ ] In-repo cross-references remain intact.
- [ ] `just skills-check` passes; `just ci` clean.

## Out of Scope

- Importing `writing-plans` / `subagent-driven-development` into this repo.
- Changing the four-section model or core behavior of either skill.
