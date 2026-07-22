# codex-bridge

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user explicitly asks the current agent to involve Codex CLI by reviewing a plan, implementing code, revising an implementation after review, or verifying extrapolated findings.

## 触发场景

- the user explicitly asks the current agent to involve Codex CLI by reviewing a plan, implementing code, revising an implementation after review, or verifying extrapolated findings
- Supports "让 Codex 审一下", "交给 Codex 实现", and explicit Claude-to-Codex collaboration through portable file-backed bundles

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-bridge` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `1.0.0` |
| 标签 | `codex`, `collaboration`, `code-review`, `implementation`, `cross-platform` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-bridge
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/codex-bridge/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/codex-bridge/checklist.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-bridge/conventions.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-bridge/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/codex-bridge/jsonl-guide.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-bridge/models.json` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/codex-bridge/references` | 目录 | 1 | 引用资料 |
| `skills/development-workflows/codex-bridge/reports` | 目录 | 3 | 顶层目录 |
| `skills/development-workflows/codex-bridge/scripts` | 目录 | 4 | 可执行脚本 |
| `skills/development-workflows/codex-bridge/security` | 目录 | 1 | 顶层目录 |
| `skills/development-workflows/codex-bridge/templates` | 目录 | 12 | 模板 |
| `skills/development-workflows/codex-bridge/tests` | 目录 | 2 | 自动化测试 |
| `skills/development-workflows/codex-bridge/THIRD_PARTY_NOTICES.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/codex-bridge/agents` | 配套 agent |
| evals | `skills/development-workflows/codex-bridge/evals` | 评测样例 |
| references | `skills/development-workflows/codex-bridge/references` | 引用资料 |
| scripts | `skills/development-workflows/codex-bridge/scripts` | 可执行脚本 |
| templates | `skills/development-workflows/codex-bridge/templates` | 模板 |
| tests | `skills/development-workflows/codex-bridge/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/codex-bridge/SKILL.md`
- `skills/development-workflows/codex-bridge`
