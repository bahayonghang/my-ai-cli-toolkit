# ZoteroSynth 高级用法

## MCP Server 安装

### 安装 zotero-mcp

```bash
uv tool install "git+https://github.com/54yyyu/zotero-mcp.git"
```

### 自动配置

```bash
zotero-mcp setup
```

### 验证安装

```bash
zotero-mcp version
zotero-mcp setup-info
```

## Zotero 连接方式

### Local API（推荐）

1. 打开 Zotero 桌面端
2. 设置 → 高级 → 勾选 "允许其他应用与 Zotero 通信"
3. 设置环境变量 `ZOTERO_LOCAL=true`

### Web API（远程访问）

设置环境变量：
- `ZOTERO_API_KEY`: 从 https://www.zotero.org/settings/keys/new 获取
- `ZOTERO_LIBRARY_ID`: 用户 ID（在 https://www.zotero.org/settings/keys 页面查看）
- `ZOTERO_LIBRARY_TYPE`: 默认 `user`，群组库设为 `group`

```bash
zotero-mcp setup --no-local --api-key YOUR_API_KEY --library-id YOUR_LIBRARY_ID
```

## 语义搜索配置

zotero-mcp 支持 AI 语义搜索，需要配置 embedding 模型：

```bash
# 仅配置语义搜索
zotero-mcp setup --semantic-config-only

# 更新语义搜索数据库
zotero-mcp update-db              # 快速更新（仅元数据）
zotero-mcp update-db --fulltext   # 完整更新（含全文提取，较慢）
zotero-mcp update-db --force-rebuild  # 强制完全重建
```

环境变量：
- `ZOTERO_EMBEDDING_MODEL`: 选择模型 (`default` / `openai` / `gemini`)
- `OPENAI_API_KEY` / `GEMINI_API_KEY`: 对应 API Key
- `ZOTERO_DB_PATH`: 自定义 zotero.sqlite 路径

## 批量操作

对大量文献（>20 篇）使用 Map-Reduce 策略：
1. **Map**: 逐篇提取摘要（每篇 300-600 tokens）
2. **Reduce**: 分批综合（每批 5-10 篇）
3. **Final**: 最终综合所有批次结果

## MCP Server 更新

```bash
# 检查更新
zotero-mcp update --check-only

# 执行更新
zotero-mcp update
```

## 故障排除

| 问题 | 原因 | 解决 |
|------|------|------|
| zotero-mcp 未安装 | 系统未安装 | `uv tool install "git+https://github.com/54yyyu/zotero-mcp.git"` |
| MCP 工具不可用 | Server 未启动 | 检查 MCP 客户端配置，运行 `zotero-mcp setup-info` |
| Zotero 未检测到 | 桌面端未运行 | 启动 Zotero 并启用 API |
| 全文获取失败 | Zotero 版本过低 | 升级到 Zotero 7.1+ |
| 语义搜索无结果 | 索引未建立 | 运行 `zotero-mcp update-db` |
