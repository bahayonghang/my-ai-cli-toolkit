# codex-context-improver

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit or improve Codex instruction context: AGENTS.md, task-relevant skills, prompts, and code_map.md.

## 触发场景

- Audit or improve Codex instruction context: AGENTS.md, task-relevant skills, prompts, and code_map.md
- Use for conflicting rules, overbroad triggers, premature stops, excessive context or verification
- 审计或优化 Codex 上下文、项目指导与技能触发
- Exclude general Codex setup advice, Claude-only guidance, ordinary code review, standalone explanations, and implicit fully specified trivial edits

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-context-improver` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `2.0.0` |
| 标签 | `codex`, `context`, `agents-md`, `skills`, `audit` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-context-improver
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/codex-context-improver/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/codex-context-improver/evals` | 目录 | 4 | 评测样例 |
| `skills/developer-tools-integrations/codex-context-improver/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/codex-context-improver/references` | 目录 | 6 | 引用资料 |
| `skills/developer-tools-integrations/codex-context-improver/reports` | 目录 | 5 | 顶层目录 |
| `skills/developer-tools-integrations/codex-context-improver/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/codex-context-improver/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/codex-context-improver/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/codex-context-improver/references` | 引用资料 |
| tests | `skills/developer-tools-integrations/codex-context-improver/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/codex-context-improver/SKILL.md`
- `skills/developer-tools-integrations/codex-context-improver`
