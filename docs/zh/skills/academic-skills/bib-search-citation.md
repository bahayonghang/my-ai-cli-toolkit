# Bib Search Citation

从 BibTeX/BibLaTeX `.bib` 文件中搜索、过滤和格式化条目，支持紧凑查询语法和引用片段生成。

## 适用场景

- 用户提供 `.bib` 文件，想按主题、作者、年份或其他字段查找论文
- 按多个条件过滤 Zotero 导出的文献库
- 生成 LaTeX（`\cite`、`\parencite`、`\textcite`）或 Typst（`@key`、`#cite(<key>)`）引用片段
- 检查哪些条目包含 DOI、代码、PDF 或摘要

## 工作流程

1. 确定 `.bib` 文件路径
2. 将用户请求转换为紧凑查询或 JSON spec
3. 对文件执行 `scripts/search_bib.py`
4. 审阅 JSON 输出，呈现最佳匹配结果及请求的字段
5. 按请求的格式（LaTeX、Typst 或两者）附上引用片段

## 紧凑查询示例

```text
mamba forecasting author:Cheng year>=2024 has:code cite:both limit:5
```

```text
author:Wang year:2023,2024 type:article sort:year_desc
```

支持的过滤器包括 `author:`、`year>=`、`year:`、`type:`、`-type:`、`has:`、`-has:`、`sort:`、`limit:`、`fields:`、`cite:` 和 `raw:`。

## 主要资源

- `scripts/search_bib.py` — 纯 Python 解析器、过滤引擎和引用格式化器（无外部依赖）
- `references/query-syntax.md` — 完整语法参考及自然语言映射示例

## 说明

- 脚本无需额外依赖，使用标准 Python 3 即可运行。
- 同时支持内联 JSON spec 和紧凑查询表达式。
- 支持 Zotero 导出的 `file` 字段，通过 `.pdf` 扩展名或 `application/pdf` MIME 类型检测 PDF。
- 如果没有匹配结果，建议放宽过滤条件：移除 `has:` 约束、扩大年份范围或减少关键词。
