# Runtime Files

## Overview

The repository contains runtime-oriented assets beyond installable skills and commands.

Current runtime content lives under:

- `content/hooks/`
- `content/platforms/codex/rules/AGENTS.md`
- `content/platforms/codex/prompts/`
- `content/platforms/claude/commands/init-projects.md`
- root-level `CLAUDE.md` and `AGENTS.md` contributor guidance

## `content/hooks/`

This folder contains ClaudeKit hook assets:

- `hooks.json`
- `inject-spec.py`
- `log-prompt.py`
- `pre-bash.py`

`hooks.json` currently wires:

- `PreToolUse` hooks for Bash
- `UserPromptSubmit` logging

These are runtime integration assets, not installable skills.

### hooks.json

The hook configuration file defines which Python scripts run at specific lifecycle events:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/pre-bash.py "$CLAUDE_TOOL_INPUT"" },
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/inject-spec.py" }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/log-prompt.py" }
        ]
      }
    ]
  }
}
```

- `PreToolUse` hooks fire before a tool is executed. The `matcher` field filters which tool triggers the hook — here, only `Bash` commands.
- `UserPromptSubmit` hooks fire when the user submits a prompt. No matcher means it fires on every submission.
- `${CLAUDE_PLUGIN_ROOT}` resolves to the directory containing `hooks.json`.

### pre-bash.py

Blocks dangerous shell commands before execution. Checks the command string against a hardcoded list of destructive patterns:

- `rm -rf /` and `rm -rf ~` — recursive deletion of root or home
- `dd if=` — raw disk writes
- `:(){:|:&};:` — fork bomb
- `mkfs.` — filesystem formatting
- `> /dev/sd` — direct device writes

If a match is found, the hook exits with code 1 and prints a `[CWF] BLOCKED` message, preventing execution.

### inject-spec.py

**Deprecated.** This hook is now a no-op (immediately exits with code 0). Spec injection is handled internally by the codeagent-wrapper via per-task `skills:` fields and the `--skills` CLI flag. Kept for backward compatibility.

### log-prompt.py

Records user prompts to session-specific log files for later review. On each `UserPromptSubmit` event:

1. Reads the prompt from stdin (JSON with a `prompt` field)
2. Determines the session ID from `CLAUDE_CODE_SSE_PORT` environment variable
3. Writes a timestamped entry (truncated to 500 chars) to `.claude/state/session-{id}.log`

Log files are session-isolated to handle concurrent sessions safely.

## Platform rules and prompts

Current platform runtime sources are split by capability:

| Source | Platform | Purpose |
|--------|----------|---------|
| `content/platforms/codex/rules/AGENTS.md` | Codex CLI | Base AGENTS.md guidance installed or diffed by MCS for Codex. |
| `content/platforms/codex/prompts/init-projects.md` | Codex CLI | Project initialization prompt that creates root and scoped `AGENTS.md` guidance. |
| `content/platforms/codex/prompts/codex-companion/` | Codex CLI | Companion prompt pack for task, review, status, result, and cancel flows. |
| `content/platforms/claude/commands/init-projects.md` | Claude Code | Claude command prompt for initializing repository guidance. |

Claude repository guidance currently lives at the root as `CLAUDE.md`. Codex repository guidance currently lives at the root as `AGENTS.md`. Those root files guide contributors in this repository; they are not the same as installed user-level runtime files.

## Guidance-related note

The MCS codebase resolves platform guidance sources through the `rules` capability directory for platforms that define `guidance_file` / legacy `prompt_file`. If you are changing runtime guidance behavior, inspect:

- `platforms.toml`
- `mcs/mcs-core/src/config/platform.rs`
- `mcs/mcs-core/src/core/guidance.rs`
- `content/platforms/codex/rules/AGENTS.md`
- `content/hooks/`

## Why this matters in docs

Earlier docs treated a broad `guidance` directory as the primary runtime source. In this repository, the real picture is:

- contributor instructions at the root
- hooks under `content/hooks/`
- platform prompt packs under `content/platforms/<platform>/prompts/`
- platform base guidance under `content/platforms/<platform>/rules/`
- guidance update logic in `mcs-core`
