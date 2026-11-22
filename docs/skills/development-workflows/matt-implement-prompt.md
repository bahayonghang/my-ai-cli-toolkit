# matt-implement-prompt

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Compile Matt Pocock workflow specs and tracer-bullet tickets (GitHub Issues or local .scratch issues) into a self-contained, pointer-driven fresh-session execution prompt with TDD, code-review, CI verification gates, and explicit remote issue-closing protocol.

## 触发场景

- the user asks to write or generate a fresh-session implementation prompt after /to-spec or /to-tickets, create a prompt to implement all tickets and close remote issues (新对话实施所有 ticket 并关闭远程 issue、生成 matt implement prompt / promt、按任务图波前编排实施提示词), or hand off a spec task graph to /implement or /implement-spec
- Excludes authoring specs or tickets themselves (/to-spec, /to-tickets), executing implementation or closing issues in the current session (/implement, /implement-spec), /goal or GOAL.md compilation (goal-meta-skill), and Trellis review revision prompts (trellis-plan-review)

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `matt-implement-prompt` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `mattpocock`, `implement-spec`, `implement`, `prompt-engineering`, `github-issues`, `handoff` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill matt-implement-prompt
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/matt-implement-prompt/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/matt-implement-prompt/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/matt-implement-prompt/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/matt-implement-prompt/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/matt-implement-prompt/references` | 目录 | 3 | 引用资料 |
| `skills/development-workflows/matt-implement-prompt/reports` | 目录 | 4 | 顶层目录 |
| `skills/development-workflows/matt-implement-prompt/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/development-workflows/matt-implement-prompt/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/matt-implement-prompt/agents` | 配套 agent |
| evals | `skills/development-workflows/matt-implement-prompt/evals` | 评测样例 |
| references | `skills/development-workflows/matt-implement-prompt/references` | 引用资料 |
| scripts | `skills/development-workflows/matt-implement-prompt/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/matt-implement-prompt/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/matt-implement-prompt/SKILL.md`
- `skills/development-workflows/matt-implement-prompt`
