---
name: codex
description: >-
  Use when you want to run the local OpenAI Codex CLI for code generation,
  debugging, refactoring, and especially explicit review workflows for pull
  requests, diffs, commits, and uncommitted changes. Trigger this skill whenever
  the user mentions Codex, asks for a Codex CLI run, wants OpenAI to review
  current changes, compare a branch against a base, review a commit or diff,
  give a second engineering opinion on changes, or needs live OpenAI-backed
  technical web search.
version: 1.2.0
argument-hint: [task-description]
allowed-tools:
  - Bash(codex *)
metadata:
  category: development-tools
  tags: [openai-codex, codex-cli, gpt-5.4, web-search, second-opinion, code-review, pr-review]
---

Run Codex CLI for `$ARGUMENTS`.

## Defaults

- Primary command form: `codex exec`
- Default model: `gpt-5.4`
- Default code reasoning: `xhigh`
- Default web-search reasoning: `high`
- Default review mode: review-only first, apply/fix only with explicit user intent
- Single-run model override: `-m <model>`
- Persistent model override: set `model` in `~/.codex/config.toml` or in `profiles.<name>.model`

## Prerequisites

1. Verify Codex CLI is installed: `command -v codex`.
   - If not found, instruct user: `npm install -g @openai/codex`
2. Verify authentication: `codex login status`.
   - If not authenticated, instruct user: `codex login`
3. If installation or login is not possible, fall back to native web/document tools instead of blocking.

## Session Model Convention

Use a shell variable in examples so the default model lives in one place:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
```

This is only an example shell convention; Codex itself only requires the final `-m` value.

## Steps

1. If `$ARGUMENTS` is empty, ask user for the task description.
2. Decide whether the task is primarily:
   - **Review-only**: code review, PR review, diff review, commit review, second-opinion analysis.
   - **Apply/fix execution**: generation, refactoring, debugging, or review findings that the user explicitly wants fixed.
   - **Web search / docs lookup**: current information, docs, URLs, comparisons.
3. For review-only tasks, prefer the lowest-risk path first:
   ```bash
   CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
   codex exec -m "$CODEX_MODEL" \
     -c model_reasoning_effort=xhigh \
     --skip-git-repo-check \
     -C <workdir> \
     "Review <target>. Do not modify files. Return findings with severity, evidence, and recommended fixes only."
   ```
4. For apply/fix tasks, or only after the user explicitly says to implement fixes, run:
   ```bash
   CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
   codex exec -m "$CODEX_MODEL" \
     -c model_reasoning_effort=xhigh \
     --dangerously-bypass-approvals-and-sandbox \
     --skip-git-repo-check \
     -C <workdir> \
     "<task>"
   ```
   > **⚠️ Safety note:** `--dangerously-bypass-approvals-and-sandbox` disables all
   > confirmation prompts and filesystem sandboxing. Use it only when the user
   > clearly wants changes applied, because Codex can modify or delete files without asking.
5. For web search / docs lookup, run:
   ```bash
   CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
   codex exec -m "$CODEX_MODEL" \
     -c model_reasoning_effort=high \
     -c web_search="live" \
     --dangerously-bypass-approvals-and-sandbox \
     --skip-git-repo-check \
     "<task>"
   ```
6. To continue a previous non-interactive session, run:
   ```bash
   codex exec resume <session_id> "<follow-up>"
   ```
7. Read `$SKILL_DIR/references/REFERENCE.md` for review templates, focus prompts, target selection guidance, and post-review checklists.

## Review Workflows

### Review uncommitted changes

Use when the user asks to review local staged, unstaged, or untracked work before commit.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review the current uncommitted changes in @. Do not modify files. Focus on correctness, regressions, missing tests, and risky diffs."
```

### Review against a base branch

Use for PR-style review before opening or updating a pull request.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review all changes in this branch against <base-branch>. Do not modify files. Summarize the branch intent, then list findings by severity with file evidence and suggested fixes."
```

### Review a specific commit

Use when the user asks whether one commit is safe, clean, or ready to cherry-pick.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review commit <sha>. Do not modify files. Check intent, correctness, hidden regressions, and whether follow-up changes are needed."
```

### Review with a custom focus

Use when the user wants targeted review such as security, performance, architecture, or test coverage.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review <target> with focus on <security|performance|maintainability|tests>. Do not modify files. Return only findings relevant to that focus plus any critical blocker outside the focus."
```

## Structured Review Output

Ask Codex to use this format for review-only tasks:

```text
Review Scope
- Target:
- Focus:
- Assumptions:

Summary
- Overall risk:
- Ready to merge:

Findings
1. [severity] Title
   - Evidence: path/to/file:line or diff/commit context
   - Why it matters:
   - Recommended fix:

2. [severity] Title
   - Evidence:
   - Why it matters:
   - Recommended fix:

Open Questions
- ...

Suggested Next Steps
- ...
```

## Model Selection

- Default: `gpt-5.4`
- One-off override: `-m <model>`
- Session-level example override: set `CODEX_MODEL` before running the examples
- Persistent default:
  ```toml
  model = "gpt-5.4"
  ```
- Profile-based override:
  ```toml
  [profiles.codex-deep]
  model = "gpt-5.4"
  model_reasoning_effort = "xhigh"
  ```

## Notes

- `codex e` is still a valid short alias, but prefer `codex exec` in docs and automation snippets.
- Prefer `-c web_search="live"` over the legacy web-search flag and old feature-toggle form.
- Starting with GPT-5.4, OpenAI recommends the general-purpose GPT-5.4 model for most Codex coding tasks.
- For pure review, omit dangerous write flags unless the user explicitly requests changes to be applied.
- For review + fix workflows, start with review-only output, confirm priorities, then rerun in apply mode if needed.

## Error Handling

- `codex: command not found`: install via `npm install -g @openai/codex`
- Login/auth error: run `codex login`
- Rate limit or timeout: retry with lower `model_reasoning_effort` or a lighter model
- CLI unavailable and cannot be installed: fall back to native web/document tools
