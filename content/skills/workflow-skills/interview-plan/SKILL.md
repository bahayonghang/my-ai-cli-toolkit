---
name: interview-plan
description: 通过苏格拉底式访谈细化需求，直接调用原生 Plan 模式生成可执行计划。适用于需求细化、技术方案设计等场景。
version: 3.0
argument-hint: [draft-or-requirements-path]
allowed-tools: Read, Glob, Grep, AskUserQuestion, EnterPlanMode
category: workflow
tags: [interview, planning, requirements, design, architecture]
---

# 访谈式计划

通过苏格拉底式访谈将模糊需求转化为清晰的工程规格，然后直接调用平台原生 Plan 模式生成可执行的实施计划。

## 步骤

1. 若 `$ARGUMENTS` 为空，提示用户提供需求文档路径（默认查找 `plan.md`）。若文件不存在，报错退出。
2. 读取目标文件，分析核心业务目标、方案完整度、模糊/矛盾/缺失点及潜在风险。
3. 读取 `resources/INTERVIEW_PRINCIPLES.md`，按其提问原则进行苏格拉底式访谈。
4. 读取 `resources/INTERVIEW_DIMENSIONS.md`，按 A-G 维度框架逐项向用户提问：
   - 必须覆盖 A（工程原则审查），其余按项目类型选择性覆盖。
   - **必须使用 `AskUserQuestion` 工具**呈现每轮问题，将 2-3 个收敛性选项映射为可点击的交互式选项卡（`options`），禁止以纯文本 A/B/C 形式输出。
   - 每个 `AskUserQuestion` 调用包含 1-4 个问题（`questions`），每个问题 2-4 个选项（`options`），用户可通过 UI 直接点选。
   - 相互独立的问题应合并到同一次 `AskUserQuestion` 调用中，减少交互轮次。
5. 若涉及高风险操作，读取 `resources/RISK_PROTECTION.md` 并发出告警，等待用户明确授权。
6. 访谈完成后，在内部整理访谈结论摘要（业务目标、架构决策、技术约束、风险评估等）。
7. **直接调用 `EnterPlanMode` 进入原生 Plan 模式**，在计划文件中写入访谈结论与实施计划：
   - 任务分解与优先级排序
   - 依赖关系与执行顺序
   - 每个任务的验收标准
   - 风险缓解措施
8. 用户审批计划后，调用 `ExitPlanMode` 进入执行阶段。

## 技术约束

- 路径使用双引号包裹，正斜杠 `/` 分隔
- 优先使用 `rg` 替代 `grep`
- **禁止自动执行** `commit`、`push` 等 Git 写操作
- 遵循 Read-before-Write 原则
- **不生成独立的 spec.md 文件**，所有规格内容直接融入原生 Plan
