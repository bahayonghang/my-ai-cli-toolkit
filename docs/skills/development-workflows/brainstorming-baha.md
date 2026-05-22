# brainstorming-baha

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

当用户想要 brainstorm 一个想法、设计 feature 或 spec 时使用。通过对话探索意图与需求，然后将 spec 文档写入 .brainstorm/ 并 STOP。不会自动接 implementation planning 或任何其他技能。

## 触发场景

- 当用户想要 brainstorm 一个想法、设计 feature 或 spec 时使用。通过对话探索意图与需求，然后将 spec 文档写入 .brainstorm/ 并 STOP。不会自动接 implementation planning 或任何其他技能。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `brainstorming-baha` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `brainstorming`, `design`, `spec`, `discovery` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill brainstorming-baha
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/brainstorming-baha/scripts` | 目录 | 5 | 可执行脚本 |
| `skills/development-workflows/brainstorming-baha/spec-document-reviewer-prompt.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/brainstorming-baha/visual-companion.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| scripts | `skills/development-workflows/brainstorming-baha/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/brainstorming-baha/SKILL.md`
- `skills/development-workflows/brainstorming-baha`
