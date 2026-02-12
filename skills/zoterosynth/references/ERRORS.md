# Zotero Error Dictionary

## E001_MCP_NOT_INSTALLED

**When**
- `zotero-mcp version` 失败或命令不存在。

**Reply Template**
```text
zotero-mcp 未安装，当前无法访问 Zotero 数据。
请先运行：
uv tool install "git+https://github.com/54yyyu/zotero-mcp.git"
zotero-mcp setup
完成后我再继续。
```

**Recovery**
- 安装后重新执行 `check`。

## E002_MCP_TOOLS_UNAVAILABLE

**When**
- MCP 客户端未正确加载 zotero-mcp tools。

**Reply Template**
```text
已检测到 zotero-mcp，但 MCP 工具当前不可用。
请检查 MCP 客户端配置并运行：zotero-mcp setup-info
确认配置后，我将继续检索文献。
```

**Recovery**
- 核对客户端配置并重启会话。

## E003_ZOTERO_CONNECTION_FAILED

**When**
- 无法连接本地 Zotero 或 Web API 鉴权失败。

**Reply Template**
```text
当前无法连接 Zotero 库。
请确认：
1) Zotero 桌面端已启动并启用本地 API；或
2) Web API 环境变量（ZOTERO_API_KEY / ZOTERO_LIBRARY_ID）已正确配置。
```

**Recovery**
- 连接恢复后先执行一次小范围搜索验证。

## E004_FULLTEXT_UNAVAILABLE

**When**
- `zotero-mcp:zotero_get_item_fulltext` 为空或失败。

**Reply Template**
```text
该条目暂时无法获取全文。我将降级为“元数据 + 标注/笔记”摘要。
结论的证据充分性会标记为 [需确认]。
```

**Recovery**
- 检查附件可读性、PDF/OCR 状态，必要时改走附件提取流程。

## E005_SEMANTIC_INDEX_MISSING

**When**
- `zotero-mcp:zotero_get_search_database_status` 显示未建立或不可用。

**Reply Template**
```text
语义检索索引尚未就绪，当前仅能执行关键词检索。
如需语义检索，请先运行索引更新（例如 `zotero-mcp update-db`）。
```

**Recovery**
- 索引更新后再执行 `zotero-mcp:zotero_semantic_search` 补检。

## E006_EMPTY_RESULT_SET

**When**
- 检索结果为空。

**Reply Template**
```text
当前检索结果为空。我将尝试：
1) 放宽关键词；
2) 切换合集范围；
3) 在索引可用时追加语义检索。
```

**Recovery**
- 输出新的查询建议并等待用户确认范围。
