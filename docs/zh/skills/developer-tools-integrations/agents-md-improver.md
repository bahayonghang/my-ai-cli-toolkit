# AGENTS.md Improver

审计并优化仓库中的 Codex `AGENTS.md` 指导文件。它关注作用域语义、nested override、可执行命令、安全边界，以及 Codex 专用工作流说明。

## 适用场景

- 审计或更新 root `AGENTS.md`
- 检查 nested `AGENTS.md` 是否冲突、过期或命令失效
- 把其他 provider 的指导改写成 Codex `AGENTS.md` 语义
- 补充 sandbox、审批、secret、生成文件、外部服务等边界
- 按已批准 plan 直接实施 AGENTS.md cleanup

## 工作流

1. 扫描 root 与 nested `AGENTS.md`
2. 判断每个文件的作用域和父子覆盖关系
3. 用仓库现状验证命令和路径
4. 按 Codex 专用 rubric 给每个文件评分
5. 先输出质量报告和建议 diff
6. 默认批准后再改；如果用户明确要求执行已批准 plan，则直接做目标编辑
7. 用 `git diff --check` 和相关仓库门禁验证

## 质量重点

- 作用域与覆盖关系清楚
- build / test / lint / typecheck 命令真实可执行
- 架构和 ownership 信息简洁、有路由价值
- 明确安全、权限、secret、外部服务边界
- Codex skills / subagents / plugins / MCP / OMX 表述准确不过度承诺
- 保留 OMX runtime/team 等 hook 管理 marker 区块

## 边界

只有在获得授权时才编辑仓库里的 `AGENTS.md`。除非用户明确要求，不编辑用户全局 `~/.codex/AGENTS.md`。不得破坏 hook 管理的 runtime marker，也不要把 root guidance 机械复制到每个 nested 文件。
