# Academic Figure

`academic-figure` 用于科研论文配图。它可以推荐图型、按期刊规范出图或审阅投稿图、
按论文风格目录用用户数据出图，以及复现上传的论文图。

## 模式

| 模式           | 输入                                   | 输出                                                         |
| -------------- | -------------------------------------- | ------------------------------------------------------------ |
| `advise`       | 数据，图型未定                         | 一个推荐图型、理由、一到两个备选、命中的误区、移交模式       |
| `journal-spec` | 期刊或学位论文目标，或投稿图审阅       | 按期刊卡片尺寸、字号、DPI 导出的矢量图，并完成 QA 检查       |
| `from-data`    | 数据与一个目录风格                     | matplotlib 脚本与 300 dpi PNG                                |
| `from-image`   | 上传的论文图                           | 复现该图的 matplotlib 脚本与 300 dpi PNG                     |

期刊目标优先于风格与参考图。`from-data` 含「展示级分支」：请求海报、幻灯片或
README 图，且没有期刊目标时，按图型选择 figures4papers 风格族，并用
`figstyle.apply_style("display")` 输出脚本、300 dpi PNG 与同名 PDF。

## 目录风格

- 8 个 paper-plot-skills 风格：`references/styles/*.md`（不含 `f4p_` 前缀），
  脚本在 `scripts/`。
- 14 个 figures4papers 风格族：`references/styles/f4p_*.md`，脚本在
  `scripts/figures4papers/`，原图在 `assets/originals/figures4papers/`。
- `references/chart-recipes.md` 第 1–20 节提供常用图型的最小代码。

## 安装

在本仓库根目录运行：

```bash
just install-projects
```

从 GitHub 安装：

```bash
npx skills add https://github.com/bahayonghang/my-ai-cli-toolkit --skill academic-figure
```

## 你可以直接这样说

- 「这份实验结果不知道用什么图，帮我选一下。」
- 「按 IEEE 双栏尺寸画这组消融结果，导出 PDF。」
- 「投稿前检查这张图的字号、DPI 和导出格式。」
- 「用 figures4papers 的堆叠柱风格画这组构成比例数据。」
- 「做一张学术海报用的方法对比柱状图。」
- 「复现这张论文图。」

## 依赖

| 依赖                     | 是否必需 | 用途                                                     |
| ------------------------ | -------- | -------------------------------------------------------- |
| Python 3、matplotlib、numpy | 必需  | 全部绘图脚本与 `scripts/figstyle.py`                     |
| LaTeX                    | 可选     | usetex 脚本；缺少时自动改用 mathtext 标签                 |
| scipy                    | 可选     | `diffusion_swiss_roll.py`、`plot_concept.py`             |
| seaborn                  | 可选     | `plot_composition.py`、recipe 的 seaborn 写法            |
| python-dateutil          | 可选     | `plot_trend.py`                                          |
| plotly、kaleido          | 可选     | plotly 路线的导出                                        |

设置 `ACADEMIC_FIGURE_NO_TEX=1` 可强制关闭 LaTeX。移植脚本读取
`ACADEMIC_FIGURE_DPI` 覆盖 DPI。

## 工具脚本

- `scripts/figstyle.py`：配色常量、`apply_style`、`save_figure`、图例与标注辅助、
  `check-palette` 色觉与灰度检查。
- `scripts/visual_qa.py`：布局审计与预览。
- `scripts/audit_pdf_text.py`：检查 PDF 中的最小字号。
- `scripts/academic_figure_pref.py`：保存用户默认的绘图库与期刊风格。

## 验证

在仓库根目录运行：

```bash
PYTHONUTF8=1 node --test "skills/academic-research-tools/academic-figure/tests/*.mjs"
PYTHONUTF8=1 just skills-check
PYTHONUTF8=1 just python-check
```

`evals/evals.json` 与 `evals/trigger_cases.json` 不由 CI 执行。真实模型的触发行为
没有复测记录。

## 故障排查

- 图中出现 `\textbf` 等原文：确认使用的是本 skill 的脚本；也可设置
  `ACADEMIC_FIGURE_NO_TEX=1` 后重新运行。
- 导出宽度与期刊卡片不一致：不要使用 `bbox_inches="tight"`；使用
  `save_figure(..., match_width=True)`。
- 提示字体缺失：脚本使用 `Helvetica`、`Arial`、`DejaVu Sans` 回退链，警告不影响出图。
- 移植脚本报 `ModuleNotFoundError`：按上表安装可选依赖。

## 致谢与许可证

本 skill 参考并吸收了以下仓库。每个仓库的贡献内容与吸收方式见
`references/attribution.md`。

- [ChenLiu-1996/figures4papers](https://github.com/ChenLiu-1996/figures4papers)
  （CC BY-NC 4.0，快照 `3c181f8`）：`scripts/figures4papers/` 的 24 个绘图脚本与
  数据模块、`assets/originals/figures4papers/` 的 29 张原图均移植自该仓库，并按
  `attribution.md` 的移植记录作了修改。这部分内容仅可用于非商业用途，使用时须注明
  原作者。
- [Trae1ounG/paper-plot-skills](https://github.com/Trae1ounG/paper-plot-skills)：
  8 个风格文档、9 个脚本与 10 张原图。
- [Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills)、
  [Haojae/scipilot-figure-skill](https://github.com/Haojae/scipilot-figure-skill)、
  [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills)、
  [Dsadd4/AgentFigureGallery](https://github.com/Dsadd4/AgentFigureGallery)、
  [Galaxy-Dawn/pubfig](https://github.com/Galaxy-Dawn/pubfig)。

`assets/originals/` 中的论文图版权归原论文作者所有，只用于复现时的视觉对照。
