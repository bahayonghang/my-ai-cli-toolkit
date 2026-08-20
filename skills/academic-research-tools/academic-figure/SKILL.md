---
name: academic-figure
description: >
  Create, advise on, or audit academic figures in four modes. advise profiles
  the data and recommends a chart type when none is fixed. journal-spec creates
  or reviews publication-ready figures for journal submission specs using
  matplotlib, seaborn, plotly, industrytslib, or the optional pubfig backend.
  from-data fills a named paper-style catalog with user data. from-image
  reproduces an uploaded paper figure as a matplotlib script and 300 dpi PNG.
  Use for 论文配图, 期刊图, 科研绘图, 审阅投稿图, 用某论文风格画数据, 复现这张图,
  a named catalog style, 不知道用什么图 / 选图 / 怎么展示这份实验数据, what chart
  should I use, 投稿前审计图的字号 DPI 与导出合规, pre-submission figure audit, or
  参考图筛选 with AgentFigureGallery. An explicit journal target takes precedence
  over a style or reference image. Exploratory data checks with no publication
  goal, paper reading, and multi-paper synthesis route to their dedicated
  skills.
category: academic-research-tools
tags:
  [
    academic-figures,
    matplotlib,
    seaborn,
    plotly,
    ieee,
    elsevier,
    nature,
    publication,
    reproduction,
    paper-style,
    from-image,
    chart-advisor,
    figure-audit,
    visual-qa,
    pubfig,
    reference-gallery,
  ]
version: 1.2.0
---

# Academic Figure

Pick one mode before loading its reference or writing plotting code.

> Replace `<skill-dir>` with the loaded skill directory. In Windows PowerShell,
> set `$env:PYTHONUTF8 = '1'` before UTF-8 Python commands.

## Pick a mode

| Input intent                                                                                            | Mode             | Read                               |
| ------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- |
| Journal/thesis target, generic `论文配图`, or compliance review                                         | **journal-spec** | `references/modes/journal-spec.md` |
| User data plus a named catalog style                                                                    | **from-data**    | `references/modes/from-data.md`    |
| Uploaded paper figure, with no journal target                                                           | **from-image**   | `references/modes/from-image.md`   |
| Data in hand with the chart type still open, or a request for a chart recommendation (`不知道用什么图`) | **advise**       | `references/modes/advise.md`       |

Resolve conflicts in order:

1. An explicit journal target selects **journal-spec**; a style or image is
   visual reference only.
2. If exact mimicry and journal compliance are both explicit, ask once which
   contract wins.
3. If the chart type is open, and no catalog style or reference image is given,
   run **advise** first. Its hand-off then applies rule 1.

## Output contracts

The selected row is authoritative.

| Mode                           | Required output behavior                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **journal-spec**               | Vector-first PDF/SVG/EPS; target size, font, and DPI; colorblind-safe defaults; `fonttype=42`; every applicable QA item checked                         |
| **from-data** / **from-image** | Matplotlib script and `dpi=300` PNG; deliberately mimic the selected style or source; journal QA is not imposed by default                              |
| **advise**                     | One recommended chart type with the reason and one or two alternates, every matched pitfall reported, and a named hand-off mode; advise draws no figure |

## Route elsewhere

| Request                                                  | Route to                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Deep-read or summarize one paper                         | **literature-mentor** (`skills/research-learning-knowledge/literature-mentor`) |
| Intake, compare, or synthesize multiple papers           | **paper-workbench** (`skills/research-learning-knowledge/paper-workbench`)     |
| Build a BI dashboard or linked operational charts        | Dashboard or BI tooling                                                        |
| Generate an AI graphical abstract or illustration        | Image-generation tooling                                                       |
| Explore a dataset with no publication or submission goal | General-purpose plotting; this skill adds no value there                       |

## Resources

- **Modes**: `references/modes/journal-spec.md`,
  `references/modes/from-data.md`, `references/modes/from-image.md`,
  `references/modes/advise.md`
- **Advisory**: `references/chart-selection.md`, `references/viz-pitfalls.md`
- **Journal guidance**: `references/figure-contract.md`,
  `references/journal-specs.md`, `references/layout-defaults.md`,
  `references/matplotlib-recipes.md`, `references/plotly-recipes.md`,
  `references/chart-recipes.md`,
  `references/panel-layout-patterns.md`,
  `references/figure-legend-conventions.md`, `references/design-theory.md`,
  `references/visual-review.md`, `references/qa-checklist.md`
- **Integrations**: `references/industrytslib-integration.md`,
  `references/pubfig-integration.md`,
  `references/agent-figure-gallery-integration.md`
- **Reproduction**: `references/styles/`,
  `references/reproduction_guide.md`, `scripts/`, `assets/originals/`,
  `references/attribution.md`
- **Scripts & evals**: `scripts/academic_figure_pref.py`,
  `scripts/visual_qa.py`, `scripts/audit_pdf_text.py`, `evals/evals.json`
