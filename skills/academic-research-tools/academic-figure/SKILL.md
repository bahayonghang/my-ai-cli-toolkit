---
name: academic-figure
description: >
  Create or review academic figures in three modes. journal-spec creates or
  reviews publication-ready figures for journal submission specs using
  matplotlib, seaborn, plotly, or industrytslib. from-data fills a named
  paper-style catalog with user data. from-image reproduces an uploaded paper
  figure as a matplotlib script and 300 dpi PNG. Use for 论文配图, 期刊图, 科研绘图,
  审阅投稿图, 用某论文风格画数据, 复现这张图, or a named catalog style. An explicit
  journal target takes precedence over a style or reference image. Paper
  reading and multi-paper synthesis route to their dedicated research skills.
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
  ]
version: 1.0.0
---

# Academic Figure

Pick one mode before loading its reference or writing plotting code.

> Replace `<skill-dir>` with the loaded skill directory. In Windows PowerShell,
> set `$env:PYTHONUTF8 = '1'` before UTF-8 Python commands.

## Pick a mode

| Input intent | Mode | Read |
| --- | --- | --- |
| Journal/thesis target, generic `论文配图`, or compliance review | **journal-spec** | `references/modes/journal-spec.md` |
| User data plus a named catalog style | **from-data** | `references/modes/from-data.md` |
| Uploaded paper figure, with no journal target | **from-image** | `references/modes/from-image.md` |

Resolve conflicts in order:

1. An explicit journal target selects **journal-spec**; a style or image is
   visual reference only.
2. If exact mimicry and journal compliance are both explicit, ask once which
   contract wins.

## Output contracts

The selected row is authoritative.

| Mode | Required output behavior |
| --- | --- |
| **journal-spec** | Vector-first PDF/SVG/EPS; target size, font, and DPI; colorblind-safe defaults; `fonttype=42`; every applicable QA item checked |
| **from-data** / **from-image** | Matplotlib script and `dpi=300` PNG; deliberately mimic the selected style or source; journal QA is not imposed by default |

## Route elsewhere

| Request | Route to |
| --- | --- |
| Deep-read or summarize one paper | **literature-mentor** (`skills/research-learning-knowledge/literature-mentor`) |
| Intake, compare, or synthesize multiple papers | **paper-workbench** (`skills/research-learning-knowledge/paper-workbench`) |
| Build a BI dashboard or linked operational charts | Dashboard or BI tooling |
| Generate an AI graphical abstract or illustration | Image-generation tooling |

## Resources

- **Modes**: `references/modes/journal-spec.md`,
  `references/modes/from-data.md`, `references/modes/from-image.md`
- **Journal guidance**: `references/figure-contract.md`,
  `references/journal-specs.md`, `references/matplotlib-recipes.md`,
  `references/plotly-recipes.md`, `references/chart-recipes.md`,
  `references/qa-checklist.md`, `references/industrytslib-integration.md`
- **Reproduction**: `references/styles/`,
  `references/reproduction_guide.md`, `scripts/`, `assets/originals/`
- **Preference CLI & evals**: `scripts/academic_figure_pref.py`, `evals/evals.json`
