# Research: figures4papers（ChenLiu-1996/figures4papers）

- **Query**: 分析 figures4papers 的 scientific-figure-making skill 与 figure_* 项目组织，给出可吸收点
- **Scope**: internal（本地 shallow clone 静态阅读，未执行仓库代码）
- **Date**: 2026-08-16
- **Clone**: `ref/repo/plot_ref/figures4papers/`，remote `https://github.com/ChenLiu-1996/figures4papers.git`，HEAD `6790a93`（2026-08-06）

## 1. 仓库结构概览

```
figures4papers/
├── README.md                          # 项目索引 + 论文 BibTeX + skill 安装说明
├── assets/                            # 11 张非端到端 Python 生成的示意图
├── scientific-figure-making/          # skill 入口
│   ├── SKILL.md                       # 38 行，frontmatter 仅 name + description
│   └── references/
│       ├── api.md                     # 152 行，API 约定（未实现）
│       ├── common-patterns.md         # 74 行，布局模式
│       ├── demos.md                   # 30 行，figure_* 目录索引表
│       ├── design-theory.md           # 138 行，风格统计与理论
│       └── tutorials.md               # 135 行，3 个端到端流程
└── figure_<项目名>/                    # 8 个论文项目目录
    ├── plot_<图名>.py                  # 绘图脚本，数据内联在文件顶部
    └── figures/                       # PNG / PDF 输出
```

8 个项目目录：`figure_ImmunoStruct`、`figure_CellSpliceNet`、`figure_Brainteaser`、
`figure_VIGIL`、`figure_ophthal_review`、`figure_RNAGenScape`、`figure_Dispersion`、
`figure_Cflows`。共 25 个 `.py`，3404 行；最大文件 `figure_Dispersion/plot_illustration.py`（404 行）。

## 2. 核心能力与工作流

### 2.1 skill 组织

`SKILL.md` 用一张 5 行表把 5 个 reference 做条件路由，明确要求按需打开而非预加载。
frontmatter 只有 `name` 与 `description`，无 `category` / `tags` / `version`。
`description` 内含反向边界（不用于 Plotly / Altair / Bokeh、纯 EDA、3D / GIS、Illustrator / Figma 优先的工作流）。

### 2.2 API 约定（规范，非可运行代码）

`tutorials.md:3` 明确说明仓库不提供共享 Python 模块，`api.md` 中的符号需使用者自行实现或改写。
仓库中确无该模块，各 `plot_*.py` 直接调用 matplotlib 原生 API。

`api.md` 定义的契约：

| 类别 | 符号                                                                                                               | 说明                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 常量 | `PALETTE`                                                                                                          | 12 色语义映射；`DEFAULT_COLORS` 为 6 色顺序表                                                    |
| 样式 | `FigureStyle`                                                                                                      | frozen dataclass：`font_size=16`、`axes_linewidth=2.5`、`use_tex=False`、`font_family` 元组      |
| 样式 | `apply_publication_style(style=None)`                                                                              | 一次性配置 rcParams，创建图前调用                                                                |
| 布局 | `create_subplots(nrows, ncols, figsize, **kw)`                                                                     | 返回 `(fig, axes)`，axes 展平为 1D                                                               |
| 导出 | `finalize_figure(fig, out_path, formats, dpi=300, close=True, pad=0.05)`                                           | 一次调用导出多格式，自动建父目录，返回 `Path` 列表；格式白名单 pdf/svg/eps/png/jpg/jpeg/tif/tiff |
| 绘图 | `make_grouped_bar` / `annotate_bars` / `make_trend` / `make_heatmap` / `make_scatter` / `make_sphere_illustration` | 统一 `ax` 优先参数；含 numpy 转换与维度长度校验                                                  |

### 2.3 设计理论（`design-theory.md`，由脚本统计反推）

本次对 25 个脚本的静态统计与文档记述一致：`plt.rcParams['font.*']` 38 次、
`axes.spines.*` 36 次、`axes.linewidth` 18 次、`text.usetex=True` 6 次、`svg.fonttype` 1 次；
`tight_layout(pad=2)` 24 次，`pad=1` 2 次，`pad=0.5` 2 次。

- **两档字号体系**：大幅柱状/对比图 `font.size=24` + `axes.linewidth=3`；紧凑分析图 `font.size=15-16` + `axes.linewidth=2`。
- **超宽画布**：实测 `figsize` 含 (96,12)、(52,12)、(45,12)×2、(36,12)×2、(36,6)×2、(35,7)、(28,6)×3、(24,8)×2；文档规则为对比柱图宽高比 3–4×。
- **语义调色板**：蓝（`#0F4D92` / `#3775BA`）表示提出方法，绿系表示改进，红/粉系表示基线或对照，灰系表示背景类别，金色 `#FFD700` 仅作单点强调。
- **导出**：主用 `dpi=300`，密集柱状面板（ImmunoStruct）用 `dpi=600`。
- **柱状编码**：柱顶直接标数值（`ax.text`，最大到 36pt）、`FixedLocator` 手动控刻度、`edgecolor='black'` + `linewidth=1.5-3`、消融用同色 alpha 0.2→1.0 阶梯、可选 hatch。

### 2.4 脚本组织约定

每个 `figure_*/` 独立自洽：数据以字典或 `np.array` 内联在脚本顶部（如
`figure_VIGIL/plot_comparison_radar.py` 的 `data_comparison` 同时含 `methods`、`colors`、`results`），
输出固定写入同目录 `figures/`。仅 `figure_ImmunoStruct/raw_data.py`（125 行）把数据单独拆文件。
无 `requirements.txt`，无跨项目共享模块。

## 3. 与现有 academic-figure skill 的重叠与差异

现有 skill 的 `references/chart-recipes.md` 已有「Cross-cutting layout patterns」小节
（第 304–329 行，来源标注为 nature-figure，随 `e6c0389` 首次提交），与本仓库多条模式重合。

| 能力                                                       | 现有 skill 状态     | 位置                                                              |
| ---------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| 图例专用子图（`set_axis_off`）                             | 已覆盖              | `chart-recipes.md:312`                                            |
| y 轴动态收紧                                               | 已覆盖              | `chart-recipes.md:318`                                            |
| alpha 阶梯表示消融                                         | 已覆盖              | `chart-recipes.md:321`                                            |
| hatch 灰度可读柱                                           | 已覆盖              | `chart-recipes.md:323`                                            |
| 跨面板统一色族                                             | 已覆盖（原则层）    | `chart-recipes.md:328`                                            |
| 热力图配方                                                 | 已覆盖              | `chart-recipes.md:146`                                            |
| 色盲安全调色板                                             | 已覆盖（Okabe-Ito） | `matplotlib-recipes.md:203`                                       |
| 矢量优先导出、`fonttype=42`、QA 清单                       | 已覆盖              | `modes/journal-spec.md`、`qa-checklist.md`                        |
| 语义色彩角色 + 具名十六进制常量                            | 未覆盖              | 现有仅有色盲安全表与「统一色族」原则，无「蓝=提出方法」的角色约定 |
| 多指标超宽面板比例规则                                     | 未覆盖              | 现有仅在 `chart-recipes.md:37` 提到宽比例适配双栏宽度             |
| 统一导出函数契约（多格式一次导出、自动建目录、格式白名单） | 未覆盖              | 现有各配方各自调用 `fig.savefig(...)`                             |
| 海报/幻灯尺度两档字号体系（24pt/lw3 与 15-16pt/lw2）       | 未覆盖              | 现有 rcParams 面向期刊单栏 3.54 in                                |
| 分类柱隐藏 x 刻度标签                                      | 未覆盖              | —                                                                 |
| 概念示意图配方（球体明暗、去刻度）                         | 未覆盖              | —                                                                 |

存在一处口径冲突：本仓库风格面向大尺寸展示（`font.size=24`、`figsize=(45,12)`），
与 `journal-spec` 模式的单栏 90 mm / 3.54 in 约束不兼容。

## 4. 建议吸收点

| 优先级 | 内容                                                                                                                                       | 建议落点                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 高     | `finalize_figure` 导出契约：多格式一次导出、自动建父目录、返回路径列表、格式白名单、批处理设 `Agg` 后端                                    | 新增 `references/export-contract.md`；在 `modes/journal-spec.md` 资源区引用                          |
| 高     | 语义调色板：12 色具名常量 + 「蓝=提出方法 / 绿=改进 / 红=基线 / 中性=背景 / 金=单点强调」角色约定，并注明与 Okabe-Ito 色盲安全表的取舍关系 | 追加到 `references/chart-recipes.md` 的 Cross-cutting 小节，或新增 `references/palette-semantics.md` |
| 中     | 多指标超宽面板：宽高比 3–4×，配合图例专用子图与隐藏 x 刻度标签                                                                             | 扩写 `references/chart-recipes.md` Cross-cutting 小节（图例专用子图已在，补比例与刻度规则）          |
| 中     | 两档字号/线宽体系（展示尺度 24pt+lw3 / 紧凑 15-16pt+lw2），并显式标注不适用于期刊单栏投稿                                                  | `references/matplotlib-recipes.md` 增设「展示尺度（海报/幻灯）」小节                                 |
| 中     | `FigureStyle` + `apply_publication_style` 的「一次配置 rcParams」调用约定                                                                  | 同上，与现有 rcParams 预设并列呈现                                                                   |
| 低     | 柱状精修细节：`FixedLocator` 手动刻度、柱顶数值字号随画布缩放                                                                              | `references/chart-recipes.md` 柱状家族                                                               |
| 低     | 概念示意图配方（`make_sphere_illustration`、去刻度、低 alpha 密集几何场景）                                                                | 暂不吸收；如需，新增 `references/schematic-recipes.md`                                               |
| 低     | 真实论文脚本索引（8 个 `figure_*` 目录的 GitHub URL 与图型对照）                                                                           | `references/` 中以外链表形式记录，不 vendor 代码                                                     |

不建议吸收：`api.md` 的 `make_*` 全套函数签名。该套 API 在上游未实现，现有 skill 的
`scripts/` 走「复制脚本 + 替换数据区」路线，引入未实现的抽象层会与既有工作流冲突。

## 5. 许可证与出处标注要求

- 仓库**无 LICENSE 文件**（已递归检索 `*licen*` / `*copying*` / `*notice*`，仅命中目录名
  `figure_CellSpliceNet` 的误匹配）。默认版权归作者保留，未授予再分发许可。
- 结论：**不复制该仓库的代码文件与图片资产**。仅吸收 `design-theory.md` /
  `common-patterns.md` / `api.md` 中的事实性设计规则（数值参数、布局原则），
  以本仓库自有措辞重写，并标注来源。
- 建议标注格式：仓库名 `ChenLiu-1996/figures4papers`、URL、HEAD `6790a93`（2026-08-06）、
  「无 LICENSE，仅参考设计规则，未复制代码」。
- README 明确要求学术引用规范；若采用其调色板并公开发布，宜在文档中致谢来源。
- 调色板十六进制色值本身不构成可版权表达，但仍建议保留来源标注。

## 6. 依赖与体积注意事项

- skill 目录（`scientific-figure-making/`）纯 Markdown，6 个文件共 529 行，体积可忽略。
- `figure_*/figures/` 与 `assets/` 为 PNG/PDF 输出，属大体积资产，符合 PRD「不 vendor 大体积资产」约束，不纳入。
- 脚本依赖 matplotlib + numpy；6 个脚本使用 `text.usetex=True`，需本地 LaTeX。
  与现有 `modes/from-data.md#runtime-dependencies` 记录的 LaTeX 注意事项口径一致。
- `font.family='helvetica'` 在多数 Linux/Windows 环境不可用，文档自身给出回退栈
  `['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif']`；若吸收需保留该回退说明。

## Caveats / Not Found

- 未执行任何脚本，风格数值均来自静态阅读与 grep 统计。
- `design-theory.md` 声称的「16 个脚本使用 helvetica / 2 个使用 sans-serif」未逐文件复核，
  本次仅复核到 `font.*` 相关 rcParams 赋值共 38 处。
- 仓库无 LICENSE 的原因未查明（未联系作者，未查 GitHub 仓库设置页）。
