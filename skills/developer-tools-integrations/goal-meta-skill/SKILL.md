---
name: goal-meta-skill
description: |
  Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code. Use for Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, goal 持久化/保存/落盘, fresh-Agent or 跨会话交接, plan-to-goal interviews, bounded agent work definitions, Trellis 任务实施, 子任务实施, commit-then-archive cadence, or 终稿展示. Do not use for ordinary one-line work, pure exploration, memory-vault creation, or active-goal management that only needs a platform command.
version: 0.6.0
category: developer-tools-integrations
tags:
  - codex
  - claude-code
  - grok
  - kimi-code
  - goal
  - prompt-engineering
  - agent-skills
  - verification
argument-hint: "[vague-task-or-goal]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)
metadata:
  owner: lyh
  review_cadence: quarterly-or-on-platform-goal-or-trellis-dispatch-change
---

# Goal Meta Skill

把模糊任务收敛成目标平台可持续执行、可验证、知道何时完成和何时停下的 `/goal`。当用户明确要求保存、持久化或交接时，还可以在最终确认后把同一份批准合同安全写入项目根目录 `GOAL.md`。

> `<skill-dir>` 是 skill 加载时提供的实际目录，不是环境变量。命令中替换为字面路径；脚本会自定位。

## Governed mode

- 普通 Goal 默认只在聊天中输出，不写文件。
- `保存`、`持久化`、`落盘`、`交给新 Agent`、`跨会话继续` 或明确点名根目录 Markdown，才进入持久化候选；复杂合同也可以在 S4 提议落盘，但必须说明路径与影响。
- `直接给` 只跳过访谈，不自动授权写文件；`直接生成并保存到项目根目录 GOAL.md` 才同时授权该次 create 动作。
- S1 始终只读。只有 S6 对已经展示并确认的合同调用命名 helper；不得用任意 Python/Write 命令绕过 helper。
- 默认 create-only。已有文件时报告冲突；替换必须再次明确确认，并带已读取旧文件的 SHA-256。
- 不自动加载、执行、提交、忽略、删除或发布 `GOAL.md`，也不把它导入 `AGENTS.md`、`CLAUDE.md`、`.grok/rules` 或 `.omp` 上下文文件。
- 合同不得包含凭证、私有数据或原始会话转录；秘密扫描只是 backstop，不是“无敏感信息”证明。
- 真实新会话接力没有 provider transcript 时保持 `UNVERIFIED`。

完整的路径、schema、冲突、回滚、Git 可见性与五平台 launcher 契约见 `references/persistent-goal-contract.md`。

## Platform selection

平台事实只以 `references/platform-goal-facts.md` 为准：

1. 用户显式名称优先。`OMP` 在无相反说明时表示 Oh My Pi。
2. 否则使用当前 host 的明确证据。
3. 仍不明确时，在现有 `可选调整` 中加入一个平台选择；不要混合生命周期命令。

目标平台支持 `codex`、`claude`、`grok`、`omp`、`kimi`。只有用户明确要求多平台交接时才生成多个 launcher；合同正文始终只有一份。

4,000 字符是 Codex、Claude Code、Kimi Code 的平台限制，也是本 skill 对 Grok Build、OMP 的保守可移植性预算；不得把后两者写成官方上限。

## Workflow

1. **S0 — Route.** 区分新 Goal、持久化/交接请求与现有 Goal 管理。纯发散方向先建议规划；翻译、单行输出、规则审计等近邻任务走其直接工作流。
2. **S1 — Reconnoiter.** 现有项目先读取局部规则、真实命令源与相关边界，并运行 `git rev-parse --show-toplevel`、`git branch --show-current`、`git status --porcelain -uall`。不运行测试、不写文件、不读 secrets/dependencies/generated output。持久化时还要检查根目录和现有 `GOAL.md`。
3. **S2 — Choose.** 需求具体或用户说 `直接给` / `按默认` 时走 fast path；只有结果、验证、边界或风险容忍存在实质缺口时才访谈。
4. **S3 — Interview.** 每轮复述结果和侦察发现，只问最多四个必须由人决定的问题。遵循 `references/interview-checklist.md`。
5. **S4/S5 — Draft/revise.** 给出完整、无占位符的目标合同与平台渲染。持久化候选必须展示精确根目录、文件名、create/replace 效果、Git 可见性影响和仍需确认的动作；此时仍不写。
6. **S6 — Deliver or persist.** 普通模式输出最终 `/goal` 与字段一览。持久化模式仅在相关确认后，用下面的 helper 从 stdin 写入已批准正文，回读摘要，再输出选定平台的短 launcher。

```text
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>"
```

替换只允许：

```text
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>" --replace --expected-sha256 "<observed-sha256>"
```

在 Windows 可将 `python` 换成 `py -3`。合同正文通过 stdin 传入，不能放入 argv，也不能用 PowerShell `>` 直接写目标文件。成功只报告相对路径、字节数、SHA-256、created/replaced 与 tracked/ignored/untracked；失败不得破坏旧文件。

7. **Validate.** 聊天型输出运行：

```text
python "<skill-dir>/scripts/lint_goal_command.py" --platform codex <file>
```

持久合同额外运行 `--contract --expected-path GOAL.md`。平台枚举为 `codex|claude|grok|omp|kimi|both|all`；`both` 保持 Codex+Claude 旧语义。

## Output contract

普通 S4 中文输出顺序：`推荐执行版（中文，可直接复制）`、`默认选择理由`、`可选调整`、`你可以直接回复`、`Goal Draft (English-compatible)`。每个 `/goal` 放在无内空行的 `text` fence。用户确认后的 S6 改为一个 `最终可复制 /goal` fence，外加 `字段一览`；英文用户默认只给英文。

每个 Goal 都包含：可观察目标、具体验证、不可变约束、写入边界、证据驱动的有限迭代、合取式完成条件、平台正确的暂停/停止条件。权威检查、文件、报告或验收条款必须界定 `all/全部` 的集合。

持久化输出使用 `references/persistent-goal-contract.md` 的固定 11 节 schema。文件正文是权威交接合同，短命令只负责显式读取、复述关键门并开始执行；不得声称开启 Goal 模式会自动发现 `GOAL.md`。

推荐 launcher 形状：

```text
Codex/Grok/OMP/Kimi: /goal First read and follow ./GOAL.md as the approved execution contract. ...
Claude Code: /goal @GOAL.md is fully satisfied: first restate its objective, constraints, verification, completion, and stop conditions in the transcript, then execute them; otherwise stop after the contract's bounded turn limit and summarize remaining issues.
```

Grok/OMP/Kimi 的 `/goal @GOAL.md` 组合在真实 fresh-session 证据前不作为推荐。只输出用户选中的平台命令。

## Management and stop semantics

- Codex：view/edit/pause/resume/clear。
- Claude Code：view/clear；没有 pause/resume/edit，使用停止并报告和 bounded turn/time clause，证据必须进入 transcript。
- Grok Build：status/pause/resume/clear；只有用户明确要求时才加 `--budget`，完成候选要经独立证据复核。
- Oh My Pi：set/show/pause/resume/drop/budget；要求 `goal.enabled`，与 plan/vibe 模式互斥，预算耗尽不等于完成。
- Kimi Code：status/pause/resume/cancel/replace/next；状态为 active/paused/blocked/complete，headless 只创建并区分退出码。

管理请求只回答最小正确命令，不另写新目标。平台命令、版本、权限与证据级别见唯一事实表 `references/platform-goal-facts.md`。

## Trellis adapter

只有 outcome 明确是 Trellis task/child implementation 时才加载 `references/trellis-goal-cadence.md`。持久合同时必须链接具体 `prd.md`、`design.md`、`implement.md`，并保留“先提交该任务产品改动，再 archive；父任务等发布门”的节奏。派发组平台的实施 `/goal` 还要求先读目标项目 `.trellis/workflow.md` Phase 2.1 / 2.2，代码实施派发 `trellis-implement`、验证派发 `trellis-check`，主会话不直接改产品文件；内联组或 `codex.dispatch_mode: inline` 不注入派发，改用该项目内联形状。`GOAL.md` 不能取代任务文档，skill 本身也不执行目标内的 commit/archive。

## Quality bar

拒绝或修订以下输出：无验证；范围覆盖整机/整库；无限重试；主观“看起来不错”作为完成证据；未解析占位符；跨平台借用 `clear/drop/cancel/replace/next/budget`；Claude 使用 pause/resume；Trellis 节奏误注入普通任务；Trellis 实施缺派发条款（目标平台在派发组时）；对内联模式平台注入派发条款；未授权写入或静默覆盖；任何自动加载、自动 commit/push/ignore/delete 声明。

## Resources

- `references/persistent-goal-contract.md`：持久化触发、schema、写入/冲突/回滚、Git 可见性、五平台 launcher。
- `references/platform-goal-facts.md`：五平台 `/goal` 行为、管理命令、限制、权限、文件引用与 dated primary sources 的唯一事实源。
- `references/goal-command-playbook.md`：普通/持久目标模板、验证锚点与示例。
- `references/default-goal-strategy.md`：默认路径、侦察、风险、长合同与 S6 输出。
- `references/trellis-goal-cadence.md`：可选 Trellis commit-then-archive 与子代理派发 adapter。
- `references/interview-checklist.md`：有限访谈题库。
- `evals/evals.json`：行为与路由 fixtures；CI 不执行，需人工审阅。
- `scripts/lint_goal_command.py`：inline/contract linter 与平台命令隔离。
- `scripts/persist_goal_contract.py`：唯一授权的确定性合同写入器。
- `reports/creation-handoff.md`：Qiaomu 参考取舍、验证证据与缺失项。

## 来源致谢

这个 skill 基于向阳乔木发布的 goal meta skill 改造而来，保留原始收敛工作流并扩展为项目侦察、平台渲染与受控持久化。MIT。

Original work copyright (c) 向阳乔木

X: https://x.com/vista8

GitHub: https://github.com/joeseesun/
