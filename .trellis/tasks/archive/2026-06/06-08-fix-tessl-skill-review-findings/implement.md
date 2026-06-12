# Implementation Plan

1. Normalize `allowed-tools`
   - Edit the 11 blocked `SKILL.md` frontmatter blocks.
   - Verify by rerunning `tessl skill review --json` on each repaired skill.

2. Verify output templates
   - Confirm `references/output-template.md` exists for `geju`.
   - Confirm `references/output-template.md` exists for `goudi`.
   - Verify no stale `references/output-template.md` references remain unresolved.

3. Fix `deep-research-pro` local metadata warning
   - Move `homepage` under `metadata` or remove it if the local validator still warns.
   - Verify `just skills-check` is clean.

4. Run validation
   - `just skills-check`
   - Targeted Tessl rerun for repaired skills.
   - `git diff --check`

5. Reply to PR #8
   - Draft a concise comment.
   - Post with `gh pr comment 8 --repo bahayonghang/my-claude-code-settings --body-file <file>`.
   - Do not merge or close the PR unless separately requested.
