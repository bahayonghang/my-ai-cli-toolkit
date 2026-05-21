# handoff

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation.

## 触发场景

- the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation
- Produces a single handoff.md that captures completed work, blocked items with what was already tried, next concrete steps, and the minimum context needed to resume cold
- Use proactively when context usage is high, a long-running task hits a natural break, or the user signals a session switch
- Triggers include 上下文压缩, 交接文档, handoff, 续接会话, 主题切换, 接力, 明早接着干, context handoff, compact before, fresh session, continue tomorrow

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `handoff` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `handoff`, `context-management`, `session`, `continuity` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill handoff
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/development-workflows/handoff/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `content/skills/development-workflows/handoff/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/development-workflows/handoff/SKILL.md`
- `content/skills/development-workflows/handoff`
