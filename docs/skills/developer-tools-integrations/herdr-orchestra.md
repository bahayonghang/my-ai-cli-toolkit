# herdr-orchestra

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user explicitly asks to coordinate worker agents in Herdr, delegate tasks across Herdr panes, or collect and compare their results; 支持 Herdr 多 Agent 编排、分工、交叉核验和结果收集。Do not use for ordinary local subagents, simple pane inspection, documentation research, work outside Herdr, or when already assigned as a leaf worker.

## 触发场景

- the user explicitly asks to coordinate worker agents in Herdr, delegate tasks across Herdr panes, or collect and compare their results
- 支持 Herdr 多 Agent 编排、分工、交叉核验和结果收集。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `herdr-orchestra` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `herdr`, `orchestration`, `agents`, `delegation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill herdr-orchestra
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/herdr-orchestra/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/herdr-orchestra/evals` | 目录 | 2 | 评测样例 |
| `skills/developer-tools-integrations/herdr-orchestra/references` | 目录 | 2 | 引用资料 |
| `skills/developer-tools-integrations/herdr-orchestra/reports` | 目录 | 5 | 顶层目录 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/herdr-orchestra/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/herdr-orchestra/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/herdr-orchestra/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/herdr-orchestra/SKILL.md`
- `skills/developer-tools-integrations/herdr-orchestra`
