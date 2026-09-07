# 五套 Harness 常青项目审查与对齐改造

## Goal

对常青技能与平台资产仓库进行证据驱动审查，形成可以逐项批准的改造计划，明确 Claude Code、Codex、Grok Build、Kimi Code、OMP（Oh My Pi）的能力边界与执行分工。

## Authority

2026-09-07 用户授权：读取结构与关键文件、运行现有测试、追踪失败工作流根因、规划工具与模型分工、创建 Trellis 父子任务。当前仅写规划与审查证据。实施、改写项目说明/skill/团队知识库须等待用户批准本轮最终计划。不执行 start、commit、push、安装、用户全局配置修改。

## Requirements

- R1：审查项目结构、关键源文件、测试与 CI 入口；记录初始基线及访问范围。
- R2：运行现有测试并记录命令、退出码、通过/失败/跳过与证据缺口；对失败追踪根因，不以修复掩盖基线。
- R3：逐项核对五套 harness 的规则加载、skills、扩展/代理、权限及完成验证边界；区分公开资料、仓库契约和本机运行证据。
- R4：标明问题的优先级、适合规划/独立审查的 harness 与强模型，以及可以交给较便宜模型的有限执行任务。
- R5：创建具有文件范围、依赖、验收标准和必过检查的父子任务。
- R6：核对 AGENTS.md、CLAUDE.md、各工具规则与说明的冲突和缺失；批准后将已验证结论回写到项目说明、对应 skill 库或项目 spec，并注明适用工具。

## Acceptance Criteria

- [x] AC1（R1、R2）：`research/audit-report.md` 与 `research/test-baseline.md` 含 HEAD、工作树基线、结构、测试结果与失败根因。
- [x] AC2（R3、R4）：`research/harness-capabilities.md` 与 `docs/harnesses.md` 覆盖五工具；日期 2026-09-07；未验证项 UNVERIFIED；分工不把品牌当模型能力或价格。
- [x] AC3（R5）：父子任务互链；C1–C4 均有 PRD/design/implement 与 jsonl；四子项已各自归档。
- [x] AC4（R6）：入口对齐由 C2 回写；知识由 C4 spec/ledger 回写。规划阶段未改产品；实施在用户批准后按子项进行。未写 Basic Memory。
- [x] AC5（R1—R6）：子项定向检查与知识落点见 `research/acceptance-ledger.md`。客户端启动与新 SHA hosted 保持 UNVERIFIED。父项 `just ci` 在本规划提交之后、归档之前运行。

## Out of Scope

本轮不实施源代码改造、不安装或启动五套客户端、不调用额外付费模型验证、不迁移全局配置、不修复无关旧任务或 runtime 状态、不建立跨平台通用适配框架、不发布远程变更。

