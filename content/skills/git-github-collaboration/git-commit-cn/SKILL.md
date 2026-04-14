---
name: git-commit-cn
description: Safely orchestrate Chinese Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything. Use when the user asks to write a commit message, split staged changes, split all changes, commit everything regardless of stage state, include untracked files in the commit set, organize a messy index before committing, prepare a Chinese commit, draft a Conventional Commit, or generate structured commit text without pushing by default.
category: git-github-collaboration
tags:
  - git
  - conventional-commits
  - commit-message
  - chinese
version: 1.4.0
allowed-tools:
  - Bash
  - python
---

Use this workflow in order: `preflight -> split plan -> classify -> compose -> commit/draft -> verify`.

Decide the active change authority before doing anything else:

- `staged-only` is the default. Respect the current index and treat unstaged or untracked files as context only.
- `all-changes` is allowed only when the user explicitly asks to include everything, such as "all changes", "所有改动", "全部改动", "不管有没有 stage", or "包括未跟踪文件". In this mode, the skill may rebuild the index from the full working tree and should treat any existing partial staging as intentionally overridden by the user.

## 1. Preflight

1. Inspect `git status --short` first. Then inspect the active change set:
   - `staged-only`: `git diff --staged --stat` and `git diff --staged`
   - `all-changes`: `git diff --stat`, `git diff`, `git diff --staged --stat`, and `git diff --staged`
   If `rtk` is available, prefer `rtk git status`, `rtk git diff --staged`, and `rtk git diff` for model-visible inspection.
2. Explicitly note:
   - the active change authority (`staged-only` or `all-changes`)
   - staged changes ready to commit
   - unstaged changes that might make the index misleading
   - untracked files that are intentionally excluded vs accidentally forgotten
3. Branch immediately on preflight results:
   - `staged-only` + no staged changes: stop and tell the user to stage files first.
   - `all-changes` + no staged, unstaged, or untracked changes: stop and say there is nothing to commit.
   - The active change set exists but is obviously mixed and cannot be safely separated from inspection alone: do not improvise a commit. Output a split plan and stop.
   - The user explicitly asked only for commit text, a draft, or suggestions: continue through classification and composition, but do not run `git commit`.

## 2. Split Plan

1. Treat split planning as a safety step, not a formatting nicety.
2. Group the active change set by one coherent unit at a time, usually one of:
   - a single feature or fix
   - one module or package
   - code vs docs vs tests when staged together by accident
3. In `all-changes` mode, it is acceptable to ignore the current staged subset only because the user explicitly asked to include everything.
4. If the split is clean and obvious, explain the planned commit boundaries before composing messages. In `all-changes` mode, say whether execution will rebuild the index per commit.
5. If the split is ambiguous, stop at the plan. Do not perform hunk-level surgery, edit files, or guess hidden intent just to manufacture atomic commits.
6. Read [references/split-strategy.md](references/split-strategy.md) when deciding whether the active change set is safe to keep together.

## 3. Classify

1. Choose `type`, optional `scope`, emoji policy, and whether `!` / `BREAKING CHANGE` is required.
2. Use [references/commit-types.md](references/commit-types.md) for type and emoji mapping.
3. Use [references/message-rules.md](references/message-rules.md) for subject, body, footer, issue, and breaking-change rules.
4. Default to emoji because this repository expects it. Only opt out when the user explicitly requests no emoji.
5. Keep `type` in English. Prefer Chinese for `scope`, `subject`, `body`, and explanatory output unless the user clearly asked for English.

## 4. Compose

1. Resolve the helper path once instead of hardcoding an interpreter name:
   - Bash / zsh / macOS / Linux: `COMMIT_COMPOSER="$SKILL_DIR/scripts/compose_commit_message"`
   - PowerShell: `$COMMIT_COMPOSER = "$SKILL_DIR/scripts/compose_commit_message.ps1"`
2. Generate the final message with the wrapper script:
   - Bash / zsh / macOS / Linux: `bash "$COMMIT_COMPOSER" ...`
   - PowerShell: `& "$COMMIT_COMPOSER" ...`
   The wrapper auto-detects `python3`, `python`, or `py`, so do not write `python ...` directly in the compose step.
3. Use:
   - `--body-line` for body content
   - `--closes` for closing issues
   - `--refs` for non-closing issue references
   - `--footer-line` for other structured trailers such as Jira references
   - `--breaking-header` when the header itself must include `!`
   - `--breaking` when a `BREAKING CHANGE:` trailer is needed
   - `--no-emoji` only when the user explicitly opts out
4. Never hand-roll a multiline commit message when the script can express it safely.
5. **PROHIBITED**: Never include `Co-Authored-By`, attribution lines, or push commands by default.

## 5. Commit Or Draft

1. If the user asked only for a draft, return the proposed commit text and stop.
2. **Confirmation checkpoint**: Before any `git commit`, display the final commit message (header + body + footer) and the list of files to be committed. If the user has been interactive in this session, wait for explicit confirmation. If the user pre-approved (e.g. "直接提交", "commit it"), proceed without pausing.
3. If the user asked to commit and `staged-only` is active, commit only the safe staged set. Write the message to a file and commit with `git commit -F <message-file>` so PowerShell and POSIX shells behave consistently.
4. If the user asked to commit and `all-changes` is active for a single atomic commit, run `git add -A` first so tracked, deleted, and untracked non-ignored files all enter the commit set.
5. If the user asked to split-commit in `all-changes` mode, rebuild the index one commit at a time using file/path boundaries only. Use full-worktree staging plus path-based staging or unstaging as needed, but stop if the split would require hunk-level staging or other hidden reconstruction.
6. If `rtk` is available and the user wants compact feedback, `rtk git commit -F <message-file>` is acceptable for the final commit step.
7. Do not push by default. Only discuss or run `git push` if the user explicitly asked for it.

## 6. Verify

1. Read the `git commit` output before claiming success.
2. If hooks reject the commit, stop immediately and report the original hook failure. Do not silently rewrite the message unless the output clearly says the message format is invalid and the user asked you to fix it.
3. After a successful commit, summarize:
   - the final header
   - whether `staged-only` or `all-changes` mode was used
   - whether emoji was included
   - whether untracked files were included
   - whether issues or breaking changes were attached
4. If you stopped before committing, say exactly why: no active changes, no staged changes under `staged-only`, ambiguous split, or draft-only request.

## References

- [references/commit-types.md](references/commit-types.md) for commit type and emoji mapping
- [references/message-rules.md](references/message-rules.md) for message structure and trailers
- [references/split-strategy.md](references/split-strategy.md) for split heuristics and stop conditions
