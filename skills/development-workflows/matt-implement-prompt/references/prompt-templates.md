# Prompt Templates

以下模板用于指导 `S3` 编译步骤按 `base` 分支与仓库现状组织段落结构。**重要：所有尖括号字段（如 `<owner>`、`<base-branch>`、`<work-branch>`、`<wt-path>`）在交付前必须 100% 替换为真实侦察到的具体值，绝不允许保留未解析占位符通过校验。**

## 1. 中文模板 A — `base = dev`（`dev-merge`：隔离实施 → 拆分提交关联关单 → 直接合并回 `dev` 并清理）

```text
请在当前仓库（<owner>/<repo>）基于 `dev` 分支，按照 <isolation-choice-and-command>（依据：<isolation-reason>）开展隔离实施，使用 Matt Pocock `/implement-spec` task-graph 流程端到端落地父 Spec `#<spec-num>` 及其全部子票（<ticket-list>）。在全部验收、双轴评审、全量验证、拆分提交与工作区清零通过后，关联提交 SHA 关闭远程 Issue <ticket-list> 与 `#<spec-num>`，并将结果直接合并回本地 `dev` 分支且清理临时分支与 worktree。不要在当前回复里猜测需求细节，先按下面顺序读取仓库规则、技能指引和远程 Issue 真源后再开工。

一、任务真源、隔离方案与依赖波前（实施前必须用 gh 实读全文）
- 仓库：<owner>/<repo>
- 基线分支：`dev`（本地已有合并后直接合入目标；先探测 `git status --short --branch` 与 `git worktree list`）
- 隔离策略：<isolation-strategy-summary>（如：主工作树干净且单路推进用 `git switch -c <work-branch> dev`；若存在并行波前或主树有未提交改动，则用 `git worktree add -b <work-branch> <wt-path> dev`，禁止用 `git stash` 干扰主树）
- 父 Spec：#<spec-num>（<spec-title>）
- 子 Ticket 波前拓扑：
  1. 第一波（blocked_by=0，立即启动）：...
  2. 第二波（blocked_by=...，前置合入后并行/串行实施）：...
  3. 收口波（blocked_by=...，全部合入后执行终审收口）：...

二、必读上下文（按此顺序读取）
1. 仓库规范：<repo-rule-pointers>
2. 执行与质量技能：<skill-pointers>（含 `implement-spec`、`tdd`、`code-review` 及同仓 `git-commit` / `git-worktree` 若存在）
3. 实时读取远程 Issue 全文与依赖状态：
   - `gh issue view <spec-num> --json number,title,body,labels,comments`
   - `gh issue view <child-num> --json number,title,body,labels,comments`
   - `gh api repos/<owner>/<repo>/issues/<spec-num>/sub_issues --jq '.[] | {number,state,title}'`

三、执行、拆分提交与清零门禁
1. 按 `/implement-spec` 规范推进各波前切片，按 `/tdd` 先写测试再改实现，完成验证后合回工作分支并清理切片临时 worktree。
2. 禁止写入任何含本机系统用户名的绝对路径或敏感凭据。
3. <environment-quirks-or-prerequisites>
4. 运行项目验证门禁：<verification-commands>
5. 全部子票合入工作分支后，对相对 `dev` 的完整 diff 执行一次 `/code-review` 双轴评审，修清所有问题再复跑全量验证。
6. **拆分原子提交与清零检查**：禁止不提交或合并成一个大杂烩提交。按票据或逻辑边界拆分提交（含 `/code-review` 返修与派生文档同步），仅用本地 `git commit -F`（禁用 `Co-authored-by`/`Made-with`/`Committed via`）。在进入关单与合并前，必须运行 `git status --short --untracked-files=all` 确认返回完全为空（零未提交/未跟踪残留），并用 `git log dev..HEAD --oneline` 确认全部提交 SHA 非空。

四、关联 Commit SHA 的远程 Issue 关闭协议
- 本指令已明确授权：在对应子票验收满足、工作区已清零且拆分的本地提交完成后，逐一关闭远程子票；全部子票关闭且整套终审通过后关闭父 Spec `#<spec-num>`。
- 关单必须严格遵守三步关联协议：
  1. 先用 `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` 核实 `blocked_by == 0`；
  2. 使用 UTF-8 临时文件（注意不要把临时文件留在仓库内）执行 `gh issue comment <n> --body-file <file>`，**明确关联该票对应的真实 commit SHA（及提交主题）**、验收结果与验证命令实测输出；
  3. 再执行 `gh issue close <n>`（不得省略独立评论步骤）。
- 关闭 `#<spec-num>` 前，复核 `sub_issues` 全为 `closed`，评论汇总全部拆分提交 SHA 清单后再关闭。

五、直接合并回 `dev`、清理与禁止边界
- **合并与清理**：全部 Issue 关单完成后，切换/回到 `dev` 分支直接合并工作分支（优先 `git merge --no-ff <work-branch>` 或 `--ff-only`，**禁止 squash** 以保留各 Issue 引用的拆分提交 SHA），随后清理任务自建 worktree（`git worktree remove` + `git worktree prune`）并删除已合并临时分支（`git branch -d <work-branch>`）。
- **禁止**：默认**禁止执行 `git push`（不自动推送 `dev` 或临时分支）**、禁止未验证强删分支（`-D`），除非我在后续对话另有明确授权（已评论在 Issue 中的真实 SHA 会在后续推送 `dev` 后自动生效为可点击链接）。
- **完成后汇报**：隔离方案与清理结果、`dev` 新增拆分提交 SHA 列表、测试/CI/评审实测结果、以及全部 Issue 的关闭链接与状态。
```

## 2. 中文模板 B — `base = main | master`（`main-pr`：隔离实施 → 拆分提交 → PR 合并关联关单 → 清理并同步本地与远端）

```text
请在当前仓库（<owner>/<repo>）基于 `<main-or-master>` 分支，按照 <isolation-choice-and-command>（依据：<isolation-reason>）开展隔离实施，使用 Matt Pocock `/implement-spec` task-graph 流程端到端落地父 Spec `#<spec-num>` 及其全部子票（<ticket-list>）。在全部验收、双轴评审、全量验证、拆分提交与工作区清零通过后，推送工作分支创建 PR 合并入 `<main-or-master>`，在 PR 与 Issue 中关联提交 SHA 完成关单，清理临时分支与 worktree，并同步本地与 remote `<main-or-master>` 至最新状态。不要在当前回复里猜测需求细节，先按下面顺序读取仓库规则、技能指引和远程 Issue 真源后再开工。

一、任务真源、隔离方案与依赖波前（实施前必须用 gh 实读全文）
- 仓库：<owner>/<repo>
- 基线分支：`<main-or-master>`（受保护主干；严禁直接向 `<main-or-master>` 提交或 `git push`）
- 隔离策略：<isolation-strategy-summary>（按 `git status --short --branch`、`git worktree list` 与任务波前选用 `git switch -c <work-branch> <main-or-master>` 或 `git worktree add -b <work-branch> <wt-path> <main-or-master>`）
- 父 Spec：#<spec-num>（<spec-title>）
- 子 Ticket 波前拓扑：
  1. 第一波（blocked_by=0，立即启动）：...
  2. 第二波（blocked_by=...，前置合入后并行/串行实施）：...
  3. 收口波（blocked_by=...，全部合入后执行终审收口）：...

二、必读上下文（按此顺序读取）
1. 仓库规范：<repo-rule-pointers>
2. 执行与质量技能：<skill-pointers>（含 `implement-spec`、`tdd`、`code-review` 及同仓 `git-commit` / `git-worktree` / `gh-pr-release` 若存在）
3. 实时读取远程 Issue 全文与依赖状态：
   - `gh issue view <spec-num> --json number,title,body,labels,comments`
   - `gh issue view <child-num> --json number,title,body,labels,comments`
   - `gh api repos/<owner>/<repo>/issues/<spec-num>/sub_issues --jq '.[] | {number,state,title}'`

三、执行、拆分提交与清零门禁
1. 按 `/implement-spec` 规范推进各波前切片，按 `/tdd` 先写测试再改实现，完成验证后合回工作分支并清理切片临时 worktree。
2. 禁止写入任何含本机系统用户名的绝对路径或敏感凭据。
3. <environment-quirks-or-prerequisites>
4. 运行项目验证门禁：<verification-commands>
5. 全部子票合入工作分支后，对相对 `<main-or-master>` 的完整 diff 执行一次 `/code-review` 双轴评审，修清所有问题再复跑全量验证。
6. **拆分原子提交与清零检查**：禁止不提交或憋成单条模糊提交。按票据或逻辑边界拆分提交（含 `/code-review` 返修与派生文档同步），仅用本地 `git commit -F`（禁用 `Co-authored-by`/`Made-with`/`Committed via`）。推送与建 PR 前必须运行 `git status --short --untracked-files=all` 确认完全为空，并用 `git log <main-or-master>..HEAD --oneline` 核实全部真实提交 SHA。

四、PR 创建、关联 Commit SHA 关单与合并协议
- 本指令已明确授权：推送工作分支 `<work-branch>`，创建指向 `<main-or-master>` 的 PR，并在合并与复核通过后关闭关联 Issue。
- 操作顺序：
  1. 执行 `git push -u origin <work-branch>`；
  2. 使用 UTF-8 `--body-file` 执行 `gh pr create --base <main-or-master> --head <work-branch>`，PR 正文列出**全部拆分提交 SHA 列表**、验证结果以及全部 `Closes #<n>`；
  3. 对每张子票与父 Spec，使用 UTF-8 临时文件执行 `gh issue comment <n> --body-file <file>`，写明**对应的真实 commit SHA**、PR URL 与验证实测结果；
  4. 核验 `gh pr checks` 全部通过后，优先执行 `gh pr merge <pr-num> --merge --delete-branch`（保留逐条拆分提交 SHA；若仓库仅允许 squash，合并后将最终 squash commit SHA 补评论到关联 Issue；若受分支保护或人工审批阻塞，立即停止并汇报 PR URL，严禁使用 `--admin` 或 `--force`）；
  5. PR 合并后复核 `sub_issues` 与 `#<spec-num>` 状态，若有未自动关闭的单据，确认 `blocked_by == 0` 后补执行 `gh issue close <n>`。

五、清理、本地与远端同步校验及禁止边界
- **禁止**：**严禁直接提交或 `git push` 到 `<main-or-master>`**、严禁 `--force` 强推、严禁 `--admin` 绕过保护规则。
- **清理与同步**：清理任务自建 worktree（`git worktree remove` + `git worktree prune`）及本地残留工作分支（`git branch -d <work-branch>`）；随后执行 `git fetch origin --prune`、`git switch <main-or-master>`、`git pull --ff-only origin <main-or-master>`，并用 `git rev-parse HEAD` vs `git rev-parse origin/<main-or-master>`、`git status --short --branch`、`git worktree list` 实证本地与 remote 已同步至最新且工作区干净。
- **完成后汇报**：PR 链接与合并方式、拆分提交 SHA 列表、Issue 关闭状态、`HEAD == origin/<main-or-master>` 同步校验输出以及清理状态。
```

## 3. English Template (`dev-merge` / `main-pr` / Local `.scratch`)

For English user requests, preserve the exact same 6 sections in natural English and adapt Section 5–6 to the detected base branch (`dev` vs `main`/`master` vs custom) and tracker (`github` vs `local`):
1. Goal, Base Branch Anchor & Isolation Choice (explicitly choose new branch vs. worktree from repo cleanliness & task wavefront, with rationale and clean path rules)
2. Source-of-Truth Pointers & Frontier Wavefront (`gh issue view` / `gh api` / `gh repo view` or `.scratch/<feature>/issues/`)
3. Required Reading Order (repo rules, workflow skills, live issue fetch)
4. Execution, TDD, Environment Notes, `/code-review`, **Split Atomic Commits** (`git commit -F` without `Co-authored-by`/`Made-with`/`Committed via`), and **Clean Working Tree Gate** (`git status --short --untracked-files=all` empty + `git log <base>..HEAD --oneline` non-empty)
5. **Commit-Linked Closure Protocol**:
   - `dev-merge` (`remote-close`): check `blocked_by == 0` -> UTF-8 `gh issue comment <n> --body-file` citing concrete commit SHA(s) & test output -> `gh issue close <n>`.
   - `main-pr` (`pr-close`): push work branch -> `gh pr create --base <main|master>` listing split SHAs + `Closes #<n>` -> comment each issue citing commit SHA(s) + PR URL -> `gh pr merge --merge --delete-branch` (squash-only & branch-protection fallbacks) -> verify all issues closed.
   - `.scratch` (`no-close`): record concrete commit SHA(s) in each `.scratch/<feature>/issues/<NN>-*.md` and mark complete; never invoke `gh issue close`.
6. **Base-Branch Delivery, Cleanup, Sync & Prohibitions**:
   - `dev-merge`: merge into `dev` preserving split commits (`--no-ff`/`--ff-only`, no squash), clean up task worktrees (`git worktree remove` + `prune`) & merged branch (`git branch -d`), keep `Do NOT run git push` on `dev` unless explicitly authorized.
   - `main-pr`: explicitly state `Do NOT push directly to main/master` or use `--force`/`--admin`; clean up task worktrees & local branch; run `git fetch origin --prune`, `git switch <base>`, `git pull --ff-only origin <base>`, and verify `HEAD == origin/<base>` and clean `git status`/`git worktree list`.
   - `branch-only`: keep `Do NOT run git push`, merge to base, or open a PR unless explicitly authorized.
