# agent-skill-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Review Codex, Claude, OpenAI, or other agent skill directories as reusable capability packages.

## 触发场景

- asked to audit, review, improve, score, rewrite, debrand, package, or document a SKILL.md, skill package, marketplace skill, or agent skill directory, especially when the user wants a comprehensive findings-first report with concrete patch recommendations and validation steps

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `agent-skill-review` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.0.0` |
| 标签 | `skills`, `review`, `agents`, `codex`, `documentation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill agent-skill-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/agent-skill-review/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/agent-skill-review/LICENSE` | 文件 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/agent-skill-review/README.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/agent-skill-review/agents` | 配套 agent |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/agent-skill-review/SKILL.md`
- `skills/developer-tools-integrations/agent-skill-review`
