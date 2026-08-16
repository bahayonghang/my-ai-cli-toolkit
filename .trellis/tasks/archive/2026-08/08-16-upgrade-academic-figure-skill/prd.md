# 整合 7 个开源 SCI 绘图项目能力到 academic-figure skill

## Goal

将 7 个开源科研绘图项目克隆到 `ref/repo/plot_ref/`，逐一分析功能与特点，基于
qiaomu-meta 流程把有价值的能力整合进
`skills/academic-research-tools/academic-figure`，完成一次版本升级。

## 背景

- 当前 academic-figure v1.0.0 已有 journal-spec / from-data / from-image 三个模式。
- from-data 与 from-image 已吸收 Trae1ounG/paper-plot-skills 的 9 个风格、脚本与原图。
- 本次为其余项目能力的增量整合；用户在会话中补充了第 7 个仓库 pubfig。

## 仓库清单

| # | 项目 | 仓库 | 核心能力（来源文章 + README） |
|---|------|------|------------------------------|
| 1 | Figures for Papers | ChenLiu-1996/figures4papers | 真实顶会论文绘图代码；scientific-figure-making skill（design-theory / api / common-patterns / tutorials / demos） |
| 2 | Paper Plot Skills | Trae1ounG/paper-plot-skills | plot-from-data / plot-from-image；已部分整合，本次做差异校对 |
| 3 | Nature Skills | Yuan1z0825/nature-skills | nature-figure：Figure 证据结构规划、多 Panel 组合、SVG/PDF/TIFF/PNG 输出 |
| 4 | AgentFigureGallery | Dsadd4/AgentFigureGallery | 参考图检索 → 浏览器人工 like/reject/select → 导出 reference bundle → 再绘图；16341 张参考图库 |
| 5 | SciPilot | Haojae/scipilot-figure-skill | 先剖析数据再选图：profile_data、chart_selection 决策框架、主动拦截 P1–P18、CJK 字体兜底、视觉自检闭环、按最终尺寸导出 |
| 6 | K-Dense | K-Dense-AI/claude-scientific-skills（仅 scientific-visualization skill） | 出版级导出与审计：figure_export.py / style_presets.py / mplstyle / journal_requirements / 投稿 checklist |
| 7 | pubfig | Galaxy-Dawn/pubfig | Matplotlib 原生绘图库（PyPI）：科研图族统一 API、期刊感知导出、agent-first JSON CLI（render / validate-spec / list-kinds）、Figma 面板组装 |

## Requirements

1. 7 个仓库以 shallow clone 存放于 `ref/repo/plot_ref/<name>/`（`ref/` 已在
   .gitignore，不入库）。
2. 每个仓库产出一份分析记录，持久化到本任务 `research/` 目录，内容含：结构、
   核心能力、与现有 skill 的差异、可吸收点、许可证。
3. 以 qiaomu-meta 流程改造 `skills/academic-research-tools/academic-figure`：
   - 吸收各项目中与科研绘图直接相关、且当前 skill 缺失的能力；
   - 保持现有 3 模式路由兼容，不破坏 from-data / from-image 的目录结构、脚本与测试；
   - 遵守仓库 skill 约定：顶层 frontmatter（name/description/category/tags/version），
     SKILL.md 为入口；
   - 版本号语义化递增。
4. 不 vendor 大体积资产（参考图库、二进制文件）；外部工具类项目
   （AgentFigureGallery、pubfig）以集成指引文档接入，参照
   `references/industrytslib-integration.md` 的既有模式。
5. 中英文文案遵守全局 CLAUDE.md 文风约束（中文输出文风 / ASD-STE100）。

## Acceptance Criteria

- [ ] `ref/repo/plot_ref/` 含 7 个可用 shallow clone。
- [ ] 任务 `research/` 目录含覆盖 7 个仓库的分析记录。
- [ ] academic-figure skill 更新完成，新增能力覆盖：
      图型选择建议与错误拦截（SciPilot）、多 Panel 证据规划（nature-skills）、
      参考图人工筛选工作流（AgentFigureGallery 模式）、投稿前审计强化（K-Dense）、
      真实论文风格与设计理论（figures4papers）、pubfig 后端集成指引。
- [ ] `just skills-check`、`just node-test`、`just python-check` 全部通过，
      现有 pref-script 测试不回归。
- [ ] description/触发边界按 qiaomu-meta 评估更新，路由表覆盖新能力。
- [ ] 变更以 Conventional Commits 提交。

## Notes / 约束

- 吸收内容需记录来源仓库与许可证，在 skill 文档中注明出处。
- K-Dense 仓库 491 MB，仅分析 scientific-visualization skill 子目录，不全量阅读。
- paper-plot-skills 已整合部分只做差异校对，不重复搬运。
- Windows 环境：Python 命令带 `PYTHONUTF8=1`。
