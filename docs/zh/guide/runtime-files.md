# 运行时文件

## 概览

除了可安装的 skills 和 commands 之外，仓库里还存在一组运行时相关资源。

当前顶层运行时内容主要位于：

- `content/hooks/`
- `content/platforms/*/guidance/`
- 仓库根目录的 `CLAUDE.md`

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

## `content/platforms/*/guidance/`

这个目录存放平台相关的 runtime prompt / memory 文件：

- `content/platforms/claude/guidance/Unix/CLAUDE.md`
- `content/platforms/claude/guidance/Windows/CLAUDE.md`
- `content/platforms/codex/guidance/AGENTS.md`

应把它们视为运行时模板或 seed 文件，而不是普通 docs 页面。

### 平台 prompt 文件

| 文件 | 平台 | 用途 |
|------|------|------|
| `claude/Unix/CLAUDE.md` | Claude Code (Unix) | Linus Torvalds 风格的工程原则，包含结构化工作流（需求理解 → 上下文收集 → 探索 → 规划 → 执行 → 验证 → 交接）。强制遵循 KISS/YAGNI、向后兼容性，以及中文最终回复。 |
| `claude/Windows/CLAUDE.md` | Claude Code (Windows) | 相同的工程原则，适配 Windows 环境。 |
| `codex/AGENTS.md` | Codex CLI | 猫又工程师人设，遵循 SOLID/KISS/DRY/YAGNI 原则，具备危险操作确认机制和结构化响应格式。 |

这些文件由 MCS 作为平台的基础 guidance 文件安装。用户安装后可自行修改——MCS 会通过 mtime 比较检测变更，并显示 `Outdated` 状态。

## 根目录 `CLAUDE.md`

根目录 `CLAUDE.md` 记录的是仓库贡献者指导和当前代码架构约定。

它并不等同于：

- 用户机器上已安装的 Claude prompt
- 某个 skill 定义
- 运行时自动生成的 memory 文件

## 与 guidance 相关的说明

MCS 代码里现在对定义了 `guidance_file` 的平台提供 guidance update 能力。如果你要调整这部分行为，请同时查看：

- `platforms.toml`
- `mcs/mcs-core/src/core/guidance.rs`
- `content/platforms/*/guidance/` 与 `content/hooks/` 下的运行时资源

## 为什么文档里要单独说明

旧文档曾把 `prompts/` 当作主要运行时目录。对当前仓库来说，真实情况更宽：

- 根目录的贡献者说明
- `content/hooks/` 下的 hook 资源
- `content/platforms/*/guidance/` 下的平台 runtime 文件
- `mcs-core` 里的 guidance update 逻辑
