# implementation-notes

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding.

## 触发场景

- implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding
- Maintain a live implementation-notes.md alongside the work capturing design decisions (choices made where the spec was ambiguous), intentional deviations from the spec, alternatives considered and rejection criteria, and open questions for human review
- Use proactively the moment implementation of a written spec begins, before the first edit
- Triggers include 实施记录, 实现笔记, 决策日志, 边写边记, 按这个 spec 实现, 按这个计划做, implementation log, decision log, spec divergence, implement this plan

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `implementation-notes` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `implementation`, `decision-log`, `spec`, `documentation`, `review` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill implementation-notes
```

## 目录内容

未检测到 `SKILL.md` 以外的顶层资源。

## 脚本、引用与测试资源

未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/development-workflows/implementation-notes/SKILL.md`
- `content/skills/development-workflows/implementation-notes`
