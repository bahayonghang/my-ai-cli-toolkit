# git-commit

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Safely orchestrate Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything.

## 触发场景

- the user asks to write a commit message, split staged changes, split all changes, commit everything regardless of stage state, include untracked files in the commit set, organize a messy index before committing, or generate structured commit text without pushing by default
- Default to English
- Switch to Chinese only when the user explicitly says `请使用中文拆分提交所有的改动`
- Agent commits automatically inject `Agent-Task` / `Agent-Model` / `Generated-By` trailers and an `[AI]` header tag

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `git-commit` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.6.0` |
| 标签 | `git`, `conventional-commits`, `commit-message`, `agent-aware` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill git-commit
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/git-commit/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/git-commit/evals` | 目录 | 1 | 评测样例 |
| `skills/git-github-collaboration/git-commit/references` | 目录 | 4 | 引用资料 |
| `skills/git-github-collaboration/git-commit/scripts` | 目录 | 3 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/git-commit/agents` | 配套 agent |
| evals | `skills/git-github-collaboration/git-commit/evals` | 评测样例 |
| references | `skills/git-github-collaboration/git-commit/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/git-commit/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/git-github-collaboration/git-commit/SKILL.md`
- `skills/git-github-collaboration/git-commit`
