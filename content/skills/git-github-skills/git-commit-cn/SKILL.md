---
name: git-commit-cn
description: Safely orchestrate Chinese Conventional Commits for staged Git changes. Use when the user asks to write a commit message, split staged changes into multiple commits, organize a messy index before committing, prepare a Chinese commit, draft a Conventional Commit, or generate structured commit text without pushing by default.
category: git-github
tags:
  - git
  - conventional-commits
  - commit-message
  - chinese
version: 1.2.0
allowed-tools:
  - Bash
  - python
---

Use this workflow in order: `preflight -> split plan -> classify -> compose -> commit/draft -> verify`.

## 1. Preflight

1. Inspect `git status --short`, `git diff --staged --stat`, and `git diff --staged`. If `rtk` is available, prefer `rtk git status` and `rtk git diff --staged` for model-visible inspection.
2. Explicitly note whether there are:
   - staged changes ready to commit
   - unstaged changes that might make the index misleading
   - untracked files that are intentionally excluded vs accidentally forgotten
3. Branch immediately on preflight results:
   - No staged changes: stop and tell the user to stage files first.
   - Staged changes exist but the staged set is obviously mixed and cannot be safely separated from inspection alone: do not improvise a commit. Output a split plan and stop.
   - The user explicitly asked only for commit text, a draft, or suggestions: continue through classification and composition, but do not run `git commit`.

## 2. Split Plan

1. Treat split planning as a safety step, not a formatting nicety.
2. Group staged changes by one coherent unit at a time, usually one of:
   - a single feature or fix
   - one module or package
   - code vs docs vs tests when staged together by accident
3. If the split is clean and obvious, explain the planned commit boundaries before composing messages.
4. If the split is ambiguous, stop at the plan. Do not unstage, restage, or commit mixed work just to produce a message.
5. Read [references/split-strategy.md](references/split-strategy.md) when deciding whether a staged set is safe to keep together.

## 3. Classify

1. Choose `type`, optional `scope`, emoji policy, and whether `!` / `BREAKING CHANGE` is required.
2. Use [references/commit-types.md](references/commit-types.md) for type and emoji mapping.
3. Use [references/message-rules.md](references/message-rules.md) for subject, body, footer, issue, and breaking-change rules.
4. Default to emoji because this repository expects it. Only opt out when the user explicitly requests no emoji.
5. Keep `type` in English. Prefer Chinese for `scope`, `subject`, `body`, and explanatory output unless the user clearly asked for English.

## 4. Compose

1. Generate the final message with `python "$SKILL_DIR/scripts/compose_commit_message.py" ...`.
2. Use:
   - `--body-line` for body content
   - `--closes` for closing issues
   - `--refs` for non-closing issue references
   - `--footer-line` for other structured trailers such as Jira references
   - `--breaking-header` when the header itself must include `!`
   - `--breaking` when a `BREAKING CHANGE:` trailer is needed
   - `--no-emoji` only when the user explicitly opts out
3. Never hand-roll a multiline commit message when the script can express it safely.
4. **PROHIBITED**: Never include `Co-Authored-By`, attribution lines, or push commands by default.

## 5. Commit Or Draft

1. If the user asked only for a draft, return the proposed commit text and stop.
2. If the user asked to commit and the staged set is safe, write the message to a file and commit with `git commit -F <message-file>` so PowerShell and POSIX shells behave consistently.
3. If `rtk` is available and the user wants compact feedback, `rtk git commit -F <message-file>` is acceptable for the final commit step.
4. Do not push by default. Only discuss or run `git push` if the user explicitly asked for it.

## 6. Verify

1. Read the `git commit` output before claiming success.
2. If hooks reject the commit, stop immediately and report the original hook failure. Do not silently rewrite the message unless the output clearly says the message format is invalid and the user asked you to fix it.
3. After a successful commit, summarize:
   - the final header
   - whether emoji was included
   - whether issues or breaking changes were attached
4. If you stopped before committing, say exactly why: no staged changes, ambiguous split, or draft-only request.

## References

- [references/commit-types.md](references/commit-types.md) for commit type and emoji mapping
- [references/message-rules.md](references/message-rules.md) for message structure and trailers
- [references/split-strategy.md](references/split-strategy.md) for staged split heuristics and stop conditions
