# Gemini CLI Command Reference

Complete reference for Gemini CLI v0.27.0+ with this skill's model-default convention.
The default skill path uses explicit model literals so the planned run header and
the CLI invocation stay aligned.

## Installation

```bash
npm install -g @google/gemini-cli
# Or without installing:
npx @google/gemini-cli
```

## Authentication

```bash
# Option 1: API Key
export GEMINI_API_KEY=your_key

# Option 2: OAuth (interactive)
gemini
```

## Command Line Flags

### Essential Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--approval-mode` | | Approval mode: `default`, `auto_edit`, or `yolo` |
| `--output-format` | `-o` | Output format: `text`, `json`, `stream-json` |
| `--model` | `-m` | Model selection. Gemini CLI falls back to `auto` when no higher-precedence override is set. |

> Deprecated: `--yolo` / `-y` and `--prompt` / `-p` are deprecated. Use `--approval-mode yolo` and positional arguments instead.

### Session Management

| Flag | Short | Description |
|------|-------|-------------|
| `--resume` | `-r` | Resume session by index or `latest` |
| `--list-sessions` | | List available sessions |
| `--delete-session` | | Delete session by index |

### Execution Options

| Flag | Short | Description |
|------|-------|-------------|
| `--sandbox` | `-s` | Run in isolated sandbox |
| `--prompt-interactive` | `-i` | Execute prompt and continue in interactive mode |
| `--checkpointing` | | Enable file change snapshots |
| `--experimental-acp` | | Start in ACP mode |
| `--experimental-zed-integration` | | Run in Zed editor integration mode |

### Context & Tools

| Flag | Description |
|------|-------------|
| `--include-directories` | Add directories to workspace |
| `--allowed-tools` | Tools allowed to run without confirmation |
| `--allowed-mcp-server-names` | Restrict MCP servers |
| `--extensions` / `-e` | List of extensions to use |

### Other Options

| Flag | Short | Description |
|------|-------|-------------|
| `--debug` | `-d` | Enable debug output |
| `--version` | `-v` | Show version |
| `--help` | `-h` | Show help |
| `--list-extensions` | `-l` | List installed extensions |
| `--screen-reader` | | Enable screen reader mode |

## Planned Run Header

Before any `gemini` invocation in the skill workflow, present this block:

```text
Planned AI Run
- Tool: Gemini CLI
- Mode: <generate | analyze | review | fast-path | compatibility-fallback | structured-output>
- Model: <literal model id>
- Runtime: <approval=yolo, output=text | approval=yolo, output=json>
- Search: <grounded when requested | off>
- Access: <yolo | review-safe>
- Workdir: <path or current>
```

Guidance:
- Keep the header and the final `-m` flag on the same literal model id.
- Use `gemini-3.1-pro-preview` for the default skill path unless the user explicitly asks for a different model.
- Use `gemini-3.1-flash-preview` for fast-path runs and mark the mode accordingly.
- Use `gemini-2.5-pro` or `auto` only for compatibility fallback, and say so in the header.
- Treat environment variables and `settings.json` as deliberate overrides, not hidden defaults for the displayed summary.

## Output Formats

### Text (`-o text`)

```bash
gemini "prompt" -o text
```

### JSON (`-o json`)

```bash
gemini "prompt" -m gemini-3.1-pro-preview -o json
```

Returns structured data:

```json
{
  "response": "The actual response content",
  "stats": {
    "models": {
      "gemini-3.1-pro-preview": {
        "api": {
          "totalRequests": 3,
          "totalErrors": 0,
          "totalLatencyMs": 5000
        },
        "tokens": {
          "prompt": 1500,
          "candidates": 500,
          "total": 2000,
          "cached": 800,
          "thoughts": 150,
          "tool": 50
        }
      }
    },
    "tools": {
      "totalCalls": 2,
      "totalSuccess": 2,
      "totalFail": 0,
      "byName": {
        "google_web_search": {
          "count": 1,
          "success": 1,
          "durationMs": 3000
        }
      }
    }
  }
}
```

### Stream JSON (`-o stream-json`)

Real-time newline-delimited JSON events for monitoring long tasks.

## Model Defaults for This Skill

### Shared Shell Convention

Use one variable for the primary model and one for the faster model when you
intentionally want reusable overrides. The default skill path still displays and
uses explicit model literals.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
```

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
if (-not $env:GEMINI_FAST_MODEL) { $env:GEMINI_FAST_MODEL = "gemini-3.1-flash-preview" }
```

### Official Override Order

1. `--model`
2. `GEMINI_MODEL`
3. `settings.json` at `model.name`
4. Gemini CLI default `auto`

### Recommended Models

| Model | Role in this skill | Notes |
|-------|--------------------|-------|
| `gemini-3.1-pro-preview` | Default primary model | Best default when preview access is available |
| `gemini-3.1-flash-preview` | Default fast model | Lower latency for lighter tasks |
| `gemini-2.5-pro` | Compatibility fallback | Use when 3.1 preview access is unavailable |
| `auto` | CLI-managed fallback | Use when you want Gemini CLI to choose |

### Usage

```bash
# Default path for this skill
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "complex analysis" -m "$GEMINI_MODEL" -o text

# Fast path for lightweight tasks
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
gemini "simple task" -m "$GEMINI_FAST_MODEL" -o text
```

## Configuration Files

### Settings Location

Priority order (highest first):

1. `/etc/gemini-cli/settings.json` (system)
2. `~/.gemini/settings.json` (user)
3. `.gemini/settings.json` (project)

### Persistent Model Override via Settings

```json
{
  "model": {
    "name": "gemini-3.1-pro-preview"
  },
  "security": {
    "auth": {
      "selectedType": "oauth-personal"
    }
  },
  "general": {
    "previewFeatures": true,
    "vimMode": false,
    "checkpointing": true
  },
  "mcpServers": {}
}
```

### Persistent Model Override via Environment Variables

```bash
export GEMINI_MODEL=gemini-3.1-pro-preview
export GEMINI_FAST_MODEL=gemini-3.1-flash-preview
```

```powershell
$env:GEMINI_MODEL = "gemini-3.1-pro-preview"
$env:GEMINI_FAST_MODEL = "gemini-3.1-flash-preview"
```

### Project Context (GEMINI.md)

Create `.gemini/GEMINI.md` in the project root:

```markdown
# Project Context

Project description and guidelines.

## Coding Standards
- Standards Gemini should follow

## When Making Changes
- Guidelines for modifications
```

### Ignore Files (.geminiignore)

Like `.gitignore`, excludes files from context:

```text
node_modules/
dist/
*.log
.env
```

## Session Management

### List Sessions

```bash
gemini --list-sessions
```

### Resume Session

```bash
echo "follow-up question" | gemini -r 1 -o text
echo "continue" | gemini -r latest -o text
```

## Rate Limits

### Rate Limit Behavior

- CLI auto-retries with exponential backoff
- Message: `"quota will reset after Xs"`
- Typical wait: 1-5 seconds

### Mitigation

1. Keep `GEMINI_MODEL` and `GEMINI_FAST_MODEL` explicit so you know which quota lane you are using.
2. Use `GEMINI_FAST_MODEL` for lower-priority or lighter tasks.
3. Batch related operations into one prompt.
4. Run long tasks in the background when the shell supports it.
5. If preview quotas are unavailable, switch `GEMINI_MODEL` to `gemini-2.5-pro` or `auto`.

## Interactive Commands

In interactive mode, these slash commands are available:

| Command | Purpose |
|---------|---------|
| `/about` | Display version information |
| `/auth` | Modify authentication method |
| `/bug` | File GitHub issues |
| `/chat save/resume/list/delete/share` | Manage conversation checkpoints |
| `/clear` | Clear the terminal screen |
| `/compress` | Condense chat context to reduce token usage |
| `/copy` | Copy last output to clipboard |
| `/directory add/show` | Manage workspace directories |
| `/docs` | Open documentation in browser |
| `/editor` | Select preferred text editor |
| `/extensions` | List active extensions |
| `/help` | Show available commands |
| `/hooks enable/disable/list` | Manage lifecycle event hooks |
| `/ide enable/disable/install/status` | Control IDE integration |
| `/init` | Generate tailored GEMINI.md context file |
| `/introspect` | Debug session state and active hooks |
| `/mcp auth/desc/list/refresh/schema` | Manage MCP servers |
| `/memory add/list/refresh/show` | Manage AI instructional context |
| `/model` | Select Gemini model version |
| `/policies list` | Manage policies |
| `/privacy` | Display privacy notice |
| `/quit` | Exit CLI |
| `/restore` | Undo file modifications from tool execution |
| `/resume` | Browse and restore previous sessions |
| `/rewind` | Navigate backward through conversation history |
| `/settings` | Open configuration editor |
| `/shells` | Toggle background process view |
| `/skills enable/disable/list/reload` | Manage Agent Skills |
| `/stats` | Show token usage and session metrics |
| `/theme` | Change visual appearance |
| `/tools desc/nodesc` | List available tools |
| `/vim` | Toggle vim-mode editing |

## Piping & Scripting

### Pipe Input

```bash
echo "What is 2+2?" | gemini -o text
cat file.txt | gemini "summarize this" -o text
```

### File Reference Syntax

In prompts, reference files with `@`:

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Review @./src/main.js for bugs" -m "$GEMINI_MODEL" -o text
```

### Shell Command Execution

In interactive mode, prefix with `!`:

```text
> !git status
```

## Keyboard Shortcuts (Interactive)

| Shortcut | Function |
|----------|----------|
| `Ctrl+L` | Clear screen |
| `Ctrl+V` | Paste from clipboard |
| `Ctrl+X` | Open in external editor |
| `?` | Toggle shortcuts panel |

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "API key not found" | Set `GEMINI_API_KEY` or complete `/auth` |
| "Preview model unavailable" | Switch `GEMINI_MODEL` to `gemini-2.5-pro` or `auto` |
| "Rate limit exceeded" | Wait for auto-retry or use `GEMINI_FAST_MODEL` |
| "Context too large" | Use `.geminiignore` or `/compress` |
| "Tool call failed" | Check JSON stats for details |

### Debug Mode

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "prompt" -m "$GEMINI_MODEL" --debug -o text
```

### Error Reports

Full error reports are typically written to Gemini CLI's temporary error-report location for the current platform.
