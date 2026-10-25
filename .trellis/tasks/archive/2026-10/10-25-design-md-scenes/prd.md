# 为 design-md 增加场景设计

## Goal

让 `design-md` 除了品牌和通用风格之外，还能按业务场景选择设计，并把选中的场景规范写成项目根 `DESIGN.md`，再按它实施 UI。第一个场景是 BI。

## Background

- 技能在 `skills/development-workflows/design-md/`，版本 `0.1.0`。选择面只有 `brand:*` 与 `style:*`，共 152 条、18 类。`scripts/design_catalog.py` 的 `apply` 把选中条目写成 `<root>/DESIGN.md`。
- `ref/design/BI` 是一份 416 行的中文企业级工作台规范，无 YAML frontmatter，文件为 CRLF。`.gitignore` 忽略 `ref/`，安装后的技能不能读取它。
- `scripts/build_catalog.py` 会重写 `index.json`，并删除 `brands/`、`styles/` 中的多余文件。自有条目要走 `assets/catalog/first-party/manifest.json`。已归档任务 `10-21-airy-glass` 用的就是这条通道。场景 slug 不能写进 `categories.json` 的上游 `style` 映射。
- 目录合同、正规化规则和重建风险见 `research/scene-catalog-fit.md`。

## Requirements

- 在现有 `design-md` 上增加种类 `scene`。本任务不新建技能。
- 建立 `assets/catalog/scenes/analytics/`，放入条目 `scene:bi`。分类 id 为 `scene-analytics`，中文名「分析与 BI」，英文名 `Analytics and BI`。
- 把 `ref/design/BI` 复制为场景正文。只把 CRLF 正规化为 LF。不改写成 stitch frontmatter。
- `first-party/bi.md` 与 `scenes/analytics/bi.md` 字节相同。运行时只读技能目录内的文件。
- `apply scene:bi --root <项目根>` 写成 `<root>/DESIGN.md`，provenance 为 `source=first-party`。已有任意大小写的 `design.md` 时，无 `--force` 仍退出码 3；有 `--force` 时先做时间戳备份。
- 用户同时点名一个场景和一个品牌或风格时，列出这些候选项并等待选择。不把两份正文合并进同一个 `DESIGN.md`。
- `scene:bi` 的名称或描述要让 `search` 命中 `BI`、`经营分析`、`数据看板`。
- 品牌保持 84 条，风格保持 68 条。现有 `brand:*` / `style:*` 的 `apply` 行为不变。
- 下次 `build_catalog.py` 仍保留 `scene:bi` 和 `style:airy-glass`。不在本次输出中的 `scenes/**/*.md` 要被清掉。
- 更新 `SKILL.md`、`agents/interface.yaml`、`README.md`、`evals/evals.json` 和生成的文档站摘要。`description` 不超过 1024 字。版本升到 `0.2.0`。
- 实施 UI 时，场景正文是设计源。色彩取自「视觉设计系统」表格，并遵守信息架构、图表、表格、无障碍和交付顺序。组件状态仍按 `references/design-system-core.md`。`scene:*` 不套用品牌 logo 限制。

## Acceptance Criteria

- [ ] `assets/catalog/scenes/analytics/bi.md` 与正规化后的 `ref/design/BI` 一致，且与 `assets/catalog/first-party/bi.md` 字节相同。
- [ ] `design_catalog.py search BI`、`search 经营分析`、`search 数据看板` 的结果都包含 `scene:bi`。
- [ ] `list` 出现「分析与 BI / Analytics and BI」，总条数 153，分类数 19，其中 brand 84、style 68、scene 1。
- [ ] `show scene:bi` 打出 BI 规范正文。
- [ ] 在临时目录执行 `apply scene:bi` 生成 `DESIGN.md`，内容含 BI 标题和 `source=first-party` 注释。目标处已有 `design.md` 时，无 `--force` 退出码为 3，有 `--force` 时留下时间戳备份。
- [ ] 重建测试证明 manifest 数组里的 `scene:bi` 进入新索引，孤儿 `scenes/**/*.md` 被删除，`style:airy-glass` 仍在。
- [ ] `tests/test_design_catalog.py` 与 `tests/test_build_catalog.py` 通过。frontmatter 变更后已运行 `just docs-sync`，结束前 `just ci` 通过。

## Out of Scope

- 没有源文件的空场景分类。
- 把 BI 改写成另一套配色或 stitch token 文件。
- 改 `style:ant`、`style:enterprise` 或其他品牌、风格正文。
- 场景与品牌各写一份设计源，或在实施时合并两份正文。
- 在本仓库根目录生成项目用的 `DESIGN.md`。
- 发布到 GitHub，或改安装器的目标映射。
