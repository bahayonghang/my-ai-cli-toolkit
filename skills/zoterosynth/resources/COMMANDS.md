# ZoteroSynth CLI 命令参考

## 数据访问

| 命令 | 说明 |
|---|---|
| `uv run scripts/zotero_client.py collections --tree` | 显示集合树 |
| `uv run scripts/zotero_client.py items --collection KEY --limit N` | 列出集合中的项目 |
| `uv run scripts/zotero_client.py search "QUERY" --limit N` | 搜索文献 |
| `uv run scripts/zotero_client.py detail KEY` | 项目元数据 |
| `uv run scripts/zotero_client.py children KEY` | 附件和笔记 |
| `uv run scripts/zotero_client.py fulltext KEY` | 全文内容 |
| `uv run scripts/zotero_client.py pdf-path KEY` | 本地 PDF 文件路径 |

## PDF 文本提取

| 命令 | 说明 |
|---|---|
| `uv run scripts/pdf_extract.py "PATH" --max-pages 30` | 从 PDF 提取文本 |

## 参数说明

- `KEY`: Zotero 项目的唯一标识符
- `QUERY`: 搜索关键词
- `N`: 返回结果数量限制
- `PATH`: PDF 文件的本地路径（用双引号包裹）

## 输出格式

所有脚本输出均为 JSON 格式，需解析后以自然语言呈现给用户。
