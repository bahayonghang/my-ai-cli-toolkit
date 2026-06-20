# Fix code-auditor broken $SKILL_DIR script paths

- Date: 2026-06-20
- Status: Planning
- Priority: P1 (runtime defect)
- Task: `.trellis/tasks/06-20-fix-code-auditor-skill-dir`

## Goal

Make `code-auditor` resolve its bundled references, assets, and scripts at runtime. The skill currently instructs the agent to read files via `$SKILL_DIR/...`, but `$SKILL_DIR` is **unset at runtime** and expands to broken paths like `/references/review-dimensions.md` and `/scripts/pr-analyzer.py`.

`code-auditor` is the only skill in `skills/development-workflows/` still using the broken `$SKILL_DIR` pattern. This was previously identified as a known-broken, out-of-scope item now due for repair.

## Confirmed Facts

- `$SKILL_DIR` is not set in this environment (verified separately; `echo "${SKILL_DIR:-UNSET}"` → `UNSET`). A SKILL.md telling the agent to run `python "$SKILL_DIR/scripts/x.py"` expands to a broken `/scripts/x.py`.
- Broken usages (9 total):
  - `skills/development-workflows/code-auditor/SKILL.md` lines 82, 83, 84, 86, 87 (references + assets paths).
  - `skills/development-workflows/code-auditor/references/workflow-guide.md` lines 10, 24, 70 (references/languages, `scripts/pr-analyzer.py`, assets report template). Line 24 is a script invocation, so the script call itself is broken.
- Repo-canonical convention (documented in `skills/developer-tools-integrations/AGENTS.md` "Script path resolution", exemplars `archive-planning` and `goal-meta-skill`):
  - Refer to the skill's own directory as the `` `<skill-dir>` `` literal-substitution placeholder.
  - Add a one-line note instructing the agent to substitute the path announced when the skill loads.
  - Do **not** use a bare `$SKILL_DIR`; do **not** use cwd-relative `python scripts/foo.py` (cwd is normally repo root).
  - Bundled scripts self-locate via `Path(__file__)`, so only the script _path_ must resolve.
- All bundled scripts (`pr-analyzer.py`, `issue-aggregator.py`, `rule-tester.py`) already self-locate; no script code change is required.

## Requirements

1. Replace every `$SKILL_DIR` occurrence in `code-auditor/SKILL.md` (5) and `code-auditor/references/workflow-guide.md` (4) with the `` `<skill-dir>` `` literal-substitution placeholder.
2. Add a one-line substitution note where commands/paths first appear (mirror the `archive-planning` / `goal-meta-skill` blockquote style).
3. Keep the Windows-friendly interpreter fallback (`python` / `py -3`) for any script invocation line.
4. Do not change script behavior, review dimensions, severity model, or output contract. This is a path-resolution fix only.

## Acceptance Criteria

- [ ] `grep -rn '\$SKILL_DIR' skills/development-workflows/code-auditor/` returns 0 matches.
- [ ] `SKILL.md` and `workflow-guide.md` use `` `<skill-dir>` `` and include the one-line substitution note.
- [ ] `just skills-check` passes for `code-auditor`.
- [ ] `python skills/development-workflows/code-auditor/scripts/pr-analyzer.py --help` (or equivalent self-locate check) still runs.
- [ ] No content/behavior drift beyond path substitution (diff is path-only).

## Out of Scope

- Other skills' `$SKILL_DIR` usage (none remain in this subtree).
- Restructuring code-auditor references/rules or its review methodology.
