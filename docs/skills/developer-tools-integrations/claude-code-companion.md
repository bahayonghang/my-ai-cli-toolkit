# claude-code-companion

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Coordinate Claude Code companion-style workflows for multi-step implementation, bounded review, follow-up execution, and session-to-session continuation inside Claude Code.

## 触发场景

- the user explicitly wants a Claude Code-native companion workflow, wants help structuring background or follow-up work in Claude Code, or needs clear guidance on when to use direct Claude Code actions versus a persistent companion-style process

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `claude-code-companion` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `claude-code`, `companion`, `workflow-orchestration`, `follow-up-execution`, `review-first`, `task-continuation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill claude-code-companion
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/claude-code-companion/README.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/claude-code-companion/SKILL.md`
- `skills/developer-tools-integrations/claude-code-companion`
