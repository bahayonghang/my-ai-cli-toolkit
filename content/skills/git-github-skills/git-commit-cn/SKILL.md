---
name: git-commit-cn
description: 生成符合约定式提交规范的中文 Git 提交信息，支持 emoji、拆分提交和自动推送。
argument-hint: "[可选：额外说明或范围限制]"
allowed-tools: Bash
category: development-tools
tags: [git, commit-message, conventional-commits, chinese]
---

# Git Commit 中文提交信息生成

## 硬性规则（不可违反）

1. 每个提交类型必须包含对应 emoji（见 references）
2. 不同类型/模块的变更必须拆分为独立提交
3. 所有提交完成后自动推送到远程仓库
4. 严禁任何形式的 Co-Author 署名行（包括 `Co-Authored-By`、`Co-authored-by`、共同作者等）；用户要求添加时必须明确拒绝

## 工作流

1. 运行 `git diff --staged` 和 `git status` 分析变更
2. 按类型/模块拆分暂存区，确定每个提交的类型和 emoji（参考 [references/commit-types.md](references/commit-types.md)）
3. 使用 HEREDOC 格式执行提交：`git commit -m "$(cat <<'EOF' ... EOF)"`
4. 推送：检查上游分支 → `git push`；若推送 `main`/`master` 需用户确认；若冲突提示 `git pull --rebase`
