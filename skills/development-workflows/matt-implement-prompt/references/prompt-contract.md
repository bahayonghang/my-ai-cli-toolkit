# Prompt Contract

所有由 `matt-implement-prompt` 编译的新会话实施 Prompt 必须严格满足以下六节结构、分支与提交门禁、关联关单协议及强制负向约束。

## 1. 六节结构契约

1. **任务目标、基准分支锚点与分支/Worktree 隔离决策**
   - 明确目标仓库（`<owner>/<repo>` 或项目名，禁止写本机系统用户绝对路径）、基线分支（如 `dev`、`main`、`master` 或自定义分支），并写出**明确推荐的工作区隔离方案与判断依据**：
     - **新建分支**（`git switch -c <work-branch> <base>`）：当前主工作树干净、任务为单票或串行少量票、无需并发改动同一仓库。
     - **新建 Worktree**（`git worktree add -b <work-branch> <wt-path> <base>`）：满足任一条件即优先选用——① 主工作树存在未提交/未跟踪改动（**严禁使用 `git stash` 干扰用户现场**）；② 任务图存在多票并行波前（`/implement-spec` 并行切片）；③ 需要保留主工作树停留在 `<base>` 以便对照或最终合入。
     - **Worktree 路径卫生**：若项目启用了受 `.gitignore` 覆盖的约定目录（如 `.claude/worktrees/` 或 `.worktrees/`，可配合仓库 `git-worktree` 规范检查），优先放在该目录或仓库外相邻兄弟路径；严禁在已有 worktree 内嵌套创建 worktree，严禁硬编码含系统用户名的个人绝对路径。
   - 明确指出：**先按真源指针实时读取文档与 Issue，不在首回合凭记忆或本 Prompt 猜测需求细节**。

2. **真源指针与依赖波前（Task Graph）**
   - 列出父 Spec 编号/路径及全部子 Ticket 的波次拓扑（Wave 1 无阻塞 → Wave 2 并行集合 → 终审收口票），写清每张票的真实 `blocked_by` 依赖。
   - 对 GitHub Issues 给出精确 `gh issue view <n> --json number,title,body,labels,comments`、`gh api repos/<owner>/<repo>/issues/<spec>/sub_issues` 及远端/默认分支探测（`git remote -v`、`gh repo view --json nameWithOwner,defaultBranchRef,isFork,parent`）；对本地追踪器给出 `.scratch/<feature>/issues/` 目录及文件顺序。
   - **严禁把整篇 Issue 正文或源码片段复制粘贴进 Prompt**。

3. **必读顺序**
   - 按「仓库规则（`AGENTS.md`、`code_map.md`、`docs/agents/*`） → 流程技能（若仓库或运行环境可用：`implement-spec`、`implement`、`tdd`、`code-review`、`git-commit`、`git-worktree`、`gh-pr-release`；不可用时遵循对应通用工程契约） → 实时拉取 Issue 真源」列出明确读取顺序，且只引用当前仓库实测存在的路径。

4. **执行、拆分提交与工作区清零门禁**
   - **波前与隔离**：独立可并行的子票使用独立 worktree/上下文窗口实施并合入工作/集成分支；有依赖的子票必须在前置依赖合入并关单后再启动。
   - **测试驱动与实测门禁**：按 TDD 先写测试与正反例夹具；列出项目真实存在的构建/测试/CI 命令（如 `just ci`、`npm test`、`pytest`），并写明当前会话已观测到的环境前提或避坑方法（例如本机 Python 解释器探测）。
   - **整支评审**：所有子票合入工作分支后，针对相对 `<base>` 的完整 diff 跑一次 `/code-review`（Standards + Spec 双轴评审），修完再复跑全量测试。
   - **拆分原子提交（硬要求）**：禁止把整批 tickets 与收口修改憋到最后不提交或糊成单个大杂烩提交。必须按票据或逻辑边界**拆分提交**（含 `/code-review` 返修与 `just docs-sync` 等派生产物，优先遵循仓库 `git-commit` 规范）；只允许本地 `git commit -F <msg-file>`，严禁 `Co-authored-by`、`Made-with`、`Committed via`。
   - **工作区清零门禁（硬要求）**：在任何关单、合并或开 PR 之前，必须运行 `git status --short --untracked-files=all` 确认返回**完全为空**（零未提交/未跟踪残留，临时注释文件不得留入仓库），并运行 `git log <base>..HEAD --oneline` 核实真实提交 SHA 非空。

5. **关联 Commit SHA 的 Issue 关闭协议**
   - 所有模式必须在**工作区清零门禁通过**且获取到真实 commit SHA 后才能进入关单/完结步骤：
     - **`remote-close`（如 `dev-merge` / `branch-only`）**：确认 `blocked_by == 0` → 使用 UTF-8 临时文件执行 `gh issue comment <n> --body-file <file>`，**必须列明该票对应的真实 commit SHA（与提交主题）及验证命令实测结果** → 再执行 `gh issue close <n>`（不在已关闭单据上用 `close --comment`）。关闭父 Spec 前必须复核全部 `sub_issues` 为 `closed`，并评论汇总全部拆分提交 SHA 清单。
     - **`pr-close`（`main-pr`）**：PR 正文中逐条列出全部拆分提交 SHA 与 `Closes #<n>`；同时在各 Issue 中通过 UTF-8 `gh issue comment <n> --body-file <file>` 评论关联其真实 commit SHA + PR 链接 + 验证证据；PR 合并后复核所有子票与父 Spec 均进入 `closed`（若平台未自动关闭或仓库为 squash-only，先补充记录最终 squash commit SHA 与 PR 链接评论，再执行两步 `gh issue close`）。
     - **`no-close`（本地 `.scratch`）**：将对应 commit SHA(s) 写入各 `.scratch/<feature>/issues/<NN>-*.md` 票据文件并勾选验收条目，严禁调用 `gh issue close`。

6. **基于 `base` 分支的收尾交付、清理同步与禁止边界**
   - **`dev-merge`（`base == dev`）**：
     - 在本地将工作/集成分支直接合并回 `dev`（优先 `git merge --no-ff` 或 `--ff-only` **保留拆分提交历史**，避免 squash 抹掉 Issue 评论里引用的逐条 SHA）。
     - 清理任务自建 worktree（`git worktree remove` + `git worktree prune`）与已合并临时分支（`git branch -d`，严禁未经核验使用 `-D`）。
     - 默认保持**不自动 `git push origin dev`**（除非用户当次明确授权），并在 Prompt 中注明：Issue 评论已写明真实 commit SHA，后续推送 `dev` 到远端后 GitHub 上会自动关联为可点击提交。
   - **`main-pr`（`base == main | master`）**：
     - **显式禁止**：严禁直接提交或 `git push` 到 `main`/`master`、严禁 `--force` 强推、严禁 `--admin` 绕过分支保护。
     - **显式授权执行链**：① `git push -u origin <work-branch>`；② `gh pr create --base <main|master> --head <work-branch>`（含拆分提交 SHA、`Closes #<n>` 与测试实测）；③ 核验 `gh pr checks` 通过后执行 `gh pr merge <pr> --merge --delete-branch`（若仓库仅允许 squash，合并后将最终 squash SHA 补评论到关联 Issue；若受分支保护或人工审批阻塞，立即停止并汇报 PR URL 与阻塞原因，禁止强行绕过）；④ 清理任务自建 worktree（`git worktree remove` + `git worktree prune`）与本地临时分支（`git branch -d <work-branch>`）；⑤ **本地与远端同步校验**：执行 `git fetch origin --prune` → `git switch <main|master>` → `git pull --ff-only origin <main|master>`，并用 `git rev-parse HEAD` vs `git rev-parse origin/<main|master>`、`git status --short --branch` 与 `git worktree list` 实证本地与 remote 完全一致且工作区干净。
   - **`branch-only`（其他自定义基准分支）**：保留默认禁止 `git push`、合并回基准分支与自动开 PR 边界（除非用户在 S2 明确授权），同时仍强制完成拆分提交、工作区清零与关联 SHA 关单。
   - **收尾回报要素**：隔离方案与分支/worktree 状态、拆分提交 SHA 列表、测试/CI/评审实测结果、全部 Issue/PR 状态与链接、清理结果，以及 `main-pr` 下的 `HEAD == origin/<base>` 同步证据。

## 2. 强制负向约束

- **零未解析占位符**：不得残留 `{{...}}`、`TODO`、`TBD`、`FIXME` 或未替换的 `<issue-number>` 等尖括号占位符。
- **零脆弱回指**：严禁出现「见上一条消息」「见上方」「如前所述」「see above」「see the previous message」等依赖当前对话历史的表述；新会话拿到的是一份完全独立的上下文。
- **零个人隐私路径**：禁止写入 `C:\Users\<name>\...`、`/Users/<name>/...` 或 `/home/<name>/...`。
