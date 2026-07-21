# gh-pr

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Operate GitHub pull requests with gh CLI: create or draft PRs, publish confirmed reviews, inspect and merge, reply to or resolve threads, apply selected review feedback, and diagnose or fix failing PR checks / 创建或发布 PR、发布评审、安全合并、回复或解决线程、按评审意见修复代码、修复 PR CI.

## 触发场景

- Operate GitHub pull requests with gh CLI: create or draft PRs, publish confirmed reviews, inspect and merge, reply to or resolve threads, apply selected review feedback, and diagnose or fix failing PR checks / 创建或发布 PR、发布评审、安全合并、回复或解决线程、按评审意见修复代码、修复 PR CI
- Use for PR creation, review publication, merge execution, thread responses, reviewer-requested fixes, or GitHub Actions failures
- Not for substantive code-review analysis (code-auditor or code-quality-review), commit authoring (git-commit), GitHub setup (gh-bootstrap), or full-spectrum repository health audits (fuck-my-shit-mountain)

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-pr` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `2.0.0` |
| 标签 | `github`, `gh-cli`, `pull-request`, `pr-lifecycle` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill gh-pr
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/git-github-collaboration/gh-pr/agents` | 目录 | 1 | 配套 agent |
| `skills/git-github-collaboration/gh-pr/evals` | 目录 | 1 | 评测样例 |
| `skills/git-github-collaboration/gh-pr/LICENSE-upstream.txt` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr/NOTICE-upstream.md` | 文件 | 1 | 顶层文件 |
| `skills/git-github-collaboration/gh-pr/references` | 目录 | 6 | 引用资料 |
| `skills/git-github-collaboration/gh-pr/reports` | 目录 | 2 | 顶层目录 |
| `skills/git-github-collaboration/gh-pr/scripts` | 目录 | 4 | 可执行脚本 |
| `skills/git-github-collaboration/gh-pr/tests` | 目录 | 3 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/git-github-collaboration/gh-pr/agents` | 配套 agent |
| evals | `skills/git-github-collaboration/gh-pr/evals` | 评测样例 |
| references | `skills/git-github-collaboration/gh-pr/references` | 引用资料 |
| scripts | `skills/git-github-collaboration/gh-pr/scripts` | 可执行脚本 |
| tests | `skills/git-github-collaboration/gh-pr/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/git-github-collaboration/gh-pr/SKILL.md`
- `skills/git-github-collaboration/gh-pr`
