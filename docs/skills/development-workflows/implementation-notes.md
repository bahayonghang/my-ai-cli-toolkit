# implementation-notes

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Maintain a live implementation-notes.md while implementing a multi-step spec, PRD, design doc, or approved plan — capturing design decisions, intentional deviations, rejected alternatives, and open questions. Start before the first edit.

## 触发场景

- 实施记录, 决策日志, 边写边记, 按这个 spec 实现, decision log

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `implementation-notes` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `implementation`, `decision-log`, `spec`, `documentation`, `review` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill implementation-notes
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/implementation-notes/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/development-workflows/implementation-notes/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/implementation-notes/SKILL.md`
- `skills/development-workflows/implementation-notes`
