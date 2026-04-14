# 技能地图 (Skill Map)

扫描当前机器上已安装的技能目录，生成一张按固定展示分组组织的 ASCII 技能地图，方便快速查看“装了什么、能不能触发、分别属于哪一组”。

## 适用场景

- 用户问“我本机装了哪些技能”“列出已安装 skill”“技能地图”
- 需要快速确认某个技能是否已安装、是否可触发、属于什么展示分组
- 需要把技能安装结果整理成可读的总览

不用于：

- 帮用户找“可安装”的 skill
- 查看 registry / catalog
- 做安装推荐

## 工作流程

1. 默认扫描 `~/.claude/skills/*/SKILL.md` 与 `~/.agents/skills/*/SKILL.md`。
2. 读取名称、版本、描述摘要、可触发性、来源分类、展示分组和安装根。
3. 仅基于 `name + desc` 推断展示分组，不直接用 frontmatter `category` 做地图分组。
4. 按固定分组顺序渲染成 ASCII 方框图，并保持分组内名称排序稳定。
5. 直接输出地图与统计信息；调试时才用 `--json`。

## 主要资源

- `scripts/skill-map.mjs`：跨平台 Node CLI
- `~/.claude/skills/`：Claude 本地技能目录
- `~/.agents/skills/`：共享技能目录
- 分组规则与 ASCII 渲染模板

## 关键约束

- 只面向安装后的技能目录，不扫描仓库源码里的技能源文件
- 保留 frontmatter `category` 作为 `source_category`，但不能拿它直接当地图展示分组
- 输出必须保持稳定布局与统计信息
- 没有技能时也要输出完整边框和兜底提示
- 脚本必须可在 Windows、macOS、Linux 三端运行
