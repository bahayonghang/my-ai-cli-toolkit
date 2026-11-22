# Tracker Adapters

在 `S1 只读侦察` 阶段按项目配置与基准分支选择对应追踪器适配器与交付协议，并在编译出的 Prompt 中嵌入匹配的操作、提交关联与关单步骤。

## 1. GitHub Issues 适配器（`--tracker github`）

适用依据：仓库存在 `docs/agents/issue-tracker.md` 并指定 GitHub Issues，或用户提供了 GitHub Issue 编号/URL。

### S1 只读侦察命令

```powershell
# 1. 核实目标仓库与默认分支（防止 fork 误查上游）
gh repo view --json nameWithOwner,defaultBranchRef,isFork,parent

# 2. 侦察本地分支、工作树与远端状态（用于决定新建分支 vs worktree 与交付模式）
git status --short --branch
git worktree list
git remote -v

# 3. 读取父 Spec 或入口 Issue
gh issue view <spec-num> --json number,title,body,labels,state,url

# 4. 列出所有原生 sub-issues 与实时阻塞数
gh api "repos/<owner>/<repo>/issues/<spec-num>/sub_issues" --jq '.[] | {number, state, title}'
gh api "repos/<owner>/<repo>/issues/<child-num>" --jq '.issue_dependencies_summary.blocked_by'
```

> 若仓库尚未启用 GitHub sub-issues 或 native issue dependencies，则改用 `gh issue list` 匹配 `Part of #<spec>` / `Blocked by:` 正文声明来推导波前。

### 嵌入 Prompt 的远程直接关单协议（`--close-mode remote-close`，适用于 `dev-merge` / `branch-only`）

必须在生成的 Prompt 中写入：
1. **工作区清零与提交核验**：执行 `git status --short --untracked-files=all` 确认无未提交/未跟踪残留，并执行 `git log <base>..HEAD --oneline` 取得真实拆分提交 SHA（禁止以未提交状态关单）；
2. **依赖核实**：关闭子票前核实 `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` 为 `0` 且该切片已拆分提交并验收通过；
3. **关联提交评论**：先用 UTF-8 文件执行 `gh issue comment <n> --body-file <file>` 写明完成摘要、**关联的真实 commit SHA 与提交主题**、以及验证命令实测结果（Windows PowerShell 严禁省略 `--body-file` 直接传中文命令行参数以防乱码）；
4. **关单与父 Spec 复核**：再执行 `gh issue close <n>`；关闭父 Spec 前复核 `gh api repos/<owner>/<repo>/issues/<spec>/sub_issues` 中全部子票均为 `closed`，评论汇总**全部拆分提交 SHA 清单**与验收结果后再执行 `gh issue close <spec>`。

### 嵌入 Prompt 的 PR 关联关单协议（`--close-mode pr-close`，适用于 `main-pr`）

必须在生成的 Prompt 中写入：
1. **工作区清零与推送**：确认 `git status --short --untracked-files=all` 为空且 `git log <base>..HEAD --oneline` 含全部拆分提交，执行 `git push -u origin <work-branch>`（严禁直推 `main`/`master`）；
2. **创建 PR 与关联**：执行 `gh pr create --base <main|master> --head <work-branch>`，PR 正文必须列出**全部拆分提交 SHA 列表**、验证结果及全部 `Closes #<n>`；
3. **逐票评论关联 Commit SHA 与 PR 链接**：在各子票与父 Spec 中用 UTF-8 `--body-file` 执行 `gh issue comment <n> --body-file <file>`，写明对应 commit SHA(s)、PR URL 与测试/评审证据；
4. **合并 PR、兜底关单与同步**：确认 `gh pr checks` 通过后执行 `gh pr merge <pr> --merge --delete-branch`（若仓库仅允许 squash，合并后将最终 squash commit SHA 补记到 Issue 评论；若受分支保护/人工审批阻塞，停止并汇报 PR URL，严禁 `--admin`/`--force`）。合并后复核所有子票与父 Spec 状态，若有未自动关闭的单据补执行两步 `gh issue close`，最后执行 `git fetch origin --prune`、`git switch <main|master>`、`git pull --ff-only origin <main|master>` 并核对 `HEAD == origin/<main|master>`。

---

## 2. 本地 `.scratch/` 文件适配器（`--tracker local --close-mode no-close`）

适用依据：无远程 tracker 配置，票据以 `<NN>-<slug>.md` 形式保存在 `.scratch/<feature>/issues/`。

### S1 只读侦察流程

1. 运行 `git status --short --branch`、`git worktree list` 决定新建分支还是 worktree；
2. 扫描 `.scratch/<feature>/issues/` 目录下的所有 `.md` 票据文件；
3. 解析每份文件的 `Blocked by:` 与 `Status:` 字段，识别当前可立即开始的前沿票据（`Blocked by: None` 或全部前置票已 `done`/`closed`）；
4. 如存在对应 Spec 文档（如 `.scratch/<feature>/spec.md`），将其路径纳入真源指针表。

### 嵌入 Prompt 的本地完结协议

1. 要求新会话采用 `/implement`（或按波前隔离）推进，按票据/逻辑切片执行**拆分原子提交**并确认 `git status --short --untracked-files=all` 清零；
2. 每张票验收通过并提交后，将对应 **commit SHA(s)** 写入 `.scratch/<feature>/issues/<NN>-<slug>.md`，勾选验收标准条目并更新 `Status` 为已完成，**严禁调用 `gh issue close` 或虚构远程 Issue 编号**；若基准分支为 `dev` 则合并回 `dev` 并清理临时分支/worktree，若为 `main`/`master` 则走 PR 合并与同步流程。
