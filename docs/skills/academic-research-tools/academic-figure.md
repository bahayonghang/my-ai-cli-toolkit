# academic-figure

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create, advise on, or audit academic figures in four modes.

## 触发场景

- Create, advise on, or audit academic figures in four modes. advise profiles the data and recommends a chart type when none is fixed. journal-spec creates or reviews publication-ready figures for journal submission specs using matplotlib, seaborn, plotly, industrytslib, or the optional pubfig backend. from-data fills a named paper-style catalog with user data. from-image reproduces an uploaded paper figure as a matplotlib script and 300 dpi PNG
- Use for 论文配图, 期刊图, 科研绘图, 审阅投稿图, 用某论文风格画数据, 复现这张图, a named catalog style, 不知道用什么图 / 选图 / 怎么展示这份实验数据, what chart should I use, 投稿前审计图的字号 DPI 与导出合规, pre-submission figure audit, or 参考图筛选 with AgentFigureGallery
- An explicit journal target takes precedence over a style or reference image
- Exploratory data checks with no publication goal, paper reading, and multi-paper synthesis route to their dedicated skills

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `academic-figure` |
| 分类 | `academic-research-tools` (学术研究工具) |
| 版本 | `1.2.0` |
| 标签 | `academic-figures`, `matplotlib`, `seaborn`, `plotly`, `ieee`, `elsevier`, `nature`, `publication`, `reproduction`, `paper-style`, `from-image`, `chart-advisor`, `figure-audit`, `visual-qa`, `pubfig`, `reference-gallery` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill academic-figure
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/academic-research-tools/academic-figure/agents` | 目录 | 1 | 配套 agent |
| `skills/academic-research-tools/academic-figure/assets` | 目录 | 10 | 素材资源 |
| `skills/academic-research-tools/academic-figure/evals` | 目录 | 1 | 评测样例 |
| `skills/academic-research-tools/academic-figure/references` | 目录 | 30 | 引用资料 |
| `skills/academic-research-tools/academic-figure/scripts` | 目录 | 12 | 可执行脚本 |
| `skills/academic-research-tools/academic-figure/tests` | 目录 | 3 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/academic-research-tools/academic-figure/agents` | 配套 agent |
| assets | `skills/academic-research-tools/academic-figure/assets` | 素材资源 |
| evals | `skills/academic-research-tools/academic-figure/evals` | 评测样例 |
| references | `skills/academic-research-tools/academic-figure/references` | 引用资料 |
| scripts | `skills/academic-research-tools/academic-figure/scripts` | 可执行脚本 |
| tests | `skills/academic-research-tools/academic-figure/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/academic-research-tools/academic-figure/SKILL.md`
- `skills/academic-research-tools/academic-figure`
