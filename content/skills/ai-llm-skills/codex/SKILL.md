---
name: codex
description: >-
  Use when you need OpenAI Codex for a second opinion, large-scale code refactoring,
  deep reasoning tasks, or web documentation lookup. Trigger this skill whenever the
  user mentions codex, asks to delegate to codex, or needs online research via OpenAI.
version: 1.0.0
argument-hint: [task-description]
allowed-tools:
  - Bash(codex *)
metadata:
  category: development-tools
  tags: [openai-codex, codex-cli, deep-reasoning, web-search, second-opinion]
---

Run Codex CLI for `$ARGUMENTS`.

## Prerequisites

1. Verify Codex CLI is installed: `command -v codex`.
   - If not found, instruct user: `npm install -g @openai/codex`
2. Verify authentication: `codex auth status` or attempt a simple command.
   - If not authenticated, instruct user: `codex auth login`
3. If both checks fail and user cannot install, fall back to manual web search tools (WebSearch, WebFetch).

## Steps

1. If `$ARGUMENTS` empty, ask user for task description.
2. Determine capability:
   - **Code Generation**: tasks involving code analysis, refactoring, generation.
   - **Web Search**: tasks requiring online research, documentation lookup.
3. For Code Generation, run:
   ```bash
   codex e -m gpt-5.3-codex -c model_reasoning_effort=xhigh \
     --dangerously-bypass-approvals-and-sandbox \
     --skip-git-repo-check \
     -C <workdir> \
     "<task>"
   ```
   > **⚠️ Safety note:** `--dangerously-bypass-approvals-and-sandbox` disables all
   > confirmation prompts and filesystem sandboxing. This is required for automated
   > execution but means Codex can modify/delete files without asking. Only use in
   > controlled environments.
4. For Web Search, run:
   ```bash
   codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
     --enable web_search_request \
     --dangerously-bypass-approvals-and-sandbox \
     --skip-git-repo-check \
     "<task>"
   ```
5. To resume a session, run: `codex e resume <session_id> "<follow-up>"`.
6. Read `$SKILL_DIR/references/REFERENCE.md` for parameters and examples.

## Model Selection

- Default: `gpt-5.3-codex` (best for code tasks)
- Override via `-m <model>` flag (e.g., `-m gpt-5` for general reasoning)
- User can also set default model in `~/.codex/config.toml` under `[model]`

## Error Handling

| Problem | Solution |
|---------|----------|
| `codex: command not found` | Install: `npm install -g @openai/codex` |
| Authentication error | Run `codex auth login` |
| Rate limit / timeout | Retry with lower `model_reasoning_effort` |
| CLI unavailable & cannot install | Fall back to WebSearch / WebFetch tools |
