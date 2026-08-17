# git-worktree

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Manage isolated Git worktrees under one repository convention root.

## 触发场景

- Manage isolated Git worktrees under one repository convention root
- Create a new-branch worktree, list trees, remove an owned tree, or show prune candidates after authorization
- Checks that the repo .gitignore excludes the worktree root before any git worktree add
- Use for 创建 worktree, 隔离工作区, 并行分支 checkout, list/remove/prune worktrees, .worktrees 规范, gitignore 检查

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `git-worktree` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `0.1.0` |
| 标签 | `git`, `worktree`, `isolation`, `agent-aware` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill git-worktree
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/git-worktree/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/git-worktree/evals` | 目录 | 1 | 评测样例 |
| `skills/git-github-collaboration/git-worktree/references` | 目录 | 2 | 引用资料 |
| `skills/git-github-collaboration/git-worktree/reports` | 目录 | 6 | 顶层目录 |
| `skills/git-github-collaboration/git-worktree/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/git-github-collaboration/git-worktree/security` | 目录 | 1 | 顶层目录 |
| `skills/git-github-collaboration/git-worktree/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/git-worktree/agents` | 配套 agent |
| evals | `skills/git-github-collaboration/git-worktree/evals` | 评测样例 |
| references | `skills/git-github-collaboration/git-worktree/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/git-worktree/scripts` | 可执行脚本 |
| tests | `skills/git-github-collaboration/git-worktree/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/git-github-collaboration/git-worktree/SKILL.md`
- `skills/git-github-collaboration/git-worktree`
