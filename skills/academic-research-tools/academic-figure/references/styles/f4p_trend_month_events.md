# Style: f4p_trend_month_events（月度累积面积 + 事件标注）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_ophthal_review`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：两个面板的月度累积面积图，标注模型发布事件  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_ophthal_review/plot_trend.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_ophthal_review/trend_by_month.png`  
**输出文件**：`trend_by_month.png`

---

## 适用场景

- 综述或文献计量：按月统计的论文数累积曲线，分为两类（例如纯文本与多模态）。
- 需要在时间轴上标出外部事件（例如模型发布），事件标签可能拥挤。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (14, 8) |
| 布局 | `add_subplot(2, 1, k)`，上下两个面板 |
| 字号 | 全局 `font.size = 15`；事件标签 `fontsize=11` |
| 线宽 | `axes.linewidth = 2`；累积曲线边界 `lw=3`；hatch 去边的白线 `linewidth=2` |
| 配色 | `#9BC8FA` `#ffa8a6` `#13457E` `#850c0a` |
| 坐标 | 月份字符串作为类别 x 轴；每 6 个月一个刻度 `time_arr[2::6]`；y 轴 `[0, 105]`（上）、`[0, 24]`（下） |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`） |
| DPI | 300 |

## 关键技法

1. 累积面积：`fill_between(time, 0, cumsum)` 加一条边界线。
2. hatch 面积画两遍：第二遍 `facecolor='none', edgecolor='white', linewidth=2`，遮住 hatch 的外框。
3. 事件标注：从数据点引箭头，文字向上偏移 `(1 + 0.8·k)·dy·(y1 − y0)`，`k` 为标签中 `*` 的个数；
   绘制时去掉 `*`。
4. 月份轴由 `relativedelta` 生成的字符串构成（`'%Y-%m'`），不使用 `matplotlib.dates`。

## 数据替换要点

- `DATA` 的键：`names`（4 个系列名）、`pub_by_month`（系列数 × 月数，上游为 33 个月）、`dates_llm`、`dates_vlm`。
- 起始月在 `month_year_list(start_year=2022, start_month=11, n_months=...)` 中设定；月数由 `pub_by_month` 的列数决定。
- 事件键必须为补零的 `'YYYY-MM'`（例如 `'2023-09'`）；键不在月份轴上时事件不显示，且没有报错。
- 同一个月有两个事件时，写在同一个键下，用 `\n` 分行；字典中重复的键会覆盖前一个。
- 标签拥挤时在标签末尾加 `*` 抬高位置。移植时 `'GPT-4*'` 改为 `'GPT-4**'`，避开两行的 2023-02 标签。
- 偏移量由 `ax.get_ylim()` 计算，而上游在 `set_ylim()` 之前读取范围；移植保留该顺序，改动 y 范围后需重新检查标签位置。

## 可选依赖与降级

- dateutil：必需（`dateutil.relativedelta`）。缺少时测试跳过该脚本。
- LaTeX：可选。脚本检测 `latex` 是否在 `PATH` 上；不可用或设置 `ACADEMIC_FIGURE_NO_TEX=1` 时关闭 `text.usetex`，改用 mathtext （`mathtext.fontset = 'cm'`），图中不出现未解析的 TeX 命令。
  图中标签全部为纯文本，降级时不需要替换字符串。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_ophthal_review/plot_trend.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
