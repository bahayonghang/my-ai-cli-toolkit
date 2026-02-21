---
name: memory-system
version: "1.1.0"
description: "本地记忆系统，将 Markdown 文件索引到 SQLite 实现跨会话语义搜索。当用户提到：记忆、memory、知识库、索引笔记、搜索记忆、跨会话记忆、记住这个、memory search、memory index、memory status、回忆、查找记忆 时触发。支持增量索引、混合搜索（向量+全文）、记忆添加和清理。"
category: knowledge-management
tags:
  - memory
  - search
  - knowledge-base
  - sqlite
  - vector-search
  - semantic-search
  - indexing
dependencies:
  - sentence-transformers
  - numpy
---

# Memory System

脚本路径: `~/.claude/skills/public/memory-system/scripts/memory.py`

## 环境要求

首次使用前，请安装 Python 依赖：

```bash
pip3 install sentence-transformers numpy
```

- **嵌入模型**: `all-MiniLM-L6-v2`（~80MB，首次运行自动下载）
- **Python**: 3.10+
- **SQLite**: 内置，FTS5 可选（增强全文搜索）

## 自动行为

### 当用户说"搜索记忆"或"在记忆中查找 X"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py search "用户的查询" \
  --db ./memory/memory.sqlite --json --top 6
```

读取 JSON 结果后，用搜索到的上下文回答用户问题。如果数据库不存在，先执行索引。

### 当用户说"记住这个"或"添加到记忆"

将内容写入 `memory/` 目录的 .md 文件：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py add "内容" \
  --file 合适的文件名.md --dir ./memory --db ./memory/memory.sqlite
```

### 当用户说"索引记忆"或"更新记忆索引"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite
```

可选：通过 `--memory-file` 指定额外索引的文件：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite --memory-file ./MEMORY.md
```

### 当用户说"记忆状态"或"memory status"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py status \
  --db ./memory/memory.sqlite -v
```

### 当用户说"清理记忆"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py cleanup \
  --days 90 --dir ./memory --force
```

## 注意事项

- `./memory/` 和 `--db` 路径相对于项目工作目录
- 索引是增量的（SHA256 哈希比对），重复运行不会重新处理未变化的文件
- 搜索使用混合策略：向量相似度(70%) + 全文匹配(30%)
- `--json` 输出适合程序解析，不加则人类可读
- 详细配置参考: [references/config.md](references/config.md)

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| `ModuleNotFoundError: sentence_transformers` | 运行 `pip3 install sentence-transformers numpy` |
| `ModuleNotFoundError: numpy` | 运行 `pip3 install numpy` |
| 搜索无结果 | 先运行 `index` 命令建立索引 |
| FTS5 不可用 | 不影响使用，向量搜索仍可工作，仅全文搜索降级 |
| 索引后数据库损坏 | 删除 `.sqlite` 文件后重新索引 |
