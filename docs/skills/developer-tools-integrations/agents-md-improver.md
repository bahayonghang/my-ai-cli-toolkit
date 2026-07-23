# agents-md-improver

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation.

## 触发场景

- Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation
- Use for effective-chain audits, nested conflicts, stale commands, scoped-guidance gaps, approved updates, 优化 AGENTS.md, 审计 Codex 项目指导, 更新 AGENTS.md, or 生成 code_map.md
- Exclude Claude-only guidance, general Codex workflow advice, explanations, ordinary code/docs review, and implicit fully specified trivial edits

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `agents-md-improver` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.2.0` |
| 标签 | `codex`, `agents-md`, `repository-guidance`, `codex-cli`, `codex-app`, `audit`, `documentation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill agents-md-improver
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/agents-md-improver/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/agents-md-improver/evals` | 目录 | 3 | 评测样例 |
| `skills/developer-tools-integrations/agents-md-improver/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/agents-md-improver/references` | 目录 | 5 | 引用资料 |
| `skills/developer-tools-integrations/agents-md-improver/reports` | 目录 | 11 | 顶层目录 |
| `skills/developer-tools-integrations/agents-md-improver/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/agents-md-improver/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/agents-md-improver/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/agents-md-improver/references` | 引用资料 |
| tests | `skills/developer-tools-integrations/agents-md-improver/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/agents-md-improver/SKILL.md`
- `skills/developer-tools-integrations/agents-md-improver`
