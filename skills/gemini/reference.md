# Gemini CLI Command Reference

Complete reference for Gemini CLI v0.27.0+

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
gemini  # First run prompts for auth
```

## Command Line Flags

### Essential Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--approval-mode` | | Approval mode: `default`, `auto_edit`, or `yolo` |
| `--output-format` | `-o` | Output format: `text`, `json`, `stream-json` |
| `--model` | `-m` | Model selection (default: `auto`) |

> **Deprecated:** `--yolo` / `-y` and `--prompt` / `-p` are deprecated. Use `--approval-mode yolo` and positional arguments instead.

### Session Management

| Flag | Short | Description |
|------|-------|-------------|
| `--resume` | `-r` | Resume session by index or "latest" |
| `--list-sessions` | | List available sessions |
| `--delete-session` | | Delete session by index |

### Execution Options

| Flag | Short | Description |
|------|-------|-------------|
| `--sandbox` | `-s` | Run in isolated sandbox |
| `--prompt-interactive` | `-i` | Execute prompt and continue in interactive mode |
| `--checkpointing` | | Enable file change snapshots |
| `--experimental-acp` | | Start in ACP (Agent Code Pilot) mode |
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
| `--screen-reader` | | Enable screen reader mode for accessibility |

## Output Formats

### Text (`-o text`)
```bash
gemini "prompt" -o text
# Returns: Human-readable response
```

### JSON (`-o json`)
```bash
gemini "prompt" -o json
```

Returns structured data:
```json
{
  "response": "The actual response content",
  "stats": {
    "models": {
      "gemini-2.5-flash": {
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

## Model Selection

### Available Models

| Model | Use Case | Notes |
|-------|----------|-------|
| `auto` (default) | Smart routing | Auto-selects Flash or Pro based on task complexity |
| `gemini-2.5-pro` | Complex tasks | Stable, 1M token context |
| `gemini-2.5-flash` | Quick tasks, lower latency | Stable, large context |
| `gemini-3-pro-preview` | Latest capabilities | Requires Google AI Ultra or paid API key |
| `gemini-3-flash-preview` | Latest Flash model | Requires Preview Features enabled |

### Auto Routing

Auto mode has two variants:
- **Auto (Gemini 2.5)** — Routes between `gemini-2.5-pro` and `gemini-2.5-flash`
- **Auto (Gemini 3)** — Routes between `gemini-3-pro-preview` and `gemini-3-flash-preview` (requires Preview Features)

Use `/model` in interactive mode or `/settings` to switch.

### Usage
```bash
# Default (Auto routing)
gemini "complex analysis" -o text

# Explicit model
gemini "simple task" -m gemini-2.5-flash -o text
```

## Configuration Files

### Settings Location
Priority order (highest first):
1. `/etc/gemini-cli/settings.json` (system)
2. `~/.gemini/settings.json` (user)
3. `.gemini/settings.json` (project)

### Example Settings
```json
{
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

### Project Context (GEMINI.md)

Create `.gemini/GEMINI.md` in project root:
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
```
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

Output:
```
Available sessions for this project (5):
  1. Create task manager (10 minutes ago) [uuid]
  2. Review code (20 minutes ago) [uuid]
  ...
```

### Resume Session
```bash
# By index
echo "follow-up question" | gemini -r 1 -o text

# Latest session
echo "continue" | gemini -r latest -o text
```

## Rate Limits

### Rate Limit Behavior
- CLI auto-retries with exponential backoff
- Message: `"quota will reset after Xs"`
- Typical wait: 1-5 seconds

### Mitigation
1. Use Auto routing (default) to let the system optimize model selection
2. Use `gemini-2.5-flash` for simple tasks
3. Batch operations into single prompts
4. Run long tasks in background

## Interactive Commands

In interactive mode, these slash commands are available:

| Command | Purpose |
|---------|---------|
| `/about` | Display version information |
| `/auth` | Modify authentication method |
| `/bug` | File GitHub issues |
| `/chat save/resume/list/delete/share` | Manage conversation checkpoints |
| `/clear` | Clear the terminal screen (Ctrl+L) |
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
| `/quit` | Exit CLI (`/exit` alias) |
| `/restore` | Undo file modifications from tool execution |
| `/resume` | Browse and restore previous sessions |
| `/rewind` | Navigate backward through conversation history |
| `/settings` | Open configuration editor |
| `/shells` | Toggle background process view (`/bashes` alias) |
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
gemini "Review @./src/main.js for bugs" -o text
```

### Shell Command Execution
In interactive mode, prefix with `!`:
```
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
| "API key not found" | Set `GEMINI_API_KEY` env var or use `/auth` |
| "Rate limit exceeded" | Wait for auto-retry or use Flash model |
| "Context too large" | Use `.geminiignore` or `/compress` |
| "Tool call failed" | Check JSON stats for details |

### Debug Mode
```bash
gemini "prompt" --debug -o text
```

### Error Reports
Full error reports saved to:
```
/var/folders/.../gemini-client-error-*.json
```
