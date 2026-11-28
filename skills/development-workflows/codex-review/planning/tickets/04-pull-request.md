# 固定版本的 GitHub PR 审查

## What to build

开发者提供 PR 编号或 URL，由本地 CLI 审查该 PR 的变更，审查期间可以继续使用当前分支。

## Acceptance criteria

- [ ] 记录 PR URL、base/head SHA 与实际合并基点，证据取自对应版本。
- [ ] 兼容来自 fork 的 PR；本地没有对象时从目标仓库读取并隔离临时数据。
- [ ] 用户的未提交文件、当前分支和索引保持原状，不向 PR 发表评论。
- [ ] PR 不可访问、Git 对象无法取得或审查进程失败时，输出明确的失败状态。

## Blocked by

01 · 未提交改动到持久化报告。
