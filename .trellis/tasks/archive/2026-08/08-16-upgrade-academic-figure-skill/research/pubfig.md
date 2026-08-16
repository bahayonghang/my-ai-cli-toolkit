# Research: pubfig（Galaxy-Dawn/pubfig）

- **Query**: 分析 pubfig 的公开 API、agent-first JSON CLI 与作为可选绘图后端的集成指引写法
- **Scope**: internal（本地 shallow clone，静态阅读）
- **Date**: 2026-08-16
- **本地路径**: `ref/repo/plot_ref/pubfig/`

## 1. 仓库结构概览

| 路径                                                      | 内容                                                                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md` / `README.zh-CN.md`                           | 580 / 573 行，中英双语；含快速上手、CLI 契约、绘图函数族表、主题与调色板说明                                                                                                      |
| `pyproject.toml`                                          | 包名 `pubfig`，MIT，`requires-python >= 3.10`，入口 `pubfig = "pubfig.cli:main"`                                                                                                  |
| `src/pubfig/__init__.py`                                  | 公开 API 汇总（`__all__`）                                                                                                                                                        |
| `src/pubfig/plots/*.py`                                   | 绘图函数族实现，按 bar / distribution / line / scatter / heatmap / dimreduction / evaluation / flow / polar / radar / comparison / composition / diagnostics / specialized 分文件 |
| `src/pubfig/plot_registry.py`                             | `PLOT_REGISTRY` 字典，`list_plot_kinds()` / `get_plot_callable()`，供 CLI 使用                                                                                                    |
| `src/pubfig/render_spec.py`                               | JSON spec 的加载、校验与执行                                                                                                                                                      |
| `src/pubfig/cli.py`                                       | CLI 主入口，含 `render` / `validate-spec` / `list-kinds` / `figma` 子命令                                                                                                         |
| `src/pubfig/export/io.py`                                 | `save_figure` / `batch_export`                                                                                                                                                    |
| `src/pubfig/export/panels.py`                             | `export_panel` / `export_panels`                                                                                                                                                  |
| `src/pubfig/specs.py`                                     | `FigureSpec` 数据类与毫米/英寸/像素换算                                                                                                                                           |
| `src/pubfig/themes/{base,default,nature,science,cell}.py` | 四个内置主题                                                                                                                                                                      |
| `src/pubfig/colors/{palettes,plotly_palettes,utils}.py`   | 调色板与色彩工具                                                                                                                                                                  |
| `src/pubfig/stats/annotations.py`                         | 显著性标注                                                                                                                                                                        |
| `src/pubfig/figma/`                                       | Figma bridge 客户端/服务端/bundle                                                                                                                                                 |
| `figma-plugin/pubfig-sync/`                               | Figma 插件（`manifest.json` / `code.js` / `ui.html`）                                                                                                                             |
| `examples/`                                               | 可运行示例脚本与 PNG 展示图                                                                                                                                                       |
| `docs/palette-gallery.md` / `.zh-CN.md`                   | 调色板画廊                                                                                                                                                                        |
| `LICENSE`                                                 | MIT                                                                                                                                                                               |

## 2. 核心能力与工作流

**Python API**：`pf.<plot_kind>(...)` 返回标准 matplotlib `Figure`，再用
`pf.save_figure(fig, "figure1.pdf", spec="nature", width="single")` 导出。

`save_figure` 签名（`src/pubfig/export/io.py:380`）：
`save_figure(fig, base_path, *, spec="nature", width="single", height_mm=None,
aspect_ratio=None, raster_dpi=None, vector_formats=("pdf","svg"),
raster_formats=("png",), transparent=None, trim=True, svg_fonttype="none")`。
当前版本要求显式文件后缀（`.pdf` / `.svg` / `.png` / `.jpg`）；传入非默认的
`vector_formats` / `raster_formats` 会抛 `ValueError`，多格式导出改用
`batch_export(fig, "figure1", formats=("pdf","svg","png","jpg"))`。README 记录
0.2.3 起 `batch_export` 与 `save_figure` 走同一条「先按出版尺寸调整、重跑布局、再写各格式」路径。

**FigureSpec**（`src/pubfig/specs.py`）：字段 `name`、`font_family`、`design_dpi=96`、
`single_column_mm=89.0`、`double_column_mm=183.0`、`default_raster_dpi=600`、
`background_color="#FFFFFF"`。内置三个：`nature`（Arial）、`science`（Helvetica）、
`cell`（Arial）。`width` 接受 `"single"` / `"double"` / 数值毫米 / `"120mm"` 字符串。
主题（`themes/__init__.py:17-20`）为 `default`、`nature`、`science`、`cell`，
用 `pf.set_default_theme("science")` 切换。

**绘图函数族**：`PLOT_REGISTRY` 覆盖 41 个 kind。README 分组：
类别与统计（`bar`、`bar_scatter`、`stacked_bar`、`paired`、`dumbbell`、`forest_plot`）、
构成与极坐标（`grouped_scatter`、`donut`、`stacked_ratio_barh`、`radial_hierarchy`、
`circular_stacked_bar`、`circular_grouped_bar`）、分布（`box`、`violin`、`strip`、
`raincloud`、`density`、`histogram`、`ridgeline`）、趋势与关系（`line`、`area`、
`scatter`、`bubble`、`contour2d`、`hexbin`、`radar`）、矩阵与嵌入（`heatmap`、
`corr_matrix`、`clustermap`、`dimreduce`、`pca_biplot`、`parallel_coordinates`）、
评估与流向（`roc`、`pr_curve`、`volcano`、`sankey`），以及诊断族
（`ecdf`、`qq`、`bland_altman`、`calibration`、`upset`）。

**agent-first JSON CLI**：

```bash
pubfig render figure.spec.json      # 读一个 JSON spec，写出图或面板
pubfig validate-spec figure.spec.json  # 解析同一个 spec、构图并校验，不写文件
pubfig list-kinds                    # 打印支持的 plot kind
```

spec 契约（`src/pubfig/render_spec.py:23-60`）：`schema_version: 1`；顶层键限定为
`schema_version` / `plot` / `panels` / `export`；`plot` 键限定 `kind` / `kwargs`；
`panels` 元素键限定 `panel_id` / `kind` / `kwargs`；数据可内联写在 JSON 中，也可用
`{"$load": "data/a.npy"}` 引用外部文件（CSV 支持 `delimiter` / `skip_header`，
NPZ 支持 `key`）。`export.mode` 三选一：`save_figure`（键：`path`、`spec`、`width`、
`height_mm`、`aspect_ratio`、`raster_dpi`、`transparent`、`trim`、`svg_fonttype`）、
`batch_export`（`base_path`、`formats`、`dpi` 等）、`export_panels`（`output_dir`、
`format`、`index_file`、`include_title` 等）。README 说明 CLI 是 Python 同一套函数的薄封装，
并称已在本地核对 CLI 与 Python 的 PNG 输出一致。

**面板与 Figma 工作流**：`export_panels(panels, "panels", overwrite=True)` 默认导出
无标题的干净面板资产（`a.svg`、`b.svg`、`panel-index.json`），再用
`pubfig figma push <panel_dir> --figure-id <id>` 推送到 Figma 插件 `pubfig-sync`；
另有 `figma package|validate|inspect|bridge|sync|watch` 子命令与
`.pubfig-figma.json` 手工回退路径。

## 3. 与现有 academic-figure skill 的重叠与差异

| 维度         | pubfig                                                                                                         | academic-figure v1.0.0                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 形态         | PyPI 库 + CLI                                                                                                  | 文档型 skill + 少量示例脚本                                                                           |
| 绘图         | 41 个函数族的统一 API，返回 matplotlib Figure                                                                  | 逐图手写 matplotlib 代码，按 `chart-recipes.md` / `matplotlib-recipes.md`                             |
| 期刊导出     | `FigureSpec` 三档（nature/science/cell），单栏 89 mm、双栏 183 mm、默认栅格 600 dpi                            | `references/journal-specs.md` 覆盖 IEEE / Elsevier / Nature 等，含字体、格式、DPI、色彩模式与出处标注 |
| 期刊覆盖面   | 3 个 spec，不含 IEEE / Elsevier / 中文学位论文                                                                 | 覆盖更广，含中文学位论文样式                                                                          |
| 自动化接口   | JSON spec + 三个 CLI 命令，可校验后再渲染                                                                      | 无结构化输入契约                                                                                      |
| 多面板       | `export_panels` + Figma 插件组装                                                                               | 无面板资产导出机制                                                                                    |
| 调色板       | `DEFAULT` / `NATURE` / `SCIENCE` / `LANCET` / `JAMA`，README 明确标注为 ggsci 衍生的社区调色板、非期刊官方规范 | 以色盲安全为约束，无期刊命名调色板                                                                    |
| 已有集成先例 | —                                                                                                              | `references/industrytslib-integration.md`（检测条件 + 两条路径 + 家族映射表 + 环境变量 + 注意事项）   |

重叠点：矢量优先、单双栏毫米宽度、`svg_fonttype="none"`。差异：pubfig 提供实现，
现有 skill 提供规格与审计口径；pubfig 的三个 spec 不能覆盖现有 skill 的期刊面。

## 4. 建议吸收点

| 优先级 | 吸收内容                                                                                                                                       | 建议落点                                                                                    | 说明                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 高     | pubfig 作为可选绘图后端的集成指引：检测条件、`pip install pubfig`、最小示例、`save_figure` / `batch_export` 参数、FigureSpec 三档与 width 取值 | 新增 `references/pubfig-integration.md`，结构参照 `references/industrytslib-integration.md` | PRD 第 4 条明确要求以集成指引接入                |
| 高     | 「函数族命中 → 调 pubfig；未命中 → 原生 matplotlib」的两路径判定，与 industrytslib 指引同构                                                    | 同上文档                                                                                    | 41 个 kind 的命中表可直接由 `PLOT_REGISTRY` 列出 |
| 高     | 期刊覆盖差异声明：pubfig 只有 nature/science/cell 三档，IEEE / Elsevier / 中文学位论文需回落到现有 `journal-specs.md` 的数值                   | 同上文档的注意事项小节                                                                      | 避免用 pubfig 默认值冒充 IEEE 规格               |
| 中     | agent-first JSON spec 契约（`schema_version`、顶层键、`$load`、三种 export mode），以及「先 `validate-spec` 再 `render`」的顺序                | 同上文档                                                                                    | 对无人值守的 agent 会话有用                      |
| 中     | 调色板出处声明：`NATURE` / `SCIENCE` / `LANCET` / `JAMA` 是 ggsci 衍生的社区调色板，不是出版方强制色彩规范                                     | 同上文档的注意事项                                                                          | 属事实性澄清，防止误用                           |
| 中     | `save_figure` 拒绝旧的 `vector_formats` / `raster_formats` 参数、要求显式后缀                                                                  | 同上文档                                                                                    | 版本行为差异，写错会抛 `ValueError`              |
| 低     | 面板资产导出（`export_panels` 默认无标题）与 `panel-index.json` 的思想                                                                         | 多面板组图相关文档                                                                          | 与 nature-skills 的多 Panel 规划可能重叠，需去重 |
| 低     | 诊断族图型清单（ECDF / QQ / Bland-Altman / Calibration / UpSet / forest_plot / volcano）                                                       | 图型选择对照表                                                                              | 补充现有 `chart-recipes.md` 未覆盖的图型名       |

不建议吸收：`figma-plugin/`、`src/pubfig/figma/`（依赖 Figma Desktop 与本地 bridge 服务，
超出绘图 skill 范围）、`examples/` 的 PNG 资产（体积）、逐函数参数文档
（README 建议用 `help(pf.bar_scatter)` 查询，写进 skill 会有版本漂移风险）。

## 5. 许可证与出处标注要求

- 许可证：MIT，根目录 `LICENSE`；`pyproject.toml` 声明 `license = "MIT"`。
- 引用其 API、CLI 契约与参数时，需注明来源仓库 `Galaxy-Dawn/pubfig`、MIT 许可证与所依据的版本
  （当前 `src/pubfig/_version.py` 为 `0.3.0`）。
- 调色板出处：README 记录 `NATURE` / `SCIENCE` / `LANCET` / `JAMA` 源自 ggsci 的
  `pal_npg` / `pal_aaas` / `pal_lancet` / `pal_jama`，属「受启发」的社区调色板。
  若在 skill 中提及这些调色板名，需同时保留该声明与 ggsci 链接。
- 集成指引若照搬 README 的示例代码，应按现有 `industrytslib-integration.md` 的做法
  给出文件路径与行号级引用，便于后续核对。

## 6. 依赖、安装方式与体积注意事项

- PyPI 包名 `pubfig`，当前版本 `0.3.0`（`src/pubfig/_version.py`），安装 `pip install pubfig`。
- 运行时依赖（`pyproject.toml`）：`matplotlib>=3.8`、`numpy>=1.24.0`、`scipy>=1.10.0`、
  `statsmodels>=0.14.0`、`scikit-learn>=1.3.0`、`pillow>=10`。相比纯 matplotlib 路径，
  额外引入 statsmodels 与 scikit-learn，属较重的依赖面。
- `requires-python >= 3.10`；构建后端 hatchling；CLI 入口 `pubfig`。
- 体积：源码仓库 109 个文件（不含 `.git`），主要体积在 `examples/` 的 PNG 与 `LOGO.png`；
  以集成指引形式接入时不需要复制任何仓库文件。
- Figma 路径需要 Figma Desktop 安装插件并点击 Connect Bridge，属人工环节，
  在无人值守会话中不可用。

## Caveats / Not Found

- 未执行 `pubfig` CLI 或 Python API，`render` / `validate-spec` 的实际输出与
  README 声称的「CLI 与 Python PNG 输出完全一致」未验证。
- `PLOT_REGISTRY` 的 41 个 kind 按 `plot_registry.py` 中 `": "` 出现次数统计得出，
  未逐个列出对照；写集成指引前需从 `list_plot_kinds()` 或源码重新核对完整列表。
- 各绘图函数的参数签名未逐个阅读，只核对了 `save_figure`；`docs/palette-gallery.md` 未阅读。
- pubfig 的 `nature` / `science` / `cell` spec 的具体 rcParams（字号、线宽）未核对，
  与 `references/journal-specs.md` 的数值是否一致，尚未判定。
