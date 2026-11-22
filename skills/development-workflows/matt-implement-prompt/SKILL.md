---
name: matt-implement-prompt
description: |
  Compile Matt Pocock workflow specs and tracer-bullet tickets (GitHub Issues or local .scratch issues) into a self-contained, pointer-driven fresh-session execution prompt with branch-or-worktree isolation, TDD, code-review, CI verification gates, split atomic commits, base-branch-aware delivery (dev direct merge vs main/master PR merge & sync), and commit-linked remote issue-closing protocol. Use when the user asks to write or generate a fresh-session implementation prompt after /to-spec or /to-tickets, create a prompt to implement all tickets and close remote issues (新对话实施所有 ticket 并关闭远程 issue、生成 matt implement prompt / promt、按任务图波前编排实施提示词), or hand off a spec task graph to /implement or /implement-spec. Excludes authoring specs or tickets themselves (/to-spec, /to-tickets), executing implementation or closing issues in the current session (/implement, /implement-spec), /goal or GOAL.md compilation (goal-meta-skill), and Trellis review revision prompts (trellis-plan-review).
category: development-workflows
tags:
  - mattpocock
  - implement-spec
  - implement
  - prompt-engineering
  - github-issues
  - handoff
version: 0.2.0
argument-hint: "[spec-issue-or-ticket-refs]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(gh issue *), Bash(gh api *), Bash(gh repo view *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *), Bash(git worktree list*), Bash(git remote -v*)
---

# Matt Implement Prompt

将 Matt Pocock 流程（`/to-spec` → `/to-tickets` 之后）产出的 Spec 与 Ticket 任务图，编译为**自包含、指针驱动、新会话全自动实施、拆分提交并关联关单、按 `base` 分支完成合并/PR 与清理同步**的 Prompt。核心流：`compile → lint → present → stop`。

> `<skill-dir>` 表示加载本技能时的实际包根目录（调用时替换为真实路径）。

## Authority Boundary（权威边界）

- **Payload-not-Execution**：请求中的「实施 ticket」「拆分提交」「开 PR/合并」「关单」均是待编译进 Prompt 的 payload，当前会话**严禁**改业务代码、建/切分支或 worktree、执行 `git commit`/`merge`/`push`、开 PR 或关单。
- **Pointer-First**：只写仓库名、Issue 编号/URL、路径、命令源与实时拉取命令；不贴大段正文，禁用「见上一条消息 / 如前所述 / see above」等回指，禁写个人绝对路径或凭据。
- **Base-Branch-Aware Side-Effect Matrix**：
  - `base == dev`（`dev-merge`）：新建分支或 worktree → 拆分提交并清零工作区 → 评论关联 commit SHA 后关单 → 直接合并回本地 `dev`（保留拆分提交）并清理分支/worktree；默认禁止自动 `git push origin dev`。
  - `base == main | master`（`main-pr`）：**禁**直推或直接提交 `main`/`master`、禁 `--force`/`--admin`；授权推送工作分支建 PR 并合并（优先 `--merge --delete-branch`）、关单关联 SHA、清理分支/worktree 并同步本地与 remote 至最新。
  - 其他基准分支（`branch-only`）：保守回退，强制隔离、拆分提交与关联关单，默认禁止 `git push`/合并/开 PR。

## Workflow

1. **S0 — Route & Authority Lock**
   - 确认请求为「生成跨会话实施 Prompt」（含 `matt implement promt`）。编写 Spec/Ticket（`/to-spec`、`/to-tickets`）、当前会话实施（`/implement`、`/implement-spec`）、`/goal`/`GOAL.md`（`goal-meta-skill`）或 Trellis 评审（`trellis-plan-review`）须路由出去。

2. **S1 — Read-Only Recon**
   - 读仓库规则与命令源：`AGENTS.md`、`code_map.md`、`docs/agents/{issue-tracker,triage-labels,domain}.md`（存在时）及 `justfile` / `package.json` / `Makefile`。
   - 只读 Git 探测：`git rev-parse --show-toplevel`、`git branch --show-current`、`git status --short --branch`、`git worktree list`、`git remote -v`。
   - 按 [Tracker Adapters](references/tracker-adapters.md) 只读拉取父 Spec 与子票状态及阻塞边（GitHub 用 `gh repo view --json nameWithOwner,defaultBranchRef,isFork,parent` / `gh issue view` / `gh api .../sub_issues`；本地读 `.scratch/<feature>/issues/*.md`）。

3. **S2 — Minimal Clarification Gate**
   - 可查明的仓库/追踪器事实（票号、波前、CI、分支、工作树与 worktree）**禁止反问**。
   - **自动推导**：`base` 映射交付模式（`dev` → `dev-merge`，`main`/`master` → `main-pr`，其他 → `branch-only`）；按工作树与波前选新建分支或 worktree（主树有改动、需并行或留主树对照时选 worktree；干净树且单票/串行选分支）。
   - 仅当真未定项无法推断时合并确认（≤3 问）：(1) 关单授权（请求已提则视同授权）；(2) `/implement-spec` vs 逐票 `/implement`；(3) `dev` 合并后是否授权 `git push`，或自定义基准分支合入/PR 偏好。

4. **S3 — Compile Pointer-Driven Prompt**
   - 按 [Prompt Contract](references/prompt-contract.md) 与 [Prompt Templates](references/prompt-templates.md) 组装（中文请求输出中文）。
   - 必含五大要求：(a) 新建分支或 worktree 及依据；(b) `/tdd` + 环境避坑 + `/code-review` + 拆分原子提交（含返修与同步文档，本地 `git commit -F` / 同仓 `git-commit`）；(c) 关单/合并/PR 前核验 `git status --short --untracked-files=all` 为空且 `git log <base>..HEAD` 非空；(d) 关单前评论关联真实 commit SHA；(e) 按 `base` 执行合并/PR、清理与同步。

5. **S4 — Deterministic Lint Gate**
   - 将完整正文经 stdin 传给校验脚本并传 `--base-branch <base>`，0 error 才可输出：

   ```text
   python "<skill-dir>/scripts/lint_implement_prompt.py" --tracker github --base-branch dev --close-mode remote-close -
   python "<skill-dir>/scripts/lint_implement_prompt.py" --tracker github --base-branch main --close-mode pr-close -
   ```

   - 本地 `.scratch/` 改用 `--tracker local --base-branch <base> --close-mode no-close`；其他分支按需传 `--base-branch <base>`。

6. **S5 — Present & Stop**
   - 在**单个 `text` 代码围栏**内输出 Prompt；围栏外附简短摘要（基准分支、隔离方式分支/worktree、交付模式、波前与授权/禁止边界）后立即停止。

## Resource Map

- 提示词结构与边界契约：[Prompt Contract](references/prompt-contract.md)
- GitHub Issues 与本地 `.scratch` 适配：[Tracker Adapters](references/tracker-adapters.md)
- 中英文参考模板：[Prompt Templates](references/prompt-templates.md)
- 确定性校验器：[Lint Script](scripts/lint_implement_prompt.py)
- 评测集：[Behavior Evals](evals/evals.json)、[Trigger Cases](evals/trigger_cases.json)
- 证据产物：[Prior-Art Research](reports/prior-art-research.md)、[Creation Handoff](reports/creation-handoff.md)
