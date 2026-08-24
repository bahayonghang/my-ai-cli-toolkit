# git-commit

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.

## 触发场景

- asked to write a commit message, split staged or working-tree changes, organize a messy index, or draft commit text without pushing
- Auto-detects commit language
- explicit phrases like 用中文提交 or 请使用中文拆分提交所有的改动 override
- Default headers have no [AI] tag

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `git-commit` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.12.0` |
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
| `skills/git-github-collaboration/git-commit/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/git-commit/agents` | 配套 agent |
| evals | `skills/git-github-collaboration/git-commit/evals` | 评测样例 |
| references | `skills/git-github-collaboration/git-commit/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/git-commit/scripts` | 可执行脚本 |
| tests | `skills/git-github-collaboration/git-commit/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/git-github-collaboration/git-commit/SKILL.md`
- `skills/git-github-collaboration/git-commit`
