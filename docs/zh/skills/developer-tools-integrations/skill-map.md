# 技能地图 (Skill Map)

检测当前 CLI，并解析该平台对应的 installed-skills 根目录，生成一张按固定展示分组组织的 ASCII 技能地图，方便快速查看“装了什么、能不能触发、分别属于哪一组”。

## 适用场景

- 用户问“我本机装了哪些技能”“列出已安装 skill”“技能地图”
- 需要快速确认某个技能是否已安装、是否可触发、属于什么展示分组
- 需要把技能安装结果整理成可读的总览
- 需要检查本地 skill 是否重复、是否值得合并

不用于：

- 帮用户找“可安装”的 skill
- 查看 registry / catalog
- 做安装推荐

## 工作流程

1. 先检测当前 CLI，并解析该平台对应的 installed-skills 根目录。
2. 若检测失败，则兜底到共享安装根（通常是 `~/.agents/skills`）。
3. 读取每个 skill 实例的稳定 id、名称、版本、描述摘要、可触发性、来源分类、展示分组和安装根。
4. 同名 skill 若来自不同根目录，扫描阶段不折叠，保留为独立实例。
5. 仅基于 `name + desc` 的 token-aware 规则推断展示分组，不直接用 frontmatter `category` 做地图分组。
6. 按固定分组顺序渲染成 ASCII 方框图，并保持分组内名称排序稳定。
7. 直接输出地图与统计信息；调试时才用 `--json`。

## 主要资源

- `scripts/skill-map.mjs`：跨平台 Node CLI
- `scripts/lib/platforms.mjs`：平台检测与 skills 根目录解析
- `scripts/lib/similarity.mjs`：相似度分析逻辑
- 分组规则与 ASCII 渲染模板

## 关键约束

- 只面向安装后的技能目录，不扫描仓库源码里的技能源文件
- 保留 frontmatter `category` 作为 `source_category`，但不能拿它直接当地图展示分组
- 默认地图不纳入 builtin/system roots（例如 `~/.codex/skills`）
- 输出必须保持稳定布局与统计信息
- 同名 skill 跨根目录共存时不能在扫描阶段被吞掉
- 没有技能时也要输出完整边框和兜底提示
- 脚本必须可在 Windows、macOS、Linux 三端运行

## 补充说明

- 支持 `--platform` 显式指定平台，支持 `--root` 做调试覆盖。
- `--analyze` / `--min-score` 只生成相似度建议，不做删除、不做移动。
