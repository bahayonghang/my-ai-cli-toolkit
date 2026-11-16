# academic-figure 默认画幅与曲线图留白：失败分析

日期：2026-08-20  
技能：`skills/academic-research-tools/academic-figure` v1.1.0  
证据图：`research/evidence-curve-cramped.png`（用户提交的失败样本）

## 用户陈述的缺陷

1. 默认应画 16:9 图。
2. 曲线图 y 轴上下范围应略放大，避免数据贴边框。
3. 避免曲线主体过小、文字和坐标 label 过大。

## 证据图测量

| 项目 | 测量 |
| --- | --- |
| 像素 | 1164 × 654，RGBA |
| 宽高比 | 1.7798（16:9 = 1.777…） |
| 图型 | 笛卡尔折线，电流/A vs 时间/min |
| y 刻度 | 25.2, 25.4, 25.6, 25.8 |
| 目视数据范围 | 约 25.18–25.78 |
| y 轴上下空隙 | 接近 0；曲线贴顶框与底框 |
| 图面 | 坐标轴标签、刻度数字相对绘图框偏大；绘图框被四周文字挤占 |

结论：该样本已经是 16:9。16:9 单独不能消除这张图的难看处。需要同时改 y 轴留白和字号相对画布的比例。

## 当前技能里互相冲突的规则

| 位置 | 现行指示 | 对失败样本的作用 |
| --- | --- | --- |
| `references/matplotlib-recipes.md:68,85,102` | IEEE/Elsevier/Nature 预设 `figsize` 高度为约 4:3（3.5×2.6 / 3.54×2.66）。文件写明高度是 presentational default，期刊不强制。 | 有期刊目标时默认画幅不是 16:9。 |
| `references/chart-recipes.md:318-320` | “Dynamic y-axis tightening”：`margin = (vmax-vmin)*0.1` 后 `set_ylim`。意图是窄带数据不要锚在 0–100。 | 10% 留白若执行，本样本会改善。该条写在 cross-cutting 末尾，且标题是收紧，代理容易理解成贴数据。 |
| `references/reproduction_guide.md:101` | “Too much whitespace: use `ax.set_ylim(content_bottom, content_top)`” | 把 ylim 收到数据极值，贴边。 |
| `references/visual-review.md:68,87` | 第 7 项只查数据是否被轴限裁切；修复建议 `ax.margins(0.05)`。 | 贴边但不裁切时可通过。5% 对本样本仍偏紧。 |
| `references/viz-pitfalls.md` P4 | 比例类截断 y 轴会夸大变化；比例从 0 或声明基线起。 | 电流（A）不是比例。代理若把 P4 做成“一律从 0 起”会压扁信号；若把 P4 理解成“贴数据”会贴边。本样本属于后者。 |
| `references/design-theory.md:20-37` | Display 档 24 pt、Compact 档 15–16 pt。范围写明用于海报/幻灯。 | 普通论文配图若套 Display/Compact，字号相对 8 英寸级 16:9 画布过大，绘图框被挤占。 |
| `references/qa-checklist.md:29` | 终稿宽度对齐期刊卡片；高度在期刊上限内。 | 不规定默认高宽比。 |
| `scripts/visual_qa.py` `audit_layout` | 只查缺字、文字出画布、刻度重叠。 | 不查 y 轴留白，不查绘图框相对画布的面积。 |
| `evals/evals.json` #6 | 泛化「论文配图」走 journal-spec，先读偏好再问一次期刊。 | 不约束默认 16:9、留白或字号占比。 |
| from-image / 目录脚本 | `from-image.md` 要求 `figsize` 匹配原图 AR；`line_aime.py` 等脚本写死纸面比例与 ylim。 | 复现契约。改这些脚本会破坏 from-data / from-image。 |

## 根因（机制，不是猜测）

三件事叠在同一条默认出图路径上：

1. **画幅**：无用户指定比例时，期刊预设给约 4:3 高度；未解析期刊时，matplotlib 默认 6.4×4.8 也是 4:3。技能没有“默认 16:9”这一条。
2. **y 轴**：技能同时写了 10% 留白、贴数据去空白、裁切时 5% margin。代理在新曲线图上常见做法是 `set_ylim(min, max)` 或收到最近的整齐刻度（本样本 25.2–25.8）。
3. **字号 vs 绘图框**：技能对投稿字号有下限（期刊 5–10 pt），对“标签不得大于数据主体”没有上限规则。`design-theory.md` 的 15–24 pt 是海报档，缺少“普通论文配图禁止套用”的硬闸。

qiaomu 泛化闸门：样本是电流曲线，机制与域无关。提升为核心规则：笛卡尔连续曲线在依赖轴两侧留空；默认画布 16:9，除非合同改写；标签服从绘图框。一次失败不单独写成“电流图特例”。

## 明确不改的边界

- from-data / from-image 目录脚本与 `assets/originals/`：纸面比例与 ylim 服务复现，不改。
- 期刊卡片的**宽度**、字号下限、DPI、格式：不改。
- P4 对比例/计数的“从 0 起”：保留；只澄清适用范围。
- 热力图、雷达、t-SNE 等正方形图族：继续正方形。
- 不发布 skill，不引入 README/manifest 以迎合 qiaomu `validate_skill.py`（仓库权威门是 `scripts/check.py`）。
