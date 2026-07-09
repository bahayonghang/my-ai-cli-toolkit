# P10 干跑验收与整体一致性核查报告

- **角色**: trellis-check（质量核查，自修限 `skills/academic-research-tools/` 子树）
- **日期**: 2026-07-09
- **上下文顺序**: check.jsonl → prd.md（A1–A7）→ design.md → implement.md
- **约束**: PYTHONUTF8=1；禁 `rm -rf`；不跑 docs-sync（写）；不 git commit

以"新会话拿到用户请求"的视角，严格按 `skills/academic-research-tools/academic-figure/SKILL.md`
六步路由走查三条代表路径。

---

## 一、三条代表路径干跑

### 路径 a — 中文"画一张 IEEE 双栏的时序预测对比图"（独立项目，无 industrytslib）

**① 路由决策链**

1. 图表契约（读 `figure-contract.md`）：核心结论"模型预测随时间贴合真实值"；原型 = quantitative
   grid + hero panel（真实/预测对比）。
2. 期刊风格轴：显式"IEEE 期刊 / 双栏" → `journal_style = ieee`，尺寸档 = 双栏。
3. 库轴：无显式库；独立项目、无 industrytslib → 默认 `matplotlib`（静态论文图默认）。
4. 集成检测：无 `industrytslib` 依赖/导入 → 走独立路径。
5. 按需加载见 ②。6. 矢量导出 + QA。

**② 实际加载的 references**

- `journal-specs.md` → IEEE 卡
- `matplotlib-recipes.md` → 纯 rcParams 路线（有 LaTeX 且 ieee/nature 可选 SciencePlots）
- `chart-recipes.md` → §2「真实/预测对比」
- `qa-checklist.md`（交付前必读）

**③ 关键参数集**

| 维度 | 取值 | 出处 |
|---|---|---|
| figsize 宽 | 双栏 **7.16 in / 182 mm** | IEEE 卡 |
| figsize 高 | ~2.6 in（默认，非期刊强制） | recipe 默认 |
| font.family / serif | serif / Times New Roman, Times, DejaVu Serif | IEEE 卡 |
| font.size | 9 pt（正文），tick/legend 8 pt | IEEE 卡（9–10 pt，旧 8 pt） |
| savefig.dpi | 600（黑白线稿 >600；彩色/灰度改 300） | IEEE 卡 |
| 格式 | PDF（矢量），需 EPS 用 `savefig(*.eps)` | IEEE 卡 |
| 字体嵌入 | `pdf.fonttype=42` / `ps.fonttype=42` | 报告 §4.2 |
| 调色盘 | Okabe-Ito 8 色（真实值取中性 `OKABE_ITO[7]`，预测取信号色） | recipe + §2 |

**④ 与 journal-specs.md 对照结论**：**一致**。双栏 7.16 in/182 mm ✓、Times 系 serif ✓、
9 pt∈9–10 pt ✓、线稿 600 dpi ✓、PDF/EPS 矢量 ✓、fonttype 42 ✓。唯一 agent 主动决策项：
`IEEE_RCPARAMS` 预设默认写单栏 `(3.5, 2.6)`，双栏须把宽改为 7.16——recipe 正文已明示
"figure.figsize 用规格卡栏宽"，属预期走查步骤，非矛盾。

---

### 路径 b — "用 plotly 给 Elsevier 期刊出相关性热力图并导出"（独立项目）

**① 路由决策链**

1. 契约：原型 = image plate + quant（单主矩阵 + colorbar 为量化键）。
2. 期刊风格轴：显式"Elsevier 期刊" → `journal_style = elsevier`。
3. 库轴：显式"用 plotly" → `library = plotly`。
4. 集成检测：无 industrytslib → 独立路径。
5. 加载见 ②。6. kaleido 矢量导出 + QA。

**② 实际加载的 references**

- `journal-specs.md` → Elsevier 卡
- `plotly-recipes.md` → journalized layout + mm→px + Kaleido 导出矩阵 + EPS 坑
- `chart-recipes.md` → §5「相关性热力图」
- `qa-checklist.md`

**③ 关键参数集**

| 维度 | 取值 | 出处 |
|---|---|---|
| 尺寸 | 单栏 ~90 mm(3.54 in)/双栏 ~190 mm(7.48 in)；`width/height` 用像素 `mm_to_px(mm, dpi)`；热力图方形 `width=height` | Elsevier 卡 + plotly-recipes |
| 字体 | `family="Arial, Helvetica, sans-serif"`, `size=7` | Elsevier 允许字体集 + 7 pt |
| 连续色标 | `RdBu`（发散，`zmid=0`），非彩虹 | §5 |
| 分类 colorway | Okabe-Ito | plotly-recipes |
| DPI（内嵌栅格） | 线稿 1000 / 半色调 300 / 组合 500 | Elsevier 卡 |
| 导出 | `write_image` → **PDF/SVG（矢量）**；PNG Elsevier 不接受 | Elsevier 卡 + 矩阵 |
| EPS 替代路径 | kaleido v1 弃 EPS → 导 PDF/SVG 再转 或 降级 kaleido<1.0 | plotly-recipes §Static export |
| 尺寸坑 | `pio.defaults.default_width/height=None`（#378） | plotly-recipes |

**④ 与 journal-specs.md 对照结论**：**一致**。Arial/Helvetica ✓、7 pt ✓、PNG 不接受 ✓、
矢量优先 ✓、EPS 替代路径正确暴露 ✓、90/190 mm 二手默认并附"以 Guide for Authors 为准"免责 ✓。
两处属 agent 判断（非矛盾）：(i) 热力图 DPI 档位（半色调/组合/线稿）需按"这张图算哪类"择一，
矢量 PDF/SVG 导出时该值仅约束内嵌栅格；(ii) plotly 矢量像素→物理英寸映射已标 `[missing evidence]`，
recipe 已提示导出后核验物理尺寸。

---

### 路径 c — 英文 "make a Nature-style t-SNE figure with seaborn"（项目 requirements 含 industrytslib）

**① 路由决策链**

1. 契约：原型 = quantitative grid（单 hero 散点，聚类承载结论）。
2. 期刊风格轴：显式"Nature-style" → `journal_style = nature`。
3. 库轴：显式"with seaborn" → seaborn 归 matplotlib 层，`library = matplotlib(+seaborn)`。
4. 集成检测：项目 requirements 含 `industrytslib` → **命中** → 读 `industrytslib-integration.md`。
5. t-SNE 映射见 ②。6. 导出 + QA。

**② 实际加载的 references + 家族映射**

- `industrytslib-integration.md`：t-SNE 命中「Family → method mapping」的 **Dim-reduction** 行 →
  `tsne_plotter` / `umap_plotter` / `input_tsne` / `sequence_tsne_pca_analysis`
  （`analysis/dimensionality.py:52/136/229/429`，均 mpl；对应盘点报告 inv §1.4）✓
- `journal-specs.md` → Nature 卡
- `chart-recipes.md` → §8「降维 t-SNE/UMAP」（seaborn 原生路线）
- `qa-checklist.md`

**③ 关键参数集（严格 Nature 目标）**

| 维度 | 取值 | 出处 |
|---|---|---|
| 尺寸 | 单栏 **89 mm(3.5 in)**，方形面板 | Nature 卡 |
| 字体 | sans-serif Helvetica/Arial | Nature 卡 |
| 字号 | 5–7 pt（面板标签 8 pt 粗，逐注解设） | Nature 卡 |
| 色彩 | RGB + Okabe-Ito，禁红绿 | Nature 卡 + §4.5 |
| 矢量 | AI/EPS/PDF/SVG，勿转曲线 | Nature 卡 |
| 散点 | `s=8` 无边，`legend markerscale=2` | §8 |

**④ 偏差暴露与对照结论**：路径 c 三项期望**全部成立**——集成检测命中 ✓、t-SNE 映射到盘点报告
降维方法 ✓、**无衬线字体 caveat 被 references 正确暴露** ✓（`industrytslib-integration.md`
caveat 1 明写"该库 elsevier/nature/springer 风格实际渲染 serif/Times，Nature 官方要
Helvetica/Arial（见 journal-specs.md），严格投稿需覆写 font.family 或走独立路径"，与 Nature 卡
交叉印证）。

> **发现→修复（路由歧义，已在子树内最小修复）**：显式 `seaborn` + 集成命中 + t-SNE 名义命中
> plotter 方法（`tsne_plotter`）三者并存时，SKILL.md step 4"drive through create_plotter"字面
> 执行会产出 serif / jet 着色 / 非 seaborn 的 Nature 图（三重不合规）。references 虽含全部事实
> （path B + caveat 1 + inv §5.2）但未把"显式 seaborn 即使图型命中方法也应走原生绘制"这一点连起来。
> **已在 `industrytslib-integration.md`「Two paths」后补一段**：显式 seaborn（或库缺的 seaborn 统计图）
> 即使图型映射到 plotter 方法也走 path (B)——原生 seaborn 绘制 + `apply_style_to_matplotlib` 仅借样式，
> 严格无衬线刊再叠 caveat 1 的字体覆写。依据 inv §5.2 + caveat 1，未引入新事实。

---

## 二、核查结论

### A1–A7 逐条判定

| 验收 | 判定 | 证据 |
|---|---|---|
| A1 `just skills-check` | **PASS** | 退出 0；`academic-figure [OK]`，全部技能 `[OK]` |
| A2 `just ci` | **PASS** | P9 整跑退出 0；本次复跑 skills-check/python-check(35 文件)/node-test(146 pass,0 fail)/`git diff --check` 全绿；docs 漂移 `--check` = up to date(39 skills/85 files)。本次唯一改动为 docs-neutral 的 reference 正文，未重跑 VitePress build（read-only，P9 已绿） |
| A3 三路径干跑 | **PASS** | 见第一节，三条参数与规格卡一致 |
| A4 industrytslib API 一致 | **PASS** | 映射表 + 3 示例 API 名/模块/行号逐条对上 `industrytslib-viz-inventory.md`（抽验 `plot_test_result:28`、`plot_correlation_matrix:295`、`tsne_plotter:52`、`plot_interval_report:44`、`create_plotter:145`、`set_style:95`、env 三件套、5 styles、caveat 序号 等 20+ 条 0 偏差） |
| A5 规格卡数值有来源 | **PASS** | 新抽 3 数值回溯（见下）；`[missing evidence]` 保留无编造 |
| A6 evals 正负例 | **PASS** | 10 例，9 明确命中 + 1 边界（eval 6）；≥2 sibling 路由负例 + 2 out-of-scope 负例（见下表） |
| A7 code_map + 公开文档 | **PASS** | `code_map.md` 有 `academic-research-tools/` 类目行；docs catalog up to date，中文标题"学术研究工具"（非英文兜底）；paper-plot 反向路由回写 zh+en 详情页 |

**A5 新抽 3 数值回溯 URL**（均异于 headline 栏宽/字号，回溯到 `research/journal-specs-and-tooling.md`）：

1. Nature 面板标签 **8 pt 加粗** → 报告 §3 表，源 "Guide to Preparing Final Artwork (PDF)"
   → https://www.nature.com/documents/nature-final-artwork.pdf
2. Elsevier 组合图（线稿+半色调）**500 dpi** → 报告 §2 表，源 "Elsevier Science Author Artwork (PDF, 官方)"
   → https://physics.mff.cuni.cz/kfpp/conference/instr/artwork_instructions.pdf
3. IEEE 彩色 TIFF 推荐 **400 dpi** → 报告 §1 表，源 "IEEE Author-Supplied Graphics FAQ (PDF)"
   → https://www.telecom.uff.br/pet/petws/downloads/modelos/IEEE_Author_Digital_Toolbox/graphicsfaq.pdf

三者在 `journal-specs.md` 均带 Source 列且 Sources 段可解析到上述 URL，数值一致。

### evals 逐例走查（对 academic-figure 与改后 paper-plot 两份 description）

| # | prompt 摘要 | 预期路由 | 判定 | 说明 |
|---|---|---|---|---|
| 1 | IEEE 双栏时序预测对比，投 IEEE | academic-figure | ✓ 成立 | 期刊+投稿触发，无 paper-plot 风格名 |
| 2 | Nature-style t-SNE for submission | academic-figure | ✓ 成立 | "Nature-style"+"submission" 消解与 scatter_tsne_cluster 的近邻 |
| 3 | 用 plotly 出 Elsevier 热力图并导出 | academic-figure | ✓ 成立 | plotly + Elsevier，paper-plot 仅 matplotlib |
| 4 | industrytslib 出 IEEE 区间图 | academic-figure（集成） | ✓ 成立 | industrytslib + IEEE |
| 5 | 中文学位论文中文标签对比图 | academic-figure（chinese-thesis） | ✓ 成立 | description 明列"中文学位论文配图" |
| 6 | 把实验数据做成一张论文配图 | academic-figure（问一次期刊） | ⚠ 边界 | "把数据做成论文图"与 paper-plot 触发词"把数据画成论文图"字面重叠；以"无期刊名→问一次"消解，属设计选择 |
| 7 | 截图照着复现柱状图 | paper-plot from-image | ✓ 成立 | academic-figure description 显式排除复现 |
| 8 | 用 scatter_tsne_cluster 风格画 | paper-plot from-data | ✓ 成立 | 风格目录名 → paper-plot（强负例，t-SNE token 不误导） |
| 9 | BI 大屏 dashboard 联动 | 非本技能 | ✓ 成立 | description 显式排除 dashboards/BI |
| 10 | 用 AI 生成图形摘要配图 | 非本技能 | ✓ 成立 | 排除 AI 生图/graphical abstract 胜过"配图"触发 |

结论：9 例明确、1 例边界（eval 6，见 open issue #1）。房规要求 ≥2 sibling 路由负例 → eval 7/8 满足；
另 eval 9/10 为 out-of-scope 负例。

### 交叉一致性

- SKILL.md 六步引用的 7 个 references 文件全部在盘（`figure-contract` / `journal-specs` /
  `matplotlib-recipes` / `plotly-recipes` / `chart-recipes` / `industrytslib-integration` /
  `qa-checklist`）✓
- references 互引无死链：`chart-recipes`→`journal-specs`/`matplotlib-recipes`/`plotly-recipes`；
  `journal-specs`→`industrytslib-integration`/`matplotlib-recipes`；`industrytslib-integration`→
  `journal-specs`/`chart-recipes`；`qa-checklist`→`journal-specs`——目标均存在 ✓
- `<skill-dir>` 字面替换写法；grep 全子树无 `$SKILL_DIR` 残留（唯一命中为 AGENTS.md 房规"do not use"
  反例说明）✓
- frontmatter `category: academic-research-tools` = 父目录 ✓

### 门禁复跑（只需结论）

- `just skills-check`：**PASS**（退出 0，academic-figure [OK]）
- `just node-test`：**PASS**（146 pass / 0 fail）
- `PYTHONUTF8=1 just python-check`：**PASS**（35 文件编译通过）

---

## 三、修复清单

1. **[已修复]** `references/industrytslib-integration.md`「Two paths」后补一段，消解"显式 seaborn +
   集成命中 + 图型命中 plotter 方法"的路由歧义（路径 c）。additive、docs-neutral、`git diff --check` clean。

## 四、Open issues（仅报告，未动手；多在修复子树外）

1. **eval 6 边界（可接受）**：bare "把实验数据做成论文配图" 与 paper-plot 触发词字面重叠。不改动——
   R12 禁止对 paper-plot description 作反向路由句以外的改动；加强 academic-figure description 反而加剧重叠。
   当前"无期刊名→问一次期刊风格"是合理消解。留待团队决定是否在 description 层再细分。
2. **check.py / code_map.md 格式化 churn（子树外，仅报告）**：`scripts/check.py` 除注册新类目 slug 外，
   含 `argparse`/`validate_category` 调用的多行重排；`skills/code_map.md` 含标题空行插入。均 cosmetic、
   不影响门禁，疑似自动 formatter 产物；超"最小改动"但无害。
3. **spec 指南新增（子树外，仅提示）**：`.trellis/spec/guides/skill-authoring-conventions.md` 新增
   "Adding a new skill category" 16 行（记录四处联动：check.py / sync_docs_catalog.py / code_map.md /
   类目 AGENTS.md）。本任务相关的合理经验沉淀，未在 implement.md 分阶段列出。
4. **path b DPI 档位（非缺陷）**：相关性热力图的 300/500/1000 dpi 三档由 agent 按图类判断，矢量导出时
   仅约束内嵌栅格；规格卡给全三档属设计，非矛盾。
5. **`scripts/__pycache__/*.pyc`（非缺陷）**：本地 py_compile/node-test 产物，已被 `.gitignore` 忽略
   （`git check-ignore` 命中），不入库。
