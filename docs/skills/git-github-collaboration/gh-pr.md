# gh-pr

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create and operate GitHub pull requests with gh CLI: draft or open a PR, publish confirmed review summaries or inline comments, approve or request changes, merge safely, and reply to or resolve review threads / 创建 PR、发布已确认的 review 总结或逐行评论、批准或请求修改、安全合并、回复或解决评审线程.

## 触发场景

- the user asks to create/publish a PR, submit an existing review decision, merge a PR, or respond to GitHub review comments
- Not for substantive code review analysis (code-auditor or code-quality-review), applying review fixes (gh-address-comments), fixing CI failures (gh-fix-ci), crafting commits (git-commit), repository collaboration setup (gh-bootstrap), or repository health audits (fuck-my-shit-mountain)

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-pr` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.0.0` |
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
| `skills/git-github-collaboration/gh-pr/references` | 目录 | 4 | 引用资料 |
| `skills/git-github-collaboration/gh-pr/reports` | 目录 | 2 | 顶层目录 |
| `skills/git-github-collaboration/gh-pr/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/git-github-collaboration/gh-pr/tests` | 目录 | 1 | 自动化测试 |

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
