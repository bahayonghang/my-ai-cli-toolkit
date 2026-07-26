# claude-context-improver

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and improve the Claude Code context layer — CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps — against Claude 5 context-engineering rules (judgement over rules, progressive disclosure, no cross-layer conflicts). Asks whether to optimize the current repository (default) or the global ~/.claude context.

## 触发场景

- the user asks to check, audit, optimize, rightsize, slim, or restructure CLAUDE.md or Claude context files, mentions nested CLAUDE.md, code_map.md, or context engineering, or says 优化 CLAUDE.md, 审计 CLAUDE.md, 优化上下文, 精简上下文, 生成 code_map (Claude)
- Not for trivial single-line edits the user has already fully specified

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `claude-context-improver` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `2.0.0` |
| 标签 | `claude-code`, `claude-md`, `context-engineering`, `repository-guidance`, `memory`, `audit`, `documentation`, `code-map` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill claude-context-improver
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/claude-context-improver/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/claude-context-improver/references` | 目录 | 6 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/claude-context-improver/agents` | 配套 agent |
| references | `skills/developer-tools-integrations/claude-context-improver/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/claude-context-improver/SKILL.md`
- `skills/developer-tools-integrations/claude-context-improver`
