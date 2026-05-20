# Hooks

`content/hooks/` 保存运行时 hook 资产。它们描述 agent runtime 何时调用外部脚本，并把实际逻辑保持为小型、可审计的文件。

## 运行时触发点

| 事件 | 匹配器 | 命令 |
| --- | --- | --- |
| `PreToolUse` | `Bash` | `python3 ${CLAUDE_PLUGIN_ROOT}/pre-bash.py "$CLAUDE_TOOL_INPUT"`<br>`python3 ${CLAUDE_PLUGIN_ROOT}/inject-spec.py` |
| `UserPromptSubmit` | `*` | `python3 ${CLAUDE_PLUGIN_ROOT}/log-prompt.py` |

## 文件职责

| 文件 | 职责 | 备注 |
| --- | --- | --- |
| `content/hooks/hooks.json` | 声明 hook 入口、matcher 与命令调用顺序。 | Runtime hook declaration file. |
| `content/hooks/inject-spec.py` | 兼容保留的 no-op spec 注入入口。 | Global Spec Injection Hook (DEPRECATED). Spec injection is now handled internally by codeagent-wrapper via the per-task `skills:` field in parallel config and the `--skills` CLI flag. This hook is kept as a no-op for backward compatibility. |
| `content/hooks/log-prompt.py` | 记录 UserPromptSubmit 输入，写入本地会话日志。 | Log Prompt Hook - Record user prompts to session-specific log files. Used for review on Stop. Uses session-isolated logs to handle concurrency. |
| `content/hooks/pre-bash.py` | 在 Bash 调用前做保守危险命令拦截。 | Pre-Bash Hook - Block dangerous commands before execution. |

## Hook 文件目录

### hooks.json

- 路径: `content/hooks/hooks.json`
- 职责: 声明 hook 入口、matcher 与命令调用顺序。
- 备注: Runtime hook declaration file.

### inject-spec.py

- 路径: `content/hooks/inject-spec.py`
- 职责: 兼容保留的 no-op spec 注入入口。
- 备注: Global Spec Injection Hook (DEPRECATED). Spec injection is now handled internally by codeagent-wrapper via the per-task `skills:` field in parallel config and the `--skills` CLI flag. This hook is kept as a no-op for backward compatibility.

### log-prompt.py

- 路径: `content/hooks/log-prompt.py`
- 职责: 记录 UserPromptSubmit 输入，写入本地会话日志。
- 备注: Log Prompt Hook - Record user prompts to session-specific log files. Used for review on Stop. Uses session-isolated logs to handle concurrency.

### pre-bash.py

- 路径: `content/hooks/pre-bash.py`
- 职责: 在 Bash 调用前做保守危险命令拦截。
- 备注: Pre-Bash Hook - Block dangerous commands before execution.


## 安全边界

- Hooks 是运行时资源，不是 docs 站构建步骤。
- `pre-bash.py` 只做保守字符串匹配；它是安全护栏，不替代对命令副作用的判断。
- `inject-spec.py` 目前必须保持可执行且无副作用，以兼容仍引用它的旧 hook 配置。
- `log-prompt.py` 写入 `.claude/state/`；该目录属于本地运行状态，不应作为内容源提交。

## 修改后验证

```bash
just python-check
just docs-check
just ci
```
