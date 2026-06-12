# Fix Tessl skill review findings

## Goal

Fix the concrete issues found by the fresh Tessl rescan of the current `skills/` architecture, without merging stale PR #8 or applying broad subjective rewrites.

## Requirements

- Preserve the current repository architecture: installable skills remain under `skills/<category>/<skill-name>/`.
- Do not merge or apply PR #8; it targets removed `content/skills/...` paths.
- Convert `allowed-tools` frontmatter that Tessl rejects as YAML arrays/objects into string form where this is behavior-preserving.
- Fix clear broken bundle references discovered by Tessl, especially missing `references/output-template.md` for `geju` and `goudi`.
- Resolve repository-local skill validator warnings where they are directly tied to the scan follow-up.
- Keep top-level `category`, `tags`, and `version` fields because this repository's own skill contract uses them.
- Leave subjective content-quality suggestions for a later targeted optimization unless a minimal edit is needed for a concrete validation failure.
- Reply to PR #8 explaining why it will not be merged and that the current architecture was rescanned separately.

## Acceptance Criteria

- [x] Previously failing Tessl deterministic validation cases can be reviewed by `tessl skill review --json`.
- [x] `geju` and `goudi` no longer reference a missing `references/output-template.md`.
- [x] `just skills-check` passes without the prior `deep-research-pro` `homepage` warning.
- [x] A focused Tessl rerun verifies the repaired skills.
- [x] PR #8 receives a GitHub comment stating the non-merge reason and the current follow-up path.

## Notes

- Keep `prd.md` focused on requirements, constraints, and acceptance criteria.
- Lightweight tasks can remain PRD-only.
- For complex tasks, add `design.md` for technical design and `implement.md` for execution planning before `task.py start`.
- Source analysis task: `.trellis/tasks/06-07-pr-8-analysis`.
- Source report: `.trellis/tasks/06-07-pr-8-analysis/research/pr-8-and-tessl-rescan.md`.
- Validation summary: `research/validation-summary.md`.
- PR comment: `https://github.com/bahayonghang/my-claude-code-settings/pull/8#issuecomment-4643220982`.
