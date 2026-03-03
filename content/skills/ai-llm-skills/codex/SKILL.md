---
name: codex
description: Execute Codex CLI for code generation and web research. Use when needing deep reasoning, large-scale refactoring, or online documentation lookup.
argument-hint: task-description
allowed-tools: Bash(codex *)
metadata:
  category: development-tools
  tags: [openai-codex, codex-cli, deep-reasoning]
---

Run Codex CLI for `$ARGUMENTS`.

## Steps

1. If Codex CLI not installed or not authenticated, report error and stop.
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
