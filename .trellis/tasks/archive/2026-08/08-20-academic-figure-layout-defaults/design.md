# Design — academic-figure 1.2.0 画幅与曲线留白

依据：`prd.md` R1–R6；事实来源 `research/layout-failure-analysis.md`。

## 目标

把默认画幅、曲线 y 留白、字号相对画布写成一条可执行合同，让 journal-spec 默认路径稳定产出 16:9、有留白、绘图框为主的图。目录复现路径保持原契约。

## 非目标

见 `prd.md` Out of Scope。不 vendor 新依赖。不改 `academic_figure_pref.py` 的 journal/library 键。

## 边界

| 层 | 职责 |
| --- | --- |
| `references/layout-defaults.md`（新增） | 唯一数值源：16:9、无卡片 figsize、y 留白 12%、字号上限、绘图框占比、例外表 |
| `references/matplotlib-recipes.md` | 预设 `figure.figsize` 高度改为「宽度 × 9/16」；指针指向 layout-defaults；不重复 12% |
| `references/plotly-recipes.md` | `height_px` 默认 `round(width_px * 9/16)`；指针同上 |
| `references/chart-recipes.md` | 改写 tightening 条为「窄带不锚 0–100 + 执行 layout-defaults 留白」 |
| `references/visual-review.md` | 读图清单增加两项；修复表增加对应动作 |
| `references/qa-checklist.md` | Final size 行补「默认高度 16:9，不超过卡片上限」 |
| `references/viz-pitfalls.md` | P4 适用范围一句 |
| `references/reproduction_guide.md` | 「Too much whitespace」限定为 from-image |
| `references/design-theory.md` | Display/Compact 再加一句硬闸：普通论文路径禁止 |
| `references/modes/journal-spec.md` | 加载 references 步加入 layout-defaults |
| `SKILL.md` | Resources 一行指针；version 1.2.0；路由表不改 |
| `scripts/visual_qa.py` | `audit_layout` 增 WARN，只测量不改图 |
| `tests/visual-qa.test.mjs` | 夹具覆盖新 WARN；无 matplotlib skip |
| `evals/evals.json` | 追加 ≥3 条；id 1–23 不动 |
| 目录 `scripts/line_*.py` 等 | 不改 figsize/ylim |

SKILL.md 保持路由入口。数值不进 SKILL.md 正文。

## 合同：`layout-defaults.md`

文件对代理给出可执行步骤，不写散文。建议结构：

1. **何时应用** — journal-spec 与 advise 交接后的新图。from-image 只在用户未要求模仿原图比例时才用画幅条。
2. **画布** — `AR = 16/9`。`height = width / AR`。无卡片 `width=8.0`。正方形图族表（heatmap / radar / tsne）。用户指定优先。高度 cap = 期刊 max height。
3. **y 留白** — 适用：plot/fill_between 的线性笛卡尔 y。`ax.margins(y=0.12)`；已设 ylim 则按数据跨度重算。P4 比例：`ymin=0`，`ymax=vmax*1.12`。对数：`ax.margins` 在 log 轴上操作。
4. **字号** — 有卡片用卡片。无卡片 body 10–11，ticks body−1。禁止 15–24 pt。CJK 换字体不换大字号。
5. **绘图框** — constrained layout 后单面板 axes 窗口框 / figure 窗口框 ≥ 0.68 宽、≥ 0.58 高。不足则减小 labelsize/tick labelsize，不加大 figsize 去「迁就」过大字号。
6. **例外** — from-image 原图 AR 与原图 ylim；目录风格脚本；用户显式 ylim/figsize；双轴与折断轴按现有家族配方。

matplotlib 与 plotly 各给一段最小代码，符号沿用 `W` `H` `W_px` `H_px`。

## 数据流

```
请求 → 选 mode
  journal-spec / advise 交接
      → 读 figure-contract → journal card 宽度
      → 读 layout-defaults 得 H、字号档、margins
      → matplotlib-recipes 或 plotly-recipes 套入 figsize / layout
      → 绘图
      → visual_qa.audit_layout（含新 WARN）
      → visual-review 读 PNG（含新两项）
      → 回改字号或 margins，最多 3 轮
      → 按原 journal-spec 导出
  from-data / from-image
      → 现有模仿契约，不读画幅/留白默认（from-image 仍读 reproduction_guide 的复现限定句）
```

## visual_qa 增量

在 `audit_layout` 现有三项之后追加，失败级别 WARN：

1. **y 留白** — 对每个带 Line2D 或 PolyCollection（fill_between）的线性 y 轴：取已绘数据的 min/max（忽略 inf/nan）；与 `get_ylim()` 比。若 `(data_min-ylim[0])/(ylim[1]-ylim[0]) < 0.08` 或上侧同类，记一条 WARN，提示读 `layout-defaults.md`。ylim 跨度为 0 则跳过。yscale 为 log 则跳过（避免错误套线性阈值）。
2. **绘图框占比** — `len(fig.axes)==1` 且非 polar：`ax.bbox` 与 `fig.bbox` 比，宽 < 0.68 或高 < 0.58 则 WARN。

阈值 0.08 略松于合同 0.12，减少刻度圆整造成的误报。夹具：一张 `set_ylim` 贴数据的折线；一张 24 pt 标签的小 figsize 折线。现有 demo 与缺字路径不改语义。

不把这两项升级为 FAIL：缺字仍是唯一 FAIL。

## 评测

在 `evals/evals.json` 追加（编号接 24）：

| id | 意图 | 断言要点 |
| --- | --- | --- |
| 24 | 「帮我画一张训练损失曲线，论文用，期刊还没定」 | journal-spec；figsize 16:9 或 (8.0, 4.5)；y 留白；不用 24 pt |
| 25 | 「把这份电流–时间 CSV 画成折线，投稿用」 | 不套 P4 从 0 起；y 两侧留白；读 layout-defaults |
| 26 | 显式 Nature 单栏时序 | 宽度 89 mm / 3.5 in；高度 16:9；Nature 字号 5–7 pt；仍 vector-first |

不改 description 触发边界，不跑 qiaomu trigger_eval 作为仓库门。若实施时改了 SKILL.md description，再在任务 `research/` 补跑 trigger 并记录。

## 兼容

- 期刊宽度、字体、DPI、导出格式不变。单栏图变矮（3.5×2.6 → 3.5×1.97）。IEEE/Nature 最大高度允许该高度。
- SciencePlots `ieee`/`nature` 样式自带 figsize 时：先套 style，再按 layout-defaults 覆盖 `fig.set_size_inches`。在 matplotlib-recipes 的 SciencePlots 段写明这一覆盖。
- `bbox_inches="tight"` 仍会改变物理尺寸。精确卡片宽度时继续用 constrained、去掉 tight。16:9 以 **创建时 figsize** 为准；tight 裁切后的文件比例允许偏离，qa-checklist 已有该取舍。
- industrytslib / pubfig：调用 `save_figure` / `set_style` 时传入由 layout-defaults 算出的尺寸；库缺失则走独立路径并说明跳过。

## 权衡

| 选择 | 结果 | 放弃的选项 |
| --- | --- | --- |
| 高度跟 16:9，宽度跟卡片 | 投稿宽合规，默认更扁 | 保持 3.5×2.6 约 4:3 |
| 12% margins 而非固定 ylim | 数据更新后仍留空 | 手写死 ylim |
| WARN 而非 FAIL | 不误杀折断轴、双轴、极坐标 | 机器一票否决 |
| 新 reference 文件 | 单点数值 | 把数字复制进 SKILL.md 与三份 recipes |

## 回滚

回滚范围限于本任务改动的 md/py/mjs/evals 与 docs 目录页。目录风格脚本无改动则无需回滚。version 改回 1.1.0 并 `just docs-sync`。
