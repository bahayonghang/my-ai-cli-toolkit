# gh-pr-release

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Operate GitHub pull requests and releases with gh CLI: create/draft PRs, publish confirmed reviews, merge safely, reply/resolve threads, apply selected feedback, fix PR checks, prepare release PRs with version bumps/changelogs, tag merged commits, publish GitHub Releases with verified assets, and diagnose release workflows / 创建或发布 PR、评审与安全合并、回复或解决线程、修复 PR CI、准备版本 PR、打 tag、发布含产物的 GitHub Release、诊断 release CI.

## 触发场景

- Operate GitHub pull requests and releases with gh CLI: create/draft PRs, publish confirmed reviews, merge safely, reply/resolve threads, apply selected feedback, fix PR checks, prepare release PRs with version bumps/changelogs, tag merged commits, publish GitHub Releases with verified assets, and diagnose release workflows / 创建或发布 PR、评审与安全合并、回复或解决线程、修复 PR CI、准备版本 PR、打 tag、发布含产物的 GitHub Release、诊断 release CI
- Not for code-review analysis (code-auditor or code-quality-review), commits (git-commit), GitHub/release-workflow setup (gh-bootstrap), registry publishing (npm/cargo/pypi), release-readiness/full-spectrum audits (fuck-my-shit-mountain), or release-notes-only writing

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-pr-release` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `3.0.0` |
| 标签 | `github`, `gh-cli`, `pull-request`, `pr-lifecycle` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill gh-pr-release
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/gh-pr-release/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/gh-pr-release/docs` | 目录 | 1 | 内嵌文档 |
| `skills/git-github-collaboration/gh-pr-release/evals` | 目录 | 4 | 评测样例 |
| `skills/git-github-collaboration/gh-pr-release/LICENSE` | 文件 | 1 | 顶层目录 |
| `skills/git-github-collaboration/gh-pr-release/LICENSE-upstream.txt` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr-release/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr-release/NOTICE-upstream.md` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr-release/references` | 目录 | 8 | 引用资料 |
| `skills/git-github-collaboration/gh-pr-release/reports` | 目录 | 49 | 顶层目录 |
| `skills/git-github-collaboration/gh-pr-release/requirements-ci.txt` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr-release/scripts` | 目录 | 4 | 可执行脚本 |
| `skills/git-github-collaboration/gh-pr-release/security` | 目录 | 2 | 顶层目录 |
| `skills/git-github-collaboration/gh-pr-release/tests` | 目录 | 3 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/gh-pr-release/agents` | 配套 agent |
| docs | `skills/git-github-collaboration/gh-pr-release/docs` | 内嵌文档 |
| evals | `skills/git-github-collaboration/gh-pr-release/evals` | 评测样例 |
| references | `skills/git-github-collaboration/gh-pr-release/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/gh-pr-release/scripts` | 可执行脚本 |
| tests | `skills/git-github-collaboration/gh-pr-release/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/git-github-collaboration/gh-pr-release/SKILL.md`
- `skills/git-github-collaboration/gh-pr-release`
