# Research: Nature Skills（Yuan1z0825/nature-skills）

- **Query**: 分析 nature-skills 中与科研绘图相关的 skill，给出结构、能力、重叠差异与可吸收点
- **Scope**: internal（本地 shallow clone，静态阅读，未执行仓库代码）
- **Date**: 2026-08-16
- **本地路径**: `ref/repo/plot_ref/nature-skills/`

## 1. 仓库结构概览

根目录含 `skills/`（19 个 skill）、`scripts/`（仓库级校验）、`docs/`、`.github/workflows/`
（7 条 CI）、`LICENSE`（Apache-2.0）、两份 README。与科研绘图直接相关的只有
`skills/nature-figure/`（`manifest.yaml` 声明 `version: 2.5.0`）；其余 18 个 skill 分属
文献检索与核验、论文阅读与格式转换、写作与评审、实验日志与内部共享参考包，均不涉及绘图。

`nature-figure/` 关键文件：

| 路径 | 内容 |
| --- | --- |
| `SKILL.md`（109 行） | 路由文件，只做路由，不含图形逻辑 |
| `manifest.yaml` | 声明式清单：`always_load` / `routes` / `preference` / `axes.backend` / `references.on_demand` |
| `static/core/contract.md`、`static/core/stance.md`（各 41 行） | 常驻加载层：图形契约、后端门、默认立场 |
| `static/fragments/backend/python.md`、`backend/r.md`（41 / 45 行） | 按后端二选一加载 |
| `references/`（19 个 md，约 3,400 行） | 深度参考；最大四份为 `api.md` 474、`design-theory.md` 463、`common-patterns.md` 371、`chart-types.md` 348 |
| `scripts/`（6 个 py，约 1,910 行） | 见第 2 节 |
| `assets/`（34 MB） | `chart-atlas/` 3.3 MB、`figures4papers/` 28 MB、`gallery/` 2.3 MB |
| `evals/evals.json`、`tests/test_figure_safety.py`、`agents/openai.yaml` | 评测、测试、平台适配 |

## 2. 核心能力与工作流

**静态/动态分层**：`SKILL.md` 先读 `manifest.yaml` 与 `always_load` 两份 core 文档，
再按后端加载一份 fragment，其余 references 由 `references.on_demand` 的 condition 触发。
文档写明"不要凭记忆套用图形逻辑，必须从磁盘加载片段"。

**后端门（阻塞式 + 持久化）**：绘图前定 Python 或 R。解析顺序为显式选择 > 语言特定的
输入文件/工作流 > `scripts/nature_figure_backend.py get` 的已存偏好 > 询问一次并保存
（配置默认 `~/.config/nature-skills/nature-figure.json`，可由 `NATURE_FIGURE_CONFIG` 覆盖）。
选定后排他：绘图、预览、导出、视觉 QA 同一后端；缺运行时即停并报缺失依赖。

**Figure 证据结构规划（五点契约）**：写代码前填契约模板，字段含 Core conclusion、
Figure archetype、Panel map、Evidence hierarchy（hero / validation / controls）、
Statistics needed、Source data needed、Image-integrity notes、Reviewer risk。配套规则：
核心结论是一句带动词的断言；每个 Panel 回答唯一问题，遮住它若论证不受损即删除或合并；
按科学论点而非按数据表规划图；配对观测应检查配对差值，边缘分布重叠可能掩盖组内效应。
四种 archetype：`quantitative grid`、`schematic-led composite`、`image plate + quant`、
`asymmetric mixed-modality figure`；Panel 默认顺序为建立体系 → 主效应 → 机制/定位 →
代表性观测定量 → 稳健性与对照。

**多 Panel 组合**：`references/common-patterns.md` 给 16 个布局模式（专用图例面板、动态
y 轴收紧、同色变透明度消融条、灰度安全 hatch、条内文字亮度自适应、组中组分组条、
schematic hero + 定量行、深色影像板、临床三联图、非对称 hero 等）；
`nature-2026-observations.md` 补 5 个 2026 年 Nature 版面 archetype 观察。

**Python / R 双栈与输出约定**：Python 走 matplotlib/seaborn；R 走 `ggplot2 + patchwork
+ ComplexHeatmap + ggrepel`，导出用 `svglite` / `cairo_pdf` / `ragg`
（`references/r-workflow.md` 172 行）。Python 侧 `save_pub_py` 同时写 SVG、PDF、TIFF（默认 600 dpi），前置 rcParams 设
`svg.fonttype="none"` 与 `pdf.fonttype=42`；`qa-contract.md` 的 Export checks 分
Python / R 两段，要求导出后打开 SVG/PDF 确认文本可选、无重叠、按最终物理尺寸可读；
`nature-article-requirements.md` 区分初审文件与接收后生产文件。单栏约 89 mm、双栏约
183 mm；正文/刻度/图例 5–7 pt；Panel 标签小写加粗约 8 pt；**5 pt 字号地板适用于渲染后
每一个字形**——mathtext 上下标约缩到父级 0.7 倍，7 pt 的 `$R^2$` 可能含 4.9 pt 字形。

**脚本**：`validate_figure.py`（752 行，绘图源码静态预检，约 25 项检查，覆盖语法、字体族
与字号地板、mathtext 缩放、图例标签大小写、色图、可编辑文本、矢量/栅格导出、DPI、期刊
常见宽度、抽样与未申报排除、模拟数据泄漏、log 守卫、插值单调性、不确定度编码、旋转文本
锚点、跨后端引用；支持 `.py` 与 `.R`，含 `--json` / `--strict`）、`audit_pdf_text.py`
（152 行，零依赖扫描 PDF 内容流的 `Tf` 字号算子，执行 `--min-pt 5`）、`plot_templates.py`
（604 行，CSV 驱动 volcano / roc / dotplot / marginal / paired，输出 SVG + PDF +
600 dpi TIFF + 计数型 QA JSON）、`figure_safety.py`（50 行，`interp_monotone` 与
`label_y_above`）、`nature_figure_backend.py`（93 行，偏好读写）。

**素材复用四级阶梯**（`references/asset-adaptation.md`）：Exact reuse / Structural
adaptation / Style-only inheritance / Build anew，每级规定允许改动范围；配套字段映射表、
变换守卫清单（log / 比值 / 开方 / 归一化 / 分箱 / 相关与聚类）与数据完整性规则。文档写明
"模板能跑通自带示例不等于对新数据可用"。

## 3. 与现有 academic-figure skill 的重叠与差异

现有 `references/figure-contract.md` 第 7 行自述 "Adapted from nature-figure's figure
contract"，证据结构规划主体（契约模板、四类 archetype 表、Panel 五步顺序、审美整合、
审稿人风险清单）**已经吸收**；结构性改动是把 Python/R 后端门换成 library + journal-style
双轴，由推断代替提问，偏好存于 `scripts/academic_figure_pref.py`。

| 维度 | nature-figure v2.5.0 | academic-figure v1.0.0 |
| --- | --- | --- |
| 模式划分 | 1 条绘图主线 + 2 条 AI 图形摘要路由 | journal-spec / from-data / from-image 三模式 |
| 加载机制 | `manifest.yaml` 声明式 + always_load + on-demand condition 表 | `SKILL.md` 路由表 + mode 文档内的按需加载指示 |
| 期刊规范 | Nature 旗舰与 NMI 分阶段规则最细（148 行） | `journal-specs.md` 183 行覆盖 IEEE / Elsevier / Nature / Springer / chinese-thesis |
| QA | `qa-contract.md` 212 行 + 两个审计脚本 | `qa-checklist.md` 94 行，无审计脚本 |
| 多 Panel 布局库 | 16 模式 + 5 archetype 观察 | `chart-recipes.md` 末尾 Cross-cutting layout patterns 一节 |
| 图注写作 | `figure-legend-conventions.md` 90 行 | 无对应文档 |
| 素材复用 | `asset-adaptation.md` 四级阶梯 | `reproduction_guide.md` 102 行，面向 from-image 复现 |

现有 skill 已覆盖、不需重复吸收：图形契约主体；`pdf.fonttype=42` 与 `svg.fonttype="none"`
（`qa-checklist.md:23,32`）；5 pt 最小字号（`journal-specs.md:123`、
`matplotlib-recipes.md:107`）；CJK 字体链与 `axes.unicode_minus=False`
（`matplotlib-recipes.md:173-194`）；灰度可读与 hatch（`chart-recipes.md:323-325`）；
色盲安全（`journal-specs.md:44`）。缺失项：渲染后逐 Panel 审计、PDF 字形地板的实际审计、
不确定度定义在可比面板间的一致性、标注与几何净空规则、图注写作规范、素材复用分级、
源码静态预检、多 Panel 布局模式库、按论点归组数据表的规划规则、配对差值检查。

## 4. 建议吸收点

| 优先级 | 吸收内容 | 建议落点 | 说明 |
| --- | --- | --- | --- |
| 高 | 渲染后逐 Panel 审计表（Panel / 唯一论点 / 中心量 / 离散量 / 重复单位 / 标签 / 碰撞检查 / 通过）与"遮住该 Panel"测试 | 扩充 `references/qa-checklist.md` | 现有清单为表单式条目，无逐面板留痕 |
| 高 | 5 pt 字形地板适用于渲染后每个字形 + mathtext 上下标缩放风险 | 扩充 `references/qa-checklist.md`、`references/matplotlib-recipes.md` | 现有只写源码级 `font.size` 下限 |
| 高 | 零依赖 PDF 字号审计（`audit_pdf_text.py` 的 `Tf` 扫描） | 新增 `scripts/audit_pdf_text.py` | Apache-2.0 允许移植；零依赖便于通过 `just python-check` |
| 高 | 不确定度定义在可比面板间保持一致；单次 `fill_between` / `errorbar` 不证明覆盖 | 扩充 `references/qa-checklist.md` 统计段 | 与现有 Statistics legend minimum 衔接 |
| 中 | 素材复用四级阶梯 + 字段映射表 + 变换守卫清单 | 新增 `references/asset-adaptation.md`，由 `modes/from-data.md`、`modes/from-image.md` 引用 | 直接服务两个复现模式的模板套用 |
| 中 | 多 Panel 布局模式（专用图例面板、非对称 hero、组中组分组条、深色影像板、条内文字亮度自适应） | 新增 `references/panel-layout-patterns.md`，或扩充 `chart-recipes.md` 的 Cross-cutting 一节 | 对应 PRD 的"多 Panel 证据规划"验收项 |
| 中 | 图注写作规范（`Fig. N \| title` 骨架、时态、自洽性、显示名大小写、长度门、中文图注） | 新增 `references/figure-legend-conventions.md` | 现有 skill 无对应内容 |
| 中 | 按科学论点归组数据表（不做"一表一图"）+ 配对差值检查 | 补入 `references/figure-contract.md` | 现有契约的 Core conclusion rules 与 Reviewer-risk prompts 缺这两条 |
| 中 | 绘图源码静态预检 + 数值与标注安全助手（`interp_monotone`、`label_y_above`） | 新增 `scripts/validate_figure.py`（按 library 轴裁剪，去掉 R 检查）与 `scripts/figure_safety.py` | 前者 752 行需精简，建议只留字体/色图/导出/DPI/尺寸/log 守卫/抽样几类；后者仅 50 行 |
| 低 | Nature 旗舰与 NMI 的初审/生产分阶段规则与图注词数上限；CSV 驱动模板（volcano / roc / dotplot / marginal / paired） | 前者扩充 `references/journal-specs.md` 的 Nature 卡片，后者落在 `scripts/` 并配 references 说明 | 前者覆盖面窄且需核对期刊现行页面；后者与现有 9 个命名风格脚本定位重叠，需先判定是否扩类 |

不建议吸收：`assets/`（34 MB，见第 6 节）、R 工作流全套、`manifest.yaml` 声明式加载清单
（现有三模式路由表已实现同等分流）、AI 图形摘要路由（现有 `SKILL.md` 的 Route elsewhere
已把图像生成路由出去）、`agents/openai.yaml`。

## 5. 许可证与出处标注要求

- 仓库根 `LICENSE` 为 Apache License 2.0。移植代码或文档需保留版权与许可声明，
  在修改的文件中标注改动，并注明来源 `Yuan1z0825/nature-skills` 与 skill 名
  `nature-figure`（`manifest.yaml` 声明 `version: 2.5.0`）。
- **`skills/nature-figure/assets/figures4papers/` 不在 Apache-2.0 覆盖范围内**。
  该目录的 `THIRD_PARTY_NOTICES.md` 写明：截至 2026-08-03，上游
  `ChenLiu-1996/figures4papers` 未通过仓库根或 GitHub license 接口公开 LICENSE 文件，
  因此这些文件不得假定适用 nature-skills 的根许可证，保留仅为出处标注与研究参考，
  不构成复制、修改、再分发或发表衍生材料的许可。
- 该约束直接影响 PRD 仓库清单第 1 项（figures4papers）：若从 nature-figure 侧接触这批
  素材，须按 `references/demos.md` 的使用边界处理——只研究布局、配色、坐标轴、图例与
  导出结构，用原创代码重实现，不复用论文特定的标签、指标数值与统计结果。
- 引用其契约、QA 条目或布局模式时，在对应 reference 文件标注来源仓库、skill 名、
  许可证与查阅日期。

## 6. 依赖与体积注意事项

- clone 总体积 76 MB，其中 `skills/nature-figure/` 占 34 MB（`assets/figures4papers/`
  28 MB、`chart-atlas/` 3.3 MB、`gallery/` 2.3 MB），其余 18 个 skill 合计不足 4 MB；
  按 PRD 第 4 条，`assets/` 全部不纳入。
- 脚本依赖：`validate_figure.py`、`audit_pdf_text.py`、`figure_safety.py`、
  `nature_figure_backend.py` 为标准库实现，`plot_templates.py` 只需 NumPy 与 Matplotlib；
  移植脚本需通过 `just python-check`，Windows 下运行带 `PYTHONUTF8=1`。
- R 栈与现有 skill 的 library 轴（matplotlib/plotly）冲突，吸收 R 会引入新依赖轴，
  建议不纳入本次升级。

## Caveats / Not Found

- 未执行 `validate_figure.py`、`audit_pdf_text.py`、`plot_templates.py`，检查项与输出格式
  以源码函数名与 `references/qa-contract.md` 的描述为准。
- `references/api.md`（474 行）与 `design-theory.md`（463 行）只读取章节标题，PALETTE
  色值、字号层级表、色彩理论细节未逐条比对；`evals/` 与 `tests/` 未阅读。
- `assets/chart-atlas/`（10 张图型图谱 PNG）与 `assets/gallery/`（5 张成图示例）的用途
  在 references 中未找到明确说明，原因未查明。
