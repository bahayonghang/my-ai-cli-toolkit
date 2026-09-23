# 明确 goal-meta-skill 的 Goal 模式触发条件

## Goal

让 `goal-meta-skill` 仅在用户明确要求使用 Goal 模式，或编写、保存、管理 Goal 时触发。用户可以用自然语言表达该意图，不必写出 `/goal` 字面量。

## Background

- 用户明确决定以“要使用 Goal 模式”等正向意图定义触发条件。
- 用户截图中，Claude Code 收到“基于 dev 分支重构 lib，先根据需求和仓库内容创建下个对话实施用 Prompt，暂不实施”的请求后加载了 `goal-meta-skill`。该请求没有表达 Goal 模式意图。截图记录了一次误触；具体触发原因未查明。
- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md:4` 的 `description` 以复杂 Agent 任务开头，并列出 `fresh-Agent or 跨会话交接`、`Trellis 任务实施` 等场景。当前表述没有把 Goal 模式意图设为共同前提。
- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md:42` 的 S0 在 skill 加载后才执行；`reports/skill-ir.json` 复用了当前描述。

## Requirements

- R1：`description` 以用户明确要求使用 Goal 模式为主触发条件，涵盖编写 `/goal` 命令或 Goal 指令、为 Goal 模式保存 `GOAL.md` 合同，以及管理现有 Goal。
- R2：允许“用 Goal 模式完成这项工作”“写成 Codex 目标指令”等自然语言表达；不要求用户必须写 `/goal` 字面量。
- R3：跨会话交接、Trellis 实施和审阅修复属于 Goal 模式触发后的任务场景；S0 路由与 frontmatter 使用同一正向条件。
- R4：`evals/evals.json` 增加不同措辞的 Goal 模式正向用例，并用截图请求作边界回归；同步 Skill IR 和公开目录内容。

## Acceptance Criteria

- A1：`description` 首先说明 Goal 模式意图条件；其支持场景均从属于该条件。S0 和 Skill IR 表达相同的触发规则。
- A2：用 Goal 模式、写 `/goal`、编写 Goal 指令、保存 Goal 合同、管理现有 Goal 的正向用例覆盖不同自然措辞。
- A3：截图中的重构交接 Prompt 作为边界回归用例记录；预期不加载 `goal-meta-skill`。同一任务明确要求 Goal 模式时，预期加载该 skill。
- A4：新增用例符合本仓库 `evals/evals.json` 格式；`just skills-check`、`just docs-check` 和最终 `just ci` 通过。若没有真实 Claude Code 触发复测，将该项标记为 `missing evidence`，不声称提供商选择行为已验证。

## Out of Scope

- 不创建截图中 lib 的重构分支，不编写该 lib 的设计 Prompt，也不实施其重构。
- 不重写 Goal 合同格式、持久化权限或五个平台的渲染逻辑。
