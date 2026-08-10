# idea-bib-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Draft an evidence-grounded literature review or related-work section from both a user-provided idea, argument, reasoning outline, 思路, 框架, or 论证主线 and one or more supplied BibTeX .bib files.

## 触发场景

- the job is to write 文献综述, 综述, or 相关工作 while preserving citation keys, auditing claim evidence, and optionally finding approval-gated supplement candidates for evidence gaps
- Route single-paper reading, generic multi-paper synthesis without a BibTeX corpus, topic-only research, BibTeX cleanup, and prose-only polishing elsewhere

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `idea-bib-review` |
| 分类 | `academic-research-tools` (学术研究工具) |
| 版本 | `0.1.0` |
| 标签 | `literature-review`, `bibtex`, `evidence`, `citations`, `related-work`, `academic-writing` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill idea-bib-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/academic-research-tools/idea-bib-review/agents` | 目录 | 1 | 配套 agent |
| `skills/academic-research-tools/idea-bib-review/evals` | 目录 | 1 | 评测样例 |
| `skills/academic-research-tools/idea-bib-review/README.md` | 文件 | 1 | 顶层文件 |
| `skills/academic-research-tools/idea-bib-review/references` | 目录 | 4 | 引用资料 |
| `skills/academic-research-tools/idea-bib-review/reports` | 目录 | 5 | 顶层目录 |
| `skills/academic-research-tools/idea-bib-review/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/academic-research-tools/idea-bib-review/tests` | 目录 | 11 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/academic-research-tools/idea-bib-review/agents` | 配套 agent |
| evals | `skills/academic-research-tools/idea-bib-review/evals` | 评测样例 |
| references | `skills/academic-research-tools/idea-bib-review/references` | 引用资料 |
| scripts | `skills/academic-research-tools/idea-bib-review/scripts` | 可执行脚本 |
| tests | `skills/academic-research-tools/idea-bib-review/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/academic-research-tools/idea-bib-review/SKILL.md`
- `skills/academic-research-tools/idea-bib-review`
