# Hooks

`platforms/claude/hooks/` 保存运行时 hook 资产。它们描述 agent runtime 何时调用外部脚本，并把实际逻辑保持为小型、可审计的文件。

## 运行时触发点

| 事件 | 匹配器 | 命令 |
| --- | --- | --- |
| `PreToolUse` | `Bash` | `python "${CLAUDE_PLUGIN_ROOT}/pre-bash.py"` |
| `UserPromptSubmit` | `*` | `python "${CLAUDE_PLUGIN_ROOT}/log-prompt.py"` |

## 文件职责

| 文件 | 职责 | 备注 |
| --- | --- | --- |
| `platforms/claude/hooks/hooks.json` | 声明 hook 入口、matcher 与命令调用顺序。 | Runtime hook declaration file. |
| `platforms/claude/hooks/log-prompt.py` | 按事件 session_id 与 cwd 记录 UserPromptSubmit 输入，写入会话隔离日志。 | Log Prompt Hook - Record user prompts to session-specific log files. Uses session-isolated logs to handle concurrency. |
| `platforms/claude/hooks/pre-bash.py` | PreToolUse Bash 护栏：读取官方 stdin JSON 的 tool_input.command；命中危险模式时以 exit 2 阻断。 | Pre-Bash Hook - Block dangerous commands before execution. |

## Hook 文件目录

### hooks.json

- 路径: `platforms/claude/hooks/hooks.json`
- 职责: 声明 hook 入口、matcher 与命令调用顺序。
- 备注: Runtime hook declaration file.

### log-prompt.py

- 路径: `platforms/claude/hooks/log-prompt.py`
- 职责: 按事件 session_id 与 cwd 记录 UserPromptSubmit 输入，写入会话隔离日志。
- 备注: Log Prompt Hook - Record user prompts to session-specific log files. Uses session-isolated logs to handle concurrency.

### pre-bash.py

- 路径: `platforms/claude/hooks/pre-bash.py`
- 职责: PreToolUse Bash 护栏：读取官方 stdin JSON 的 tool_input.command；命中危险模式时以 exit 2 阻断。
- 备注: Pre-Bash Hook - Block dangerous commands before execution.


## 安全边界

- Hooks 是运行时资源，不是 docs 站构建步骤。
- `pre-bash.py` 只做保守字符串匹配；官方 PreToolUse 阻断使用 exit 2。它是安全护栏，不替代对命令副作用的判断。
- `log-prompt.py` 写入 `.claude/state/`；该目录属于本地运行状态，不应作为内容源提交。
- 仓库里的 `hooks.json` 不是 Claude Code 客户端已注册或已加载这些 hook 的证明。

## 修改后验证

```bash
just python-check
just python-test
just docs-check
just ci
```
