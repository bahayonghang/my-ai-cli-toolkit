---
name: git-commit
description: Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything. Use when asked to write a commit message, split staged or working-tree changes, organize a messy index, or draft commit text without pushing. Auto-detects commit language; explicit phrases like 用中文提交 or 请使用中文拆分提交所有的改动 override. Default headers have no [AI] tag; add it only when asked (加 AI 标记 / add [AI] tag / 不要 [AI]). Create commits with local git commit only — never GitHub web, GitHub file-commit APIs, or a platform GitHub App — so GitHub does not show "This commit was created on GitHub.com" or "Committed via Cursor Agent". 本地 git 提交; 不要在 GitHub 上创建 commit; 不要 Committed via. Handles the local commit portion of mixed requests, then hands already-authorized push, PR, or other remaining operations back to the main coordinator for the appropriate workflow.
category: git-github-collaboration
tags:
  - git
  - conventional-commits
  - commit-message
  - agent-aware
version: 1.13.0
allowed-tools: Read, Bash
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
- `agent-mode` is on by default whenever this skill runs (the caller is an agent). It attaches `Agent-Task` / `Agent-Model` / `Generated-By` trailers and applies the Why-line rule for `feat` / `fix` / `refactor` / `perf`. It does **not** inject `[AI]` in the header. Pass `--ai` only when the user explicitly says "add [AI] tag", "加 AI 标记", "加上 [AI]", or equivalent. Turn agent-mode off when the user says "no AI tag", "不要 AI 标记", "不加 agent trailer", or equivalent.
- `commit-channel` is **local git only**. Create the commit with `git commit -F <message-file>` (or `rtk proxy git commit -F`). Do not create commits through GitHub's web UI, Contents API, Git Data API, GraphQL `createCommitOnBranch`, `gh api` file-commit helpers, GitHub MCP `create_or_update_file` / `push_files`, or a platform GitHub App (Cursor Agent, Copilot, Grok[bot], Devin). Those channels make GitHub show "This commit was created on GitHub.com." and often "Committed via <Client>". Do not pass `git commit --trailer` for `Co-authored-by`, `Made-with`, or "Committed via" text.
- Skill responsibility: local commit preparation, execution, and verification. `git push`, pull-request creation, `git commit --amend`, `git rebase`, and tags belong to other workflows. For mixed requests, preserve the user's full request and hand already-authorized remaining steps back to the main coordinator after verification (§7); the skill boundary does not end the request. A commit-only request grants no push or PR authorization.

## 1. Preflight

1. Inspect `git --no-optional-locks status --short --untracked-files=all` first (include untracked files even when repository display defaults hide them). Then inspect the active change set:
   - `staged-only`: `git diff --staged --stat` and `git diff --staged`
   - `all-changes`: `git diff --stat`, `git diff`, `git diff --staged --stat`, and `git diff --staged`
   If `rtk` is required, use `rtk proxy git --no-optional-locks status --short --untracked-files=all` for the same complete status; do not replace it with compact `rtk git status`. Preserve optional-lock disabling for read-only preparation. Compact diffs may supplement inspection, but use unfiltered diffs when deciding file/hunk scope.
2. Explicitly note:
   - the active change authority (`staged-only` or `all-changes`)
   - staged changes ready to commit
   - unstaged changes that might make the index misleading
   - untracked files that are intentionally excluded vs accidentally forgotten
3. Branch immediately on preflight results:
   - Either mode + no staged, unstaged, or untracked changes: say there is nothing to commit.
   - `staged-only` + no staged changes but working-tree changes exist: continue read-only preparation. List candidate paths with staged/unstaged/untracked states; check paths and sizes for secrets/large/binary risks before reading the necessary safe diffs or untracked text. Continue through repository conventions, supported split planning, classification, and message drafts. Label candidates as unapproved for staging; do not change the index, product files, or history, or run `git commit`. Use read-only inspection with optional Git locks disabled so even index refresh is avoided. Report the exact blocker: the index is empty and staging is not authorized by this mode. Distinguish this from missing commit consent; do not ask again whether to commit when that is already authorized.
     If candidate grouping or intent is unclear, give only supported groups/drafts and the unresolved decision instead of inventing a final file set or message. A risky path may be listed without exposing its contents; preparation of other safe candidates can continue. This branch does not enable a new staging mode or authorize staging named files.
   - The active change set exists but is obviously mixed and cannot be safely separated from inspection alone: do not improvise a commit. Output a split plan and stop.
   - The user explicitly asked only for commit text, a draft, or suggestions: continue through classification and composition, but do not run `git commit`.
4. **Detect agent context** (skip when user disabled `agent-mode`):
   - Resolve `agent-model` from the id of the model currently running this skill — read the runtime's own id (e.g. `claude-fable-5` when that is the running model), never a model id copied from an example, which goes stale. This value is required.
   - Resolve `agent-task` by trying, in order: (a) explicit task ID or issue URL in the user message, (b) `closes #N` / `refs #N` mentioned by the user, (c) ticket ID extracted from the current branch name, (d) `Agent-Task` value from the previous commit on this branch, (e) fallback to `unspecified`.
   - Resolve `agent-prompt-ref` only when a stable prompt reference exists; otherwise leave empty.
   - Detect `checkpoint-mode`: triggered by user words such as `checkpoint`, `打个 checkpoint`, `先存一下`, `WIP`, `[WIP]`, `work in progress`, `先提交一下，待会再整理`.
5. **Sample repository conventions** so the skill adapts instead of imposing one repo's habits everywhere:
   - Language + style: read `git log -n 20 --format=%s`. Note the dominant subject language (this feeds `commit-language` step 3 in §0) and whether subjects carry gitmoji. History that already contains `[AI]` is informational only — do not copy `[AI]` into new commits unless the user opted in.
   - Config: if `commitlint.config.*`, `.commitlintrc*`, `.czrc`, `.cz.*`, `.gitmessage`, or a `CONTRIBUTING` commit section exists, treat its allowed `type` / `scope` list and length rules as authoritative over this skill's defaults. Pass a repo length rule to the composer via `--max-header-width` (§4) and a repo custom type via `--type` as-is (§4).
   - AI attribution: from the same `git log` sample plus `CONTRIBUTING` / AI-policy files, note whether the repo already has an AI attribution convention such as `Assisted-by:` or `Generated-by:` trailers. If it does, the repo convention wins over this skill's private trailer scheme — see §3.4 and [references/agent-workflow.md](references/agent-workflow.md). Do not treat host/client badges (`Co-authored-by: Cursor`, `Made-with: Cursor`, "Committed via …") as a repo convention to copy.
   - When no signal exists, fall back to this skill's defaults: emoji on, agent trailers on, `[AI]` off, local `git commit -F` only, scope from the changed path.
6. **Safety scan** the active change set's file list (`git diff --staged --name-only`, plus untracked paths in `all-changes`). If it includes likely secrets (`.env`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, `*.p12`, `*.keystore`) or large/binary blobs (> ~1 MB), do not commit silently. Surface each risky path with its staged/untracked/tracked state, size when practical, and why it is risky. For large files, ask the user to decide per path before staging or committing: intentionally commit it, leave it untracked, add or adjust a `.gitignore` pattern, or move it to Git LFS / external artifact storage. Do not treat `all-changes` as permission to sweep every large file into history. "Safely orchestrate" means catching leaked secrets and accidental artifacts before they enter history, not only splitting commits cleanly.

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
7. **Checkpoint mode branch**: when `checkpoint-mode` is detected, skip the atomic check and prepare a single `chore(wip): 🔧 [WIP] <subject>` commit covering the active change set. Skip Why enforcement. Still attach agent trailers. Do not add `[AI]` unless the user opted in. In §6 Verify, remind the user to squash `[WIP]` commits before merging.
8. Read [references/split-strategy.md](references/split-strategy.md) when deciding whether the active change set is safe to keep together.

## 3. Classify

1. Choose `type`, optional `scope`, emoji policy, output language, `[AI]` policy (off unless the user opted in), Why policy, and whether `!` / `BREAKING CHANGE` is required.
2. Use [references/commit-types.md](references/commit-types.md) for type and emoji mapping.
3. Use [references/message-rules.md](references/message-rules.md) for subject, body, footer, issue, breaking-change, and Why rules.
4. Use [references/agent-workflow.md](references/agent-workflow.md) for agent context resolution, trailer ordering, checkpoint handling, the local-git commit channel, and the repo-convention branch: when Preflight §5 found an existing AI attribution convention (`Assisted-by:` / `Generated-by:`), emit the repo's trailer via `--footer-line` and omit this skill's private `Agent-*` / `Generated-By: agent` group. Never emit host/client attribution (`Co-authored-by: Cursor`, `Made-with`, "Committed via").
5. Default to emoji because this repository expects it. Opt out when the user requests no emoji, or when Preflight §5 found a target repo whose history carries no gitmoji.
6. **Infer `scope` from the changed paths** instead of inventing one: take the common parent of the changed files. In this repo's layout `skills/<category>/<name>/…` → scope `<name>`, and `platforms/<platform>/…` → scope `<platform>`. Changes spanning unrelated top-level areas are a signal to split (§2), not a reason to pick a vague umbrella scope. Prefer a scope that already appears in `git log` when it fits.
7. Keep `type` in English — the Conventional Commit keyword is the one machine-parsed token and stays stable across languages.
8. Render `scope`, `subject`, `body`, and explanatory output in the `commit-language` resolved in §0 (user instruction → request language → repo history → English fallback).
9. Mark Why-required when `type` ∈ {`feat`, `fix`, `refactor`, `perf`} and `checkpoint-mode` is off.

## 4. Compose

1. Resolve the helper path once instead of hardcoding an interpreter name. `<skill-dir>` below means this skill's base directory — the path announced when the skill loads. It is not an environment variable, so substitute the literal path:
   - Bash / zsh / macOS / Linux: `COMMIT_COMPOSER="<skill-dir>/scripts/compose_commit_message"`
   - PowerShell: `$COMMIT_COMPOSER = "<skill-dir>/scripts/compose_commit_message.ps1"`
2. Generate the final message with the wrapper script:
   - Bash / zsh / macOS / Linux: `bash "$COMMIT_COMPOSER" ...`
   - PowerShell: `& "$COMMIT_COMPOSER" ...`
   The wrapper auto-detects `python3`, `python`, or `py`, so do not write `python ...` directly in the compose step.
3. Required arguments:
   - `--type` for the commit type; choose a key from [references/commit-types.md](references/commit-types.md), or pass the repo's own custom type (lowercase `^[a-z][a-z0-9-]*$`, e.g. `hotfix`) when Preflight §5 found a repo config that defines it. Custom types have no built-in emoji — pair them with `--emoji` or accept the no-emoji output.
   - `--summary` for the subject line content. The flag is `--summary`, not `--subject`; passing `--subject` is not accepted and fails argparse.
4. Optional arguments:
   - `--body-line` for body content
   - `--why` for the motivation line (rendered as `Why: <text>` at the top of body)
   - `--closes` for closing issues
   - `--refs` for non-closing issue references
   - `--footer-line` for other structured trailers such as Jira references or a repo's own AI attribution trailer (§3)
   - `--confidence` / `--scope-risk` / `--tested` for the quality-trail trailers (`Confidence:` / `Scope-risk:` / `Tested:`)
   - `--breaking-header` when the header itself must include `!`
   - `--breaking` when a `BREAKING CHANGE:` trailer is needed
   - `--no-emoji` only when the user explicitly opts out
   - `--emoji <char>` to set the header emoji explicitly — required for a custom type to carry an emoji; also overrides the built-in mapping
   - `--max-header-width <columns>` when Preflight §5 found a repo header-length rule (default 72). Pass the repo's limit instead of shortening a legal subject. The script measures display columns (CJK/emoji count as 2), which is stricter than commitlint's character count, so passing the repo's character limit never admits a header the repo would reject.
   - `--output <path>` to write the message to a file as UTF-8 (see §5.3)
5. **Agent-mode defaults** (applied unless the user disabled agent-mode):
   - Do **not** pass `--ai` unless the user opted in (§0). The composer also strips a leading `[AI]` from `--summary`, so do not smuggle the tag there.
   - Always pass `--agent-model <model> --generated-by-agent` — except in the repo-convention branch (§3.4), where the repo's own AI attribution trailer goes through `--footer-line` and the private `--agent-*` / `--generated-by-agent` flags are omitted (the `[AI]` tag rule for that branch lives in [references/agent-workflow.md](references/agent-workflow.md)).
   - Pass `--agent-task <value>` (use `unspecified` only as last-resort fallback).
   - Pass `--agent-prompt-ref <ref>` only when a stable reference exists.
   - When you know them, pass `--confidence <high|medium|low>`, `--scope-risk <narrow|moderate|broad>`, and `--tested "<how verified>"`. Recommended in agent-mode but not enforced — omit a field rather than guessing its value.
   - For Why-required types, pass `--why "<motivation>"` and `--require-why` so the script fails loudly when Why is missing.
   - In `checkpoint-mode`, use `--type chore --scope wip` and prepend `[WIP] ` to summary; skip `--require-why`; skip `--closes` / `--refs`.
6. If the user disabled agent-mode: omit `--ai`, omit all `--agent-*` flags, omit `--generated-by-agent`. Fall back to plain Conventional Commit.
7. If the Why-required check fails and Why cannot be inferred from user context: stop, return to the split-plan layer, and ask the user for the motivation. Do not fabricate a Why line.
8. Never hand-roll a multiline commit message when the script can express it safely.
9. **PROHIBITED**: Never include `Co-authored-by` / `Co-Authored-By`, `Made-with:` / `Made with`, a `Committed via …` line, attribution lines (e.g. `🤖 Generated with Claude Code`), `git commit --trailer` for those keys, or push commands by default. The composer rejects those host/client lines with exit 4. `Generated-By: agent` is a structured trailer for audit grep, not an attribution line — it stays.

## 5. Commit Or Draft

1. If the user asked only for a draft, return the proposed commit text and stop without staging or editing files. If preflight found an empty index under `staged-only`, return the supported candidate groups, drafts, and exact staging blocker, then go directly to the no-commit report in §6.4 and handoff in §7. Do not enter the execution steps below even when commit consent already exists. A completely clean repository likewise goes directly to the no-commit report.
2. **Execution consent checkpoint**: Before any `git commit`, display the final commit message (header + body + footer) and the list of files to be committed. Explicitly call out that the channel is local `git commit -F` (not GitHub web/API), whether `[AI]` is in the header (default: no), whether Why is present, and which agent trailers will attach. Then decide whether to pause:
   - Proceed without an extra confirmation when the user's current request already authorizes execution, such as "commit it", "execute the commit", "commit all changes", "直接提交", "提交了", "按方案执行", or `请使用中文拆分提交所有的改动`, and preflight found no secret/large-binary risk, no ambiguous split, no missing Why, and no draft-only wording.
   - Wait for explicit confirmation when execution was not clearly requested, when the user asked to review/plan/draft first, when the proposed file set or message differs materially from the requested scope, or when any safety gate in this workflow says to ask before committing.
3. If the user asked to commit and `staged-only` is active, commit only the safe staged set. Write the message file with the composer's `--output` flag — e.g. `--output "$(git rev-parse --git-dir)/COMMIT_MSG_SKILL"` — then commit with `git commit -F <message-file>` so PowerShell and POSIX shells behave consistently. Invoke the `git` binary directly. Do not add `--trailer`. Do not create the commit by editing files through GitHub's Contents API or MCP `push_files` / `create_or_update_file`. Never capture the composer's stdout with `>` redirection in PowerShell: Windows PowerShell 5.1 writes UTF-16LE by default, and `git commit -F` then reads a Chinese or emoji message as mojibake; `--output` always writes UTF-8. Keep the message file outside the working tree — the git dir as above or the OS temp dir — never inside the repo, where the `all-changes` flow's `git add -A` would sweep it into the commit.
4. If the safety scan found large/binary files, wait for an explicit decision for each risky path before any broad staging command. If the correct outcome is to ignore generated artifacts, edit or ask for a `.gitignore` update first, then re-run preflight so ignored files are no longer part of the candidate set. Include `.gitignore` only when the user approved that ignore policy.
5. If the user asked to commit and `all-changes` is active for a single atomic commit, run `git add -A` only after the safety scan is clear or all risky files have explicit include/ignore decisions, so tracked, deleted, and safe untracked non-ignored files enter the commit set.
6. If the user asked to split-commit in `all-changes` mode, rebuild the index one commit at a time using file/path boundaries only. Use full-worktree staging plus path-based staging or unstaging as needed, but stop if the split would require hunk-level staging or other hidden reconstruction.
7. Preserve unfiltered commit/hook output and exit status. If `rtk` is required, use `rtk proxy git commit -F <message-file>`; summarize only after retaining the original diagnostic output.
8. Keep push execution in the appropriate workflow. When the user also requested push, retain it for the post-verification handoff (§7).

## 6. Verify

1. Read the `git commit` output before claiming success.
2. Diagnose hook failures before deciding whether execution can continue. Preserve the original output and exit status, report the cause supported by that evidence, and prepare the exact correction (or identify missing diagnostic evidence). Never bypass or disable a hook, including through `--no-verify` or a hooks-path override.
   - **Hook rejected the commit** (non-zero exit, message-format or lint failure): apply the correction only when the existing remediation rule and user authorization permit it. A message rewrite still requires both output clearly identifying invalid message format and an explicit user request to fix it; ordinary commit authorization alone does not grant this. Otherwise show the precise correction and ask once for the needed decision. Product-file fixes may continue only when the original request already authorizes those fixes; otherwise hand the concrete fix proposal to the main coordinator for that decision. Stop dependent execution if remediation changes the requested scope or meaning, needs destructive history editing, or introduces a new external or production action. After authorized remediation, rerun the relevant check and local commit with hooks enabled, then verify the result.
   - **Hook rewrote files** (a formatter such as prettier/black/gofmt modified files): inspect status and both staged and unstaged diffs against the pre-commit file set. Re-stage only formatting edits within the already-authorized commit content, then retry the same message with hooks enabled if the attempt was aborted. Do not absorb pre-existing unstaged hunks, newly created paths, unrelated files, or semantic changes; if they cannot be separated safely, stop at a concrete proposal/decision. Never fall back to `git add -A` for hook recovery. If HEAD already advanced, verify what was committed and report leftover formatter edits; do not retry as though no commit exists or amend implicitly. Say that the hook reformatted files — do not treat the reformatting as your own change.
3. After a successful commit, inspect `git log -1 --format='%an <%ae>%n%cn <%ce>%n%B'` before claiming success. If the message contains `Co-authored-by`, `Made-with`, or `Committed via`, or the committer is `GitHub <noreply@github.com>`, the wrong channel or a host wrapper added provenance GitHub will render as "This commit was created on GitHub.com." / "Committed via …". Report that outcome. Do not amend (amend is out of scope). Then summarize:
   - the final header
   - whether `staged-only` or `all-changes` mode was used
   - the resolved `commit-language` and which signal chose it (user instruction / request language / repo history)
   - whether emoji was included
   - that `[AI]` is absent unless the user opted in, and which `Agent-*` trailers attached
   - which quality trailers attached (`Confidence` / `Scope-risk` / `Tested`), if any
   - whether the commit is a `chore(wip)` checkpoint
   - whether a Why line is present (required for feat/fix/refactor/perf)
   - whether untracked files were included
   - whether issues or breaking changes were attached
   - that the commit was created with local `git commit -F`, not GitHub web/API
4. If no commit was created, report the preparation completed and the exact blocker or draft-only outcome: no changes at all; an empty index under `staged-only` with candidates/drafts prepared but staging unauthorized; unresolved grouping; missing Why; or a diagnosed hook failure with its correction and outstanding authorization/evidence. Do not report prepared candidates as committed or approved for staging.
5. If the branch now contains multiple `chore(wip):` commits, remind the user to squash them via `git rebase -i <base-branch>` before merging — but do not run rebase from this skill.

## 7. Continue The Authorized Request

After verification, hand the main coordinator the repository path, branch, created commit SHA(s) and final HEAD (`git rev-parse HEAD`), verification results, remaining requested actions in order, and any blockers or unresolved targets. Include known push remote/branch and PR repository/base; clarify only missing information that cannot be resolved from the request and repository context.

For “commit, push, then create a PR,” the coordinator continues through `gh-pr-release` when available, or the appropriate authorized workflow. Reuse the existing authorization for explicitly requested steps without asking for it again merely because the local commit finished. The receiving workflow retains its target, risk, and exact-head checks. Normal progress does not itself invalidate authorization; a material scope or target change requires reassessment.

If commit execution or verification fails, report the completed portion and failure, and do not execute push/PR steps that depend on that commit. If the required continuation tool or workflow is unavailable, report the verified local result and the specific unfinished actions and blocker; do not claim the whole request completed or bypass local git with GitHub file-commit APIs. For a commit-only request, finish with the local verification summary.

## References

- [references/commit-types.md](references/commit-types.md) for commit type, emoji mapping, and end-to-end agent commit examples
- [references/message-rules.md](references/message-rules.md) for message structure, Why-line rule, trailers, and agent trailer field table
- [references/split-strategy.md](references/split-strategy.md) for split heuristics, atomic-check three questions, and checkpoint vs atomic distinction
- [references/agent-workflow.md](references/agent-workflow.md) for agent context resolution, local-git commit channel, checkpoint mode, and audit commands
