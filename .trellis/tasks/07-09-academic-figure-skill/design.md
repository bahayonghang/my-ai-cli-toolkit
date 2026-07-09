# design.md — academic-figure 技能技术设计

依据：`prd.md`（R1–R11）、`research/journal-specs-and-tooling.md`、`research/nature-figure-analysis.md`、`research/industrytslib-viz-inventory.md`（图表映射与集成示例以此为唯一事实来源）。

## D1 类目命名（R1）

- 定稿：`skills/academic-research-tools/`（用户评审定名，2026-07-09；语义覆盖未来的学术研究工具类技能）。
- 同步项：`skills/code_map.md` 的 Internal Routing 增加一行类目说明。

## D2 目录布局（R2/R10）

遵循本仓库惯例（无 manifest.yaml，路由表内联在 SKILL.md；重内容放 references/）：

```
skills/academic-research-tools/academic-figure/
├── SKILL.md                          # 精简路由器（≤120 行正文）
├── references/
│   ├── figure-contract.md            # 图表契约 + 审稿风险自检（继承改造）
│   ├── journal-specs.md              # IEEE/Elsevier/Nature 规格卡 + springer/chinese-thesis 扩展档
│   ├── matplotlib-recipes.md         # matplotlib+seaborn 期刊化 quick-start
│   ├── plotly-recipes.md             # plotly template + kaleido 导出
│   ├── chart-recipes.md              # 图表家族配方（时序/对比/箱线/分布/热力图/损失/区间/降维/序列）
│   ├── industrytslib-integration.md  # 项目检测 + create_plotter 映射表
│   └── qa-checklist.md               # 交付前 QA 契约
├── scripts/
│   └── academic_figure_pref.py       # (library, journal_style) 偏好持久化 CLI
├── tests/
│   └── pref-script.test.mjs          # 偏好脚本 get/set/clear 行为测试（临时配置目录）
└── evals/
    └── evals.json                    # 触发正负例
```

类目级另建 `skills/academic-research-tools/AGENTS.md`（对齐 `skills/research-learning-knowledge/AGENTS.md` 的房规结构：`<skill-dir>` 字面替换规则、frontmatter 房规、evals 房规、结构变更后 docs-sync 提醒）。

不引入 assets/ 图库（nature-figure 的 chart-atlas/figures4papers 不搬运，必要时 references 内文字描述配方即可；后续确有需要再补，避免仓库膨胀）。

## D3 SKILL.md 路由协议（R7）

frontmatter：顶层 `name: academic-figure`、`category: academic-research-tools`、`tags`（academic-figures, matplotlib, seaborn, plotly, ieee, elsevier, nature, publication）、`version: 0.1.0`、`description` 见 D8。

路由步骤（对 nature-figure 五点契约的改造——"backend 门控"换成"库 + 期刊风格"双轴，且允许推断、最多问一次）：

1. **图表契约**：写核心结论一句话 → 证据链/面板映射 → 原型分类（quantitative grid / schematic-led / image+quant / asymmetric）→ 期刊导出契约。先立论后写码。
2. **期刊风格轴**：显式指定 > 请求上下文（投稿目标期刊）> `scripts/academic_figure_pref.py get` 的保存偏好 > 一次性提问（"目标期刊风格？ieee / elsevier / nature（或 springer / chinese-thesis）"）。回答后保存。
3. **库轴**：显式指定 > 项目上下文（代码里已用的库；industrytslib 项目 → 其 matplotlib/plotly 后端）> 保存偏好 > 默认 matplotlib（论文静态图默认；交互/网页需求才推荐 plotly）。seaborn 归入 matplotlib 轴：作为其上层 API，规格最终仍落到 rcParams。
4. **集成检测**：满足任一 → 走 `references/industrytslib-integration.md`：(a) 用户明说 industrytslib；(b) 项目依赖/导入中出现 `industrytslib`。否则走独立路径（journal-specs + 对应库 recipe）。集成路径只调用不修改该库。
5. **按需加载**：只读当前轴组合需要的 references（风格规格卡一节 + 一份库 recipe + 命中的图表家族配方）；qa-checklist 在交付前必读。
6. **导出与 QA**：按 D5 导出契约出文件，逐条过 qa-checklist。

## D4 期刊规格卡设计（R3）

`references/journal-specs.md` 每刊一张卡（数值与来源 URL 从 `research/journal-specs-and-tooling.md` 转写，missing evidence 保留标注）：

| 维度 | IEEE | Elsevier | Nature |
|---|---|---|---|
| 单栏宽 | 3.5 in (88.9 mm) | ~90 mm | 89 mm |
| 双栏宽 | 7.16 in (182 mm) | ~190 mm | 183 mm |
| 字体 | Times 系 serif | Arial/Helvetica/Times/Courier/Symbol | Helvetica/Arial 无衬线 |
| 字号 | ~9–10 pt（旧版 8pt 并注） | 7 pt（下标 ≥6pt） | 5–7 pt，面板标签 8 pt 粗 |
| DPI | 彩色/灰度 >300、线稿 >600 | 线稿 1000 / 半色调 300 / 组合 500 | 照片 300 |
| 格式 | PS/EPS/PDF/PNG/TIFF | EPS/PDF/TIFF（不收 PNG） | 分层矢量 AI/EPS/PDF/SVG 优先 |
| 色彩 | RGB | RGB（部分 Health 刊 CMYK） | RGB，红绿无障碍 |

扩展档：springer、chinese-thesis（CJK 字体链 SimHei/微软雅黑/Noto CJK + `axes.unicode_minus=False`；industrytslib 已有同名风格）。卡内附"以目标刊 Guide for Authors 为准"的免责说明（Elsevier 尺寸随刊变化）。

## D5 导出契约（R8）

- matplotlib：矢量 PDF 优先（`pdf.fonttype=42`/`ps.fonttype=42` 嵌 TrueType，避免 Type 3 被拒）；需要 EPS 的刊直接 `savefig(*.eps)`；栅格按规格卡 DPI。
- plotly：kaleido 导出 png/svg/pdf；**EPS 为已知坑**（kaleido v1 已弃 EPS）→ 输出 PDF/SVG 再转换，或声明降级 kaleido v0；CJK 依赖系统字体 + `layout.font.family`。
- 调色板默认色盲安全：分类 Okabe-Ito（8 色），连续 viridis/cividis；禁止仅用红绿区分；黑白打印可读（线型/标记区分作为冗余通道，industrytslib IEEE 风格已内置 grayscale/linestyle 备选，同理搬到独立路径）。

## D6 图表家族配方与 industrytslib 映射（R5/R6）

- `references/chart-recipes.md`：按家族组织——时序、真实/预测对比、箱线、分布、相关性热力图、训练损失（diffusion/GAN）、区间预测、降维（t-SNE/UMAP）、序列（npy 批量）、指标表格化。每族给：适用原型、三刊参数要点、matplotlib 与 plotly 的最小实现骨架。
- `references/industrytslib-integration.md`：检测方法 + 入口（`create_plotter(backend, project, style=...)`、`plotter.set_style(...)`、`plotter_builder`）+ **家族→方法名映射表**（方法名、所在模块、后端支持，逐条以 `research/industrytslib-viz-inventory.md` 为准转写，不得凭记忆写 API）+ 3 个最短调用示例 + 环境变量（`INDUSTRYTSLIB_EXPORT_PNG`/`INDUSTRYTSLIB_PNG_DPI`/`INDUSTRYTSLIB_WEBGL_THRESHOLD`）。
- 集成路径分两档（盘点结论：该库只暴露业务化方法，无通用 scatter/bar/violin API）：(a) 图表家族命中 → 直接调 plotter 业务方法；(b) 家族未命中 → 原生 matplotlib 绘制 + `StyleManager.apply_style_to_matplotlib(style)` 只复用其期刊样式。
- 集成注意事项（必须写入该 reference）：① 该库 elsevier/nature/springer 风格 docstring 声称 sans-serif、实际渲染 serif/Times，与官方期刊要求（Nature/Elsevier 要 Helvetica/Arial）不符——严格投稿场景需覆写 `font.family` 或走独立路径；② `get_available_styles()` 实际返回 5 种（含 chinese_thesis）；③ plotly 路径 PNG 导出默认关闭，需 `INDUSTRYTSLIB_EXPORT_PNG=1` 或显式 export_formats；④ Windows 下 FontManager 不扫描 `C:\Windows\Fonts`，中文出图前先验证 `FontManager.get_cjk_font_family()` 非 None，必要时 `apply_visualization_options_to_matplotlib(options)` 强制注入 CJK 字体。
- 独立路径双路线：SciencePlots 路线（有 LaTeX、目标 ieee/nature 时最省事；无 Elsevier 样式、CJK 需 no-latex 处理）与纯 rcParams 路线（零依赖，规格卡数值直接展开）。两路线的选择规则写进 matplotlib-recipes.md。

## D7 偏好脚本（R7）

`scripts/academic_figure_pref.py`：纯标准库 CLI，骨架继承 nature-figure 的 `nature_figure_backend.py`（get/set/clear/path 子命令 + 环境变量覆盖）：

- 存储：`~/.config/my-claude-skills/academic-figure.json`，env `ACADEMIC_FIGURE_CONFIG` 覆盖路径。
- 键：`library`（matplotlib|plotly）、`journal_style`（ieee|elsevier|nature|springer|chinese-thesis）。两键独立 get/set。
- 测试：`tests/pref-script.test.mjs` 以 Node 子进程调用（`PYTHONUTF8=1`，临时目录作配置），断言 set→get 回读、clear、非法值报错。

## D8 description 触发词（R2，写早）

要点：创建/修改/审查学术论文图表；期刊风格 IEEE、Elsevier、Nature（扩展 Springer、中文学位论文）；库 matplotlib/seaborn/plotly；industrytslib 项目自动集成。中文触发：论文配图、学术图表、期刊图、投稿图、科研绘图、出图、IEEE 图、中文学位论文图。英文触发：publication-ready figure、journal figure、IEEE/Elsevier/Nature style plot。排除：dashboard/BI 大屏、AI 生图/图形摘要、R 语言绘图、Illustrator/Figma 后处理、无图表诉求的通用数据分析；复现具体论文的图/模仿特定论文视觉风格 → 路由到 paper-plot（见 D12）。

## D9 evals（R11）

`evals/evals.json` 采用本仓库房规 schema（`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`，见 `skills/research-learning-knowledge/AGENTS.md`；prompt 用自然语言、expected_output 与 assertions 用英文；evals 不进 CI，属评审资产）：

- 正例 ≥6：中文"画一张 IEEE 双栏的时序预测对比图"、英文 "make a Nature-style t-SNE figure"、"用 plotly 出 Elsevier 热力图并导出"、industrytslib 场景、中文学位论文场景、只说"论文配图"无期刊名场景。
- 近邻负例 ≥4（含 ≥2 条路由负例）：复现上传的论文图/按 paper-plot 风格目录名画图（→ paper-plot）、BI 大屏/dashboard（→ 非本技能）、AI 生成图形摘要、R/ggplot2 绘图。
- 发布档位为 Production（团队目录），按 yao-meta 门槛跑触发评测；yao-meta 的 `trigger_eval.py` 若在本机可用则作为附加门（注意 `$SKILL_DIR` 运行时不注入，需字面替换路径），不可用则人工逐例核查并在任务里记录 missing evidence。

## D10 验证映射（对 prd 验收标准）

| 验收 | 验证手段 |
|---|---|
| A1/A2 | `just skills-check` → `just ci` |
| A3 | 三条代表路径干跑记录（写入任务 research/ 或 PR 描述）：IEEE+matplotlib 时序对比、Elsevier+plotly 热力图导出、Nature+seaborn t-SNE |
| A4 | 映射表逐行对照 `research/industrytslib-viz-inventory.md` |
| A5 | journal-specs.md 逐数值带 URL 或 missing evidence |
| A6 | evals.json 逐例人工/脚本核查 |
| A7 | `just docs-sync` 后 `just docs-check`，code_map.md diff 检查 |

## D11 风险与回滚

- 新类目是目录级新增，回滚 = 删除目录 + 还原 code_map.md/docs（单提交内聚，`git revert` 即可）。
- `just docs-sync` 会重生成全部 docs：实现时先确认工作区无未提交的手改 docs。
- Windows：脚本与测试统一 `PYTHONUTF8=1`；不使用 `rm -rf`（hook 拦截）。

## D12 近邻边界：paper-plot（R12）

`skills/research-learning-knowledge/paper-plot` 已存在，分工如下：

| 维度 | paper-plot（现存） | academic-figure（新） |
|---|---|---|
| 定位 | 复现具体论文的视觉风格 / 复现上传论文图 | 按目标期刊投稿规范产出合规图 |
| 输入 | 数据+风格目录名 / 论文图截图 | 绘图诉求 + 期刊风格轴 + 库轴 |
| 库 | 仅 matplotlib（8 个预置脚本） | matplotlib(+seaborn)/plotly + industrytslib 集成 |
| 输出 | 300dpi PNG | 期刊导出契约（矢量 PDF/EPS/SVG + 合规 DPI/字体/色彩） |
| 触发核心 | "复现这张图"、风格目录名、"照着这个图画" | "IEEE/Elsevier/Nature 投稿图"、期刊合规、industrytslib 出图 |

- academic-figure 的 description 显式排除"复现论文图/模仿特定论文风格"；SKILL.md 正文路由表把该场景指向 paper-plot。
- 反向路由（用户已批准，2026-07-09）：在 paper-plot 的 description 末尾追加一句"期刊投稿合规出图 → academic-figure"；属既有技能边界改动，独立提交便于单独回滚。
- 不移动、不重构 paper-plot；是否将其迁入新类目留作后续独立任务（用户决策）。
