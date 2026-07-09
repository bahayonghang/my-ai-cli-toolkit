# Research: nature-figure 方法论提炼（供 academic-figure 复用）

- **Query**: 深读 nature-figure 参考技能，提炼对新建 academic-figure（IEEE/Elsevier/Nature 多刊 × matplotlib/seaborn/plotly 多库 + industrytslib 集成）可复用的内容
- **Scope**: internal（只读 `ref/repo/nature-skills/skills/nature-figure/`）
- **Date**: 2026-07-09
- **约定**: 路由机制（静态/动态分层、backend 门控、按需 references）已知，不再复述；本文聚焦"契约方法论 / 图表配方 / 工程结构 / 取舍建议"。所有出处均为 `ref/repo/nature-skills/skills/nature-figure/` 下相对路径。

---

## 一、方法论提炼

### 1.1 五点图表契约（出处 `static/core/contract.md:23-31`）

契约要求"先立论、后写码"，代码/美学从属于科学逻辑：

1. **Core conclusion 核心结论**：写出该图必须捍卫的一句话主张（带动词，如"X 通过恢复 Z 降低 Y"，而非"X 的结果"）。
2. **Evidence chain 证据链**：每个 panel 映射到主张；不承载独有证据的 panel 删除或合并。
3. **Archetype 原型分类**：四选一 —— `quantitative grid`（定量网格）/ `schematic-led composite`（示意主导复合）/ `image plate + quant`（图像板+定量）/ `asymmetric mixed-modality figure`（非对称多模态）。
4. **Backend 后端**：显式或已存偏好的 Python/R 独占用于绘图、预览、导出、视觉 QA（**此点即新技能要改造成"库+期刊风格双轴"**）。
5. **Journal/export contract 期刊/导出契约**：定稿尺寸、可编辑文字、source data、统计、图像完整性说明、导出格式 —— 在美化之前确定。

> 最高优先级铁律（`static/core/contract.md:31`）：**the chart serves the scientific logic**，美学/模板/复杂布局都从属于"让核心结论清晰、可辩护、可审稿"。

配套还有三条门控规则（`static/core/contract.md:5-21`），新技能需改造其中"backend"含义：
- 后端选择使用**已保存偏好**（显式选择 > 语言特定输入 > 保存值 > 只问一次并记住）。
- 所选后端**独占**：预览/导出/QA 不得跨语言渲染。
- **缺运行时/包**时：停止渲染并报告 blocker，给脚本+安装命令，绝不用另一后端替代出图。

### 1.2 默认立场要点（出处 `static/core/stance.md`）

- **配色策略**（`:5-8`）：跨所有 panel 优先**统一方法家族**而非最大化色相区分；密集页用低饱和 `NMI pastel`；绿/红只留给增益、下降、方向性线索。
- **立场清单**（`:9-19`）：
  - 先把图归入四原型之一。
  - 偏好**一个 hero panel + 从属证据 panel**，而非等大子图铺满画布。
  - 单图也要识别其在论文主张中的角色：discovery / mechanism / validation / comparison / robustness / clinical relevance。
  - 图/示意背景保持白色；仅显微/体渲染图像板用黑底。
  - 空间固定的类别优先**直接标注**而非图例（减少视线移动）。
  - 每图一套克制调色板：一个中性族 + 一个信号族 + 一个强调族。
  - 统计、`n`、误差棒定义、source-data 可追溯、图像完整性视为图的一部分，而非图注善后。
- **隐私规则**（`:21-23`）：面向用户输出不得暴露私有路径、私有文件名、聊天附件名、内部参考文件名、模板编号、私有素材来源；用"提供的模板集合""内部图件契约"等泛称；仅当用户明确要审计轨迹才给出确切路径。

### 1.3 `references/figure-contract.md` 核心规则 + 可复用清单

- **契约模板**（`:16-34`）：working notes 里先填 `Core conclusion / Figure archetype / Target journal/output / Backend / Final size / Panel map(a,b,c) / Evidence hierarchy(hero,validation,controls) / Statistics needed / Source data needed / Image-integrity notes / Reviewer risk`。—— **可整段复用为 academic-figure 的契约填空模板**（把 Backend 换成 Library+Journal style）。
- **核心结论规则**（`:39-49`）：一句话带动词；每 panel 答唯一问题；主证据用 hero panel、对照/鲁棒性视觉更安静；只有数据无主张时先推定一个主张并请用户确认。
- **原型选择表**（`:53-58`）：四原型 × "何时用 / hero panel / 支持 panel"，`schematic-led` 中示意占 35-60% 面积。
- **panel 逻辑顺序**（`:62-72`）：建立系统 → 主效应 → 机制/定位 → 定量代表性图像 → 鲁棒性/对照/亚组；Fig.1 首 panel 定义视觉词汇并全图复用。
- **审稿风险自检清单**（`:86-93`，**逐条可复用**）：
  1. 样本量是否出现在图例或 source data？
  2. 误差棒/区间/统计检验是否定义？
  3. 邀请对比的 panel 之间坐标轴是否可比？
  4. 代表性图像是否已定量且可追溯到原始文件？
  5. 图像调整是否全局且有记录？
  6. 同一结论能否用更少 panel 得出？

### 1.4 `references/qa-contract.md` 核心规则 + 交付前清单（逐条）

- **官方参考须核对**（`:9-16`）：给出 Nature research figure guide 等 URL，并声明"期刊规则会变，最终以目标期刊作者指南为准"。—— **新技能应对 IEEE/Elsevier/Nature 各给一组官方 URL 并标注 missing evidence**。
- **Pre-submission 清单**（`:20-37`，**逐条可复用**，pass 条件已给）：
  | 项 | 通过条件（原文提炼） |
  |---|---|
  | Core conclusion | 存在一句话主张，每 panel 都映射到它 |
  | Archetype | 声明了原型与 panel 层级 |
  | Backend exclusivity | 所选后端产出全部绘图/预览/导出/QA（→ 新技能改为"库+风格一致"） |
  | Final size | 单栏约 89 mm / 双栏约 183 mm，高度不超刊限 |
  | Text size | 定稿尺寸下正文/刻度/图例可读，密集图常 5-7 pt |
  | Panel labels | 小写、粗体、近左上角，定稿约 8 pt |
  | Editable text | SVG/PDF 文字保持可编辑，非必要不描边成路径 |
  | Font | 一致使用 Arial/Helvetica/sans-serif 回退 |
  | Color | 无彩虹色图；红/绿不作唯一编码；灰度打印仍可读 |
  | Legend strategy | 尽量共享或直接标注，无重复冗余图例 |
  | Statistics | `n`、生物/技术重复定义、中心、离散、检验、多重比较校正、确切对比均记录 |
  | Source data | 定量 panel 可追溯到干净 CSV/TSV/XLSX 或脚本输出 |
  | Raster resolution | 照片/显微达定稿分辨率；线画尽量矢量 |
  | Microscopy scale | 有校准比例尺，非仅放大倍数 |
  | Image integrity | 裁剪/对比/伪彩/拼接/复用/原始文件溯源均记录 |
  | Export bundle | 需要时脚本+source data+SVG+PDF+TIFF/PNG 预览+QA 说明一并交付 |
- **统计图例最小集**（`:41-63`）：`n definition / biological replicates / technical replicates / center statistic / spread/interval / test / multiple-comparison correction / p-value display / source-data file`；ML 模型另加 `train/val/test split / seeds or folds / metric definition / CI or variability / baseline definition`。—— **ML 模型附加块对时序/工业预测场景高度可复用**。
- **图像完整性最小集**（`:69-79`）：`raw file / processed file / crop / brightness-contrast-gamma / pseudo-color / scale calibration / stitching / reuse / quantification link`；全局调整优于局部选择性编辑。
- **导出检查**（`:91-116`）：只跑所选后端的导出块；Python 用 `svg.fonttype="none"` + `pdf.fonttype=42` + savefig svg/pdf/tiff(600dpi)；导出后打开验证文字可选、标签不重叠、定稿尺寸可读。

### 1.5 `references/design-theory.md` 核心规则概括（11 节）

源自 figures4papers（NMI 及顶级 ML/生信）脚本。逐节要点：
1. **Typography**（`:9-31`）：字体栈 `['Arial','Helvetica','DejaVu Sans','sans-serif']`；`svg.fonttype='none'`；LaTeX 仅在装了时用。字号层级表（密集定稿 7-9pt；大柱状 panel 24pt；大 panel 轴标题 32-54pt）。**定稿要比 slide 预览小**，2026 样本落在 7-9pt。
2. **Axes & Spines**（`:36-44`）：右/上 spine 恒关；图例恒 frameless；默认无网格，稀疏 y 刻度引导。
3. **Color Palette**（`:48-142`）：语义（蓝=本文法、绿=正向、红/粉=基线、中性=参考）；**家族一致 > 最大色相区分**；给出 `PALETTE` 与 `PALETTE_NMI_PASTEL` 两套 + `DEFAULT_COLOR_ORDER`；五条家族规则；按模态调色（imaging/schematic/clinical/genomics）；ablation 用**单色变 alpha**（`alphas=np.linspace(0.2,1.0,n)`）。
4. **Layout & Composition**（`:147-204`）：figure 尺寸表；**专用 legend-only 子图**（最后一格 `set_axis_off()`）；**动态 y 轴收紧**（值在窄带时勿用 0-100）；四种 Nature 页面原型表；panel label/gutter 规范；图例经济学；方法名已在图例时 `ax.set_xticks([])`。
5. **Bar Chart Rules**（`:207-262`）：竖柱（yerr+capsize+edgecolor black+lw1.5）；横柱 ablation（alpha 编码）；柱内亮度感知数值注释；灰度打印 hatch 编码；误差棒样式。
6. **Line/Trend**（`:266-279`）：线宽 2-3pt、marker 8-12pt；共享图例；时间进程 alpha 渐变（LineCollection）；`fill_between` 不确定带（alpha 0.1-0.2）；参考线 dashed axhline；无网格。
7. **Heatmap**（`:283-310`）：正/负列用 Reds / Blues_r；NaN 掩为白；逐列归一化；去 frame/tick 保留 label；cell 文字按亮度取黑白。
8. **Radar/Polar**（`:314-321`）：`projection='polar'`；去默认网格/spine，自绘 spokes+contour；逐 spoke 归一化；`set_theta_zero_location('N')`；图例放外侧。
9. **Export Policy**（`:324-353`）：**SVG 为必须主格式**（`svg.fonttype='none'`）；PNG dpi=300（密集柱状 600）为次级；禁用 `svg.fonttype='path'`；`tight_layout(pad=2)` 后 `plt.close(fig)`。
10. **Reproduction Checklist**（`:420-436`）：MANDATORY 首三行 rcParams、SVG 主输出、spine off、字号、语义配色、黑底仅图像板、图例共享、y 轴收紧、隐藏 x 刻度、pad=2、close。
11. **Multi-Panel Information Architecture**（`:356-417`）：**每 panel 答唯一问题**；三层递进 Overview（堆叠柱/组成）→ Deviation（z-score 发散热图）→ Relationship（散点/气泡）；反冗余清单；四类常见冗余陷阱 + 修正；z-score 热图与象限气泡散点代码。—— **这套"反冗余信息架构"是最通用、与期刊无关的资产**。

### 1.6 `references/figure-legend-conventions.md` 核心规则（写/审图注）

源自 2025 Nat Commun CS/AI 语料；**注意 PRD 把"图注文案代写"划出 scope，归 nature-writing**，故此文件在新技能中作 QA 参考而非主打。
- **固定骨架**（`:11-22`）：`Fig. N | ` + 粗体名词短语总题 → `a/b/c` 现在时电报式分面 → 统计写进图注（`n=`、误差类型、检验）→ 结尾 `Source data are provided as a Source Data file.` 套语。
- **时态**（`:24-27`）：视觉事实现在时，制作方法过去时。
- **自足性**（`:30-36`）：颜色/形状映射、样本量、关键数值（PDB/RMSD/单位）写进图注，脱离正文可读。
- **进阶**（`:38-42`）：末句可给一句推断结论，但须有 panel 支撑，慎用。
- **综述图注**（`:44-50`）：聚合他人系统逐子图一句话定性 + `adapted with permission from refs… by Springer Nature` 授权串。
- **长度/标题**（`:59-63`）：≤300 词；标题名词化，数字/结果放 panel 与统计。
- 文件末尾已附**中文图注要点**（`:65-71`），可直接搬用。

---

## 二、图表配方盘点

### 2.1 `references/chart-types.md` —— 基础柱/趋势之外的专用配方

| 配方 | 关键函数/签名 | 职责 |
|---|---|---|
| Radar/Polar（`:8-104`） | `plot_radar(methods, colors, subtask_names, value_matrix, benchmark_radii, display_range=(45,90))` | 多方法跨多 benchmark 同图；逐 spoke 归一化、自绘 spokes/contour、外侧图例 |
| 3D sphere/概念图（`:108-180`） | `draw_shaded_sphere(ax, light_dir, resolution=512, alpha, extent)`；`plot_3d_scatter_with_arrows(ax, points, grad_vectors, ...)`（内含 `Arrow3D`） | numpy 网格 ray-cast 做 Lambertian 着色的伪 3D 球；3D 散点+梯度箭头 |
| 聚类散点（`:184-194`） | `make_scatter(ax, x, y, labels_or_colors, size=50, alpha=0.7, edgecolors='none')` | 单/多簇散点；概念图 `set_axis_off()` |
| Fill-between 堆叠面积（`:198-220`） | `ax.fill_between(...) + hatch + 白边擦除 + 叠 plot 线` | 累计计数/堆叠贡献，灰度打印安全 |
| Log-scale 柱（`:224-235`） | `ax.set_yscale('log')` + 顶部留白 `ymax*20` | 跨量级柱 + 柱上注释 |
| GridSpec 多面板（`:239-252`） | `gridspec.GridSpec(2,4)` + `gs[0,1:3]` 跨列 / `gs[1,:]` 全宽 | 非对称多面板骨架 |
| 科学计数法 y 轴（`:256-260`） | `ax.ticklabel_format(axis='y', style='sci', scilimits=(0,0))` | 极大/极小值轴 |
| 自定义 spine 定位（`:264-271`） | `ax.spines['bottom'].set_position(('data',0))` | 负值图把底轴移到 y=0 |

### 2.2 `references/common-patterns.md` —— 16 个可复用布局/编码模式

1. **Ultra-wide 多指标柱面板**（`:7-29`）：`figsize=(45,12)`，宽约高 3-4×，末格 legend-only。
2. **专用 legend panel**（`:33-48`）：图例独占一轴，数据面板保持干净。
3. **无 x 刻度类别柱**（`:52-60`）：`set_xticks([])` vs `set_xticklabels([])`。
4. **动态 y 轴收紧**（`:64-75`）：`margin=(max-min)*0.1`；手动 round 刻度。
5. **Alpha 渐变 ablation 柱**（`:79-89`）：同色变 alpha 表完整度。
6. **Hatch 灰度打印安全**（`:93-104`）：`hatches=['/','\\','.','x','o','+']` + black edge。
7. **语义/家族配色映射**（`:108-130`）：`method_colors` 字典跨 panel 一致；绿/红仅方向标注（`^`增益/`v`下降）。
8. **柱内亮度感知文字**（`:134-149`）：`annotate_bars(ax, bars, colors, fmt='{:.2f}', fontsize=32, offset=-0.10)`。
9. **Fill-between 趋势 + hatch**（`:153-166`）：三反斜杠密 hatch + 白边擦除。
10. **趋势线事件标注**（`:170-193`）：`mark_events(ax, x_labels, y_cumsum, events_dict, dy_fraction=0.1)`，`*` 数控制箭头高度。
11. **多数据集分组柱（组内套组）**（`:197-215`）：组间留 1 空位，`_nolegend_` 抑制重复图例。
12. **Schematic hero + 支持定量行**（`:219-244`，**hero panel 配方**）：`height_ratios=[2.2,1.0]`，hero 占总高 45-60%，下方复用软化同色。
13. **暗色图像板重复视图**（`:248-270`）：仅 cell 内黑底；通道/比例尺直标；裁剪几何一致。
14. **临床三联图**（`:274-297`）：`height_ratios=[1.0,1.35,0.8]`，三列语义平行，森林行虚线参考+浅组带。
15. **非对称 hero panel**（`:301-317`）：`gs[:,3]` 让 hero 跨全行；科学重要性不等则勿等大。
16. **填充区内直接标注**（`:321-339`，**legend 经济学**）：重复类别结构时嵌字优于超大图例。

### 2.3 `references/tutorials.md` —— 4 个端到端走查

1. **分组柱多指标比较**（`:9-74`）：`GridSpec(1, n_metrics+1)`，末格 legend-only，逐指标动态 y。
2. **Ablation 柱（alpha 渐变横向）**（`:78-116`）：`barh` + `alphas=np.linspace(0.2,1.0,n)`。
3. **多面板趋势共享图例**（`:120-170`）：两趋势 panel + 第三 legend-only。
4. **双色图热图**（`:174-241`）：正列 Reds / 负列 Blues_r，逐列 norm，cell 文字亮度自适应。

### 2.4 `references/api.md` —— PALETTE 常量与 helper 签名

**PALETTE 常量族**（`:11-101`）：
- `PALETTE`（语义 blue/green/red/neutral/accent）+ `DEFAULT_COLORS`（6 色序）。
- `PALETTE_NMI_PASTEL` + `DEFAULT_COLORS_NMI_PASTEL`（统一家族低饱和）。
- 四套模态盘：`PALETTE_NATURE_IMAGING`(黑/context/cyan/magenta/white)、`PALETTE_NATURE_MATERIAL`(aqua/teal/lilac/violet/callout_red/neutral)、`PALETTE_NATURE_CLINICAL`(baseline/week6/13/26/year1/2/group_band)、`PALETTE_NATURE_GENOMICS`(neutral/wave1/2/3/outline)。—— **命名绑定 Nature modality，新技能应去 Nature 化并补色盲安全默认盘**。

**强制 rcParams**（`:109-127`）：三行不可协商 —— `font.family='sans-serif'` / `font.sans-serif=['Arial','DejaVu Sans','Liberation Sans']` / `svg.fonttype='none'`。

**helper 函数签名与职责**（`:132-403`，**这套是新技能 helper 库的直接蓝本**）：
| 函数 | 签名 | 职责 |
|---|---|---|
| `apply_publication_style` | `(font_size=16, axes_linewidth=2.5, use_tex=False)` | 一次性设 Nature 风格 rcParams（含强制 SVG 三件套 + spine/linewidth/frameon）；给出大柱/紧凑/密集/LaTeX 四种预设 |
| `is_dark` | `(hex_color, threshold=128)` | 判底色深浅（0.299R+0.587G+0.114B），决定叠字黑白 |
| `add_panel_label` | `(ax, label, x=-0.06, y=1.02, fontsize=14, color='black', fontweight='bold')` | 左上角小写粗体 panel 字母；暗图版移入内部转白 |
| `style_dark_image_ax` | `(ax, facecolor='black')` | 显微/渲染图版轴：黑底、去 ticks、去 spines |
| `make_grouped_bar` | `(ax, categories, series, labels, ylabel='Value', colors=None, annotate=False, bar_width=0.8, error_kw=None)` | 分组柱；默认 `DEFAULT_COLORS`；可选值注释；返回 BarContainer 列表 |
| `make_trend` | `(ax, x, y_series, labels, colors=None, ylabel, xlabel, show_shadow=False, shadow_alpha=0.15, lw=2.5, marker='o', markersize=8)` | 多线趋势；`y_series` 为 2D 时自动 mean±std 阴影带 |
| `make_forest_plot` | `(ax, labels, estimates, ci_low, ci_high, colors=None, ref=0.0, xlabel, xlim, marker='o', markersize=5, lw=1.5)` | 临床/统计森林图；虚线参考线 + 可选浅色分组带 |
| `make_heatmap` | `(ax, matrix, x_labels, y_labels, cmap='magma', cbar_label, annotate=False, fmt='{:.2f}', fontsize=12)` | 2D 热图 + 可选 colorbar + 亮度感知 cell 注释 |
| `finalize_figure` | `(fig, out_path, formats=None, dpi=300, pad=2, bbox_inches=None, close=True)` | `tight_layout` + 多格式保存（png/pdf/svg/eps/jpg/tif）+ 自动建父目录 + close |

**校验规则**（`:408-413`）与**约定**（`:417-428`）：形状一致性断言；`./figures/` 输出；headless 用 `matplotlib.use('Agg')`；多面板一基线族+一 hero 族；配色/分辨率/布局欠定时先确认。

---

## 三、工程结构细节

### 3.1 Python backend fragment（`static/fragments/backend/python.md`）

- **Python-only 执行规则**（`:3`）：选 Python 后绘图/预览/导出/QA 全 Python，缺包停止报告，不跨渲染。
- **quick-start**（`:7-27`）：一次 `mpl.rcParams.update({...})` 设 `font.family / font.sans-serif(4 字体栈) / svg.fonttype='none' / pdf.fonttype=42 / font.size=7 / spines off / axes.linewidth=0.8 / legend.frameon=False`；导出 helper `save_pub_py(fig, filename, dpi=600)` 一次落 `.svg/.pdf/.tiff`。—— **注意此处默认 `font.size=7`（定稿密集），而 api.md 的 `apply_publication_style` 默认 16（slide），两处并存说明"字号随用途切换"**。
- **going deeper**（`:32-37`）：列出 5 个 references 的打开条件。

对照 `SKILL.md:56-58` 与 `manifest.yaml:36-52`：fragment 在 backend gate 解决后才 Read，且**只读所选那一个**（`multi: false`）。**新技能可把此 fragment 结构复制为 `matplotlib.md` / `plotly.md` 两个库片段**。

### 3.2 evals 格式（`evals/evals.json`）

结构：顶层 `{ "skill_name", "evals": [...] }`；每条 `{ id, prompt, expected_output, assertions: [{name, description}], files: [] }`。
- 现有 **2 条**用例，均为**后端独占性负例守护**（R 缺运行时 / Python 缺包时不得跨后端替代）。**无独立正例**（正例隐含在 prompt 的正常路径里）。
- 判定方式：`assertions` 为**自然语言断言**（`no_cross_backend_rendering` / `selected_backend_blocker_reported`），供人工或 LLM 评审，非机器精确匹配。
- **对新技能的启示**：PRD R11/A6 要正例 + 近邻负例、中英文。可沿用此 JSON 形状，把断言改为"命中/不命中触发""参数正确（尺寸/字体/DPI/格式）""不误触发相邻技能"。**本仓库另有 `skills/development-workflows/html-artifact/evals/evals.json` 可作本仓惯例对照**。

### 3.3 偏好持久化机制（`scripts/nature_figure_backend.py`）

- **存哪**（`:16-20`）：环境变量 `NATURE_FIGURE_CONFIG` 覆盖，否则 `~/.config/nature-skills/nature-figure.json`。
- **什么格式**（`:35-37`）：JSON 对象，缩进 2，`ensure_ascii=False`，键 `backend ∈ {python, r}`。
- **子命令**（`:66-89`）：`get`（打印，未设置 exit 1）/ `set <backend>`（校验后写）/ `clear` / `path`。纯标准库、无依赖、幂等。
- **对新技能的改造**：把持久化对象从 `backend(python/r)` 改为 `(library, journal_style)`（如 `{"library":"matplotlib","style":"ieee"}`）；配置文件与 env 变量改名（勿沿用 `nature-figure.json`）。CLI 骨架可几乎照搬。

### 3.4 assets 用途与被引用方式

- **`assets/figures4papers/`**（真实生产脚本 + 预览）：被 `references/demos.md` 索引。`demos.md:22-34` 给"项目 → 何时用 → 本地 `plot_*.py`"映射表，`:36-48` 给"图表族 → 起手项目"路由；用法是**复用模式而非 demo 数据/标签**（`:16-19`），且不得暴露本地路径。`manifest.yaml:82-83` 以"bundled figures4papers scripts and previews"条件按需挂载 demos.md。单脚本形态见 `assets/figures4papers/figure_ImmunoStruct/plot_bars.py`（直接 `plt.rcParams` 内联 + `figsize=(28,6)` + 末格 legend-only + `savefig png dpi=600`），风格与 tutorials 一致但更"原始"。
- **`assets/chart-atlas/`**（10 张 4×4 图表类型预览 PNG）：仅被 `README.md:53-62` 表格引用，作"图表族视觉语法总览"；references 正文**不引用**（属人读文档资产）。
- **`assets/gallery/`**（5 张结果图预览 PNG）：仅被 `README.md:37-41` 引用，展示技能规则下的模拟数据 mockup。文件策略（`README.md:43`）：只留轻量 PNG，不提交大 SVG/PDF，用户应从源数据+脚本重生。
- **启示**：新技能的 atlas/gallery 属"README 级人读预览"，与 LLM 按需加载的 references 分离；demos 式"配方索引表"值得保留，但需换成自有 matplotlib/plotly 示例且遵守本仓 asset 策略。

---

## 四、对 academic-figure skill 的取舍建议

### 4.1 应直接继承

- **static/dynamic 按需加载架构**：`manifest.yaml` 的 `always_load`(core) + 轴门控 fragment + `references.on_demand` 条件表；`SKILL.md` 保持精简路由（PRD R7/约束已要求）。
- **图表契约方法论**：五点契约中的四点（核心结论、证据链、原型分类、期刊/导出契约）+ `figure-contract.md` 契约填空模板 + 审稿风险自检 6 问 + panel 逻辑顺序。
- **QA 契约清单**：`qa-contract.md` 的 pre-submission 表、统计图例最小集（含 ML 附加块）、图像完整性最小集、"导出后打开验证"习惯。
- **反冗余多面板信息架构**：Overview→Deviation→Relationship 三层 + 冗余陷阱表（`design-theory.md §11`），与期刊/库无关，通用性最强。
- **helper 函数库设计**：`apply_publication_style / finalize_figure / make_grouped_bar / make_trend / make_heatmap / make_forest_plot / is_dark / add_panel_label / style_dark_image_ax`（`api.md`）—— 作为多风格参数化的实现蓝本。
- **evals.json 形状**：`{skill_name, evals:[{id, prompt, expected_output, assertions:[{name,description}], files}]}`。
- **偏好持久化 CLI 脚本模式**：`get/set/clear/path` + env 覆盖 + `~/.config` JSON（改存 library+style）。
- **通用工程技巧**：亮度感知文字黑白、hatch 灰度打印安全、动态 y 轴收紧、legend-only 子图、hero panel 布局、方法名在图例时隐藏 x 刻度。
- **隐私规则**：不暴露私有路径/模板来源（`stance.md:21-23`）。

### 4.2 不应带入

- **R 后端**：`static/fragments/backend/r.md`、`references/r-workflow.md`、`references/r-template-index.md`、`backend-selection.md` 中 R 相关（PRD Out of Scope 明确）。
- **OpenRouter AI 生图路由**：`SKILL.md` route 0、`references/openrouter-image-generation.md`、`scripts/generate_openrouter_schematic.py`、`manifest.yaml` 的 `routes.openrouter_image_generation`（PRD Out of Scope）。
- **Nature 单刊假设**：`references/nature-2026-observations.md`（特定 Nature 论文取样）、`PALETTE_NATURE_*` 的 Nature-modality 绑定命名；调色**思想**可留，**Nature 专属命名/取样**不留。
- **图注文案代写主打**：`figure-legend-conventions.md` 可作 QA 参考，但"图注代写"归 nature-writing（PRD Out of Scope），不作为本技能主线。
- **私有 R 模板适配逻辑**：随 R 后端一起排除。

### 4.3 需要改造

- **风格轴（单刊 → 多刊）**：新增 `ieee / elsevier / nature` 三档必备 + `springer / chinese-thesis` 扩展。每档一张**规格卡**（尺寸如 IEEE 单栏 3.5in/双栏 7.16in、字体、字号、线宽、DPI、格式 PDF/EPS/TIFF、色彩模式 RGB/CMYK），**数值附官方来源 URL，查不到标 missing evidence，不编造**（PRD R3/A5）。`chinese-thesis` 需处理 CJK 字体。
- **库轴（Python/R → matplotlib/plotly）**：backend gate 改为"库 + 期刊风格"**双轴**；seaborn 作 matplotlib 生态层（`set_context/set_style` + rcParams 协同），不单列（PRD R4）。决策从"blocking gate + 强制先问"改为"**可从请求上下文自动推断，推断不出最多问一次**"（PRD R7）。
- **industrytslib 集成检测路径**（PRD R5）：识别 industrytslib 项目场景（检测其 `src/industrytslib/utils/visualization/` 可视化模块存在），优先走 `create_plotter(backend, project, style=...)` / `plotter.set_style(...)`，并提供"图表家族 → 库 API"映射（覆盖时序、真实/预测对比、箱线、分布、相关性热力图、损失曲线、区间预测、序列、决策序列、联合训练、可靠性、t-SNE/UMAP、回归指标、训练报告）；无该库时走 4.1 的独立规格卡路径（R6）。**具体 API 以本任务 `research/industrytslib-viz-inventory.md` 为准**（另有队友产出）。
- **偏好持久化对象**：`backend(python/r)` → `(library, journal_style)`；config/env 改名（勿用 `nature-figure.json`）。
- **导出契约**：从"Nature SVG-first"改为"**按期刊**"：矢量 PDF/EPS 优先、TIFF/PNG 按 DPI 要求、字体嵌入（matplotlib `pdf.fonttype=42`；plotly `kaleido` 导出 + 字体处理）、色彩模式（部分刊要 CMYK）、色盲友好调色板约束（PRD R8）。
- **rcParams / 模板**：从单套 Nature 模板改为**按期刊风格参数化的多套**（matplotlib rcParams / plotly template / seaborn 配置三视角）。
- **PALETTE**：保留语义/统一家族/ablation-alpha 思想，去 Nature-modality 命名绑定，补一套**期刊中性 + 色盲安全**默认盘。
- **QA 清单适配**：`Backend exclusivity` → `库+风格一致性`；新增 CMYK/矢量优先/色盲无障碍检查项（PRD R9）。
- **evals**：补正例 + 近邻负例、中英文触发，并对齐本仓 `just skills-check` 与 `html-artifact/evals` 惯例。

---

## Caveats / Not Found

- `industrytslib` 在本仓库不存在（`grep` 仅命中 PRD 与无关的 html-artifact 资产），是**外部项目**；其确切 API（`create_plotter` 签名、`set_style` 取值、图表家族方法名）需以队友的 `research/industrytslib-viz-inventory.md` 为准，本文未核实。
- 期刊规格卡的**具体数值**（IEEE/Elsevier/Nature 尺寸、字号、DPI、CMYK 要求）本文未采集，需另一份期刊规范调研（PRD 提到的 `research/` 期刊规范材料），并逐条附官方 URL。
- 本文只读 `nature-figure` 单个技能；其"mirrors nature-writing/polishing/reader/paper2ppt"（`SKILL.md:78`）等姊妹技能未展开，如需统一 manifest 惯例可再查。
- plotly / seaborn 在 `nature-figure` 中**几乎不涉及**（stance 明确"Not for Plotly"），故这两库的期刊化配方在参考技能里**无现成资产**，需新技能自建。
