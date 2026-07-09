# handoff

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Write a handoff.md that lets a fresh session resume unfinished work cold.

## 触发场景

- compacting before auto-compaction, handing off an unfinished task, switching topics, or proactively when context usage is high
- Triggers include 上下文压缩, 交接文档, 接力, 续接会话, 明早接着干, handoff, fresh session

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `handoff` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `handoff`, `context-management`, `session`, `continuity` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill handoff
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/handoff/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/development-workflows/handoff/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/handoff/SKILL.md`
- `skills/development-workflows/handoff`
