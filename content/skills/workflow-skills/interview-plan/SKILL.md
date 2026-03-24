---
name: interview-plan
description: 通过苏格拉底式访谈细化需求，优先使用 planning-with-files 文件计划模式生成持久化实施计划，不可用时降级为原生 Plan 模式。适用于需求细化、技术方案设计等场景。
version: 3.1
argument-hint: [draft-or-requirements-path]
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion, EnterPlanMode, Skill, Write
category: workflow
tags: [interview, planning, requirements, design, architecture]
---

# 访谈式计划

通过苏格拉底式访谈将模糊需求转化为清晰的工程规格，然后直接调用平台原生 Plan 模式生成可执行的实施计划。

## 步骤

1. 若 `$ARGUMENTS` 为空，提示用户提供需求文档路径（默认查找 `plan.md`）。若文件不存在，报错退出。
2. 读取目标文件，分析核心业务目标、方案完整度、模糊/矛盾/缺失点及潜在风险。
3. 读取 `resources/BRAINSTORMING_INTEGRATION.md`，了解头脑风暴集成协议。若用户说"跳过头脑风暴"，则跳过所有新增步骤（2.5、3.5、4.5）。
   - **步骤 2.5 — 范围分解检查**：若检测到 3+ 独立子系统或需求文档超 500 行，按协议提议拆分。
4. 读取 `resources/INTERVIEW_PRINCIPLES.md`，按其提问原则进行苏格拉底式访谈。
   - **步骤 3.5 — 可视化伴侣提议**：若项目涉及 UI/前端开发，按协议提议启用浏览器可视化伴侣（参考 `resources/VISUAL_COMPANION.md` 和 `scripts/`）。
     - 仅在用户明确接受后才启动服务器。
     - 默认绑定 `127.0.0.1` / `localhost`；没有明确远程访问需求时，不要放宽监听范围。
5. 读取 `resources/INTERVIEW_DIMENSIONS.md`，按 A-G 维度框架逐项向用户提问：
   - 必须覆盖 A（工程原则审查），其余按项目类型选择性覆盖。
   - **必须使用 `AskUserQuestion` 工具**呈现每轮问题，将 2-3 个收敛性选项映射为可点击的交互式选项卡（`options`），禁止以纯文本 A/B/C 形式输出。
   - 每个 `AskUserQuestion` 调用包含 1-4 个问题（`questions`），每个问题 2-4 个选项（`options`），用户可通过 UI 直接点选。
   - 相互独立的问题应合并到同一次 `AskUserQuestion` 调用中，减少交互轮次。
   - **步骤 4.5 — 方案提议**：维度提问完成后，按 `BRAINSTORMING_INTEGRATION.md` 的方案提议协议，提出 2-3 种实现方案附权衡分析，通过 `AskUserQuestion` 让用户选择。
6. 若涉及高风险操作，读取 `resources/RISK_PROTECTION.md` 并发出告警，等待用户明确授权。
7. 访谈完成后，在内部整理访谈结论摘要（业务目标、架构决策、选定方案及被拒方案理由、技术约束、风险评估等）。
8. **计划生成（双轨模式）**：
   a. 检查系统上下文中的可用技能列表（available skills），判断 `planning-with-files` 是否存在。
   b. **若 planning-with-files 可用（优先路径）**：
      - 输出提示：`📋 检测到 planning-with-files，使用文件计划模式`
      - 先将访谈结论（来源、研究发现、关键决策）以 planning-with-files 的 notes.md 模板格式写入工作目录的 `notes.md`
      - 调用 `Skill(skill="planning-with-files:plan", args="基于访谈结论创建实施计划，访谈结论已写入 notes.md")` 生成 `task_plan.md`
      - task_plan.md 应包含：从访谈提取的业务目标(Goal)、任务分解为带 checkbox 的阶段(Phases)、访谈中回答的关键问题(Key Questions)、架构决策及理由(Decisions Made)、风险项(Errors Encountered 预填风险)、当前状态(Status)
      - 计划生成完成后，告知用户计划文件位置，流程结束
   c. **若 planning-with-files 不可用（降级路径）**：
      - 输出提示：`📋 planning-with-files 不可用，使用平台原生 Plan 模式`
      - 调用 `EnterPlanMode` 进入原生 Plan 模式
      - 在计划文件中写入访谈结论与实施计划（任务分解、依赖关系、验收标准、风险缓解）
9. 仅降级路径：用户审批计划后，调用 `ExitPlanMode` 进入执行阶段。

## 跳过头脑风暴

用户在访谈任意阶段说出"跳过头脑风暴"或"skip brainstorming"，将跳过步骤 2.5（范围分解）、3.5（可视化伴侣）和 4.5（方案提议），回退到原始访谈流程。

## 技术约束

- 路径使用双引号包裹，正斜杠 `/` 分隔
- 优先使用 `rg` 替代 `grep`
- **禁止自动执行** `commit`、`push` 等 Git 写操作
- 遵循 Read-before-Write 原则
- **不生成独立的 spec.md 文件**，规格内容融入 `task_plan.md`（文件模式）或原生 Plan（降级模式）
- planning-with-files 模式下，`task_plan.md` 和 `notes.md` 创建在工作目录根路径，不创建子目录
