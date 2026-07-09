# unknowns-first

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Diagnose a task before execution when the user may not yet know how to define success.

## 触发场景

- Diagnose a task before execution when the user may not yet know how to define success
- Use to clarify an ambiguous or unfamiliar task, define what good means, turn vague intent into an actionable brief, or when the user says 澄清任务, 先诊断再做, 理清需求, 帮我定义成功标准

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `unknowns-first` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `task-clarification`, `requirements`, `unknowns`, `diagnosis`, `planning` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill unknowns-first
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/unknowns-first/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/unknowns-first/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/unknowns-first/references` | 目录 | 2 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/unknowns-first/agents` | 配套 agent |
| evals | `skills/development-workflows/unknowns-first/evals` | 评测样例 |
| references | `skills/development-workflows/unknowns-first/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/unknowns-first/SKILL.md`
- `skills/development-workflows/unknowns-first`
