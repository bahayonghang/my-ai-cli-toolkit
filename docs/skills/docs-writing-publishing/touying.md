# touying

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Author, refactor, migrate, or troubleshoot Typst slide decks using @preview/touying:0.8.0 (Typst 0.15.0+).

## 触发场景

- creating or editing .typ presentations, multi-file globals.typ decks, built-in or custom themes, slide headings or #slide, incremental animations (#pause, #uncover, #only, #animate), speaker notes (#speaker-note, .pdfpc), or multi-mode export (presentation, handout, article), including Chinese and English requests (制作/创建/重构/排查/迁移 Typst Touying 幻灯片、演示文稿与讲义)
- Excludes non-Typst web or office slides (HTML, reveal.js, PPT, Marp), ordinary non-slide Typst papers or reports, and XeLaTeX thesis defense decks (academic-defense-beamer)

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `touying` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `2.0.0` |
| 标签 | `typst`, `touying`, `slide-deck`, `animation`, `theme`, `presentation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill touying
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/touying/agents` | 目录 | 1 | 配套 agent |
| `skills/docs-writing-publishing/touying/evals` | 目录 | 2 | 评测样例 |
| `skills/docs-writing-publishing/touying/examples` | 目录 | 9 | 示例 |
| `skills/docs-writing-publishing/touying/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/docs-writing-publishing/touying/README.md` | 文件 | 1 | 顶层文件 |
| `skills/docs-writing-publishing/touying/references` | 目录 | 8 | 引用资料 |
| `skills/docs-writing-publishing/touying/reports` | 目录 | 4 | 顶层目录 |
| `skills/docs-writing-publishing/touying/tests` | 目录 | 4 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/docs-writing-publishing/touying/agents` | 配套 agent |
| evals | `skills/docs-writing-publishing/touying/evals` | 评测样例 |
| examples | `skills/docs-writing-publishing/touying/examples` | 示例 |
| references | `skills/docs-writing-publishing/touying/references` | 引用资料 |
| tests | `skills/docs-writing-publishing/touying/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/docs-writing-publishing/touying/SKILL.md`
- `skills/docs-writing-publishing/touying`
