# Codex CLI Reference

## Defaults and Override Order

These examples centralize the default model with a shell variable:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
```

Use this order when choosing a model:

1. Example shell variable: `CODEX_MODEL`
2. Single-run CLI override: `-m <model>`
3. Persistent user config: `~/.codex/config.toml` with `model = "..."`
4. Profile override: `profiles.<name>.model`

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `<task>` | Task description, supports `@file` references | (required) |
| `-m <model>` | Override model (e.g., `gpt-5.4`, `gpt-5.4-pro`) | `gpt-5.4` |
| `-c model_reasoning_effort=<level>` | Reasoning depth: low/medium/high/xhigh | xhigh (code) / high (web) |
| `-c web_search="live"` | Enable live web search for current information | disabled |
| `-C <workdir>` | Working directory | current directory |
| `--json` | JSON output for programmatic use | disabled |

## File Reference Syntax

- `@file` — reference a file relative to working directory
- `@.` — reference entire working directory

## Code Generation Examples

Basic code analysis:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "explain @src/main.ts"
```

Refactoring with custom reasoning:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "refactor @src/utils for performance"
```

Multi-file analysis:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C /path/to/project \
  "analyze @. and find security issues"
```

## Web Search Examples

Fetch GitHub repo:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Fetch and summarize https://github.com/user/repo"
```

Documentation search:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "find the latest React 19 hooks documentation"
```

Technology research:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "compare Vite vs Webpack for React projects today"
```

## Session Resume

Resume a previous session for multi-turn conversations:
```bash
# First session output includes thread_id in JSON
codex exec resume <session_id> "<follow-up task>"
```

## Config Examples

Set a persistent default model:
```toml
model = "gpt-5.4"
```

Set a reusable profile for live web lookup:
```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## Notes

- Requires Codex CLI installed and authenticated
- Use `codex login status` to verify login and `codex login` to authenticate
- All commands use `--dangerously-bypass-approvals-and-sandbox` for automation
- Use `--skip-git-repo-check` to work in any directory
- `codex e` remains a short alias, but `codex exec` is the preferred form in docs
- Prefer `-c web_search="live"` over the legacy web-search flag and old feature-toggle form

### Security: `--dangerously-bypass-approvals-and-sandbox`

This flag disables **all** confirmation prompts and filesystem sandboxing. When active:
- Codex can read, write, and delete any file without asking
- No sandbox isolation — commands run with your full user permissions
- Intended for automated/CI pipelines where human approval is impractical

**Recommendations:**
- Only use in controlled environments (local dev, CI)
- Never use on production systems or with untrusted prompts
- Review generated changes via `git diff` after execution

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `codex: command not found` | Install Codex CLI: `npm install -g @openai/codex` |
| Authentication error | Run `codex login` to authenticate |
| Session resume fails | Verify `session_id` from previous JSON output |
| Web search not working | Add `-c web_search="live"` or configure `web_search = "live"` |
