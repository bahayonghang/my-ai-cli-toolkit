# Codex CLI Reference

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `<task>` | Task description, supports `@file` references | (required) |
| `-m <model>` | Override model (e.g., `gpt-5.3-codex`, `gpt-5`) | `gpt-5.3-codex` |
| `-c model_reasoning_effort=<level>` | Reasoning depth: low/medium/high/xhigh | xhigh (code) / high (web) |
| `-C <workdir>` | Working directory | current directory |
| `--enable web_search_request` | Enable web search capability | disabled |
| `--json` | JSON output for programmatic use | disabled |

## File Reference Syntax

- `@file` — reference a file relative to working directory
- `@.` — reference entire working directory

## Code Generation Examples

Basic code analysis:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "explain @src/main.ts"
```

Refactoring with custom reasoning:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "refactor @src/utils for performance"
```

Multi-file analysis:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C /path/to/project \
  "analyze @. and find security issues"
```

## Web Search Examples

Fetch GitHub repo:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Fetch and summarize https://github.com/user/repo"
```

Documentation search:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "find the latest React 19 hooks documentation"
```

Technology research:
```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "compare Vite vs Webpack for React projects in 2024"
```

## Session Resume

Resume a previous session for multi-turn conversations:
```bash
# First session output includes thread_id in JSON
codex e resume <session_id> "<follow-up task>"
```

## Alternative: Config File

Add to `~/.codex/config.toml` to enable web search by default:
```toml
[features]
web_search_request = true
```

## Notes

- Requires Codex CLI installed and authenticated
- All commands use `--dangerously-bypass-approvals-and-sandbox` for automation
- Use `--skip-git-repo-check` to work in any directory

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `codex: command not found` | Install Codex CLI: `npm install -g @openai/codex` |
| Authentication error | Run `codex auth login` to authenticate |
| Session resume fails | Verify `session_id` from previous JSON output |
| Web search not working | Add `--enable web_search_request` flag or configure `config.toml` |
