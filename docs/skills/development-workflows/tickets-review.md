# tickets-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Independent read-only audit of remote GitHub Issues or local .scratch ticket graphs (parent spec plus child tickets) against live code, tests, and repo contracts. Runs Pass 0 dependency/metadata precheck and Passes 1-7 evidence-backed checks, persists one Markdown report under reports/tickets-review/, and emits one copyable handoff prompt with a structured confirmation gate for a downstream agent to optimize the tickets.

## 触发场景

- asked to review remote tickets, audit GitHub issues or spec tickets before implementation, or check dependencies, AFK readiness, and code alignment (审查所有远程 tickets、审查 GitHub issues、审阅 spec 和子票、检查 tickets 可执行性并输出本地报告和优化 prompt)
- Excludes Trellis plan reviews (trellis-plan-review), execution prompt compilation (matt-implement-prompt), spec/ticket authoring (/to-spec, /to-tickets), code-diff/PR reviews (code-review, gh-pr-release), and editing tickets or coding directly

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `tickets-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `tickets`, `github-issues`, `spec-audit`, `review`, `acceptance-criteria`, `handoff` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill tickets-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/tickets-review/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/tickets-review/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/tickets-review/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/tickets-review/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/tickets-review/references` | 目录 | 6 | 引用资料 |
| `skills/development-workflows/tickets-review/reports` | 目录 | 4 | 顶层目录 |
| `skills/development-workflows/tickets-review/scripts` | 目录 | 3 | 可执行脚本 |
| `skills/development-workflows/tickets-review/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/tickets-review/agents` | 配套 agent |
| evals | `skills/development-workflows/tickets-review/evals` | 评测样例 |
| references | `skills/development-workflows/tickets-review/references` | 引用资料 |
| scripts | `skills/development-workflows/tickets-review/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/tickets-review/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/tickets-review/SKILL.md`
- `skills/development-workflows/tickets-review`
