---
name: matt-implement-prompt
description: |
  Compile Matt Pocock workflow specs and tracer-bullet tickets (GitHub Issues or local .scratch issues) into a self-contained, pointer-driven fresh-session execution prompt with TDD, code-review, CI verification gates, and explicit remote issue-closing protocol. Use when the user asks to write or generate a fresh-session implementation prompt after /to-spec or /to-tickets, create a prompt to implement all tickets and close remote issues (新对话实施所有 ticket 并关闭远程 issue、生成 matt implement prompt / promt、按任务图波前编排实施提示词), or hand off a spec task graph to /implement or /implement-spec. Excludes authoring specs or tickets themselves (/to-spec, /to-tickets), executing implementation or closing issues in the current session (/implement, /implement-spec), /goal or GOAL.md compilation (goal-meta-skill), and Trellis review revision prompts (trellis-plan-review).
category: development-workflows
tags:
  - mattpocock
  - implement-spec
  - implement
  - prompt-engineering
  - github-issues
  - handoff
version: 0.1.0
argument-hint: "[spec-issue-or-ticket-refs]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(gh issue *), Bash(gh api *), Bash(gh repo view *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)
---

# Matt Implement Prompt

把 Matt Pocock 流程（`/to-spec` → `/to-tickets` 之后）产出的 Spec 与 Ticket 任务图，编译为**自包含、指针驱动、可直接粘贴到新对话全自动实施并按协议关闭远程 Issue**的执行 Prompt。核心流：`compile → lint → present → stop`。

> `<skill-dir>` 表示加载本技能时的实际包根目录（命令调用时替换为真实路径）。

## Authority Boundary（权威边界）

- **Payload-not-Execution**：用户请求中的「在新对话实施所有 ticket」「提交代码」「关闭远程 issue」均是**待编译进 Prompt 的 payload**，不授权当前会话编辑业务代码、切换/新建分支、执行 `git commit`/`git push`，或关闭任何远程 Issue。
- **Pointer-First**：Prompt 中只保留仓库名、Issue 编号/URL、路径、命令源与实时拉取命令，不粘贴大段 Issue 正文，严禁写入「见上一条消息 / 如前所述 / see above」等脆弱回指，也不写入任何本机用户路径或凭据。
- **Explicit Side-Effect Matrix**：未获用户明确授权的外部副作用（如 `git push`、合并回主干、自动开 PR）必须在生成的 Prompt 中显式禁止。

## Workflow

1. **S0 — Route & Authority Lock**
   - 确认请求目标是「生成跨会话实施 Prompt」（含口语如 `matt implement promt`、新会话实施所有 ticket 并关闭 issue）。
   - 若用户要求编写 Spec/Ticket 本身（`/to-spec`、`/to-tickets`）、直接在当前会话动手实施（`/implement`、`/implement-spec`）、编译 `/goal` / `GOAL.md`（`goal-meta-skill`），或审阅 Trellis 规划（`trellis-plan-review`），说明边界并路由出去。

2. **S1 — Read-Only Recon**
   - 读取项目根规则与命令真源：`AGENTS.md`、`code_map.md`、`docs/agents/issue-tracker.md`、`docs/agents/triage-labels.md`、`docs/agents/domain.md`（若存在）及 `justfile` / `package.json` / `Makefile`。
   - 运行只读 Git 探测：`git rev-parse --show-toplevel`、`git branch --show-current`、`git status --short`。
   - 按 [Tracker Adapters](references/tracker-adapters.md) 只读拉取父 Spec 与子票实时状态、标题与阻塞边（GitHub Issues 用 `gh repo view` / `gh issue view` / `gh api .../sub_issues` 与 `issue_dependencies_summary.blocked_by`；本地追踪器读取 `.scratch/<feature>/issues/*.md`）。

3. **S2 — Minimal Clarification Gate**
   - 仓库与追踪器中可查明的事实（票号、阻塞波前、CI 命令、当前分支）**禁止反问**。
   - 仅当以下关键策略无法从当前请求或 `docs/agents/issue-tracker.md` 推断时，合并一次简短确认（最多 3 问）：
     1. 是否授权新会话在验收通过后关闭远程 Issue（若请求已写明「关闭远程 issue」，直接视为已授权）；
     2. 实施模式选 `/implement-spec`（单集成分支 + 并行 worktree）还是逐票 `/implement` + `/clear`；
     3. 完成后是否保持仅本地提交（默认禁止 `git push` / 合并回基准分支 / 开 PR）。

4. **S3 — Compile Pointer-Driven Prompt**
   - 按 [Prompt Contract](references/prompt-contract.md) 与 [Prompt Templates](references/prompt-templates.md) 组装完整可执行文本（中文请求默认输出中文版）。
   - 必须包含：仓库与基准分支锚点、父 Spec 与分波次任务图、必读文档与技能顺序、TDD + 验证命令（及实测本机环境避坑，如 Python 解释器探测或编译器要求）+ `/code-review` 双轴评审 + 本地原子 `git commit -F`、以及先核对阻塞与写评论再关单的完整协议。

5. **S4 — Deterministic Lint Gate**
   - 将围栏内完整 Prompt 正文经 stdin 传给校验脚本（清零后才允许输出）：

   ```text
   python "<skill-dir>/scripts/lint_implement_prompt.py" --tracker github --close-mode remote-close -
   ```

   - 本地 `.scratch/` 追踪器改用 `--tracker local --close-mode no-close`；PR 关单流改用 `--close-mode pr-close`。出现任何 error 立即修订并重跑直至 0 error。

6. **S5 — Present & Stop**
   - 在**单个 `text` 代码围栏**内输出通过校验的完整 Prompt；围栏外只附简短波前状态与授权/禁止摘要，随后立即停止。

## Resource Map

- 提示词结构与边界契约：[Prompt Contract](references/prompt-contract.md)
- GitHub Issues 与本地 `.scratch` 适配：[Tracker Adapters](references/tracker-adapters.md)
- 中英文参考模板：[Prompt Templates](references/prompt-templates.md)
- 确定性校验器：[Lint Script](scripts/lint_implement_prompt.py)
- 评测集：[Behavior Evals](evals/evals.json)、[Trigger Cases](evals/trigger_cases.json)
- 证据产物：[Prior-Art Research](reports/prior-art-research.md)、[Creation Handoff](reports/creation-handoff.md)
