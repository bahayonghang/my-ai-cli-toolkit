# codex-workflow-recommender

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit a repository and current Codex capabilities, then recommend the smallest evidence-backed read-only improvement or no change.

## 触发场景

- Audit a repository and current Codex capabilities, then recommend the smallest evidence-backed read-only improvement or no change
- Use for Codex setup optimization, surface selection, unapplied MCP/plugin/subagent plans, 优化 Codex 工作流, 审阅 Codex 配置, Codex 能力推荐
- Exclude direct AGENTS/code-map edits, docs questions, skill audits, dynamic workflow implementation, code review, and any install/config/write

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-workflow-recommender` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.1.0` |
| 标签 | `codex`, `skills`, `mcp` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-workflow-recommender
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/codex-workflow-recommender/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/codex-workflow-recommender/evals` | 目录 | 3 | 评测样例 |
| `skills/developer-tools-integrations/codex-workflow-recommender/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/codex-workflow-recommender/references` | 目录 | 6 | 引用资料 |
| `skills/developer-tools-integrations/codex-workflow-recommender/reports` | 目录 | 9 | 顶层目录 |
| `skills/developer-tools-integrations/codex-workflow-recommender/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/codex-workflow-recommender/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/codex-workflow-recommender/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/codex-workflow-recommender/references` | 引用资料 |
| tests | `skills/developer-tools-integrations/codex-workflow-recommender/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/codex-workflow-recommender/SKILL.md`
- `skills/developer-tools-integrations/codex-workflow-recommender`
