# 统一五套 Harness 项目说明与能力边界

## Goal

从同一项目入口获得真实、可追溯的五工具支持说明，避免把安装目录、原生机制与已验证运行混为一谈。

## Confirmed facts

- `CLAUDE.md:15`、`README.md:65`、`docs/index.md:22` 的 CI 列表未跟随 justfile 的完整门。
- `CLAUDE.md:1` 起维护独立说明，没有引用根 AGENTS；根 AGENTS 包含 Trellis 与目录导航约束。
- `docs/scripts/sync_docs_catalog.py:759` 的 archive-planning 示例不在当前 skill catalog；当前 Codex 源目录没有 prompts。
- `scripts/install_projects.py:32` 至第 45 行有共享目录与五工具安装目标，但它们不是新会话发现证明。

## Requirements

- R1：根 AGENTS 作为仓库共用规则，CLAUDE 使用兼容入口转发；共用规则无宿主专属能力假设。
- R2：五工具事实表覆盖规则发现、skills、扩展/hook、代理、权限、验证边界，注明当前资料来源和证据状态。
- R3：README 与中英文 docs 反映真实目录、完整 CI、第三方安装 CLI 与本地 live-link 的不同职责。
- R4：生成内容只能从生成器更新；不伪造不存在的工具资产或客户端已验证状态。

## Acceptance Criteria

- [x] AC1（R1）：CLAUDE 明确引用 `@AGENTS.md`，仅保留 Claude 加载说明；AGENTS→CLAUDE 走读无重复冲突的 CI/授权/目录规则。
- [x] AC2（R2）：Claude Code、Codex、Grok Build、Kimi Code CLI、OMP 各有完整行，来源日期 2026-09-07；未验证项写 UNVERIFIED；Kimi 产品/仓库未混用；OMP 不借用 Pi。
- [x] AC3（R3）：README 与中英文 docs 首页 CI 清单匹配 justfile；能力表从 README 与首页进入。README_CN.md 与 vitepress top nav 在 OBJECTIVE 写界外，未改。
- [ ] AC4（R4）：生成器不再声称存在 `$archive-planning` 或 Codex prompts；`just docs-sync` 与 `just docs-check` 均为 0。全库 `just ci` 由父项在归档后运行。客户端加载 UNVERIFIED。

## Dependencies and scope

资料与入口草稿可独立开展；hook 公开说明与最终生成同步依赖 `09-07-claude-hook-runtime-contract` 的实现就绪；最终 CI 清单以 `09-07-harness-verification-coverage` 已修改并通过定向测试的 justfile 为准。两项前置不要求 completed/archive，其最终 CI 验收由本项生成同步后的父项集成门回填。

不创建三套空平台目录、不新增三份复制的规则、不改用户全局加载配置、不声称所有 skills 在五工具语义等价。Antigravity 仅作现有资产说明，不实施其旁支工作流重构。
