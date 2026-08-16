# Research: K-Dense scientific-visualization skill

- **Query**: 分析 K-Dense-AI/claude-scientific-skills 的 scientific-visualization skill，对照现有 academic-figure 的 journal-specs 与 qa-checklist 列出增量
- **Scope**: internal（本地 shallow clone，仅 `skills/scientific-visualization/` 子目录）
- **Date**: 2026-08-16
- **本地路径**: `ref/repo/plot_ref/claude-scientific-skills/skills/scientific-visualization/`

仓库总体积 491 MB，含 100+ 个科研 skill；本记录只覆盖 scientific-visualization 子目录（236 KB）。

## 1. 子目录结构概览

| 路径                                                | 行数  | 内容                                                                                                                         |
| --------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| `SKILL.md`                                          | 286   | 入口；frontmatter 含 `name`/`description`/`license`/`compatibility`/`allowed-tools`/`metadata.version: "1.1"`/`skill-author` |
| `references/publication_guidelines.md`              | 196   | 数据完整性、误导性编码、可及性、静态与交互输出                                                                               |
| `references/journal_requirements.md`                | 169   | 8 家出版方的分阶段规格快照                                                                                                   |
| `references/color_palettes.md`                      | 227   | 调色板语义、精确色值、WCAG 对比度、灰度注意事项、色彩管理                                                                    |
| `references/matplotlib_examples.md`                 | 336   | matplotlib / seaborn / plotly 可运行范式                                                                                     |
| `references/sources.md`                             | 76    | 官方 URL、访问日期、版本快照                                                                                                 |
| `scripts/figure_export.py`                          | 642   | 导出与溯源清单                                                                                                               |
| `scripts/export_plan.py`                            | 493   | 出版方导出计划与文件筛查                                                                                                     |
| `scripts/image_metadata.py`                         | 731   | 栅格/矢量文件元数据检查                                                                                                      |
| `scripts/palette_audit.py`                          | 327   | 对比度与灰度分离审计                                                                                                         |
| `scripts/style_presets.py`                          | 501   | style preset 机制与 CLI                                                                                                      |
| `scripts/style_preview.py`                          | 232   | style 预览图生成                                                                                                             |
| `scripts/_common.py`                                | 136   | 共用工具                                                                                                                     |
| `assets/publisher_profiles.json`                    | 269   | 机器可读出版方快照                                                                                                           |
| `assets/{publication,nature,presentation}.mplstyle` | 68–77 | 三个 mplstyle 起点                                                                                                           |
| `assets/color_palettes.py`                          | 263   | Okabe-Ito、Paul Tol 色值与元数据                                                                                             |
| 测试                                                | —     | `tests/scientific-visualization/test_scripts.py`（在仓库根 `tests/` 下）                                                     |

## 2. 核心能力与工作流

SKILL.md 的六步工作流：定义证据与投稿目标 → 选择诚实编码 → 前置设计可及性 →
用作用域受限的 style 实现 → 显式导出并记录溯源 → 检查、比对与复核。

**不可协商约束（SKILL.md「Non-negotiable guardrails」）**：不修改或选择性增强数据；
保留原始表格/图像、排除项、缺失值编码、分析代码、归一化、分箱、图像调整与随机种子；
不推断期刊要求，必须确认具体期刊、文章类型、图类型与投稿阶段并核对官方现行说明；
不声称某调色板、DPI、格式或自动报告使图达到可及性或期刊合规。

**style preset 机制**（`scripts/style_presets.py`）：`BASE_STYLE` 加
`STYLE_OVERRIDES`（`default`、`nature`、`science`、`cell`、`minimal`、`presentation`）；
`get_style()` 返回纯 rcParams 字典且不修改全局；`style_context()` 提供临时上下文；
`set_color_palette()`、`apply_publication_style()`、`configure_for_journal()`、
`create_style_template()` 写出 `.mplstyle`、`figure_size_for_profile()` 由 profile 算尺寸。
`nature`/`science`/`cell` 三个 style 各带 `STYLE_NOTICES` 声明，写明是「起点」而非合规声明。
调色板资产提供 `okabe_ito`、`okabe_ito_on_white`、`wong`、`tol_bright`、
`tol_high_contrast`、`tol_vibrant`、`tol_muted`、`tol_medium_contrast`、`tol_pale`、
`tol_dark`、`tol_light`，以及 `SEQUENTIAL_COLORMAPS`、`DIVERGING_COLORMAP_CANDIDATES`
（`RdBu_r`/`PuOr`/`BrBG`）、`DIVERGING_COLORMAPS_AVOID`（`RdYlGn`）、
荧光色 `FLUOROPHORES_TRADITIONAL` 与 `FLUOROPHORES_ACCESSIBLE`。

**出版方 profile**（`assets/publisher_profiles.json`）：顶层含 `schema_version`、
`accessed`、`notice`、`profiles`；覆盖 `nature`、`science`、`cell`、`plos`、
`elsevier`、`ieee`、`bmc`、`acs`。每个 profile 字段：`label`、`scope`、`phase`、
`journal_specific`、`sources`（官方 URL 列表）、`widths_mm`（如 nature 的
`single 89 / one-and-half-min 120 / one-and-half-max 136 / full 183`）、
`max_height_mm`、`formats`（按 line-art / photo / combination 分列）、
`raster_dpi`（按图类型给 min/max，可为 null）、`color_modes`、
`preferred_color_mode`、`max_file_bytes`、`notes`。PLOS 另有
`width_range_px_at_300_dpi` 与 `max_height_px_at_300_dpi`。

**程序化检查**：

- `scripts/export_plan.py --publisher <p> --figure-type <line-art|photo|combination>
--width <single|full> --phase <initial|final>` 生成计划；加 `--input figure.pdf`
  对文件做机器可读筛查。检查项标识：`format`、`effective_raster_dpi`、
  `final_width_mm`、`final_height_mm`、`pixel_width_snapshot`、`file_size`、
  `color_mode`、`transparency`；结论状态为 `pass` / `fail` / `review` / `unknown`。
- `scripts/image_metadata.py <file>` 支持栅格（Pillow）、SVG、PDF（pypdf）、EPS/PS；
  报告尺寸、DPI/有效 DPI、色彩模式、alpha、ICC 存在性、压缩、页面尺寸与 PDF 首页字体资源；
  阈值参数含 `--min-dpi`/`--max-dpi`/`--target-width-mm`/`--format`/`--mode`/
  `--alpha-policy`/`--min-width-px`/`--max-file-bytes`/`--output`。
- `scripts/palette_audit.py --palette <name> --background <hex> --role <graphical>`
  给出 WCAG sRGB 对比度与成对 CIE L\* 灰度筛查；文档标注灰度阈值是启发式而非标准。
- `scripts/figure_export.py` 的 `export_figure()` 接受 `provenance` 字典与
  `write_manifest=True`；拒绝隐式覆盖、原子写入、保留矢量内嵌栅格 DPI、TIFF 用 LZW、
  可用 PDF/PS Type 42。另有 `check_figure_size()`、`save_for_journal()`、
  `verify_font_embedding()`。

## 3. 与现有 academic-figure skill 的重叠与差异

| 维度         | K-Dense scientific-visualization                                  | academic-figure v1.0.0                                          |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| 期刊规格载体 | `assets/publisher_profiles.json`（机器可读，8 家）                | `references/journal-specs.md`（Markdown 表格，人读）            |
| 投稿阶段维度 | 有：`phase` 字段区分 initial / revised / final production         | 无阶段维度                                                      |
| 图类型细分   | line-art / photo / combination 分别给格式与 DPI                   | `journal-specs.md` 的 Elsevier 卡片已有三类 DPI，其余期刊未统一 |
| 合规检查     | 命令行程序化检查（尺寸、DPI、格式、色彩模式、透明度、文件大小）   | `references/qa-checklist.md` 为人工逐项核对                     |
| 数据完整性   | 独立的不可协商约束章节（基线、缺失值、对数轴、双轴、图像处理）    | `qa-checklist.md` 有统计图例最小集，无误导性编码专章            |
| style 机制   | 代码化 preset + 临时上下文 + `.mplstyle` 资产                     | `references/matplotlib-recipes.md` 的代码片段                   |
| 溯源         | `export_figure(provenance=..., write_manifest=True)` 产出清单文件 | 「源数据可追溯」为 checklist 条目，无产物格式                   |
| 可及性审计   | WCAG 对比度 + CIE L\* 灰度数值化                                  | 「无彩虹色图、灰度可读」定性条目                                |
| 依赖管理     | 带日期的直接依赖 pin 快照（uv 运行）                              | 未固定版本                                                      |

重叠：矢量优先、`pdf.fonttype=42`、`svg.fonttype="none"`、色盲安全、按最终尺寸检查文字大小。

## 4. 建议吸收点

| 优先级 | 吸收内容                                                                                                                   | 建议落点                                                                | 说明                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 高     | 投稿阶段维度（initial / revised / final）与「不推断期刊要求、需核对官方现行说明」的约束                                    | `references/journal-specs.md` 开头 + `references/modes/journal-spec.md` | 现有卡片缺少阶段区分                                               |
| 高     | 图类型（line-art / photo / combination）× DPI × 格式的三维对照                                                             | `references/journal-specs.md` 各期刊卡片补列                            | 需按现有卡片的来源标注方式补证据                                   |
| 高     | 导出后程序化检查清单：格式、有效 DPI、最终宽高 mm、色彩模式、透明度、文件大小；结论用 pass/fail/review/unknown 四态        | `references/qa-checklist.md` 新增「导出后机器检查」小节                 | 可只写检查项与判定口径，不搬运脚本                                 |
| 中     | 误导性编码专章条目（基线与零点、不确定度定义、缺失/删失/排除区分、面积体积编码、对数轴、分箱平滑、归一化、双轴、图像调整） | `references/figure-contract.md` 或 `qa-checklist.md` 新增小节           | 与 SciPilot 的 P1–P18 拦截清单存在重叠，需去重                     |
| 中     | 溯源清单字段（raw_data、transformations、uncertainty、missing_data）                                                       | `references/qa-checklist.md` 的统计图例最小集旁                         | 现有 checklist 已有统计最小集，可并列扩展                          |
| 中     | style preset 机制的思想：临时 style 上下文、不修改全局 rcParams、`layout="constrained"` 与 `bbox_inches="tight"` 的取舍    | `references/matplotlib-recipes.md`                                      | 「精确物理尺寸时不要用 `bbox_inches="tight"`」是现有文档缺失的要点 |
| 中     | 可及性数值口径：WCAG 2.2 的 4.5:1 / 3:1 / 图形对象 3:1；灰度分离用 CIE L\* 且标注为启发式                                  | `references/qa-checklist.md` 的色彩可及性行                             | 把定性条目改为可核对口径                                           |
| 低     | Okabe-Ito / Paul Tol 精确色值与 `RdYlGn` 避免项                                                                            | `references/chart-recipes.md` 或调色板小节                              | 色值为公开学术调色板，非该仓库独创                                 |
| 低     | Kaleido 1.3.0 需要 Chrome/Chromium、EPS 仅 v0 支持、`scale=3` 不等于 300 DPI                                               | `references/plotly-recipes.md`                                          | 现有 plotly 文档已提到 kaleido v1 丢弃 EPS，需差异校对             |
| 低     | 带日期的依赖 pin 快照写法                                                                                                  | skill 文档的环境说明                                                    | 本仓库无 uv 约定，属可选                                           |

不建议吸收：`scripts/*.py`（六个脚本共 3062 行，含 CLI 与文件 IO，超出本 skill 的脚本定位）、
`assets/publisher_profiles.json`（与现有 Markdown 卡片重复，两套数据源需同步维护）、
`assets/*.mplstyle`（可在文档中说明机制，不必 vendor 文件）。若后续确需程序化检查，
以「集成指引」形式引用上游脚本，比复制维护更可控。

## 5. 许可证与出处标注要求

- 许可证：MIT，`LICENSE.md`，Copyright (c) 2025 K-Dense Inc.；skill frontmatter 亦写
  `license: MIT`、`skill-author: K-Dense Inc.`。
- 插件元数据 `plugin.json`：`name: scientific-agent-skills`、`version: 2.63.0`、
  作者 K-Dense Inc.（https://k-dense.ai），仓库标注为 K-Dense-AI/scientific-agent-skills。
- 吸收其文字或清单结构时，需注明来源仓库 `K-Dense-AI/claude-scientific-skills` 的
  `skills/scientific-visualization`、MIT 许可证与快照日期。
- 其 `references/sources.md` 记录官方来源 URL 与访问日期 2026-07-23；若引用其中的
  出版方数值，出处应指向官方 URL 而非本仓库，并保留「日期快照，非合规判定」的声明。

## 6. 依赖、安装方式与体积注意事项

- 运行要求（frontmatter `compatibility`）：Python 3.11+ 与 uv；脚本无网络访问，
  按需加载 matplotlib、Pillow 或 pypdf；plotly 静态导出用 Kaleido v1 时需要兼容的
  Chrome/Chromium。
- pin 快照（`SKILL.md`「Pinned snapshot」，日期 2026-07-23）：matplotlib 3.11.1、
  seaborn 0.13.2、plotly 6.9.0、kaleido 1.3.0、pillow 12.3.0、pypdf 6.14.2；
  文档说明这是直接依赖快照，不是传递依赖锁。
- 体积：仓库总 491 MB，本子目录仅 236 KB。若采用文档级吸收，无体积负担。
- Windows 注意：脚本用 `uv run --isolated --no-project` 调用；本仓库既有约定为
  `PYTHONUTF8=1`，两者的运行方式不同，集成时需明确采用哪一种。

## Caveats / Not Found

- 未执行任何脚本，`export_plan.py` 与 `image_metadata.py` 的实际输出未验证。
- 未阅读 `references/matplotlib_examples.md`、`references/publication_guidelines.md`、
  `references/color_palettes.md` 的正文全文，仅按标题结构与 SKILL.md 引用做的归纳；
  若要逐条搬运具体数值，需回读原文。
- `tests/scientific-visualization/test_scripts.py` 的覆盖范围未查看。
- 未核对 `publisher_profiles.json` 中各期刊数值与现有 `journal-specs.md` 的差异，
  两份数据存在冲突时以哪一份为准，尚未判定。
