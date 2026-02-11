# Memory System (记忆系统)

本地记忆系统，将 Markdown 文件索引到 SQLite 实现跨会话语义搜索。

## 概述

Memory System 技能提供强大的本地知识库功能：
- 将 Markdown 文件索引到 SQLite 数据库
- 使用向量嵌入实现语义搜索
- 支持混合搜索（向量 + 全文）
- 为 AI 助手维护跨会话记忆
- 通过 SHA256 哈希比对实现增量索引

## 功能特性

- **语义搜索**：使用自然语言查询查找相关信息
- **混合搜索**：结合向量相似度和全文搜索获得更好结果
- **增量索引**：仅处理变化的文件以提高效率
- **跨会话记忆**：在多次 AI 对话中持久化知识
- **记忆管理**：添加、搜索、索引和清理操作
- **状态监控**：查看数据库统计信息和健康状态

## 安装

```bash
uv run python src/install.py install memory-system
```

## 依赖

该技能需要 Python 包来生成向量嵌入：

```bash
uv add sentence-transformers numpy
```

## 使用方法

### 自动触发

当用户提到以下关键词时，技能会自动激活：
- "记忆" / "memory"
- "知识库" / "knowledge base"
- "索引笔记" / "index notes"
- "搜索记忆" / "search memory"
- "跨会话记忆" / "cross-session memory"
- "记住这个" / "remember this"
- "回忆" / "recall"
- "查找记忆" / "find memory"

### 命令

#### 搜索记忆

在记忆数据库中搜索信息：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py search "你的查询" \
  --db ./memory/memory.sqlite --json --top 6
```

#### 添加到记忆

保存新信息到记忆：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py add "要记住的内容" \
  --file 文件名.md --dir ./memory --db ./memory/memory.sqlite
```

#### 索引记忆

构建或更新搜索索引：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite
```

#### 检查状态

查看记忆数据库统计信息：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py status \
  --db ./memory/memory.sqlite -v
```

#### 清理旧记忆

删除超过指定天数的记忆：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py cleanup \
  --days 90 --dir ./memory --force
```

## 配置

### 目录结构

```
./memory/
├── memory.sqlite       # 包含索引内容的 SQLite 数据库
└── *.md               # 包含记忆的 Markdown 文件
```

### 选项

- `--db`：SQLite 数据库路径（默认：`./memory/memory.sqlite`）
- `--dir`：包含 Markdown 文件的目录（默认：`./memory`）
- `--json`：以 JSON 格式输出结果，便于程序解析
- `--top`：返回的搜索结果数量（默认：6）
- `--days`：清理操作的时间阈值
- `--force`：跳过确认提示

## 工作原理

1. **索引**：扫描 Markdown 文件并使用 sentence-transformers 生成向量嵌入
2. **存储**：将内容、嵌入和元数据存储在 SQLite 中
3. **搜索**：结合向量相似度搜索和全文搜索以获得最佳结果
4. **增量更新**：使用 SHA256 哈希检测文件变化，避免重复处理

## 最佳实践

- 将记忆文件组织在 `./memory/` 目录中
- 添加多个新文件后运行 `index`
- 使用描述性文件名以便更好地组织
- 定期检查 `status` 以监控数据库健康状态
- 设置定期 `cleanup` 以删除过时信息

## 使用场景

- **项目文档**：记住项目决策和上下文
- **代码片段**：存储和检索有用的代码模式
- **研究笔记**：索引研究发现和参考资料
- **会议记录**：跨会议摘要搜索
- **学习日志**：构建可搜索的知识库

## 技术细节

- **向量模型**：使用 sentence-transformers 生成语义嵌入
- **数据库**：SQLite 用于高效存储和查询
- **搜索算法**：结合余弦相似度和 BM25 的混合方法
- **哈希算法**：SHA256 用于变化检测

## 相关技能

- [research](./research) - 支持网络搜索的技术研究
- [planning-with-files](./planning-with-files) - 基于文件的任务规划

## 参考资料

有关详细配置选项，请参阅技能的 `references/config.md` 文件。
