# 优化 academic-figure 默认 16:9 与曲线图留白

## Goal

`academic-figure` 在默认出图路径上产出 16:9 画布；笛卡尔曲线图在 y 轴上下留出可见空隙；坐标文字服从绘图框，曲线主体占图面主要面积。

用户价值：泛化「论文配图」和期刊投稿图不再出现贴边曲线、近 4:3 扁方画布、或标签大于数据主体的成品。

## Background

技能版本 1.1.0。默认出图走 **journal-spec**（`SKILL.md` 路由表：期刊/学位论文/泛化「论文配图」）。用户提交一张失败样本（任务 `research/evidence-curve-cramped.png`）：电流–时间折线。

测量记录见 `research/layout-failure-analysis.md`。要点：

- 样本像素 1164×654，宽高比 1.7798，已经是 16:9。
- y 刻度 25.2–25.8，数据约 25.18–25.78，曲线贴顶框与底框。
- 轴标题与刻度数字相对绘图框偏大，绘图框被四周文字挤占。

因此本任务同时覆盖三件事：默认画幅、曲线 y 轴留白、字号相对画布。只改 16:9 不能修这张样本。

现行规则互相冲突，位置与作用见同一分析文件。期刊预设高度约 4:3（`matplotlib-recipes.md` 已标明高度是 default）。`chart-recipes.md` 写了 10% ylim 留白，但标题是 tightening；`reproduction_guide.md` 要求 ylim 贴数据；`visual-review.md` 只拦裁切；`visual_qa.py` 不查留白与绘图框占比。

## Requirements

### R1 默认画幅 16:9

- 新建或投稿路径（journal-spec，以及 advise 交接后的绘图）在未指定比例时，画布宽高比为 16:9。
- 已解析期刊卡片时：宽度仍取卡片的单栏/双栏值；高度 = 宽度 × 9/16，且不超过卡片最大高度。
- 未解析期刊、或 chinese-thesis 卡片无物理尺寸时：默认 `figsize=(8.0, 4.5)`（英寸），plotly 对应像素按同一比例。
- 正方形图族保持正方形：相关性热力图、雷达、t-SNE/UMAP、以及 `chart-recipes.md` 中 `figsize=(W, W)` 的家族。
- 用户显式给出比例、尺寸或「单栏/双栏」时，用户值优先。
- from-image 仍按原图像素比设置 `figsize`。

### R2 曲线图 y 轴留白

- 笛卡尔折线、面积、带置信带的训练/时序/预测曲线：线性 y 轴在数据最小/最大外侧各留数据跨度的 12%。
- 优先 `ax.margins(y=0.12)`（或 plotly 等价），避免 `set_ylim(vmin, vmax)`。
- 比例或计数命中 P4 时：下界仍为 0 或声明基线；只在上界加 12% 留白。
- 对数轴在对数空间留同等相对空隙，不把线性 12% 套到对数数据上。
- 柱状图从 0 起的基线规则保持不变；本条不要求柱顶贴框。

### R3 绘图框大于标签

- 单面板笛卡尔图在 `layout="constrained"` 之后，数据坐标轴窗口框占画布宽度 ≥ 68%、高度 ≥ 58%。
- 期刊路径使用该期刊卡片字号（IEEE 约 9 pt，Elsevier/Nature 约 7 pt）。无卡片路径正文 10–11 pt，刻度比正文小 1 pt。
- 禁止把 `design-theory.md` 的 Display 24 pt 或 Compact 15–16 pt 用在普通论文/期刊图上。这两档只用于用户明确要求的海报或幻灯。
- 不得单独把 `axes.labelsize` / 刻度字号加大到「中文好看」而挤占绘图框。中文用字体链解决，不用加大字号解决。

### R4 规则单点与冲突消除

- 画幅、y 留白、字号相对画布三条只在一处给出数值，其余文件指针指向该处。
- 删除或改写与 R2 冲突的「ylim 贴数据去空白」指示（`reproduction_guide.md` 的 Common Pitfalls 行仅保留给 from-image 复现）。
- `chart-recipes.md` 的 “Dynamic y-axis tightening” 改为：窄带数据不要锚在 0–100，同时执行 R2 留白。
- `viz-pitfalls.md` P4 写明：适用于比例与有自然零点的计数；不适用于无自然零点的连续度量（损失、电流、温度、嵌入坐标）。

### R5 视觉检查能抓住本类失败

- `visual-review.md` 增加可读检查：曲线不贴框；标签不大于数据主体。
- `scripts/visual_qa.py` 对 matplotlib Figure 增加 WARN：线性笛卡尔轴数据相对 ylim 的空隙不足；单面板绘图框面积不足。缺 matplotlib 时测试 skip，与现有 visual-qa 测试一致。
- 机器 WARN 不单独作为投稿失败；代理必须按 visual-review 回改后再交付。

### R6 评测与版本

- `evals/evals.json` 增加至少 3 条行为用例，覆盖：无比例指定时 16:9；曲线 y 留白；字号服从绘图框。既有 23 条路由结论保持不变。
- 技能版本 1.1.0 → 1.2.0。frontmatter 变更后跑 `just docs-sync`。

## Acceptance Criteria

- [ ] A1 无用户比例、无正方形图族、无 from-image 原图约束时，journal-spec 产出的 `figsize` 宽高比为 16:9（允许 ±0.02）。期刊宽度仍等于卡片。
- [ ] A2 对与证据图同类的线性折线（窄带 y、无自然零点），ylim 下界 < 数据最小、上界 > 数据最大，两侧空隙各约为数据跨度的 12%（允许实现取 `margins(y=0.12)` 的等价结果）。
- [ ] A3 `design-theory.md` Display/Compact 字号不得出现在 journal-spec 普通论文路径的默认 rcParams 中。无卡片路径默认正文 ≤ 11 pt。
- [ ] A4 `visual_qa.audit_layout` 对「ylim 贴数据」和「标签挤占绘图框」的合成夹具给出 WARN；现有缺字 FAIL / 裁切 WARN 行为不回归。
- [ ] A5 `reproduction_guide.md` 不再把「ylim 贴数据」作为新图默认；from-image 仍可按原图 ylim 复现。
- [ ] A6 `evals/evals.json` 新增用例的 expected_output / assertions 写明 16:9、y 留白、字号服从绘图框；既有条目 id 1–23 的路由断言不改。
- [ ] A7 `just skills-check`、`just python-check`、`just node-test`、`just docs-check` 通过。version 为 1.2.0。
- [ ] A8 from-data / from-image 目录下 8 个风格脚本的 `figsize` 与 `set_ylim` 数值保持原样（git diff 不含这些脚本的比例/ylim 行，除非为无关的编码或注释）。

## Out of Scope

- 改 8 个目录复现脚本和 `assets/originals/` 的纸面比例、ylim、字号（复现契约）。
- 改期刊卡片的宽度、字号下限、DPI、格式、色彩模式。
- 改 x 轴留白政策（用户未要求）。
- 发布 skill、补 README.md / manifest.json、跑 qiaomu `validate_skill.py` 作为仓库门。
- 修改 industrytslib 或 pubfig 源码；仅在本技能控制尺寸时传入 16:9 高度。
- 重画用户证据图作为交付物。

## Constraints

- 只改 `skills/academic-research-tools/academic-figure/` 与因 version 产生的 `docs/` 目录页。
- SKILL.md 脚本路径保持 `python "<skill-dir>/scripts/...." `。
- Markdown 内嵌代码围栏外层用 4 反引号（格式化钩子）。
- 中文遵守仓库中文输出文风；英文遵守 ASD-STE100。
- Windows：`PYTHONUTF8=1`。
- qiaomu-meta：本包已是 Production 技能的增量；不升 Governed；不把电流图细节写成核心百科。

## Key Decisions

| ID | 决定 | 依据 |
| --- | --- | --- |
| D1 | 期刊路径：锁宽度，默认高度改为 16:9 | 用户要求默认 16:9；`matplotlib-recipes.md` 已写高度是 default；IEEE 最大高度 9⅔ in，16:9 高度远低于上限 |
| D2 | 无卡片默认 8.0×4.5 in | 16:9；与证据图像素量级接近；正文 10–11 pt 时绘图框可占主要面积 |
| D3 | y 留白 12% 数据跨度，两侧 | 用户要求「稍微」放大；现行 10% 条被忽略且标题为收紧；5%（matplotlib/visual-review）对本样本仍贴边 |
| D4 | 不改目录复现脚本 | from-data / from-image 输出契约是模仿原图 |
| D5 | P4 只约束比例与自然零点 | 证据图是电流（A）；从 0 起会压扁信号；贴数据会贴框 |

## Artifact Status

- `research/layout-failure-analysis.md`：已写
- `research/evidence-curve-cramped.png`：已存
- `prd.md`：本文件（已过收敛）
- `design.md` / `implement.md`：复杂任务配套，与本文件同时交付
- `task.py start`：需用户批准本规划摘要之后
