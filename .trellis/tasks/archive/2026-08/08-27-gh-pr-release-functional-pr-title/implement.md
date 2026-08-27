# Implement: functional PR titles and compact completion

## Checklist

1. Edit `skills/git-github-collaboration/gh-pr-release/references/create.md`
   - Replace the title bullet with the algorithm in `design.md`.
   - Forbid `--fill` and equivalent commit-list dumps for title and body.
   - Keep template / What-Why-How-to-test / Out of scope body rules.
   - Allow one topology line `Merges <head> into <base>` in the body.
2. Edit `skills/git-github-collaboration/gh-pr-release/references/merge.md`
   - After inspect, if the open PR title is mechanical, draft a functional replacement and require a separate `gh pr edit --title` authorization.
   - Point to create.md for the algorithm. Do not copy it.
3. Edit `skills/git-github-collaboration/gh-pr-release/SKILL.md`
   - Tighten Completion to the identifier list and the forbidden operation-dump fields.
   - Set `version: 3.0.1`.
   - Do not expand description or routes.
4. Edit `skills/git-github-collaboration/gh-pr-release/reports/artifact-design-profile.md`
   - Add one PR-title pointer and one completion-report pointer to create.md / SKILL.md.
5. Optional one clause in `agents/interface.yaml` `default_prompt` if it currently implies copying repo merge-title history. Skip if the file does not mention titles.
6. Set `manifest.json` `version` to `3.0.1` and `updated_at` to `2026-08-27`.
7. Add `evals/evals.json` cases 39–42 and matching `evals/output/cases.jsonl` fixtures per R6/AC1–AC5.
8. Do not add scripts, do not rewrite `git-commit`, do not regenerate Skill Atlas / trust / scorecard reports.

## Validation

```bash
just skills-check
just python-check
just docs-sync
just ci
```

Manual review of the four new eval cases against AC1–AC5. `just ci` does not execute `evals.json`.

## Rollback

Revert the files listed above. No GitHub writes and no generated docs besides catalog pages from `just docs-sync`.

## Risky files

- `references/create.md`: one-home rule; do not duplicate the algorithm into SKILL.md.
- `evals/output/cases.jsonl`: keep assertions short; do not paste the full PR #30 report as a required string.
- `SKILL.md` description length remains ≤1024 if any trigger phrase is touched (default: do not touch it).
