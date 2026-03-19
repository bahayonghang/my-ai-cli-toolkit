---
name: codex
description: >-
  Use when you want to run the local OpenAI Codex CLI for code generation,
  debugging, refactoring, review-style second opinions, or up-to-date
  documentation and web lookup. Trigger this skill whenever the user mentions
  codex, asks for a Codex CLI run, wants a second engineering opinion from
  OpenAI, or needs live OpenAI-backed technical web search.
version: 1.1.0
argument-hint: [task-description]
allowed-tools:
  - Bash(codex *)
metadata:
  category: development-tools
  tags: [openai-codex, codex-cli, gpt-5.4, web-search, second-opinion]
---

Run Codex CLI for `$ARGUMENTS`.

## Defaults

- Primary command form: `codex exec`
- Default model: `gpt-5.4`
- Default code reasoning: `xhigh`
- Default web-search reasoning: `high`
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
   - **Code execution**: analysis, generation, refactoring, debugging, review.
   - **Web search / docs lookup**: current information, docs, URLs, comparisons.
3. For code tasks, run:
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
   > confirmation prompts and filesystem sandboxing. This is required for automated
   > execution but means Codex can modify/delete files without asking. Only use in
   > controlled environments.
4. For web search / docs lookup, run:
   ```bash
   CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
   codex exec -m "$CODEX_MODEL" \
     -c model_reasoning_effort=high \
     -c web_search="live" \
     --dangerously-bypass-approvals-and-sandbox \
     --skip-git-repo-check \
     "<task>"
   ```
5. To continue a previous non-interactive session, run:
   ```bash
   codex exec resume <session_id> "<follow-up>"
   ```
6. Read `$SKILL_DIR/references/REFERENCE.md` for parameter details, config examples, and copy-ready command templates.

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

## Error Handling

- `codex: command not found`: install via `npm install -g @openai/codex`
- Login/auth error: run `codex login`
- Rate limit or timeout: retry with lower `model_reasoning_effort` or a lighter model
- CLI unavailable and cannot be installed: fall back to native web/document tools
