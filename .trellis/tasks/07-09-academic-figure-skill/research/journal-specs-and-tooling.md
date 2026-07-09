# Research: 学术期刊图表规范与 Python 工具链

- **Query**: 调研 IEEE / Elsevier / Nature 投稿图表规范 + matplotlib/seaborn/plotly 学术出图工具链，为 `academic-figure` skill 提供依据
- **Scope**: external（网络调研，官方页面优先）
- **Date**: 2026-07-09

> 说明：所有规格数值均附来源 URL。凡官方页面未能直接查到的数值，明确标注 **[missing evidence]** 并给出退路建议，未编造任何数字。次要来源（博客/聚合站）用于交叉印证时会注明其为二手来源。

---

## 1. IEEE（Transactions / Journals / Conference）

IEEE 各出版物（期刊、会议、Magazine）的图表要求高度一致，均由 IEEE Author Center 统一发布。

### 规格速查表

| 项目               | 规格                                                                                    | 来源                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 单栏图宽           | 3.5 in / 88.9 mm / 21 picas                                                             | IEEE Author Center – Resolution and Size                                          |
| 双栏图宽           | 7.16 in / 182 mm / 43 picas                                                             | 同上                                                                              |
| 图形最大高度       | 9⅔ in / 58 picas（需为图注留空间）                                                      | IEEE Signal Processing Society 电子图形指南                                       |
| 彩色 / 灰度 DPI    | > 300 dpi                                                                               | IEEE Author Center – Resolution and Size                                          |
| 黑白线稿 DPI       | > 600 dpi                                                                               | 同上                                                                              |
| 彩色 TIFF 推荐 DPI | RGB 彩色 TIFF 建议 400 dpi                                                              | IEEE Author-Supplied Graphics FAQ (PDF)                                           |
| 低分辨率兜底像素宽 | 单栏 ≥ 1050 px，整页 ≥ 2150 px                                                          | IEEE Author Center – Magazines                                                    |
| 矢量格式（首选）   | PS、EPS、PDF                                                                            | IEEE Author Center – Resolution and Size                                          |
| 光栅格式（可接受） | PNG、TIFF                                                                               | IEEE Author Center – File Formatting                                              |
| 仅作者照片可用     | 高分辨率 JPEG                                                                           | 同上                                                                              |
| 不接受             | VSD、GIF、BMP；正文图不接受 JPEG                                                        | 同上                                                                              |
| 色彩模式           | 提交 RGB；最终会被转成 RGB color EPS；纯黑白图应单独按黑白提交                          | IEEE Author-Supplied Graphics FAQ (PDF)                                           |
| 推荐字体           | Times New Roman、Helvetica、Arial、Cambria、Symbol、Courier 等（列表内）                | Proceedings of the IEEE – Figures and Tables Guidelines                           |
| 字号               | 全尺寸下正文约 **9–10 pt**（会议/期刊页）；旧版 FAQ 要求可缩放到 **8 pt**               | IEEE Conferences – Improve Your Graphics；IEEE Author-Supplied Graphics FAQ (PDF) |
| 字体嵌入           | EPS/PS/PDF 必须嵌入字体或转曲线                                                         | IEEE Author Center – File Formatting                                              |
| 色盲无障碍         | 避免红-绿；用「颜色+形状」双编码、粗线+唯一数据点符号、颜色与明度双重对比、灰度打印可读 | IEEE Journals – Create Graphics (CVD 部分)                                        |

### IEEE Graphics Analyzer 工具（重要更新）

- IEEE Graphics Analyzer（旧地址 `graphicsqc.ieee.org` / `http://graphicsqc.ieee.org/`）曾是投稿前自检工具，可检查文件格式、分辨率、尺寸、色彩空间、字体是否缺失/损坏、是否含图层或透明、命名是否合规，并生成逐图报告。来源：IEEE 期刊模板 `jsen.pdf`「L. Checking Your Figures: The IEEE Graphics Analyzer」。
- **该工具已于 2020 年前后被停用（decommissioned）**。IEEE 官方停用页明确写道：投稿时图形现在会由 IEEE **自动检查**，不再需要作者手动预检。来源：IEEE Graphics Analyzer Tool – Decommissioned（AWS 托管的官方停用页）。
- 对 skill 的含义：不要再引导用户去访问 Graphics Analyzer；应改为「按规范自查 + 依赖投稿系统自动检查」。

### 来源 URL

- Resolution and Size：https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/resolution-and-size/
- File Formatting：https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/file-formatting/
- Create Graphics（含 CVD 无障碍）：https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/
- Conferences – Improve Your Graphics：https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/improve-your-graphics/
- Magazines – Article Submission Requirements：https://magazines.ieeeauthorcenter.ieee.org/create-your-ieee-magazine-article/article-submission-requirements/
- Proceedings of the IEEE – Figures and Tables：https://proceedingsoftheieee.ieee.org/resources/guidelines-for-figures-and-tables/
- Signal Processing Society 电子图形指南：https://signalprocessingsociety.org/publications-resources/guidelines-preparing-electronic-graphics
- IEEE Author-Supplied Graphics FAQ (PDF)：https://www.telecom.uff.br/pet/petws/downloads/modelos/IEEE_Author_Digital_Toolbox/graphicsfaq.pdf
- IEEE 期刊模板（描述旧版 Graphics Analyzer）：http://journals.ieeeauthorcenter.ieee.org/wp-content/uploads/sites/7/jsen.pdf
- Graphics Analyzer 停用页：https://ieeeshutpages.s3-us-west-2.amazonaws.com/GraphicsAnalyzer/GAshutpage.html

---

## 2. Elsevier

Elsevier 图表要求分「通用 artwork 规范」与「各刊 Guide for Authors 特例」两层；尺寸体系随刊变化较大，务必以目标刊为准。

### 规格速查表

| 项目                     | 规格                                                                                           | 来源                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 单栏图宽                 | ~90 mm（≈3.54 in）                                                                             | Enago / ScholarViz（二手，交叉印证）；davila7 scientific-visualization 参考 |
| 1.5 栏图宽               | **~140 mm（常被引用为 Elsevier 标准值，但本次未取到官方页面直接证据）** **[missing evidence]** | 见下方说明                                                                  |
| 双栏图宽                 | ~190 mm（≈7.48 in；部分二手来源写 185–190 mm）                                                 | Enago / ScholarViz（二手）                                                  |
| 最小尺寸                 | 常引作 30 mm **[missing evidence，未见官方直接页面]**                                          | —                                                                           |
| 最大高度                 | ~220–250 mm（随刊变化，需核实）                                                                | ScholarViz（二手）                                                          |
| 线稿 DPI                 | 最小 **1000 dpi**                                                                              | Elsevier Science Author Artwork (PDF，官方)                                 |
| 半色调（照片）DPI        | 最小 **300 dpi**                                                                               | 同上                                                                        |
| 组合图（线稿+半色调）DPI | 最小 **500 dpi**                                                                               | 同上                                                                        |
| 推荐光栅格式             | TIFF（位图/灰度/彩色首选）                                                                     | 同上                                                                        |
| 矢量格式                 | EPS；现行也接受 PDF                                                                            | Elsevier Science Author Artwork (PDF)；ScholarViz（二手）                   |
| PNG                      | **不接受**（用 TIFF 代替）                                                                     | ScholarViz（二手）                                                          |
| 允许字体（仅限）         | Arial、Courier、Helvetica、Symbol、Times                                                       | Elsevier Science Author Artwork (PDF)                                       |
| 字号                     | 成品正文 **7 pt**，上/下标不小于 **6 pt**（rule-of-thumb）                                     | 同上                                                                        |
| 色彩模式                 | 默认 RGB；部分 Elsevier Health Science 刊偏好 CMYK                                             | 同上                                                                        |
| 预览头                   | EPS 应带 72 dpi 的 8-bit preview/header；字体需嵌入                                            | 同上                                                                        |
| 质量检查                 | 投稿后有 Artwork Quality Check (AQC)，字体未嵌入会报错                                         | ScholarViz（二手）                                                          |

### 关于 90 / 140 / 190 mm 尺寸体系的证据说明（重要）

- 官方 **Elsevier Science Author Artwork (PDF)** 页面里我能直接确认的是：字号规则（7pt/6pt）、三档分辨率（1000/300/500 dpi）、允许字体、RGB 扫描、300 dpi 最小扫描分辨率。该 PDF 的「Sizing of artwork」章节强调「以各刊 journal style 为准」，**并未在本次抓取的内容中给出 90/140/190 mm 的明确数字**。
- 90 mm（单栏）/ 190 mm（双栏）来自 Enago、ScholarViz、davila7 等二手来源的交叉印证，可作默认值；**1.5 栏 = 140 mm 与最小 30 mm 属常见引用但本次缺官方直接证据 [missing evidence]**。
- 反例佐证「随刊变化」：某非 Elsevier 期刊（aboutscience JCB）采用 1 栏 8.7 cm / 1.5 栏 13.6 cm / 2 栏 18 cm，说明各刊数值确有差异。
- **对 skill 的建议**：Elsevier 尺寸应以「目标刊 Guide for Authors → artwork/figure 章节」为准；90/190 mm 作为安全默认值，1.5 栏建议提示用户去官方页确认，不要硬编码 140 mm。

### 来源 URL

- Elsevier Science Author Artwork（官方 PDF，含分辨率/字体/尺寸规则）：https://physics.mff.cuni.cz/kfpp/conference/instr/artwork_instructions.pdf
- Elsevier 现行 artwork 页（建议 skill 引用官方入口）：https://www.elsevier.com/researcher/author/policies-and-guidelines/artwork-and-media-instructions
- ScholarViz – Elsevier Figure Requirements（二手，含格式/DPI/AQC/字号）：https://scholarviz.com/blog/elsevier-figure-requirements-submission-guide
- Enago – Journal-Specific Artwork Requirements（二手）：https://www.enago.com/articles/journal-artwork-requirements-resolution-pixel-size/
- davila7 claude-code-templates journal_requirements.md（二手，已有类似 skill 参考）：https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/scientific/scientific-visualization/references/journal_requirements.md
- 「1.5 / 2-column」概念说明（Stack Exchange）：https://writing.stackexchange.com/questions/21658/

---

## 3. Nature 及子刊

Nature 强调**可编辑矢量 + 分层**，光栅/矢量分类清晰；无障碍要求最严格（Nature Methods 的 Wong/Okabe-Ito 配色即出自此处）。

### 规格速查表

| 项目             | 规格                                                                                                                                 | 来源                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 单栏图宽         | **89 mm**（部分旧指南写 88/180 制）                                                                                                  | Nature – Final submission；Guide to Preparing Final Artwork (PDF) |
| 双栏图宽         | **183 mm**                                                                                                                           | 同上                                                              |
| 1.5 栏图宽       | 120 mm 或 136 mm                                                                                                                     | Guide to Preparing Final Artwork (PDF)                            |
| 整页最大深度     | 247 mm（表格页面上限约 18 cm × 24 cm）                                                                                               | Nature – Final submission                                         |
| 字体             | 无衬线，首选 **Helvetica 或 Arial**，全文统一；氨基酸序列用 Courier                                                                  | Nature – Final submission                                         |
| 最大字号         | 7 pt（正文文字）                                                                                                                     | Guide to Preparing Final Artwork (PDF)；Nature Protocols 指南     |
| 最小字号         | 5 pt                                                                                                                                 | 同上                                                              |
| 分图面板标签     | 8 pt 加粗（a、b、c…）                                                                                                                | Guide to Preparing Final Artwork (PDF)                            |
| 印刷最优字号     | 全尺寸下约 7 pt                                                                                                                      | Nature initial/revised submission (PDF)                           |
| 矢量格式（首选） | AI、EPS、PDF、PS、SVG；保持可编辑、分层、勿转曲线/勿栅格化文字                                                                       | Nature – Final submission；Final Artwork (PDF)                    |
| 光栅/照片格式    | 分层 PSD 或 TIFF；位图也接受 PNG/JPG（JPG 需最高质量）                                                                               | Nature – Final submission；initial submission (PDF)               |
| 照片 DPI         | 最小 **300 dpi**（按最大使用尺寸）；在线校样最大输出 450 dpi                                                                         | Nature – Final submission；Final guide (PDF)                      |
| 色彩模式         | **RGB**，300 dpi 及以上                                                                                                              | Nature initial/revised submission (PDF)                           |
| 色彩无障碍       | 避免红-绿等对色盲不友好的组合；见 Nature research figure guide 的 colour/accessibility 章节；Nature Methods 推荐 Wong/Okabe-Ito 配色 | Nature research figure guide；Wong 2011 (nmeth.1618)              |

> 注意格式细节的表面矛盾并非错误：Nature 对**矢量线稿**「不接受 JPEG/TIFF/PNG」（必须 AI/EPS/PDF）；对**照片/位图**则要求 PSD/TIFF（300–600 dpi）。区分依据是「这张图是矢量还是位图」。

### 来源 URL

- Final submission（主入口）：https://www.nature.com/nature/for-authors/final-submission
- Guide to Preparing Final Artwork (PDF)：https://www.nature.com/documents/nature-final-artwork.pdf
- Final guide to authors (PDF)：https://www.nature.com/documents/Final_guide_to_authors.pdf
- Initial / revised submissions (PDF，RGB/300dpi/7pt)：http://www.nature.com/documents/nature_3a_initial_revised_submissions.pdf
- Nature Protocols – Preparing Final Artwork (PDF，min 5pt / max 7pt)：https://www.nature.com/documents/nprot-guide-to-preparing-final-artwork.pdf
- Nature research figure guide（色彩/无障碍/分辨率总站）：https://research-figure-guide.nature.com/
- Wong「Points of View: Color blindness」Nature Methods（Okabe-Ito 来源）：https://www.nature.com/articles/nmeth.1618

---

## 4. Python 工具链现状

### 4.1 SciencePlots

- **定位**：一组 matplotlib `.mplstyle` 样式，专为科研论文/幻灯片/学位论文出图。约 9K stars，**活跃维护**（PyPI 最新 v2.2.2，最近发布 2026-02-25）。
- **可用样式**（`plt.style.use([...])` 可叠加）：
  - 基础：`science`（主样式）、`no-latex`、`grid`、`scatter`、`notebook`
  - 期刊：`ieee`（设为单栏宽、黑白可读、`std-colors` 覆盖色环）、`nature`（无衬线）
  - 色环：`bright`（色盲安全，7 色）、`vibrant`、`muted`（10 色）、`high-contrast`（3 色）、`light`（9 色）、`std-colors`、`high-vis`、`retro`
  - Paul Tol 离散彩虹：`discrete-rainbow-N`（N=1..23）
- **用法**：
  ```python
  import matplotlib.pyplot as plt
  import scienceplots            # v1.1.0+ 必须显式 import
  plt.style.use(['science', 'ieee'])
  ```
- **关键局限**：
  - **默认依赖 LaTeX**（文本走 usetex）。无 LaTeX 环境需加 `'no-latex'`：`plt.style.use(['science','no-latex'])`；Windows 常需手动把 LaTeX 加入 PATH。
  - **CJK 字体需另行安装**（README FAQ 有 Noto Serif CJK 安装说明）；science 样式的 LaTeX 模式下中文需走 `pgf` + `xeCJK`。
  - 只涵盖 IEEE / Nature，**没有 Elsevier 专用样式**（需自定义 rcParams 补齐尺寸/字体）。
  - 安装后在 notebook 可能需 `plt.style.reload_library()`。
- **来源**：
  - README：https://github.com/garrettj403/SciencePlots/blob/master/README.md
  - Gallery（样式全表）：https://github.com/garrettj403/SciencePlots/wiki/Gallery
  - PyPI（版本/维护状态）：https://pypi.org/project/SciencePlots/
  - 示例脚本：https://github.com/garrettj403/SciencePlots/blob/master/examples/plot-examples.py

### 4.2 matplotlib rcParams / style sheet 期刊化

- 期刊化最佳实践：用自定义 `.mplstyle` 或 `rcParams` 一次性锁定 `figure.figsize`（按栏宽英寸）、`font.family`/`font.sans-serif`、`font.size`、`axes.labelsize`、`legend.fontsize`、`savefig.dpi`（≥300/600）、`savefig.format`（pdf/eps）、`axes.linewidth`、`lines.linewidth`、`savefig.bbox='tight'`。
- 内置色盲友好色环：matplotlib 自带 `tableau-colorblind10` 样式（`plt.style.use('tableau-colorblind10')`）。
- 矢量导出：`fig.savefig('f.pdf')` / `.eps` / `.svg`；PDF/EPS 中嵌入字体可设 `pdf.fonttype=42` / `ps.fonttype=42`（TrueType，避免 Type 3 字体被期刊拒收）。
- 来源（matplotlib 官方样式文档，供 skill 引用）：https://matplotlib.org/stable/users/explain/customizing.html

### 4.3 seaborn（论文场景）

- **缩放上下文**：`sns.set_context("paper")`（另有 notebook/talk/poster），按论文尺寸缩放标签、线宽等；可用 `font_scale` 单独缩放字号。
- **样式**：`sns.set_style("whitegrid"|"ticks"|"white"|...)`；`white`/`ticks` 建议配 `sns.despine()` 去掉上/右轴线。
- **一步到位**：`sns.set_theme(context="paper", style="ticks", palette="colorblind", font="sans-serif")`。
- **色盲安全调色板**：`sns.color_palette("colorblind")`（10 色 CVD 安全）。
- 来源：
  - Aesthetics 教程：https://seaborn.pydata.org/tutorial/aesthetics.html
  - set_context：https://seaborn.pydata.org/generated/seaborn.set_context.html
  - set_style：https://seaborn.pydata.org/generated/seaborn.set_style.html
  - set_theme：https://seaborn.pydata.org/generated/seaborn.set_theme.html

### 4.4 plotly + kaleido（静态导出）

- **导出方式**：`fig.write_image("f.pdf")` 或 `plotly.io.write_image`；由 Kaleido 引擎渲染。
- **支持格式**：`png`、`jpg/jpeg`、`webp`、`svg`、`pdf`。
- **EPS 重大坑**：**Kaleido v1 已不再支持 EPS**（`format="eps"` 会抛 `ValueError`，提示改用 SVG/PDF）。Kaleido < 1.0.0 才支持 EPS（且需 poppler 库）。**投 IEEE/Elsevier 需 EPS 时，plotly 应导出 PDF/SVG 再转 EPS，或降级 Kaleido v0。**
- **版本关系**：Kaleido v1 需 plotly ≥ 6.1.1；Orca 引擎与 Kaleido v0 于 2025-09 后停止支持。
- **分辨率**：`scale` 参数放大光栅分辨率（`scale=2` 等）；但**对矢量导出中内嵌的光栅，`scale` 不会提高其分辨率**（Kaleido issue #58）。
- **width/height 坑**：`plotly.io.defaults.default_width/default_height` 会覆盖 `layout` 尺寸导致 `write_image` 不按预期尺寸输出；修法是把二者设为 `None`（Kaleido issue #378）。
- **来源**：
  - 静态导出文档：https://plotly.com/python/static-image-export/
  - 6.1 / Kaleido v1 变更（EPS 移除）：https://plotly.com/python/static-image-generation-changes/
  - write_image API：https://plotly.github.io/plotly.py-docs/generated/plotly.io.write_image.html
  - Kaleido 仓库：https://github.com/plotly/kaleido
  - EPS 报错源码：https://github.com/plotly/plotly.py/blob/master/plotly/io/_kaleido.py
  - scale/矢量坑 #58：https://github.com/plotly/Kaleido/issues/58
  - width/height 坑 #378：https://github.com/plotly/Kaleido/issues/378

### 4.5 色盲友好调色板

| 调色板                         | 用途           | 关键点                                                                                                       | 来源                                       |
| ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **Okabe-Ito**（=Wong palette） | 定性/分类      | 8 色，CVD 安全，被 Nature Methods 采纳；行业黄金标准                                                         | conceptviz / clauswilke colorblindr / jfly |
| **Paul Tol** schemes           | 定性/顺序/发散 | bright/high-contrast/vibrant/muted/medium-contrast/light/pale/dark + sunset/BuRd/iridescent 等；多数灰度可读 | SRON technote                              |
| **viridis 家族**               | 顺序/连续      | viridis/magma/plasma/inferno/cividis/mako/rocket/turbo；感知均匀 + 色盲稳健 + 灰度安全；matplotlib 内置      | viridis R vignette                         |

- **Okabe-Ito 十六进制**（含灰或黑两变体）：
  `#E69F00`(橙) `#56B4E9`(天蓝) `#009E73`(蓝绿) `#F0E442`(黄) `#0072B2`(蓝) `#D55E00`(朱红) `#CC79A7`(紫红)，第 8 色为 `#999999`(灰) 或 `#000000`(黑)。
  来源：clauswilke/colorblindr `palettes.R`（`palette_OkabeIto` 用 `#999999`，`palette_OkabeIto_black` 用 `#000000`）。
- **Paul Tol bright（7 色）**：`#4477AA #EE6677 #228833 #CCBB44 #66CCEE #AA3377 #BBBBBB`。
- **通用原则**：分类 ≤ 6–8 色；用 Okabe-Ito/Tol 做分类，viridis/cividis 做连续；任何图都不要仅靠红-绿区分；分类色亮度尽量接近；出图后做 deuteranopia/protanopia 模拟。
- **来源**：
  - Okabe-Ito 十六进制参考：https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference
  - colorblindr 源码（权威 hex）：https://rdrr.io/github/clauswilke/colorblindr/src/R/palettes.R
  - Okabe & Ito 原始「Color Universal Design」：https://jfly.uni-koeln.de/color/
  - Paul Tol Colour Schemes（SRON technote PDF）：https://personal.sron.nl/~pault/data/colourschemes.pdf
  - Paul Tol 主页：https://personal.sron.nl/~pault/
  - viridis 介绍：https://github.com/sjmgarnier/viridis/blob/master/vignettes/intro-to-viridis.Rmd

---

## 5. 中文 / CJK 字体处理（matplotlib 与 plotly）

学位论文/中文期刊出图常见两大坑：**中文显示为方框/问号** 与 **负号显示为方框**。

### matplotlib

- 核心两行：
  ```python
  import matplotlib.pyplot as plt
  plt.rcParams['font.sans-serif'] = ['SimHei']   # 或 'Microsoft YaHei' / 'Noto Sans CJK SC'
  plt.rcParams['axes.unicode_minus'] = False      # 修复负号(U+2212)显示为方框
  ```
- **负号问题原理**：matplotlib 默认用 Unicode 减号 U+2212，而 SimHei 等中文字体常不含该字形 → 显示方框；`axes.unicode_minus=False` 让其退回 ASCII 连字符 `-`。
- **前提**：字体须已安装（Windows 在 `C:\Windows\Fonts\`，如 simhei.ttf）；字体需覆盖所用汉字。
- **已知坑**：在 Jupyter 中用 `plt.rc_context({"font.sans-serif":"SimHei"})` 可能不生效，改用 `plt.rcParams.update(...)`（matplotlib issue #20738）。
- 也可用 `FontProperties(fname=...)` 对单个文本对象指定字体文件，避免全局改动。
- **来源**：
  - squash.io（rcParams + unicode_minus 方案）：https://www.squash.io/how-to-use-matplotlib-for-chinese-text-in-python/
  - jdhao 指南：https://jdhao.github.io/2017/05/13/guide-on-how-to-use-chinese-with-matplotlib/
  - Anpu Li（获取 SimHei）：https://anpu.li/matplotlib-chinese-font/
  - rc_context 失效 issue：https://github.com/matplotlib/matplotlib/issues/20738

### plotly

- 通过 `fig.update_layout(font=dict(family="Microsoft YaHei"))`（或 "SimHei"/"Noto Sans CJK SC"）指定中文字体；坐标轴/图例可分别设 `font`。
- **Kaleido 静态导出（PDF/SVG）时**，渲染进程需能找到该 CJK 字体，否则导出的静态图仍缺字；建议使用系统已安装、名称明确的字体（如 Noto Sans CJK）。
- **来源（一般做法，权威直证有限，标注 [partial evidence]）**：Kaleido 字体依赖于系统安装字体，见 https://github.com/plotly/kaleido 。plotly 中文字体设置的官方专页本次未定位到，建议以 `layout.font.family` + 系统字体安装为准 **[missing evidence: 无 plotly 官方 CJK 专页]**。

### SciencePlots + 中文

- `science` 样式默认走 LaTeX，中文需 `pgf` 后端 + `xeCJK`（示例脚本注释给了 `\setCJKmainfont{SimHei}` 的 pgf preamble 写法），或直接 `['science','no-latex']` 后再按上面的 matplotlib 方案设中文字体 + `axes.unicode_minus=False`。
- 来源：SciencePlots 示例脚本注释（pgf/xeCJK 段）：https://github.com/garrettj403/SciencePlots/blob/master/examples/plot-examples.py

---

## 6. 对 academic-figure skill 的建议

1. **以「目标期刊」为一等参数驱动 rcParams**：skill 应内置 IEEE / Elsevier / Nature 三套 preset（栏宽英寸、字体、字号、DPI、格式、色彩模式），让 AI 先问「投哪个刊/单栏还是双栏」，再套用对应 preset。数值以本报告速查表为准，Elsevier 尺寸提示「以 Guide for Authors 为准」。

2. **图宽用英寸硬编码、字号按最终尺寸设**：IEEE 单栏 3.5 in / 双栏 7.16 in；Nature 单栏 89 mm / 双栏 183 mm；Elsevier 单栏 90 mm / 双栏 ~190 mm。设 `figure.figsize` 用英寸，字号 IEEE 8–10 pt、Nature 5–7 pt（面板标签 8 pt 粗）、Elsevier 7 pt（下标 ≥6 pt）。

3. **格式与 DPI 决策树**：矢量优先（PDF/EPS/SVG）；位图按类型定 DPI —— 照片 300 dpi、线稿 IEEE 600 / Elsevier 1000 dpi、组合图 Elsevier 500 dpi；色彩默认 RGB（提醒 Elsevier Health / 某些印刷刊可能要 CMYK）。**注意 IEEE/Elsevier 要 EPS 而 plotly Kaleido v1 不支持 EPS → 走 PDF/SVG 转 EPS 或降级 Kaleido v0。**

4. **默认色盲安全配色**：分类默认 Okabe-Ito（附 hex），连续默认 viridis/cividis，禁止仅红-绿区分；matplotlib 可用 `tableau-colorblind10` 或 SciencePlots `bright`/`std-colors`，seaborn 用 `palette="colorblind"`。所有图应能在灰度下可读（IEEE/Nature 明确要求）。

5. **三库分工 + 中文兜底**：静态论文图首选 matplotlib（+SciencePlots，注意 LaTeX 依赖，无 LaTeX 用 `no-latex`）或 seaborn（`set_context("paper")`+`despine`）；交互/网页图用 plotly（导出注意 EPS 与 width/height/scale 坑）。中文场景统一注入 `font.sans-serif=[中文字体]` + `axes.unicode_minus=False`，并提醒字体需安装。

6. **字体嵌入与投稿自检**：EPS/PDF 必须嵌入字体（matplotlib 设 `pdf.fonttype=42`/`ps.fonttype=42` 避免 Type 3 被拒）；提醒用户 IEEE Graphics Analyzer 已停用，改为投稿系统自动检查 + Elsevier AQC，skill 应在导出后做一次「格式/DPI/字号/色彩模式」自查清单输出。

---

## Caveats / Not Found

- **Elsevier 1.5 栏 = 140 mm、最小 30 mm**：本次未在官方页面直接取到，属常见二手引用，已标 [missing evidence]，建议 skill 以目标刊 Guide for Authors 为准。
- **Elsevier 90 / 190 mm** 来自二手来源交叉印证（Enago/ScholarViz/davila7），非官方页面直证；官方 artwork PDF 只确认字号/分辨率/字体/RGB。
- **plotly 中文字体官方专页** 未定位到，第 5 节 plotly-CJK 部分为通用做法 [partial/missing evidence]。
- IEEE 字号存在版本差异：Author Center 现行页写「约 9–10 pt」，旧版 FAQ 写「可缩放到 8 pt」，已并列标注。
- Nature 存在 88/180 mm 与 89/183 mm 两套历史数字（不同指南/子刊），已以现行 Final submission 页的 89/183 mm 为主、并注明 1.5 栏 120/136 mm。
