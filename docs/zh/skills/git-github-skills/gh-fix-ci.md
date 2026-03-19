# GitHub Fix CI

用 `gh` 检查 PR 失败状态，抽取最小必要日志片段，并给出本地复现命令。

## 概览

配套脚本现在会返回：

- 失败的 GitHub Actions 检查项
- 精简后的失败日志片段
- 本地复现命令
- 可安全推导出的 RTK 前缀复现命令

示例：

```bash
python content/skills/git-github-skills/gh-fix-ci/scripts/inspect_pr_checks.py --repo . --pr 123 --json
```

## 工作流

1. 先确认 `gh auth status`。
2. 解析当前分支 PR，或使用显式 PR 编号 / URL。
3. 运行脚本并整理失败检查项。
4. 区分 GitHub Actions 与外部 CI。外部 CI 默认只报告，不直接深入处理。
5. 用建议的本地命令复现问题，修复后重新执行 `gh pr checks`。

## RTK 快路径

如果本机安装了 `rtk`，可以在探索和摘要阶段优先使用：

- `rtk gh pr checks ...`
- `rtk gh run view ...`
- `rtk read ...`
- `rtk grep ...`

但拉取原始 JSON 和原始日志时，仍然应该使用未经压缩的 `gh` 输出。
