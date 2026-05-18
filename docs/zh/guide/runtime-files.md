# 运行时文件

## 概览

除了可安装的 skills 和 commands 之外，仓库里还存在一组运行时相关资源。

当前运行时内容主要位于：

- `content/hooks/`
- `content/platforms/codex/rules/AGENTS.md`
- `content/platforms/codex/prompts/`
- `content/platforms/claude/commands/init-projects.md`
- 仓库根目录的 `CLAUDE.md` 与 `AGENTS.md` 贡献者指导

## `content/hooks/`

这个目录存放 ClaudeKit hook 相关资源：

- `hooks.json`
- `inject-spec.py`
- `log-prompt.py`
- `pre-bash.py`

`hooks.json` 目前主要接入：

- Bash 的 `PreToolUse`
- `UserPromptSubmit` 日志记录

这些文件属于运行时集成资源，不是 installable skill。

### hooks.json

Hook 配置文件定义了在特定生命周期事件中运行哪些 Python 脚本：

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

- `PreToolUse` hook 在工具执行前触发。`matcher` 字段用于过滤触发的工具类型——此处仅匹配 `Bash` 命令。
- `UserPromptSubmit` hook 在用户提交 prompt 时触发。没有 matcher 表示每次提交都会触发。
- `${CLAUDE_PLUGIN_ROOT}` 解析为 `hooks.json` 所在的目录。

### pre-bash.py

在执行前拦截危险的 shell 命令。会将命令字符串与一组硬编码的破坏性模式进行匹配：

- `rm -rf /` 和 `rm -rf ~` — 递归删除根目录或用户主目录
- `dd if=` — 原始磁盘写入
- `:(){:|:&};:` — fork 炸弹
- `mkfs.` — 文件系统格式化
- `> /dev/sd` — 直接设备写入

如果匹配成功，hook 以退出码 1 终止并输出 `[CWF] BLOCKED` 消息，阻止命令执行。

### inject-spec.py

**已弃用。** 此 hook 现在是空操作（立即以退出码 0 退出）。Spec 注入已由 codeagent-wrapper 通过每个任务的 `skills:` 字段和 `--skills` CLI 参数在内部处理。保留此文件仅为向后兼容。

### log-prompt.py

将用户 prompt 记录到会话专属的日志文件中，便于后续审查。每次 `UserPromptSubmit` 事件触发时：

1. 从 stdin 读取 prompt（包含 `prompt` 字段的 JSON）
2. 通过 `CLAUDE_CODE_SSE_PORT` 环境变量确定会话 ID
3. 将带时间戳的条目（截断至 500 字符）写入 `.claude/state/session-{id}.log`

日志文件按会话隔离，以安全处理并发会话。

## 平台 rules 与 prompts

当前平台运行时源按能力拆分：

| 源 | 平台 | 用途 |
|----|------|------|
| `content/platforms/codex/rules/AGENTS.md` | Codex CLI | MCS 为 Codex 安装或 diff 的基础 `AGENTS.md` 指导文件。 |
| `content/platforms/codex/prompts/init-projects.md` | Codex CLI | 创建根目录和子目录 `AGENTS.md` 的项目初始化 prompt。 |
| `content/platforms/codex/prompts/codex-companion/` | Codex CLI | 覆盖 task、review、status、result、cancel 流程的 companion prompt pack。 |
| `content/platforms/claude/commands/init-projects.md` | Claude Code | 用于初始化仓库指导文件的 Claude command prompt。 |

Claude 仓库指导当前位于根目录 `CLAUDE.md`。Codex 仓库指导当前位于根目录 `AGENTS.md`。这些根目录文件用于指导本仓库贡献者，不等同于用户机器上安装的 runtime 文件。

## 与 guidance 相关的说明

MCS 会通过 `rules` 能力目录解析定义了 `guidance_file` / 旧名 `prompt_file` 的平台指导源。如果你要调整这部分行为，请同时查看：

- `platforms.toml`
- `mcs/mcs-core/src/config/platform.rs`
- `mcs/mcs-core/src/core/guidance.rs`
- `content/platforms/codex/rules/AGENTS.md`
- `content/hooks/`

## 为什么文档里要单独说明

旧文档曾把一个宽泛的 `guidance` 目录当作主要运行时源。对当前仓库来说，真实情况是：

- 根目录的贡献者说明
- `content/hooks/` 下的 hook 资源
- `content/platforms/<platform>/prompts/` 下的平台 prompt packs
- `content/platforms/<platform>/rules/` 下的平台基础指导文件
- `mcs-core` 里的 guidance update 逻辑
