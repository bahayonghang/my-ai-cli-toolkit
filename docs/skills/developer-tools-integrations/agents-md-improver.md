# agents-md-improver

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and improve Codex AGENTS.md guidance files and companion code_map.md navigation maps in repositories.

## 触发场景

- the user asks to check, audit, update, optimize, or fix AGENTS.md files
- asks for Codex project guidance maintenance
- mentions nested AGENTS.md conflicts, code maps, stale commands, scoped instructions, sandbox or approval boundaries
- or says "优化 AGENTS.md", "审计 AGENTS.md", "检查 nested AGENTS.md", "更新 Codex 项目指导", or "生成 code_map.md"

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `agents-md-improver` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.0.0` |
| 标签 | `codex`, `agents-md`, `repository-guidance`, `codex-cli`, `codex-app`, `audit`, `documentation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill agents-md-improver
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/agents-md-improver/references` | 目录 | 3 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `skills/developer-tools-integrations/agents-md-improver/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/agents-md-improver/SKILL.md`
- `skills/developer-tools-integrations/agents-md-improver`
