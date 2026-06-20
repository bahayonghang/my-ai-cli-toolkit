# Fix broken script-path invocation in archive-planning and goal-meta-skill

## Goal

Make both script-bearing skills in this category invoke their bundled Python
scripts through a path that actually resolves at runtime, using the repo's
established `<skill-dir>` literal-substitution convention.

## Background / evidence

- `archive-planning/SKILL.md:30` → `python "$SKILL_DIR/scripts/archive_planning.py" "$ARGUMENTS"`
- `archive-planning/SKILL.md:36` → `python "$SKILL_DIR/scripts/archive_planning.py"`
- `goal-meta-skill/SKILL.md:59-60` → `python scripts/lint_goal_command.py <file>` /
  `py -3 scripts/lint_goal_command.py <file>` (cwd-relative)
- `goal-meta-skill/SKILL.md:134` references the script by relative path too.
- Authority for the fix: `skills/git-github-collaboration/AGENTS.md:8-17`
  — refer to the skill's own dir as `` `<skill-dir>` `` and instruct the agent to
  substitute the literal path announced when the skill loads; do **not** use bare
  `$SKILL_DIR`. Scripts self-locate via `Path(__file__)`, so only the path must
  resolve. The `gh-*` skills and `git-commit` are the working exemplars.

## Requirements

1. Replace bare `$SKILL_DIR/scripts/...` in `archive-planning/SKILL.md` with the
   `<skill-dir>/scripts/...` convention (quoted), matching the gh-\* phrasing
   ("substitute the literal path announced when the skill loads").
2. Replace the cwd-relative `scripts/lint_goal_command.py` invocations in
   `goal-meta-skill/SKILL.md` (workflow step 10 and the Reference Files section)
   with the same `<skill-dir>/scripts/...` convention.
3. Keep the existing Python interpreter probe intent (`python` / `py -3`); do not
   regress the Windows-friendly `py` fallback that goal-meta-skill already shows.
4. Decide how to handle `$ARGUMENTS` in archive-planning: keep it only if it is
   genuinely substituted in this skill-runner context; otherwise describe the
   argument in prose the way gh-\* skills do. Document the decision in the task.
5. Do not modify the Python scripts themselves — they already self-locate and
   pass their tests. This is a SKILL.md-only change.

## Constraints

- Surgical edits to the two SKILL.md files only.
- Preserve each skill's behavior contract and output wording.

## Acceptance Criteria

- [ ] No bare `$SKILL_DIR` remains in either SKILL.md
      (`grep -rn 'SKILL_DIR' skills/developer-tools-integrations` returns nothing).
- [ ] No cwd-relative `scripts/...` invocation remains in `goal-meta-skill/SKILL.md`.
- [ ] Both skills describe script invocation the same way the gh-\* skills do.
- [ ] `just node-test` still passes (archive-planning + goal-meta tests unaffected).
- [ ] `just skills-check` clean for both skills.

## Notes

- Lightweight task: PRD-only is sufficient.
- If `06-20-add-dti-agents-md` lands first, follow the exact phrasing it codifies.
