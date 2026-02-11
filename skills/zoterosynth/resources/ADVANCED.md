# ZoteroSynth 高级用法

## uv 安装与配置

### 安装 uv

macOS / Linux:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows PowerShell:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 首次运行
```bash
cd D:/Documents/Code/Agents/ZoteroSynth/skill/zoterosynth
uv run scripts/zotero_client.py check
```
uv 会自动：创建 .venv → 安装 pyzotero + pymupdf → 执行脚本。

### 无 uv 回退
```bash
pip install pyzotero pymupdf
python D:/Documents/Code/Agents/ZoteroSynth/skill/zoterosynth/scripts/zotero_client.py check
```

## Web API 配置

设置环境变量启用远程访问：
- `ZOTERO_API_KEY`: 从 https://www.zotero.org/settings/keys/new 获取
- `ZOTERO_LIBRARY_ID`: 用户 ID（在 https://www.zotero.org/settings/keys 页面查看）
- `ZOTERO_LIBRARY_TYPE`: 默认 `user`，群组库设为 `group`

## 自定义数据目录

如果 Zotero 数据不在默认位置（`~/Zotero`），设置环境变量：
- `ZOTERO_DATA_DIR`: 自定义数据目录路径

默认路径：
- Windows: `C:\Users\<用户名>\Zotero`
- macOS: `~/Zotero`
- Linux: `~/Zotero`

## 批量操作

对大量文献（>20 篇）使用 Map-Reduce 策略：
1. **Map**: 逐篇提取摘要（每篇 300-600 tokens）
2. **Reduce**: 分批综合（每批 5-10 篇）
3. **Final**: 最终综合所有批次结果

## 故障排除

| 问题 | 原因 | 解决 |
|------|------|------|
| uv 未安装 | 系统未安装 uv | 按上方安装指南操作 |
| uv run 报错 "No module" | venv 损坏 | 删除 `.venv` 目录后重试 |
| Zotero 未检测到 | Zotero 未运行且 sqlite 不存在 | 启动 Zotero 桌面端，或检查数据目录 |
| PDF 提取为空 | PDF 为扫描件 | 需 OCR 工具预处理 |
| 全文 API 不可用 | Zotero 版本过低 | 升级到 Zotero 7.1+ 或 8.0+ |
| SQLite 锁定错误 | Zotero 正在写入 | 脚本已自动复制到临时文件，通常不会出现 |
| Windows 路径错误 | 路径含特殊字符 | 用双引号包裹路径 |

## 与 MCP Server 互操作

如果已安装 [zotero-mcp](https://pypi.org/project/zotero-mcp/)，本 skill 可与其共存：
- zotero-mcp 提供 MCP 工具（适合 Claude Desktop）
- ZoteroSynth 提供 CLI skill（适合 Claude Code / Codex CLI）
- 两者访问同一个 Zotero 数据库，互不冲突
