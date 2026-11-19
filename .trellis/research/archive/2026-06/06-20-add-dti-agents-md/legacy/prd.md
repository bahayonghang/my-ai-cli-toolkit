# Add developer-tools-integrations house-style AGENTS.md

## Goal

Give `skills/developer-tools-integrations/` a category-level `AGENTS.md` that
pins the conventions its 7 skills keep diverging on, modeled on the existing
`skills/git-github-collaboration/AGENTS.md`. This is the root-cause fix: without
a written anchor, the script-path / evals / interface drift recurs.

## Background / evidence

- `git ls-files "skills/**/AGENTS.md"` → only `git-github-collaboration/AGENTS.md`.
- The git-github AGENTS.md exists specifically because that suite "drifted apart
  again"; this category has the same problem and no anchor.

## Requirements

Author `skills/developer-tools-integrations/AGENTS.md` covering at least:

1. **Script path resolution** — codify the `<skill-dir>` literal-substitution
   convention (no bare `$SKILL_DIR`, no cwd-relative paths). Reference the
   git-github rule rather than restating it at length if that reads cleaner.
2. **`allowed-tools`** — declare exactly the real Claude Code tools each skill
   uses; note that `Bash(python *)` is the correct form for script-running skills
   and that bare `python` is not a tool token.
3. **Evals** — one format and location (`evals/evals.json`), the chosen key name
   (`assertions[]` vs `expectations` — pick one for the category and justify),
   and the rule to include ≥2 near-neighbor routing-negative cases. Note that CI
   does not execute evals today (they are review/future-tooling assets).
4. **Interface contract** — single neutral `agents/interface.yaml`
   (`display_name`, `short_description`, `default_prompt`); no platform-named
   `openai.yaml` duplicates. State whether interface files are required or
   optional for this category (5 of 7 skills currently have none).
5. **Reference exemplar** — name the skill other skills here should imitate
   (recommend `claude-md-improver` or `agents-md-improver` for structure; pick one).
6. **Intentional exceptions** — record any deliberate asymmetries (e.g. which
   skills legitimately have no script, no evals, or no interface file) so they
   are not "fixed" later as drift.

## Constraints

- This is documentation, not a refactor: the AGENTS.md describes the target
  state; the actual conforming edits live in the sibling child tasks.
- Keep it concise and scoped to this category, mirroring the git-github file's
  density. Do not duplicate repo-root `CLAUDE.md` content.

## Acceptance Criteria

- [ ] `skills/developer-tools-integrations/AGENTS.md` exists and covers the 6
      areas above.
- [ ] Conventions are consistent with `git-github-collaboration/AGENTS.md` (no
      contradictory guidance between the two house styles).
- [ ] The file names a concrete reference exemplar skill.
- [ ] `just ci` passes clean (AGENTS.md is not parsed by `check.py`, but the diff
      must not break `git diff --check`).

## Notes

- Lightweight task: PRD-only is sufficient.
- Recommended to land before `harmonize-dti-evals` and `normalize-dti-frontmatter`
  so they apply exactly what this file codifies.
