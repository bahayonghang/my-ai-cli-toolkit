# codex-workflow-recommender

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Analyze a repository and current Codex environment, then recommend Codex CLI, Codex App, AGENTS.md, skills, native subagents, plugins, MCP servers, config/hooks, and optional OMX workflow improvements without modifying files.

## 触发场景

- the user asks to optimize Codex workflows, improve Codex setup, recommend Codex automation, configure MCP/plugins/subagents, analyze AGENTS.md scope needs, or says "优化 Codex 流程", "Codex 工作流推荐", "给 Codex 配 MCP", "配置 Codex plugins", or "配置 Codex subagents"

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-workflow-recommender` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.0.0` |
| 标签 | `codex`, `codex-cli`, `codex-app`, `workflow`, `agents-md`, `skills`, `subagents`, `plugins`, `mcp`, `hooks`, `omx` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-workflow-recommender
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/codex-workflow-recommender/references` | 目录 | 5 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `skills/developer-tools-integrations/codex-workflow-recommender/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/codex-workflow-recommender/SKILL.md`
- `skills/developer-tools-integrations/codex-workflow-recommender`
