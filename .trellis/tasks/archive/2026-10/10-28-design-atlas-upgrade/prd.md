# 把 design-md 升级为 design-atlas UI 设计 skill

## Goal

`skills/development-workflows/design-md` 现在只能列出、选择、写入 DESIGN.md 并按它实施。本任务吸收 hallmark（`ref/repo/hallmark`，MIT）的三项能力：

1. 50 套材质主题，与现有 153 个条目去重后并入。
2. 项目没有指定风格时，按项目需求自动选择主题。
3. Anti-AI-slop 门禁：规则、静态检查脚本、豁免记录、新鲜上下文复核。

合并后它是一个完整的 UI 设计 skill，因此改名为 **`design-atlas`**（设计图谱）。

## 命名决定

- 推荐：`design-atlas`。atlas 同时表达“可浏览的目录”和“按需求导航选择”；两段式，与仓库 kebab-case 约定一致；不与 `ui`、`ui-ux-pro-max`、`huashu-design`、`html-artifact` 或 hallmark 的 theme 名冲突。
- 备选：`ui-design-studio`（直白，但 `studio` 与 theme:studio 撞名）、`ui-craft`（短，但与 hallmark `craft.md` 概念混淆）。
- 项目产物文件名仍是 `DESIGN.md`，不随 skill 改名。
- **已确认（2026-10-28，用户）：使用 `design-atlas`。**

## 子任务

| 顺序 | 子任务 | 交付 |
| --- | --- | --- |
| 1 | `10-28-design-atlas-rename` | 目录与所有引用改名，行为不变 |
| 2 | `10-28-design-atlas-themes` | 新增 `theme` 条目类型，去重导入 hallmark 主题 |
| 3 | `10-28-design-atlas-routing` | `signals` / `route` 命令与路由元数据，工作流默认自动选择 |
| 4 | `10-28-design-atlas-anti-slop` | 分级门禁 reference、静态检查脚本、DESIGN.md 豁免、复核提示 |

依赖：2 依赖 1；3 依赖 2（需要 theme 元数据）；4 只依赖 1，但与 2、3 共同修改 `SKILL.md`，最终由父任务统一整合。

## Requirements

- R1 改名：skill 目录、frontmatter `name`、`agents/interface.yaml`、README、evals、tests、docs 生成页、`skills/development-workflows/AGENTS.md`、`.trellis/spec/guides/skill-authoring-conventions.md` 中所有现行引用都指向 `design-atlas`。归档任务与 journal 中的历史记录不改。
- R2 主题导入：50 个 hallmark 主题以 `theme:<slug>` 条目进入目录，每个都有去重结论（`supersede` / `cluster` / `distinct`）及理由。可见条目中不出现材质重复的一对。旧条目 id 保持可 `show` / `apply`，向后兼容。
- R3 自动路由：项目根没有 DESIGN.md，且用户没有点名品牌、风格、主题或场景时，skill 读取项目信号和用户需求，从可路由条目（theme、style、scene；brand 仅在点名时）中确定性地选出 1 个，同时给出 2 个备选和理由，然后继续执行。中文和英文需求都能路由。
- R4 Anti-slop：
  - 一份分级门禁 reference，保留 hallmark gate 编号作为稳定 id。
  - 一个与 token 命名无关的静态检查脚本，能检查 CSS、HTML、JSX/TSX、Vue、Svelte、Astro。
  - 豁免记录写在 DESIGN.md 中。
  - 实施后执行检查和新鲜上下文复核。
  - 提供只出报告的 audit 分支，用于检查已有页面。
- R5 现有能力不退化：`list`、`search`、`show`、`apply`、`--force` 备份、brand boundary、scene 规则、退出码契约、运行页验证都保持不变。
- R6 归属：hallmark MIT 许可证文本放入 `assets/catalog/LICENSES/`。README 与 reference 中写明来源和固定 commit。主题正文改写后不得残留指向未随包提供文件的引用。
- R7 仓库约定：frontmatter 五键齐全；description ≤ 1024 字符且中英触发词齐全；命令一律用 `<skill-dir>` 占位；evals 用 `assertions` schema 且至少 2 条近邻反例；Python 可字节编译；Node 脚本零依赖、Node ≥ 20，并有 `tests/*.mjs`。

## Non-goals

- hallmark 的图片库（`photos.json`）、截图采集、Together AI 生图。
- 渲染层 sloplint（puppeteer 多宽度像素检查）。
- macrostructure 与 anatomy 页面构成库、redesign 的 `--before` / `--kept` 流程。后续可另立任务。
- 跨构建多样性日志。
- 在仓库内存放 50 张预览图。

## Acceptance Criteria

- [ ] 4 个子任务全部完成并归档，各自验收项通过。
- [ ] `skills/development-workflows/design-atlas/` 存在，`design-md/` 不存在；`rg -n "design-md" skills docs .trellis/spec` 只命中有意保留的说明（如“原名 design-md”的迁移说明，以及 DESIGN.md 文件名本身）。
- [ ] `python "<skill-dir>/scripts/design_catalog.py" list` 输出包含 4 个 theme 分类，可见条目数与 `dedup.json` 推算一致。
- [ ] 一个没有 DESIGN.md 的 fixture 项目，配一句中文需求（如“给我们的精酿啤酒厂做官网”），按 SKILL.md 工作流能自动选出 1 个条目并写入 DESIGN.md，无需人工选择。
- [ ] `node "<skill-dir>/scripts/slop_check.mjs" <fixture>` 对 slop fixture 报 FAIL、对干净 fixture 报 0 FAIL；DESIGN.md 中声明的豁免生效。
- [ ] SKILL.md 的 Compact Workflow 明确写出：已有 DESIGN.md、点名条目、自动路由、仅列出、仅审计五条分支各自的入口步骤。
- [ ] `evals/evals.json` 覆盖：自动路由（中文）、点名主题、anti-slop 审计、文字去 AI 味反例（路由到 `write`）、截图复刻反例（路由到 `image-to-ui-skill`）。
- [ ] `just ci` 全绿。
- [ ] Skill IR 导出到 `skills/development-workflows/design-atlas/reports/skill-ir.json`，或在 handoff 中标记 `missing evidence` 并说明原因。

## Notes

- 证据与初判见 `research/hallmark-analysis.md`。
- 技术契约见 `design.md`，执行顺序见 `implement.md`。
