# Hooks

`content/hooks/` stores runtime hook assets. They describe when an agent runtime invokes external scripts while keeping behavior in small, auditable files.

## Runtime trigger points

| Event | Matcher | Commands |
| --- | --- | --- |
| `PreToolUse` | `Bash` | `python3 ${CLAUDE_PLUGIN_ROOT}/pre-bash.py "$CLAUDE_TOOL_INPUT"`<br>`python3 ${CLAUDE_PLUGIN_ROOT}/inject-spec.py` |
| `UserPromptSubmit` | `*` | `python3 ${CLAUDE_PLUGIN_ROOT}/log-prompt.py` |

## File responsibilities

| File | Responsibility | Notes |
| --- | --- | --- |
| `content/hooks/hooks.json` | Declares hook entrypoints, matchers, and command order. | Runtime hook declaration file. |
| `content/hooks/inject-spec.py` | Compatibility no-op for the former spec-injection hook. | Global Spec Injection Hook (DEPRECATED). Spec injection is now handled internally by codeagent-wrapper via the per-task `skills:` field in parallel config and the `--skills` CLI flag. This hook is kept as a no-op for backward compatibility. |
| `content/hooks/log-prompt.py` | Logs UserPromptSubmit input to local session logs. | Log Prompt Hook - Record user prompts to session-specific log files. Used for review on Stop. Uses session-isolated logs to handle concurrency. |
| `content/hooks/pre-bash.py` | Blocks conservative dangerous Bash fragments before execution. | Pre-Bash Hook - Block dangerous commands before execution. |

## Hook file catalog

### hooks.json

- Path: `content/hooks/hooks.json`
- Responsibility: Declares hook entrypoints, matchers, and command order.
- Notes: Runtime hook declaration file.

### inject-spec.py

- Path: `content/hooks/inject-spec.py`
- Responsibility: Compatibility no-op for the former spec-injection hook.
- Notes: Global Spec Injection Hook (DEPRECATED). Spec injection is now handled internally by codeagent-wrapper via the per-task `skills:` field in parallel config and the `--skills` CLI flag. This hook is kept as a no-op for backward compatibility.

### log-prompt.py

- Path: `content/hooks/log-prompt.py`
- Responsibility: Logs UserPromptSubmit input to local session logs.
- Notes: Log Prompt Hook - Record user prompts to session-specific log files. Used for review on Stop. Uses session-isolated logs to handle concurrency.

### pre-bash.py

- Path: `content/hooks/pre-bash.py`
- Responsibility: Blocks conservative dangerous Bash fragments before execution.
- Notes: Pre-Bash Hook - Block dangerous commands before execution.


## Safety boundaries

- Hooks are runtime assets, not part of the docs-site build pipeline.
- `pre-bash.py` is a conservative string-match guardrail; it does not replace review of command side effects.
- `inject-spec.py` should stay executable and side-effect free while older hook configs still reference it.
- `log-prompt.py` writes local runtime state under `.claude/state/`; that directory is not a content source to commit.

## Validation after changes

```bash
just python-check
just docs-check
just ci
```
