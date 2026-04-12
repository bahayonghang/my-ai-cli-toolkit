# Bib Search Citation

从 BibTeX/BibLaTeX `.bib` 文件中搜索、过滤和格式化条目，支持紧凑查询语法和引用片段生成。

## 适用场景

- 用户提供 `.bib` 文件，想按主题、作者、年份或其他字段查找论文
- 按多个条件过滤 Zotero 导出的文献库
- 生成 LaTeX（`\cite`、`\parencite`、`\textcite`）或 Typst（`@key`、`#cite(<key>)`）引用片段
- 检查哪些条目包含 DOI、代码、PDF 或摘要

## 工作流程

1. 确定 `.bib` 文件路径
2. 如果安装了 `rtk`，先用它完成文件定位和字段抽样这类探索步骤
3. 将用户请求转换为紧凑查询或 JSON spec
4. 对文件执行 `scripts/search_bib.py`，并保留原始 JSON 输出
5. 如需紧凑的人类可读摘要，可将 JSON 管道给 `scripts/preview_bib_search.py`
6. 按请求的格式（LaTeX、Typst 或两者）附上引用片段

## 紧凑查询示例

```text
mamba forecasting author:Cheng year>=2024 has:code cite:both limit:5
```

```text
author:Wang year:2023,2024 type:article sort:year_desc
```

支持的过滤器包括 `author:`、`year>=`、`year:`、`type:`、`-type:`、`has:`、`-has:`、`sort:`、`limit:`、`fields:`、`cite:` 和 `raw:`。

## RTK 快路径

- 使用 `rtk find . -name "*.bib"` 定位参考文献文件
- 使用 `rtk read /path/to/library.bib -l aggressive -m 80` 快速查看代表性条目
- 使用 `rtk grep "doi|keywords|annotation|eprint" /path/to/library.bib` 快速确认字段覆盖情况

只要后续步骤需要机器可读 JSON，就必须继续走原始 `search_bib.py` 路径，不要让 RTK 压缩该输出。如果想在搜索后得到紧凑摘要，可以使用：

```bash
python scripts/search_bib.py \
  --bib /path/to/library.bib \
  --query 'mamba forecasting author:Cheng year>=2024 has:code cite:both limit:5' \
| python scripts/preview_bib_search.py
```

## 主要资源

- `scripts/search_bib.py` - 纯 Python 解析器、过滤引擎和引用格式化器（无外部依赖）
- `scripts/preview_bib_search.py` - 将 `search_bib.py` 的 JSON 渲染为紧凑人类可读摘要的工具
- `references/query-syntax.md` - 完整语法参考及自然语言映射示例

## 说明

- 脚本无需额外依赖，使用标准 Python 3 即可运行。
- 同时支持内联 JSON spec 和紧凑查询表达式。
- RTK 是可选探索工具，只用于定位和检查，不替代原始 JSON 搜索结果。
- 支持 Zotero 导出的 `file` 字段，通过 `.pdf` 扩展名或 `application/pdf` MIME 类型检测 PDF。
- 如果没有匹配结果，建议放宽过滤条件：移除 `has:` 约束、扩大年份范围或减少关键词。
