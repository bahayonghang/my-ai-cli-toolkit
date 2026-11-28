# codex-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user asks for GPT or Codex to review code with the local Codex CLI (使用 GPT 审查、让 Codex 审查、codex review).

## 触发场景

- the user asks for GPT or Codex to review code with the local Codex CLI (使用 GPT 审查、让 Codex 审查、codex review)
- Covers the whole repository, uncommitted changes, a commit, branch baseline or GitHub PR and saves a Markdown report
- Generic code review without a named reviewer, writing a PR description, and ticket review use their own workflows

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `codex`, `code-review`, `git`, `pull-request` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/codex-review/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/codex-review/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/codex-review/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-review/planning` | 目录 | 5 | 顶层目录 |
| `skills/development-workflows/codex-review/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-review/reports` | 目录 | 6 | 顶层目录 |
| `skills/development-workflows/codex-review/scripts` | 目录 | 3 | 可执行脚本 |
| `skills/development-workflows/codex-review/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/codex-review/agents` | 配套 agent |
| evals | `skills/development-workflows/codex-review/evals` | 评测样例 |
| scripts | `skills/development-workflows/codex-review/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/codex-review/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/codex-review/SKILL.md`
- `skills/development-workflows/codex-review`
