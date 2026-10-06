# touying

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Author Typst slide decks with the Touying package.

## 触发场景

- creating or editing .typ presentations: applying or building Touying themes (e.g. metropolis), turning headings or #slide into slides, incremental reveals (#pause, dynamic content), speaker notes via pdfpc, and page layout config
- Not for non-Typst decks (HTML, PPT, reveal.js, Marp) or ordinary non-presentation Typst documents

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `touying` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.0.0` |
| 标签 | `typst`, `touying`, `slide-deck`, `animation`, `theme` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill touying
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/touying/docs` | 目录 | 34 | 内嵌文档 |
| `skills/docs-writing-publishing/touying/evals` | 目录 | 1 | 评测样例 |
| `skills/docs-writing-publishing/touying/examples` | 目录 | 9 | 示例 |
| `skills/docs-writing-publishing/touying/references` | 目录 | 2 | 引用资料 |
| `skills/docs-writing-publishing/touying/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| docs | `skills/docs-writing-publishing/touying/docs` | 内嵌文档 |
| evals | `skills/docs-writing-publishing/touying/evals` | 评测样例 |
| examples | `skills/docs-writing-publishing/touying/examples` | 示例 |
| references | `skills/docs-writing-publishing/touying/references` | 引用资料 |
| tests | `skills/docs-writing-publishing/touying/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/docs-writing-publishing/touying/SKILL.md`
- `skills/docs-writing-publishing/touying`
