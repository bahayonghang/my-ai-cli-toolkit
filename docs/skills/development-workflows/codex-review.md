# codex-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user asks an Agent inside Herdr to start Codex for an independent review through herdr-orchestra, or invokes codex-review with established Herdr task context; 支持在 Herdr 中让 Codex 审查改动、提交、文件或计划。Do not use for generic review, direct non-Herdr Codex collaboration, automatic fixes or CHANGELOG generation, research-only discussion, or when already assigned as the leaf reviewer.

## 触发场景

- the user asks an Agent inside Herdr to start Codex for an independent review through herdr-orchestra, or invokes codex-review with established Herdr task context
- 支持在 Herdr 中让 Codex 审查改动、提交、文件或计划。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `codex`, `herdr`, `review`, `read-only`, `delegation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/codex-review/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/codex-review/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/codex-review/references` | 目录 | 2 | 引用资料 |
| `skills/development-workflows/codex-review/reports` | 目录 | 5 | 顶层目录 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/codex-review/agents` | 配套 agent |
| evals | `skills/development-workflows/codex-review/evals` | 评测样例 |
| references | `skills/development-workflows/codex-review/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/codex-review/SKILL.md`
- `skills/development-workflows/codex-review`
