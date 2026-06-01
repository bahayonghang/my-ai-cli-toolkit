# codex-dynamic-workflows

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.

## 触发场景

- Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-dynamic-workflows` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.2.0` |
| 标签 | `codex`, `orchestration`, `subagents`, `workflows`, `verification` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-dynamic-workflows
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/codex-dynamic-workflows/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/codex-dynamic-workflows/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/codex-dynamic-workflows/references` | 目录 | 3 | 引用资料 |
| `skills/development-workflows/codex-dynamic-workflows/scripts` | 目录 | 3 | 可执行脚本 |
| `skills/development-workflows/codex-dynamic-workflows/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/codex-dynamic-workflows/agents` | 配套 agent |
| evals | `skills/development-workflows/codex-dynamic-workflows/evals` | 评测样例 |
| references | `skills/development-workflows/codex-dynamic-workflows/references` | 引用资料 |
| scripts | `skills/development-workflows/codex-dynamic-workflows/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/codex-dynamic-workflows/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/codex-dynamic-workflows/SKILL.md`
- `skills/development-workflows/codex-dynamic-workflows`
