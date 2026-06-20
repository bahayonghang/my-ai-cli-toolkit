# gh-address-comments

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Address GitHub PR review comments and actionable review threads with GitHub CLI.

## 触发场景

- triaging reviewer feedback, summarizing unresolved PR comments, or applying selected fixes on a pull request

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-address-comments` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.2.0` |
| 标签 | `github`, `gh-cli`, `pr-review`, `code-review` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill gh-address-comments
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/gh-address-comments/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/gh-address-comments/assets` | 目录 | 2 | 素材资源 |
| `skills/git-github-collaboration/gh-address-comments/evals` | 目录 | 1 | 评测样例 |
| `skills/git-github-collaboration/gh-address-comments/LICENSE.txt` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-address-comments/scripts` | 目录 | 1 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/gh-address-comments/agents` | 配套 agent |
| assets | `skills/git-github-collaboration/gh-address-comments/assets` | 素材资源 |
| evals | `skills/git-github-collaboration/gh-address-comments/evals` | 评测样例 |
| scripts | `skills/git-github-collaboration/gh-address-comments/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/git-github-collaboration/gh-address-comments/SKILL.md`
- `skills/git-github-collaboration/gh-address-comments`
