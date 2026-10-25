# design-md 场景目录怎么接

日期：2026-10-25。项目写入位置已在规划中决定：`apply scene:bi --root <项目根>` 写成项目根 `DESIGN.md`，与 brand/style 使用同一契约。已有 `design.md` 时仍由 `--force` 先做时间戳备份。

## 问题

`design-md` 现在只能在 `brand:*` 与 `style:*` 里选择，然后 `apply` 写成项目根 `DESIGN.md` 再实施 UI。需要增加业务场景。第一个场景是 BI。材料是 `ref/design/BI`（单文件，无扩展名）。场景要放进可安装的分类目录。

## 已核对的事实

- 技能根：`skills/development-workflows/design-md/`。版本 `0.1.0`。`SKILL.md` 的 `description` 现为 840 字，校验上限 1024（`.trellis/spec/guides/skill-authoring-conventions.md`）。
- 目录合同：`assets/catalog/index.json` 有 152 条（84 brand、68 style）、18 个分类。运行时只读这份索引和条目文件。`scripts/design_catalog.py` 的 `list/search/show/apply` 都从这里来。
- `apply`（`design_catalog.py` 约第 100–127 行）把条目正文写到 `<root>/DESIGN.md`，加上 provenance 注释。已有任意大小写的 `design.md` 时退出码 3；`--force` 先改名为 `*.bak-YYYYMMDD-HHMMSS`。
- `--kind` 只接受 `brand` 或 `style`（`design_catalog.py` 第 140、148 行）。`print_grouped` 把非 brand 全部算成 style（第 44–46 行）。
- 测试把这些数字写死：`tests/test_design_catalog.py` 的 `test_counts`、`test_list_text_groups_by_category`。`evals/evals.json` 第 1 条也写「18 categories」。
- `ref/` 在 `.gitignore` 第 4 行。`npx skills add` 和 `just install-projects` 只带走 skill 目录。运行时不能读 `ref/design/BI`。
- `ref/design/BI`：12208 字节，416 行，全文 CRLF，无行尾空格，无 YAML frontmatter。标题是「企业级 B 端 Web 工作台 UI/UX 设计规范」。正文是中文编号规范：信息架构四层、布局、色彩/字体/间距表、卡片、图表、表格、交互、无障碍、工程实现、视觉约束、10 步交付。色彩在第 4 节表格，例如 Primary `#635BDB`，不是 stitch frontmatter。
- 现有格式说明（`references/design-md-format.md`）只定义 `stitch`（142）和 `legacy`（10）。legacy 指品牌正文里的 “2. Color Palette & Roles”。BI 对不上这个章节名，但 `format` 仍应标 `legacy`：没有 frontmatter。
- `scripts/build_catalog.py` 会用上游检出重写 `index.json`，并删除 `brands/`、`styles/` 里不在本次输出中的 `*.md`（第 396–402 行）。手改 `index.json` 会在下次重建时丢失。
- 自有条目的现成通道是 `assets/catalog/first-party/manifest.json`。`merge_first_party`（第 251–313 行）接受单个对象或数组；源文件固定读 `first-party/<slug>.md`，再按条目的 `path` 写入。`source` 必须是 `first-party`，不能放进 `index.json` 的 `sources`。依据：`.trellis/spec/guides/skill-authoring-conventions.md` 的 “design-md first-party catalog entries”，以及已归档任务 `.trellis/tasks/archive/2026-10/10-21-airy-glass/`。
- 当前 manifest 是 `style:airy-glass` 的单个对象。测试 `test_first_party_is_kept_and_other_stale_styles_are_removed` 使用临时目录里的单个对象，改成数组不会破坏该测试。
- 重建不会删除 `scenes/` 下的文件，因为清理循环只看 `brands` 和 `styles`。不把场景并进 manifest 的话，索引里的场景条目仍会被整份重写掉。
- 公开说明里的 152 和分类表在 `README.md`。`docs/skills.md` 的摘要来自 frontmatter，要靠 `just docs-sync` 再生，不能手改生成页（`.trellis/spec/backend/quality-guidelines.md`）。

## 参照与取舍

研究范围是这个技能自己的目录合同，加上 airy-glass 的 first-party 合并。没有新建技能，也没有跑外部 skill 目录检索。

| 做法 | 结论 | 理由 |
| --- | --- | --- |
| 沿用 `brand` / `style` / `apply` / first-party manifest | 采用 | 选择、写入、重建、许可注释已经有测试 |
| 把 BI 放进 `categories.json` 的 `style` 列表 | 拒绝 | 重建会把它当成缺失的上游风格并失败 |
| 只改 `styles/bi.md` 和 `index.json` | 拒绝 | 下次 `build_catalog.py` 会删文件并丢掉索引 |
| 新建一个 skill | 拒绝 | 用户要完善现有 `design-md` |
| 运行时直接读 `ref/design/BI` | 拒绝 | `ref/` 不入库，安装包里没有 |
| 本任务把 BI 改写成 stitch YAML | 拒绝 | 用户要求复制原文。改写会丢掉信息架构、图表、表格和交付顺序，或把同一规则写两遍 |
| 场景与品牌各写一份设计源，实施时合并 | 不采用 | 已决定继续只用项目根一份 `DESIGN.md`。同时点名场景和品牌时，先给出候选项并等待选择 |

## 目录结构

场景分类目录放在技能内部，和 `brands/`、`styles/` 并列：

```text
assets/catalog/scenes/analytics/bi.md
assets/catalog/first-party/bi.md
```

两份字节相同。权威源是 `first-party/bi.md`。`scenes/analytics/bi.md` 是索引 `path` 指向的运行时文件，由重建从 first-party 复制。复制时只做目录已有的正规化：CRLF 转 LF，保留正文。

`categories.json` 增加一条，并同步进 `index.json`：

- `id`: `scene-analytics`
- `kind`: `scene`
- `en`: `Analytics and BI`
- `zh`: `分析与 BI`
- `order`: `19`

索引条目：

- `id`: `scene:bi`
- `kind`: `scene`
- `slug`: `bi`
- `name`: `企业级 BI 工作台`
- `category`: `scene-analytics`
- `format`: `legacy`
- `path`: `scenes/analytics/bi.md`
- `source`: `first-party`
- `upstream_path`: `assets/catalog/first-party/bi.md`
- `description`: 一句话写明浅色、高信息密度的企业级 BI / 经营分析工作台，覆盖 KPI、趋势、明细表和待办。检索要能命中「BI」。

`first-party/manifest.json` 改为数组，保留 `style:airy-glass`，追加上述对象。

本任务只建有材料的分类。不提交空的场景文件夹。后续场景继续用 `scenes/<category>/<slug>.md`，并在 manifest 里追加。

## 推荐的代码改动面

1. `design_catalog.py`：`--kind` 增加 `scene`。列表标题分别统计 brand、style、scene。
2. `build_catalog.py`：manifest 数组已经能合并。补一块清理，用 `scenes/**/*.md` 对照本次 `files`，避免摘掉 manifest 后留下孤儿文件。品牌和风格的清理保持原样。
3. `SKILL.md`：选择步骤增加场景。用户说出 BI、经营分析、数据看板、工作台这类业务场景时，先 `search` / `list --kind scene`。`description` 补中英触发词，总长保持在 1024 以内。版本改为 `0.2.0`。
4. `references/implementation.md` 与 `references/design-md-format.md`：说明场景 legacy 的色彩在「视觉设计系统」表格，另外还要遵守信息架构、图表、表格和无障碍各节，以及第 12 节的交付顺序。`design-system-core.md` 的组件状态仍然适用。
5. `references/brand-boundary.md`：`scene:*` 不套用品牌 logo / wordmark 限制。BI 正文本身也没有这些资产。
6. `agents/interface.yaml`、`README.md`、`evals/evals.json`：计数从 152 / 18 改为 153 / 19；增加一条 BI 触发样例。
7. 测试：目录计数、`list` 分组数、`search BI`、`show scene:bi`、`apply` 写入内容与 first-party 注释、重建后场景条目还在且两份 markdown 字节相同、品牌 84 与风格 68 不变。
8. 校验：`python -m unittest` 跑该技能的两个测试模块，然后 `just docs-sync`，结束前 `just ci`。

`apply` 的 provenance 已对 `source == "first-party"` 写成 `source=first-party; license=MIT`，不引用 VoltAgent 或 Bergside 的 commit。场景沿用这句即可。

## 风险

- 场景和品牌都写入同一份项目根 `DESIGN.md`。后一次 `apply --force` 会备份并替换前一次。同时点名两者时要停下来让用户选，不能把两份正文拼进一个文件。
- BI 正文开头是「你是一名设计师」式任务说明。实施时它是设计源，不替换 `SKILL.md` 的步骤。
- legacy 实施指引若只写「从 Color Palette 章节抄 token」，代理会漏掉 BI 第 4 节的表格。
- `description` 只剩约 180 字余量。触发词和旧句子要一起改。
- 场景文件被 `test_assets_are_normalized` 覆盖：禁止 CR，禁止行尾空格。

## 假设（尚未验证）

代理读完这份中文 legacy 规范后，能像读 stitch `DESIGN.md` 一样实施可运行页面。这要等实现后的页面核对，不能当成已经成立。
