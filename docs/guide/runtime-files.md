# Runtime Files

## Overview

The repository contains runtime-oriented assets beyond installable skills and commands.

Current top-level runtime content lives under:

- `content/hooks/`
- `content/memorys/`
- root-level `CLAUDE.md`

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
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/pre-bash.py \"$CLAUDE_TOOL_INPUT\"" },
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

## `content/memorys/`

This directory stores platform-specific runtime prompt or memory files:

- `content/memorys/claude/Unix/CLAUDE.md`
- `content/memorys/claude/Windows/CLAUDE.md`
- `content/memorys/codex/AGENTS.md`

Treat these as runtime seeds or templates, not as normal docs-site pages.

### Platform prompt files

| File | Platform | Purpose |
|------|----------|---------|
| `claude/Unix/CLAUDE.md` | Claude Code (Unix) | Linus Torvalds–style engineering principles with structured workflow (intake → context gathering → exploration → planning → execution → verification → handoff). Enforces KISS/YAGNI, backward compatibility, and Chinese final responses. |
| `claude/Windows/CLAUDE.md` | Claude Code (Windows) | Same engineering principles adapted for Windows environments. |
| `codex/AGENTS.md` | Codex CLI | Nekomata engineer persona with SOLID/KISS/DRY/YAGNI principles, dangerous operation confirmation mechanism, and structured response format. |

These files are installed by MCS as the platform's base prompt or memory file. Users can customize them after installation — MCS will detect modifications via mtime comparison and show an `Outdated` status.

## Root `CLAUDE.md`

The root `CLAUDE.md` documents repository contributor guidance and current architecture conventions for the codebase itself.

It is not the same thing as:

- an installed Claude user prompt
- a skill definition
- a generated runtime memory file

## Prompt-related note

The MCS codebase still has a prompt update path for platforms that define `prompt_file`, with Claude being the default case. If you are changing runtime prompt behavior, inspect:

- `platforms.toml`
- `mcs/mcs-core/src/core/prompt.rs`
- the runtime assets under `content/memorys/` and `content/hooks/`

## Why this matters in docs

Earlier docs treated `prompts/` as the primary runtime source directory. In this repository, the real picture is broader:

- contributor instructions at the root
- hooks under `content/hooks/`
- memory/runtime files under `content/memorys/`
- prompt update logic in `mcs-core`
