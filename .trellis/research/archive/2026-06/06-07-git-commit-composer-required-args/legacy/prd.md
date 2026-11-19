# Document git commit composer required arguments

## Goal

Fix GitHub issue #9 by documenting the required arguments for the
`git-commit` skill's commit message composer, then reply to and close the
issue.

The user value is lower first-try failure risk for LLM agents using the skill:
agents should see that the composer requires `--type` and `--summary`, and that
the subject-line flag is `--summary`, not `--subject`.

## Confirmed Facts

- Issue #9 reports that `skills/git-github-collaboration/git-commit/SKILL.md`
  does not clearly document required composer flags in the Compose section.
- `skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py`
  has required argparse options `--type` and `--summary`.
- Passing `--subject` fails with argparse reporting missing `--type` and
  `--summary`.
- The current skill body uses "subject" terminology in message rules, so a
  mistaken `--subject` flag is plausible.
- The issue path used the older `content/skills/...` layout; the current source
  path is `skills/git-github-collaboration/git-commit/...`.

## Requirements

- Update the `git-commit` skill Compose section with a concise required-argument
  callout before optional flags.
- Name both required composer flags: `--type` and `--summary`.
- Explain that `--summary` is the CLI flag for the subject line, and that
  `--subject` is not accepted.
- Keep the change surgical: no script behavior changes and no unrelated
  wording refactors.
- Reply to GitHub issue #9 with the resolution summary and close it after the
  fix is committed or otherwise present on the branch.

## Acceptance Criteria

- [x] The Compose section documents `--type` and `--summary` as required.
- [x] The documentation warns that `--summary` is not `--subject`.
- [x] The optional-argument list remains clear after the new callout.
- [x] Targeted validation for the edited skill passes, or any skipped gate is
      explicitly reported.
- [x] GitHub issue #9 receives a concise resolution comment and is closed.

## Completion Evidence

- Commit: `acbe7b7 docs(git-commit): [AI] 📝 document composer required args`
- Pushed: `origin/main` at `acbe7b72e5a8f8cba3804578b537d06cc69ca3f5`
- Validation: `just ci`
- Issue: https://github.com/bahayonghang/my-claude-code-settings/issues/9 closed

## Out of Scope

- Changing `compose_commit_message.py` argument names or compatibility behavior.
- Adding a `--subject` alias.
- Broadly rewriting commit-message rules or generated docs.

## Notes

- This is a lightweight documentation task; PRD-only planning is sufficient.
