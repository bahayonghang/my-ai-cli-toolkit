# antigravity-companion

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Coordinate Antigravity companion workflows for staged review, focused task execution, follow-up analysis, and clear continuation boundaries.

## 触发场景

- the user explicitly wants an Antigravity-native companion process, wants help deciding how Antigravity should review versus implement, or needs a structured Antigravity workflow instead of ad-hoc shell usage
- Prefer this whenever the task is specifically about operating Antigravity as a companion rather than a single one-off command

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `antigravity-companion` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `antigravity`, `companion`, `workflow-orchestration`, `review-first`, `follow-up-analysis` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill antigravity-companion
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/developer-tools-integrations/antigravity-companion/README.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/developer-tools-integrations/antigravity-companion/SKILL.md`
- `content/skills/developer-tools-integrations/antigravity-companion`
