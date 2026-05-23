# claude-md-improver

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps.

## 触发场景

- the user asks to check, audit, update, optimize, or fix CLAUDE.md files
- mentions nested CLAUDE.md, additive loading, ancestor/descendant loading, path-scoped rules, @import chains, CLAUDE.local.md, claudeMdExcludes, or code_map.md
- or says "优化 CLAUDE.md", "审计 CLAUDE.md", "检查嵌套 CLAUDE.md", "Claude Code 项目指导", "生成 code_map (Claude)"
- Make sure to use this skill whenever the user wants to manage Claude Code memory files at any layer, even if they only mention CLAUDE.md without explicit audit wording

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `claude-md-improver` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.0.0` |
| 标签 | `claude-code`, `claude-md`, `repository-guidance`, `memory`, `audit`, `documentation`, `code-map` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill claude-md-improver
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/claude-md-improver/references` | 目录 | 4 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `skills/developer-tools-integrations/claude-md-improver/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/claude-md-improver/SKILL.md`
- `skills/developer-tools-integrations/claude-md-improver`
