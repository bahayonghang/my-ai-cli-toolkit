# gh-fix-ci

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Debug and fix failing GitHub PR checks with GitHub CLI.

## 触发场景

- GitHub Actions checks fail, when a PR has broken status checks, or when you need local reproduction commands for CI failures

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-fix-ci` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.2.0` |
| 标签 | `github`, `gh-cli`, `ci`, `debugging`, `pr-checks` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill gh-fix-ci
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/gh-fix-ci/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/gh-fix-ci/assets` | 目录 | 2 | 素材资源 |
| `skills/git-github-collaboration/gh-fix-ci/LICENSE.txt` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-fix-ci/references` | 目录 | 1 | 引用资料 |
| `skills/git-github-collaboration/gh-fix-ci/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/git-github-collaboration/gh-fix-ci/test-prompts.json` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/gh-fix-ci/agents` | 配套 agent |
| assets | `skills/git-github-collaboration/gh-fix-ci/assets` | 素材资源 |
| references | `skills/git-github-collaboration/gh-fix-ci/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/gh-fix-ci/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/git-github-collaboration/gh-fix-ci/SKILL.md`
- `skills/git-github-collaboration/gh-fix-ci`
