# codex-dynamic-workflows

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Plan and run AI-agent dynamic workflows for complex tasks that benefit from explicit orchestration, goal mode, subagents or simulated work packets, approval gates, integration, verification, and reusable workflow artifacts.

## 触发场景

- the user invokes this skill, asks for a swarm, subagents, parallel agents, a dynamic workflow, a large migration or audit, multi-track research plus implementation, or Claude Code-style workflow orchestration

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-dynamic-workflows` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `codex`, `orchestration`, `subagents`, `workflows`, `verification` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-dynamic-workflows
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/codex-dynamic-workflows/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/codex-dynamic-workflows/references` | 目录 | 3 | 引用资料 |
| `skills/development-workflows/codex-dynamic-workflows/scripts` | 目录 | 3 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/codex-dynamic-workflows/agents` | 配套 agent |
| references | `skills/development-workflows/codex-dynamic-workflows/references` | 引用资料 |
| scripts | `skills/development-workflows/codex-dynamic-workflows/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/codex-dynamic-workflows/SKILL.md`
- `skills/development-workflows/codex-dynamic-workflows`
