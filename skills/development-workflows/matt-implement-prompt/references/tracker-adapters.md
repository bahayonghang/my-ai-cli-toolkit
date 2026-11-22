# Tracker Adapters

在 `S1 只读侦察` 阶段按项目配置选择对应追踪器适配器，并在编译出的 Prompt 中嵌入匹配的操作与关单协议。

## 1. GitHub Issues 适配器（`--tracker github`）

适用依据：仓库存在 `docs/agents/issue-tracker.md` 并指定 GitHub Issues，或用户提供了 GitHub Issue 编号/URL。

### S1 只读侦察命令

```powershell
# 1. 核实目标仓库（防止 fork 误查上游）
gh repo view --json nameWithOwner,isFork,parent

# 2. 读取父 Spec 或入口 Issue
gh issue view <spec-num> --json number,title,body,labels,state,url

# 3. 列出所有原生 sub-issues 与实时阻塞数
gh api "repos/<owner>/<repo>/issues/<spec-num>/sub_issues" --jq '.[] | {number, state, title}'
gh api "repos/<owner>/<repo>/issues/<child-num>" --jq '.issue_dependencies_summary.blocked_by'
```

> 若仓库尚未启用 GitHub sub-issues 或 native issue dependencies，则改用 `gh issue list` 匹配 `Part of #<spec>` / `Blocked by:` 正文声明来推导波前。

### 嵌入 Prompt 的远程关单协议（`--close-mode remote-close`）

必须在生成的 Prompt 中写入：
1. 关闭子票前核实 `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` 为 `0` 且该切片验收与本地提交已通过；
2. 先用 UTF-8 文件执行 `gh issue comment <n> --body-file <file>` 写明完成摘要、对应提交 SHA 与验证命令实测结果（Windows PowerShell 严禁省略 `--body-file` 直接传中文命令行参数以防乱码）；
3. 再执行 `gh issue close <n>`；
4. 关闭父 Spec 前，复核 `gh api repos/<owner>/<repo>/issues/<spec>/sub_issues` 中全部子票均为 `closed`，再评论总体验收与集成分支结果后执行 `gh issue close <spec>`。

---

## 2. 本地 `.scratch/` 文件适配器（`--tracker local`）

适用依据：无远程 tracker 配置，票据以 `<NN>-<slug>.md` 形式保存在 `.scratch/<feature>/issues/`。

### S1 只读侦察流程

1. 扫描 `.scratch/<feature>/issues/` 目录下的所有 `.md` 票据文件；
2. 解析每份文件的 `Blocked by:` 与 `Status:` 字段，识别当前可立即开始的前沿票据（`Blocked by: None` 或全部前置票已 `done`/`closed`）；
3. 如存在对应 Spec 文档（如 `.scratch/<feature>/spec.md`），将其路径纳入真源指针表。

### 嵌入 Prompt 的本地完结协议（`--close-mode no-close`）

1. 要求新会话采用 `/implement` 逐票推进，每完成一票按要求清理/切换新上下文再接下一票；
2. 每张票验收通过并提交后，勾选该票文件内的验收标准条目并更新 `Status` 为已完成，**严禁调用 `gh issue close` 或虚构远程 Issue 编号**。
