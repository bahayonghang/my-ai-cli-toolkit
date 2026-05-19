# Codex Workflow Recommender

只读分析并推荐仓库的 Codex 工作流优化：`AGENTS.md`、Codex skills、native subagents、plugins、MCP servers、config/hooks、CLI runtime 命令，以及可选的 OMX 工作流。

## 适用场景

- 分析某个 repo 应该怎样优化 Codex 工作流
- 推荐 Codex MCP、plugins、skills 或 subagents
- 检查 `AGENTS.md` 作用域和 nested guidance 是否足够
- 规划安全的 Codex CLI / Codex App 自动化，而不是立刻改配置
- 区分通用 Codex 能力和当前环境特有的 OMX 增强

## 它会检查什么

- 仓库技术栈、验证门禁和风险边界
- root 与 nested `AGENTS.md`
- 相关的 `.codex/skills`、`~/.codex/skills`、`.codex/agents`、`~/.codex/agents`
- `codex --help`、`codex mcp --help`、`codex plugin --help` 等只读命令输出
- 当前存在且可读的本机 config / hook 文件

## 输出结构

默认报告包含：

- Codebase Profile
- Current Codex Surface
- Top Recommendations by category
- Safe Implementation Order
- Verification Plan
- Want me to implement...

这个 skill 不安装插件、不添加 MCP server、不直接编辑文件，只给出可以后续批准执行的安全实施顺序。

## 边界

这是旧 Claude automation recommender 的 Codex 专用替代版本，不能把 Claude-only 路径或命令当作 Codex 操作指令。OMX 只在当前环境确实支持时作为可选增强项出现。
