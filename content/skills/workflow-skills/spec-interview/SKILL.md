---
name: spec-interview
description: 通过系统性访谈完善技术规格文档并生成 spec.md，引导调用平台 Plan 模式落地。适用于需求细化、技术方案设计等场景。
version: 2.0
argument-hint: [plan-or-spec-draft-path]
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
category: workflow
tags: [spec, interview, planning, requirements, design, architecture]
---

# 规格访谈

通过苏格拉底式访谈将草稿规格说明转化为完整、可执行的 `spec.md`，然后引导调用平台原生 Plan 模式落地。

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
6. 访谈完成后，读取 `resources/SPEC_TEMPLATE.md`，按模板汇总生成 `spec.md`（或更新原文件）。
7. 读取 `resources/PLAN_MODE_GUIDE.md`，引导用户启动对应 AI 工具的 Plan 模式执行开发。

## 技术约束

- 路径使用双引号包裹，正斜杠 `/` 分隔
- 优先使用 `rg` 替代 `grep`
- **禁止自动执行** `commit`、`push` 等 Git 写操作
- 遵循 Read-before-Write 原则
