# Zotero MCP Tool Matrix

> 参数名称可能随 `zotero-mcp` 版本变化。调用前先读取 MCP tool schema，再按本表选择工具。

## Search

| Tool | Use when | Input pattern | Common failure hint |
|---|---|---|---|
| `zotero-mcp:zotero_search_items` | 已知关键词检索 | `关键词 + 可选范围/数量` | 结果过少时放宽关键词或换语义检索 |
| `zotero-mcp:zotero_advanced_search` | 需要多条件过滤 | `关键词 + 字段过滤 + 可选排序` | 条件过严会导致空结果 |
| `zotero-mcp:zotero_semantic_search` | 概念/主题相似检索 | `语义查询 + 可选数量` | 未建索引时先更新语义数据库 |
| `zotero-mcp:zotero_search_by_tag` | 按标签筛选 | `标签名 + 可选数量` | 标签拼写不一致会漏检 |

## Browse

| Tool | Use when | Input pattern | Common failure hint |
|---|---|---|---|
| `zotero-mcp:zotero_get_collections` | 浏览目录树 | `无或可选层级参数` | 库权限异常会返回空 |
| `zotero-mcp:zotero_get_collection_items` | 获取某合集条目 | `collection 标识 + 可选分页/数量` | collection 标识错误 |
| `zotero-mcp:zotero_get_tags` | 列出标签 | `无或可选范围` | 标签过多时需分页 |
| `zotero-mcp:zotero_get_recent` | 查看最近新增 | `可选数量` | 时间窗口过小导致结果少 |

## Content

| Tool | Use when | Input pattern | Common failure hint |
|---|---|---|---|
| `zotero-mcp:zotero_get_item_metadata` | 获取书目信息/BibTeX | `item 标识 + 可选 format` | item 标识错误；BibTeX 需 `format="bibtex"` |
| `zotero-mcp:zotero_get_item_fulltext` | 获取全文文本 | `item 标识` | 附件缺失、OCR 不可用或本地文件不可读 |
| `zotero-mcp:zotero_get_item_children` | 查询附件/子项 | `item 标识` | 子项为空并非错误，需降级流程 |

## Notes & Annotations

| Tool | Use when | Input pattern | Common failure hint |
|---|---|---|---|
| `zotero-mcp:zotero_get_annotations` | 读取高亮与批注 | `item 标识` | PDF 无标注时返回空 |
| `zotero-mcp:zotero_get_notes` | 读取笔记 | `item 或 collection 标识` | 权限或筛选范围错误 |
| `zotero-mcp:zotero_search_notes` | 在笔记中检索 | `查询词 + 可选范围` | 查询词过窄 |
| `zotero-mcp:zotero_create_note` | 写回新笔记（beta） | `目标 item + note 内容` | beta 能力可能受版本限制 |

## Semantic Index Management

| Tool | Use when | Input pattern | Common failure hint |
|---|---|---|---|
| `zotero-mcp:zotero_get_search_database_status` | 检查语义索引状态 | `无` | 状态异常时不要直接做语义检索 |
| `zotero-mcp:zotero_update_search_database` | 更新/重建语义索引 | `可选更新模式` | 首次全量更新耗时较长 |

## Selection Rules

- 先关键词检索，再语义补全：`zotero-mcp:zotero_search_items` → `zotero-mcp:zotero_semantic_search`。
- 先元数据后全文：`zotero-mcp:zotero_get_item_metadata` → `zotero-mcp:zotero_get_item_fulltext`。
- 涉及用户重点时优先补 `zotero-mcp:zotero_get_annotations`。
- 语义任务前必须先查 `zotero-mcp:zotero_get_search_database_status`。
