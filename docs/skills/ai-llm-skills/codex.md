# Codex CLI Integration

Run the local Codex CLI for deep code work, live technical research, and citation-backed web workflows.

Starting with GPT-5.4, OpenAI recommends the latest GPT-5 general-purpose model for most Codex coding tasks, so this skill now defaults to `gpt-5.4`.

## Default Configuration

- Preferred command: `codex exec`
- Short alias still available: `codex e`
- Default model: `gpt-5.4`
- Code reasoning: `xhigh`
- Web search reasoning: `high`
- Live web search: `-c web_search="live"`

## Shared Model Convention

These examples keep the default model in one place:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
```

This is just a shell convention for the examples. Codex itself only requires the final `-m` value.

## Code Execution Template

Use this for analysis, debugging, refactoring, and other code-heavy tasks:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "<task>"
```

### Examples

```bash
# Explain a file
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "explain @src/main.ts"

# Refactor code
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "refactor @src/utils for performance"

# Analyze an entire project
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C /path/to/project \
  "analyze @. and find security issues"
```

## Web Search and Research Template

Use this for current docs, URL summarization, and the merged live research workflow that replaces the standalone `research` skill:

- break broad research into focused subqueries
- prefer official docs and official announcements first
- keep clickable citations in the final answer
- validate links when the reference list is long or a result looks stale

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "<task>"
```

### Examples

```bash
# Fetch a GitHub repository page
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Fetch and summarize https://github.com/user/repo"

# Search current documentation
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "find the latest React 19 hooks documentation"

# Compare technologies with live search
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "compare Vite vs Webpack for React projects today"
```

## Model Override and Config

Override the model for one run:

```bash
codex exec -m gpt-5.4-pro "review @src/server.ts for race conditions"
```

Set a persistent default in `~/.codex/config.toml`:

```toml
model = "gpt-5.4"
```

Or define a reusable profile:

```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## Session Resume

Continue an existing non-interactive Codex session:

```bash
codex exec resume <session_id> "<follow-up task>"
```

Example:

```bash
codex exec resume <session_id> "now add type hints"
```

## Prerequisites and Notes

- Verify installation: `command -v codex`
- Verify login: `codex login status`
- Authenticate if needed: `codex login`
- `@file` references files relative to the working directory
- `@.` references the entire working directory
- JSON output is available with `--json`
- All automation examples use `--dangerously-bypass-approvals-and-sandbox`
- Use `--skip-git-repo-check` for one-off directories
- Prefer `-c web_search="live"` over the legacy web-search flag and old feature-toggle form
