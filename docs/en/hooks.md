# Hooks

`platforms/claude/hooks/` stores runtime hook assets. They describe when an agent runtime invokes external scripts while keeping behavior in small, auditable files.

## Runtime trigger points

| Event | Matcher | Commands |
| --- | --- | --- |
| `PreToolUse` | `Bash` | `python "${CLAUDE_PLUGIN_ROOT}/pre-bash.py"` |
| `UserPromptSubmit` | `*` | `python "${CLAUDE_PLUGIN_ROOT}/log-prompt.py"` |

## File responsibilities

| File | Responsibility | Notes |
| --- | --- | --- |
| `platforms/claude/hooks/hooks.json` | Declares hook entrypoints, matchers, and command order. | Runtime hook declaration file. |
| `platforms/claude/hooks/log-prompt.py` | Logs UserPromptSubmit input using event session_id and cwd into session-isolated files. | Log Prompt Hook - Record user prompts to session-specific log files. Uses session-isolated logs to handle concurrency. |
| `platforms/claude/hooks/pre-bash.py` | PreToolUse Bash guard. Reads official stdin JSON tool_input.command. Exit 2 blocks a matched dangerous pattern. | Pre-Bash Hook - Block dangerous commands before execution. |

## Hook file catalog

### hooks.json

- Path: `platforms/claude/hooks/hooks.json`
- Responsibility: Declares hook entrypoints, matchers, and command order.
- Notes: Runtime hook declaration file.

### log-prompt.py

- Path: `platforms/claude/hooks/log-prompt.py`
- Responsibility: Logs UserPromptSubmit input using event session_id and cwd into session-isolated files.
- Notes: Log Prompt Hook - Record user prompts to session-specific log files. Uses session-isolated logs to handle concurrency.

### pre-bash.py

- Path: `platforms/claude/hooks/pre-bash.py`
- Responsibility: PreToolUse Bash guard. Reads official stdin JSON tool_input.command. Exit 2 blocks a matched dangerous pattern.
- Notes: Pre-Bash Hook - Block dangerous commands before execution.


## Safety boundaries

- Hooks are runtime assets, not part of the docs-site build pipeline.
- `pre-bash.py` is a conservative string-match guardrail; official PreToolUse blocking uses exit 2. It does not replace review of command side effects.
- `log-prompt.py` writes local runtime state under `.claude/state/`; that directory is not a content source to commit.
- `hooks.json` in this repository is not proof that a Claude Code client registered or loaded these hooks.

## Validation after changes

```bash
just python-check
just python-test
just docs-check
just ci
```
