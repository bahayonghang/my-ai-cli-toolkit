# session-wrap

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user wants to wrap up the current coding session, summarize what happened in this session before ending work, document learnings and decisions, produce a handoff note for the next session, decide what to commit, or says 总结会话, 会话总结, 收尾, 会话收尾, 结束会话, 总结本次会话.

## 触发场景

- the user wants to wrap up the current coding session, summarize what happened in this session before ending work, document learnings and decisions, produce a handoff note for the next session, decide what to commit, or says 总结会话, 会话总结, 收尾, 会话收尾, 结束会话, 总结本次会话
- Use proactively when the user signals they are done working or switching context, even if they don't explicitly say "wrap up"

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `session-wrap` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `3.1.0` |
| 标签 | `session`, `wrap-up`, `handoff`, `summary` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill session-wrap
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/development-workflows/session-wrap/README.md` | 文件 | 1 | 顶层文件 |
| `content/skills/development-workflows/session-wrap/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `content/skills/development-workflows/session-wrap/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/development-workflows/session-wrap/SKILL.md`
- `content/skills/development-workflows/session-wrap`
