# academic-figure

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create or review publication-ready academic figures that meet journal submission specs (IEEE / Elsevier / Nature, plus Springer and chinese-thesis presets) using matplotlib(+seaborn) or plotly; in industrytslib projects it drives that library's built-in visualization system.

## 触发场景

- Create or review publication-ready academic figures that meet journal submission specs (IEEE / Elsevier / Nature, plus Springer and chinese-thesis presets) using matplotlib(+seaborn) or plotly
- in industrytslib projects it drives that library's built-in visualization system
- Use for 论文配图, 期刊图, 科研绘图, 中文学位论文配图, "publication-ready figure"

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `academic-figure` |
| 分类 | `academic-research-tools` (学术研究工具) |
| 版本 | `0.1.0` |
| 标签 | `academic-figures`, `matplotlib`, `seaborn`, `plotly`, `ieee`, `elsevier`, `nature`, `publication` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill academic-figure
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/academic-research-tools/academic-figure/evals` | 目录 | 1 | 评测样例 |
| `skills/academic-research-tools/academic-figure/references` | 目录 | 7 | 引用资料 |
| `skills/academic-research-tools/academic-figure/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/academic-research-tools/academic-figure/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
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
