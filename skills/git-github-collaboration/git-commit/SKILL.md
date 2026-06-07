---
name: git-commit
description: Safely orchestrate Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything. Use when the user asks to write a commit message, split staged changes, split all changes, commit everything regardless of stage state, include untracked files in the commit set, organize a messy index before committing, or generate structured commit text without pushing by default. Output language is auto-detected from the user's instruction, the request's own language, and the repository's recent commit history (English fallback); explicit phrases like `用中文提交`, `commit in English`, or `请使用中文拆分提交所有的改动` override detection. Agent commits automatically inject `Agent-Task` / `Agent-Model` / `Generated-By` trailers — plus optional `Confidence` / `Scope-risk` / `Tested` quality trailers — and an `[AI]` header tag; Why-line is required for feat/fix/refactor/perf; supports a `chore(wip)` checkpoint mode for long-running agent tasks.
category: git-github-collaboration
tags:
  - git
  - conventional-commits
  - commit-message
  - agent-aware
version: 1.7.0
allowed-tools: Bash, python
---

Use this workflow in order: `preflight -> split plan -> classify -> compose -> commit/draft -> verify`.

Decide the active change authority and output language before doing anything else:

- `staged-only` is the default. Respect the current index and treat unstaged or untracked files as context only.
- `all-changes` is allowed only when the user explicitly asks to include everything, such as "all changes", "所有改动", "全部改动", "不管有没有 stage", or "包括未跟踪文件". In this mode, the skill may rebuild the index from the full working tree and should treat any existing partial staging as intentionally overridden by the user.
- `commit-language` is **detected, not fixed-default**, because forcing one language fights repos (and users) whose history is already in the other. Resolve it in this order, then use it for `scope`, `subject`, `body`, and explanatory output:
  1. An explicit instruction in the user's message — "use English", "英文提交", "用中文", "中文提交", or the legacy phrase `请使用中文拆分提交所有的改动`. Honor whichever language the user names.
  2. The dominant language of the user's current request message.
  3. The repository's own habit, sampled in Preflight from `git log -n 20 --format=%s`. Match what the repo already does so your commit doesn't read as an outlier.
  4. Fall back to English only when none of the above gives a clear signal.
  Language is orthogonal to emoji, `[AI]`, and trailers: detecting Chinese never changes whether `[AI]` or agent trailers attach.
- `agent-mode` is on by default whenever this skill runs (the caller is an agent). It injects `[AI]` in the header, attaches `Agent-Task` / `Agent-Model` / `Generated-By` trailers, and applies the Why-line rule for `feat` / `fix` / `refactor` / `perf`. Turn it off only when the user explicitly says "no AI tag", "不要 AI 标记", "不加 agent trailer", or equivalent.

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
4. **Detect agent context** (skip when user disabled `agent-mode`):
   - Resolve `agent-model` from the model currently running this skill (e.g. `claude-opus-4-7`, `claude-sonnet-4-6`, `gpt-5-codex`). This value is required.
   - Resolve `agent-task` by trying, in order: (a) explicit task ID or issue URL in the user message, (b) `closes #N` / `refs #N` mentioned by the user, (c) ticket ID extracted from the current branch name, (d) `Agent-Task` value from the previous commit on this branch, (e) fallback to `unspecified`.
   - Resolve `agent-prompt-ref` only when a stable prompt reference exists; otherwise leave empty.
   - Detect `checkpoint-mode`: triggered by user words such as `checkpoint`, `打个 checkpoint`, `先存一下`, `WIP`, `[WIP]`, `work in progress`, `先提交一下，待会再整理`.
5. **Sample repository conventions** so the skill adapts instead of imposing one repo's habits everywhere:
   - Language + style: read `git log -n 20 --format=%s`. Note the dominant subject language (this feeds `commit-language` step 3 in §0), whether subjects carry gitmoji, and whether they already use an `[AI]` tag.
   - Config: if `commitlint.config.*`, `.commitlintrc*`, `.czrc`, `.cz.*`, `.gitmessage`, or a `CONTRIBUTING` commit section exists, treat its allowed `type` / `scope` list and length rules as authoritative over this skill's defaults.
   - When no signal exists, fall back to this repository's defaults: emoji on, `[AI]` + agent trailers on, scope from the changed path.
6. **Safety scan** the active change set's file list (`git diff --staged --name-only`, plus untracked paths in `all-changes`). If it includes likely secrets (`.env`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, `*.p12`, `*.keystore`) or large/binary blobs (> ~1 MB), do not commit silently — surface them and ask the user to confirm or unstage first. "Safely orchestrate" means catching a leaked secret before it enters history, not only splitting commits cleanly.

## 2. Split Plan

1. Treat split planning as a safety step, not a formatting nicety.
2. Group the active change set by one coherent unit at a time, usually one of:
   - a single feature or fix
   - one module or package
   - code vs docs vs tests when staged together by accident
3. In `all-changes` mode, it is acceptable to ignore the current staged subset only because the user explicitly asked to include everything.
4. **Atomic check** (skip in `checkpoint-mode`). For every candidate commit, answer:
   - Can the repo compile / tests pass at this commit?
   - Can `git revert <sha>` undo it without leaving the repo inconsistent?
   - Can one subject line + one Why line explain its intent?
   If any answer is no, return to the split-plan layer instead of committing.
5. If the split is clean and obvious, explain the planned commit boundaries before composing messages. In `all-changes` mode, say whether execution will rebuild the index per commit.
6. If the split is ambiguous, stop at the plan. Do not perform hunk-level surgery, edit files, or guess hidden intent just to manufacture atomic commits.
7. **Checkpoint mode branch**: when `checkpoint-mode` is detected, skip the atomic check and prepare a single `chore(wip): [AI] 🔧 [WIP] <subject>` commit covering the active change set. Skip Why enforcement. Still attach agent trailers. In §6 Verify, remind the user to squash `[WIP]` commits before merging.
8. Read [references/split-strategy.md](references/split-strategy.md) when deciding whether the active change set is safe to keep together.

## 3. Classify

1. Choose `type`, optional `scope`, emoji policy, output language, `[AI]` policy, Why policy, and whether `!` / `BREAKING CHANGE` is required.
2. Use [references/commit-types.md](references/commit-types.md) for type and emoji mapping.
3. Use [references/message-rules.md](references/message-rules.md) for subject, body, footer, issue, breaking-change, and Why rules.
4. Use [references/agent-workflow.md](references/agent-workflow.md) for agent context resolution, trailer ordering, and checkpoint handling.
5. Default to emoji because this repository expects it. Opt out when the user requests no emoji, or when Preflight §5 found a target repo whose history carries no gitmoji.
6. **Infer `scope` from the changed paths** instead of inventing one: take the common parent of the changed files. In this repo's layout `skills/<category>/<name>/…` → scope `<name>`, and `platforms/<platform>/…` → scope `<platform>`. Changes spanning unrelated top-level areas are a signal to split (§2), not a reason to pick a vague umbrella scope. Prefer a scope that already appears in `git log` when it fits.
7. Keep `type` in English — the Conventional Commit keyword is the one machine-parsed token and stays stable across languages.
8. Render `scope`, `subject`, `body`, and explanatory output in the `commit-language` resolved in §0 (user instruction → request language → repo history → English fallback).
9. Mark Why-required when `type` ∈ {`feat`, `fix`, `refactor`, `perf`} and `checkpoint-mode` is off.

## 4. Compose

1. Resolve the helper path once instead of hardcoding an interpreter name:
   - Bash / zsh / macOS / Linux: `COMMIT_COMPOSER="$SKILL_DIR/scripts/compose_commit_message"`
   - PowerShell: `$COMMIT_COMPOSER = "$SKILL_DIR/scripts/compose_commit_message.ps1"`
2. Generate the final message with the wrapper script:
   - Bash / zsh / macOS / Linux: `bash "$COMMIT_COMPOSER" ...`
   - PowerShell: `& "$COMMIT_COMPOSER" ...`
   The wrapper auto-detects `python3`, `python`, or `py`, so do not write `python ...` directly in the compose step.
3. Required arguments:
   - `--type` for the commit type; choose a key from [references/commit-types.md](references/commit-types.md).
   - `--summary` for the subject line content. The flag is `--summary`, not `--subject`; passing `--subject` is not accepted and fails argparse.
4. Optional arguments:
   - `--body-line` for body content
   - `--why` for the motivation line (rendered as `Why: <text>` at the top of body)
   - `--closes` for closing issues
   - `--refs` for non-closing issue references
   - `--footer-line` for other structured trailers such as Jira references
   - `--confidence` / `--scope-risk` / `--tested` for the quality-trail trailers (`Confidence:` / `Scope-risk:` / `Tested:`)
   - `--breaking-header` when the header itself must include `!`
   - `--breaking` when a `BREAKING CHANGE:` trailer is needed
   - `--no-emoji` only when the user explicitly opts out
5. **Agent-mode defaults** (applied unless the user disabled agent-mode):
   - Always pass `--ai --agent-model <model> --generated-by-agent`.
   - Pass `--agent-task <value>` (use `unspecified` only as last-resort fallback).
   - Pass `--agent-prompt-ref <ref>` only when a stable reference exists.
   - When you know them, pass `--confidence <high|medium|low>`, `--scope-risk <narrow|moderate|broad>`, and `--tested "<how verified>"`. Recommended in agent-mode but not enforced — omit a field rather than guessing its value.
   - For Why-required types, pass `--why "<motivation>"` and `--require-why` so the script fails loudly when Why is missing.
   - In `checkpoint-mode`, use `--type chore --scope wip` and prepend `[WIP] ` to summary; skip `--require-why`; skip `--closes` / `--refs`.
6. If the user disabled agent-mode: omit `--ai`, omit all `--agent-*` flags, omit `--generated-by-agent`. Fall back to plain Conventional Commit.
7. If the Why-required check fails and Why cannot be inferred from user context: stop, return to the split-plan layer, and ask the user for the motivation. Do not fabricate a Why line.
8. Never hand-roll a multiline commit message when the script can express it safely.
9. **PROHIBITED**: Never include `Co-Authored-By`, attribution lines (e.g. `🤖 Generated with Claude Code`), or push commands by default. `Generated-By: agent` is a structured trailer for audit grep, not an attribution line — it stays.

## 5. Commit Or Draft

1. If the user asked only for a draft, return the proposed commit text and stop.
2. **Confirmation checkpoint**: Before any `git commit`, display the final commit message (header + body + footer) and the list of files to be committed. Explicitly call out whether `[AI]` is in the header, whether Why is present, and which agent trailers will attach. If the user has been interactive in this session, wait for explicit confirmation. If the user pre-approved (e.g. "直接提交", "commit it"), proceed without pausing.
3. If the user asked to commit and `staged-only` is active, commit only the safe staged set. Write the message to a file and commit with `git commit -F <message-file>` so PowerShell and POSIX shells behave consistently.
4. If the user asked to commit and `all-changes` is active for a single atomic commit, run `git add -A` first so tracked, deleted, and untracked non-ignored files all enter the commit set.
5. If the user asked to split-commit in `all-changes` mode, rebuild the index one commit at a time using file/path boundaries only. Use full-worktree staging plus path-based staging or unstaging as needed, but stop if the split would require hunk-level staging or other hidden reconstruction.
6. If `rtk` is available and the user wants compact feedback, `rtk git commit -F <message-file>` is acceptable for the final commit step.
7. Do not push by default. Only discuss or run `git push` if the user explicitly asked for it.

## 6. Verify

1. Read the `git commit` output before claiming success.
2. Distinguish two hook outcomes before reacting:
   - **Hook rejected the commit** (non-zero exit, message-format or lint failure): stop and report the original hook failure. Do not silently rewrite the message unless the output clearly says the format is invalid and the user asked you to fix it.
   - **Hook rewrote files** (a formatter such as prettier/black/gofmt modified tracked files and left them unstaged, aborting or staling the commit): re-inspect `git status`, re-stage the hook's edits, and retry the same commit message. Say that the hook reformatted files — do not treat the reformatting as your own change.
3. After a successful commit, summarize:
   - the final header
   - whether `staged-only` or `all-changes` mode was used
   - the resolved `commit-language` and which signal chose it (user instruction / request language / repo history)
   - whether emoji was included
   - whether `[AI]` tag was applied and which `Agent-*` trailers attached
   - which quality trailers attached (`Confidence` / `Scope-risk` / `Tested`), if any
   - whether the commit is a `chore(wip)` checkpoint
   - whether a Why line is present (required for feat/fix/refactor/perf)
   - whether untracked files were included
   - whether issues or breaking changes were attached
4. If you stopped before committing, say exactly why: no active changes, no staged changes under `staged-only`, ambiguous split, Why missing for Why-required type, or draft-only request.
5. If the branch now contains multiple `chore(wip):` commits, remind the user to squash them via `git rebase -i <base-branch>` before merging — but do not run rebase from this skill.

## References

- [references/commit-types.md](references/commit-types.md) for commit type, emoji mapping, and end-to-end agent commit examples
- [references/message-rules.md](references/message-rules.md) for message structure, Why-line rule, trailers, and agent trailer field table
- [references/split-strategy.md](references/split-strategy.md) for split heuristics, atomic-check three questions, and checkpoint vs atomic distinction
- [references/agent-workflow.md](references/agent-workflow.md) for agent context resolution, checkpoint mode, and audit commands
