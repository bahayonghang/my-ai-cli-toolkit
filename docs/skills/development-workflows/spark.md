# spark

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Plan-first brainstorming workflow that turns an idea into an approved implementation plan before coding.

## 触发场景

- the user wants to brainstorm, design, scope, stress-test, or plan a feature/spec
- Spark adapts to the active planning surface: in Codex native Plan mode it stays read-only and returns a chat-only final plan
- in Claude Code Plan mode it uses Claude's plan approval/exit flow and writes files only after approval exits Plan mode
- in writable/default mode it saves Markdown plans under .plannings/YYYY-MM-DD-feature-slug.md

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `spark` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.6.0` |
| 标签 | `brainstorming`, `plan-writing`, `product-design`, `requirements`, `planning` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill spark
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/spark/assets` | 目录 | 1 | 素材资源 |
| `skills/development-workflows/spark/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/spark/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/spark/scripts` | 目录 | 5 | 可执行脚本 |
| `skills/development-workflows/spark/spec-document-reviewer-prompt.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/spark/tests` | 目录 | 1 | 自动化测试 |
| `skills/development-workflows/spark/visual-companion.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/development-workflows/spark/assets` | 素材资源 |
| evals | `skills/development-workflows/spark/evals` | 评测样例 |
| scripts | `skills/development-workflows/spark/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/spark/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/spark/SKILL.md`
- `skills/development-workflows/spark`
