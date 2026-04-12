# GitHub Address Comments

使用 `gh` 汇总 PR 中可执行的 review 反馈，并对选中的问题进行修复。

## 概览

这个技能现在默认输出稳定的“可行动摘要”，不再直接倾倒原始 review JSON。它同时支持：

- 当前分支关联的 PR
- 显式指定的 PR 编号或 URL

常用命令：

```bash
python content/skills/git-github-collaboration/gh-address-comments/scripts/fetch_comments.py --repo .
python content/skills/git-github-collaboration/gh-address-comments/scripts/fetch_comments.py --repo . --pr 42 --json
```

## 工作流

1. 先确认 `gh auth status`。
2. 从当前分支或 `--pr` 解析目标 PR。
3. 运行脚本收集未解决的 review thread、review body 和顶层评论。
4. 将结果整理成编号列表给用户确认。
5. 修复选中的反馈，并总结本轮已处理的评论项。

## RTK 快路径

如果本机安装了 `rtk`，优先把它用于模型可见的探索步骤：

- `rtk gh pr view ...`
- `rtk read ...`
- `rtk grep ...`

如果后续脚本需要原始 JSON 或 GraphQL 输出，就不要让 RTK 压缩这类机器输入。
