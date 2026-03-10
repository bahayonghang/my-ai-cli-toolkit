# 创建技能

## 仓库布局

新增一方技能时，请放在：

```text
content/skills/<category>/<skill-name>/
```

例如：

```text
content/skills/workflow-skills/my-skill/
└── SKILL.md
```

## 推荐目录结构

```text
content/skills/<category>/<skill-name>/
├── SKILL.md
├── references/
├── scripts/
├── assets/
├── docs/
└── tests/
```

只有 `SKILL.md` 是必需的。新增子目录之前，优先复用同类技能已有模式。

## 推荐 frontmatter

`mcs-core` 当前会解析顶层 frontmatter 字段，例如：

- `name`
- `description`
- `category`
- `tags`
- `version`

推荐示例：

```yaml
---
name: my-skill
description: 在 MCS 和 docs 中展示的简短描述。
category: workflow
tags: [planning, automation]
version: 0.1.0
---
```

## 编写建议

- 主体内容保持命令式、面向执行
- 优先使用本地 references / scripts，而不是把长教程直接塞进 `SKILL.md`
- 技能内部路径统一使用 `$SKILL_DIR`
- 明确触发条件和边界

## 验证流程

发布新技能前，至少完成以下步骤：

1. 放入正确的 `content/skills/` 分类目录
2. 确认 `SKILL.md` 可被 MCS 正常读取 metadata
3. 通过 `just mcs` 浏览该技能
4. 在 `docs/skills/<category>/<skill-name>.md` 新增或更新英文页面
5. 在 `docs/zh/skills/...` 新增或更新中文页面

## 补充说明

- 文档站点不会把技能内部所有 reference 文件逐个镜像成页面。重点是文档化“技能本身”，并说明关键支撑资源。
- 如果某个技能只用于本地实验或尚未准备公开展示，不要过早加入公开 docs catalog。
