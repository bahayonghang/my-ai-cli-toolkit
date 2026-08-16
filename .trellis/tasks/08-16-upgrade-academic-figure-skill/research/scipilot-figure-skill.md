# Research: SciPilot Figure Skill（Haojae/scipilot-figure-skill）

- **Query**: 分析 scipilot-figure-skill 的结构、五个核心机制、与现有 skill 的重叠差异与可吸收点
- **Scope**: internal（本地 shallow clone，静态阅读，未执行仓库代码）
- **Date**: 2026-08-16
- **本地路径**: `ref/repo/plot_ref/scipilot-figure-skill/`

## 1. 仓库结构概览

单 skill 仓库，无子 skill 目录，无资产目录，clone 体积 375 KB（含 `.git` 161 KB）。
`SKILL.md`（329 行）frontmatter 只有 `name` 与 `description`，无 `version` / `category` /
`tags`；仓库还含 `README.md`、`requirements.txt`、`LICENSE`（MIT）。

| references（1,939 行） | 行数 | scripts（1,883 行） | 行数 |
| --- | --- | --- | --- |
| `chart_selection.md` 图型选择决策框架 | 288 | `profile_data.py` 数据剖析 | 481 |
| `data_profiling.md` 剖析报告解读手册 | 239 | `setup_style.py` 期刊预设 + CJK 字体 | 352 |
| `journal_specs.md` 期刊规范 + 中文字体安装 | 216 | `visual_qa.py` 预览渲染 + 程序自检 | 343 |
| `plot_recipes.md` 10 类图配方 | 543 | `check_figure.py` 文件级合规审计 | 265 |
| `publication_checklist.md` 形式合规清单 | 132 | `layout_tools.py` 子图标签对齐 + 版面兜底 | 253 |
| `visual_review.md` AI 读图清单与回改协议 | 145 | `export_figure.py` 多格式按最终尺寸导出 | 189 |
| `viz_pitfalls.md` P1–P18 避坑清单 | 376 | | |

`SKILL.md` 自我定位为"可视化顾问"，只覆盖纯数据图（折线、柱状、散点、箱线/小提琴、
热力图、误差棒、分布图、相关性矩阵、多面板组合），不做示意图、流程图、架构图。

## 2. 核心能力与工作流

八步工作流，`SKILL.md` 写明"每一步缺位前一步的成果都不该执行"：0 理解任务（确认论证
目标与数据形态，目标不明确时主动询问）→ 1 剖析数据 → 2 选图（给推荐 + 理由 + 1–2 备选）
→ 3 查期刊规范 → 4 配环境 → 5 绘制（`figsize` 直接设最终尺寸）→ 6 自检闭环（语义层
viz_pitfalls + 形式层 publication_checklist + 视觉层 visual_review）→ 7 导出。

五条硬性原则：按最终尺寸出图不二次缩放；矢量优先，数据图不用 JPEG；配色对色盲友好并加
冗余编码；字号在最终尺寸下 7–9 pt、最小 ≥ 6 pt；误差须在图注交代类型、n、检验方法、
多重比较校正与显著性符号定义。

### 机制 A：先剖析数据再选图

`profile_data.py` 输出每列类型（continuous / categorical / ordinal / datetime /
boolean / text / unknown）、样本量、缺失率、连续列描述统计 + 偏度 + IQR 异常值、是否建议
对数轴、分组样本量分布、相关性矩阵、初步图型建议；CLI 支持可重复的 `--group` 与
`--json`。`data_profiling.md` 是报告解读手册，末节给出"从报告到画图决策"的流程。

`chart_selection.md` 的决策三轴：变量数量与类型、论证意图（分布/比较/关系/趋势/构成/
相关/差异/不确定性）、数据规模。样本量阈值直接约束图型：n < 3 直接列点，不画箱线或
小提琴；3 ≤ n < 10 用 stripplot / 蜂巢散点 / dot plot；10 ≤ n < 30 用箱线或小提琴叠加
stripplot；n ≥ 30 三者均可；总数 > 10⁴ 用 alpha 0.1–0.3 或改 hexbin / 2D KDE。
另含"同一批数据、不同论点 → 不同图"两个实例、五条拆图判据（维度组合 > 12、x 轴标签
碰撞、图例 > 6 项、y 轴跨量级且不能用 log、想说两件事）与三组图型语义边界对比。

### 机制 B：主动拦截清单 P1–P18

`viz_pitfalls.md` 每条给"错误 → 后果/审稿人视角 → 替代方案"。P1 均值柱掩盖分布与样本量、
P2 双 Y 轴、P3 饼图与 3D 图、P4 Y 轴不当截断、P5 连续色阶无 colorbar、P6 离散点连成
折线、P7 过度使用颜色、P8 图例缺失或不清、P9 误差类型不交代、P10 chartjunk、
P11 分辨率/格式不达标、P12 一图多论点、P13 红绿对比、P14 rainbow/jet 色图、
P15 显著性符号滥用、P16 缺字乱码、P17 文字裁切与图例遮盖、P18 多面板子图编号不对齐。

拦截协议：说明命中哪条 → 一句话给审稿人视角的原因 → 给可执行的替代方案 → 询问是否仍按
原方案；用户坚持则照做，但留下明确的劝阻记录。文档给出可复用的话术模板。

### 机制 C：CJK 字体配置与负号修复

`setup_style.py` 的 `CJK_FONT_PRIORITY` 10 项：Noto Sans CJK SC、Noto Sans SC、
Source Han Sans SC、Source Han Sans CN、SimHei、Microsoft YaHei、PingFang SC、
Heiti SC、WenQuanYi Zen Hei、Arial Unicode MS；中文期刊宋体混排走 `CJK_SERIF_PRIORITY`
7 项（Noto Serif CJK SC … SimSun、STSong、Songti SC），由 `serif_for_zh=True` 触发；
找不到任何 CJK 字体时抛出 `CJK_INSTALL_HINT`，含三平台安装命令与 `--list-fonts` 提示。
`setup_style()` 全模式默认设 `axes.unicode_minus = False`（用 ASCII 连字符代替 U+2212）
与 `figure.constrained_layout.use = True`；`JOURNAL_PRESETS` 有 nature / science / ieee /
general 四套；`SciencePlots` 装了先应用再用内置预设覆盖，未装则回退不报错。P16 记录根因：
matplotlib 遇缺字只发 warning 仍出图，问题常到导出投稿才暴露。

### 机制 D：视觉自检闭环

`visual_review.md` 定义闭环：绘制 → 渲染 PNG 预览 → 程序自检 → AI 读图 → 回改 → 重渲
→ 通过。`visual_qa.audit_layout(fig)` 抓缺字乱码（FAIL）、文字越界裁切（WARN）、刻度
标签重叠（WARN）三类确定性问题，同时拦截 matplotlib 的 warning 与 logging 两条通道判
缺字，非破坏性；AI 用 `Read` 读 `render_preview(fig, out, dpi=150)` 产出的 PNG，对照
8 项清单核对图例压数据、标注重叠、子图标签对齐、子图间距、配色与灰度可分、数据被切、
跨子图一致性等感知性问题；第 4 步给 9 行"读图发现 → 回改动作"对应表。循环纪律：每改
一处重渲一次，最多 3 轮，3 轮不过判定为图型选错或维度过多。
`layout_tools.add_panel_labels(fig, style='nature'|'ieee')` 把标签锚在每个子图的
axes fraction (0,1) 再施加统一的 points 偏移，使标签横竖成线且不受各子图 y 轴刻度宽度
影响；`finalize_figure(fig, prefer='constrained')` 做版面兜底。

### 机制 E：按最终尺寸导出与灰度预览

`export_figure(fig, basename, formats=('pdf','svg','png'), dpi=300, size_inches=None,
grayscale_preview=False, tight=True, pad_inches=0.05, transparent=False)`：传入
`size_inches` 调 `fig.set_size_inches()` 强制最终尺寸；函数内强制 `pdf.fonttype=42`、
`ps.fonttype=42`、`svg.fonttype='none'`；`grayscale_preview=True` 额外写
`_grayscale.png` 供色盲检查。`check_figure.py --strict` 做文件级审计：栅格 DPI、矢量
格式、PDF 字体嵌入、SVG 检查、拒绝 JPEG，严重度分 INFO / WARN / FAIL。

## 3. 与现有 academic-figure skill 的重叠与差异

| 维度 | scipilot-figure-skill | academic-figure v1.0.0 |
| --- | --- | --- |
| 入口结构 | 单文件 SKILL.md 329 行，八步线性工作流；起点是数据剖析与图型决策 | 三模式路由（journal-spec / from-data / from-image）；起点是图形契约与期刊/库轴解析 |
| 图型选择 | 决策框架 288 行 + 剖析脚本 | 无对应机制 |
| 错误拦截 | P1–P18 + 拦截话术 | 无对应机制 |
| 视觉自检 | 渲染 PNG + 程序自检 + AI 读图 + 回改表 | 无对应机制 |
| 期刊覆盖 | Nature / Science / IEEE / Elsevier / PNAS / 中文核心 | IEEE / Elsevier / Nature / Springer / chinese-thesis |
| 绘图配方 | `plot_recipes.md` 10 节 | `chart-recipes.md` 10 图族 + matplotlib / plotly 两份配方 |
| 脚本 | 6 个工具脚本，1,883 行 | 1 个偏好 CLI + 9 个风格绘图脚本 |

现有 skill 已覆盖、不需重复吸收：CJK 字体链与 `axes.unicode_minus = False`
（`matplotlib-recipes.md:173-194`、`journal-specs.md:175-182`）；矢量优先与
`pdf.fonttype=42` / `svg.fonttype="none"`（`qa-checklist.md:23,32`）；期刊栏宽、最小
5 pt 字号、Panel 标签 8 pt 加粗；色盲安全与灰度可读、hatch 冗余编码
（`journal-specs.md:44`、`chart-recipes.md:96,323-325`）；10 类常用图配方；投稿前形式
合规清单（`qa-checklist.md`，条目少于 `publication_checklist.md`）。缺失项：数据剖析
脚本与"从剖析结果到图型决策"的流程、图型选择决策框架、样本量阈值驱动的图型规则、
P1–P18 语义层拦截清单与拦截话术、视觉自检闭环、子图标签统一对齐工具、按最终尺寸强制
导出的封装、灰度预览产物、文件级合规审计脚本。边界差异：SciPilot 不做示意图与风格复现；
现有 skill 的 journal-spec 模式同时覆盖创建与审阅，from-image 模式覆盖风格复现；
两者的图型选择能力不重叠，可直接互补。

## 4. 建议吸收点

| 优先级 | 吸收内容 | 建议落点 | 说明 |
| --- | --- | --- | --- |
| 高 | 图型选择决策框架：决策三轴、数据形态速查表、样本量阈值表、同数据不同论点对照、五条拆图判据、图型语义边界 | 新增 `references/chart-selection.md` | 对应 PRD"图型选择建议"；与 `chart-recipes.md` 分工为"选什么图"与"怎么画" |
| 高 | 在模式流程中插入"选图"步骤 | 修改 `references/modes/journal-spec.md`（图形契约之后、期刊轴解析之前）与 `SKILL.md` Resources 段 | 现有 journal-spec 六步无选图环节 |
| 高 | P1–P18 拦截清单 | 新增 `references/viz-pitfalls.md`，并在 `references/qa-checklist.md` 增加语义层交叉引用 | 对应 PRD"错误拦截"；现有 QA 只有形式层 |
| 高 | 拦截协议四步（说明命中项 → 审稿人视角原因 → 替代方案 → 询问是否坚持 + 留痕） | 写入 `SKILL.md` 或各 mode 文档 | 属行为约束，需放在常驻加载位置才生效 |
| 高 | 视觉自检闭环：渲染 PNG → 程序自检 → AI 读图 8 项清单 → 回改对应表 → 3 轮上限 | 新增 `references/visual-review.md` + `scripts/visual_qa.py`；插到 `modes/journal-spec.md` 第 6 步 QA 之前 | 对应 PRD"投稿前审计强化"；依赖 Read 读图，本平台可执行 |
| 中 | 数据剖析脚本与报告解读手册 | 新增 `scripts/profile_data.py` + `references/data-profiling.md` | 引入 pandas / scipy 依赖，需评估（见第 6 节） |
| 中 | 按最终尺寸强制导出 + 灰度预览产物 | 新增 `scripts/export_figure.py`，或把 `size_inches` 强制与 `_grayscale.png` 要点并入 `matplotlib-recipes.md` 与 `qa-checklist.md` | "不在 Word/LaTeX 里二次缩放"现有文档未明确写出 |
| 中 | 子图标签统一对齐（axes fraction 锚点 + 统一 points 偏移） | 新增 `scripts/layout_tools.py`，或写入 `chart-recipes.md` 的 Cross-cutting layout patterns | 与 nature-skills 的多 Panel 布局吸收点相邻，注意去重 |
| 中 | CJK 字体优先级链 10 项 + 宋体混排链 7 项 + 三平台安装提示 + `--list-fonts` | 扩充 `matplotlib-recipes.md` 的 CJK 段与 `journal-specs.md` 的 chinese-thesis 段 | 现有只列 3 个字体名，无回退链与安装指引 |
| 低 | 文件级合规审计脚本（栅格 DPI / 矢量 / PDF 字体嵌入 / 拒绝 JPEG） | 新增 `scripts/check_figure.py` | 与 nature-skills 的 `audit_pdf_text.py` 部分重叠，二者择一或合并 |
| 低 | `plot_recipes.md` 配方差集（箱线/小提琴叠 stripplot、pairplot、多面板组合）与中文图额外项 | 补入 `references/chart-recipes.md` 与 `references/qa-checklist.md` | 其余部分与现有配方和清单重叠度高 |

不建议吸收：`setup_style.py` 的 `JOURNAL_PRESETS` 整体（现有 `journal-specs.md` 已按
期刊卡片组织，两套预设并存会产生两个数值来源）、plotly 相关内容（`plotly-recipes.md`
已覆盖）、SciencePlots 包装（`matplotlib-recipes.md:25,31` 已讨论）。

## 5. 许可证与出处标注要求

- 许可证：MIT，`LICENSE` 文件，`Copyright (c) 2026 Haojae`。MIT 允许复制、修改、合并、
  发布、再授权，条件是在所有副本或实质性部分中保留版权声明与许可声明。
- 移植脚本时须在文件头保留 MIT 版权声明并注明来源仓库 `Haojae/scipilot-figure-skill`。
- 移植文档内容（决策框架、P1–P18、读图清单）建议按本仓库文风重写而非逐字复制，仍需在
  新增 reference 文件中标注来源仓库、许可证与查阅日期。
- `SKILL.md` frontmatter 无 `version` 字段，正文提到 "v2.1 新增"；可引用的版本标识只有
  commit 号，需在出处标注中记录克隆时的 commit。

## 6. 依赖与体积注意事项

- `requirements.txt` 必需项 7 个：`matplotlib>=3.7`、`seaborn>=0.13`、`plotly>=5.18`、
  `Pillow>=10.0`、`numpy>=1.24`、`pandas>=2.0`、`scipy>=1.10`；可选项 4 个（注释状态）：
  `SciencePlots>=2.1`、`pypdf>=4.0`、`kaleido>=0.2.1`、`PyMuPDF>=1.23`（仅用于对已保存
  PDF 做 `render_preview`）。文档称可选依赖缺失时优雅降级并提示。
- 按脚本的依赖归属：`profile_data.py` 需 pandas + scipy（偏度）；`check_figure.py` 与
  灰度预览需 Pillow，PDF 字体嵌入检查需 pypdf；`visual_qa.py`、`layout_tools.py`、
  `export_figure.py` 只需 matplotlib，移植成本最低。
- 体积无风险：仓库 375 KB，无资产目录，无二进制文件。
- 移植脚本需通过 `just python-check`；Windows 下运行带 `PYTHONUTF8=1`，脚本含中文
  docstring 与中文输出，编码问题需在移植时验证。`setup_style.py` 的字体查找依赖
  `matplotlib.font_manager` 的已索引字体表，Windows 下刷新字体缓存的行为未验证。

## Caveats / Not Found

- 未执行任何脚本，`profile_data.py` 的报告格式、`audit_layout` 的命中率、
  `check_figure.py --strict` 的输出均以源码签名、docstring 与 references 描述为准。
- `plot_recipes.md`（543 行）只读取章节标题，10 节配方的代码未逐节比对，与现有
  `chart-recipes.md` 的重叠度为按标题的估计。
- `journal_specs.md` 的具体数值（栏宽、字号、DPI）未与现有 `journal-specs.md` 逐项比对，
  两套数值是否一致未验证；`README.md` 未逐行阅读。
- 仓库无 `tests/` 目录，脚本的自测覆盖情况未找到。
