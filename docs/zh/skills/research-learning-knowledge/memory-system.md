# Memory System（记忆系统）

本地记忆系统，将 Markdown 文件索引到 SQLite 实现跨会话语义搜索。

**脚本路径：** `~/.claude/skills/public/memory-system/scripts/memory.py`
**版本：** 1.1.0

## 概述

Memory System 技能为 AI 助手提供持久化的本地知识库：

- 将 Markdown 文件索引到 SQLite，生成向量嵌入
- 混合搜索：向量相似度（70%）+ 全文 BM25（30%）
- 基于 SHA-256 的增量索引——未变化的文件自动跳过
- 跨会话记忆持久化
- savepoint 事务保护——嵌入生成失败时自动回滚，不会损坏已有数据

## 环境要求

首次使用前，请安装 Python 依赖：

```bash
pip3 install sentence-transformers numpy
```

- **嵌入模型**：`all-MiniLM-L6-v2`（~80MB，首次运行自动下载）
- **Python**：3.10+
- **SQLite**：内置；FTS5 可选（增强全文搜索，trigram tokenizer 支持中文）

## 自动触发关键词

当用户提到以下关键词时，技能会自动激活：

- 记忆 / memory / 知识库 / 索引笔记
- 搜索记忆 / memory search / memory index
- 跨会话记忆 / 记住这个 / 回忆 / 查找记忆
- memory status

## 自动行为

### 当用户说"搜索记忆"或"在记忆中查找 X"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py search "用户的查询" \
  --db ./memory/memory.sqlite --json --top 6
```

读取 JSON 结果后，用搜索到的上下文回答用户问题。如果数据库不存在，先执行索引。

### 当用户说"记住这个"或"添加到记忆"

将内容写入 `memory/` 目录的 `.md` 文件：

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py add "内容" \
  --file 合适的文件名.md --dir ./memory --db ./memory/memory.sqlite
```

### 当用户说"索引记忆"或"更新记忆索引"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite
```

通过 `--memory-file` 额外索引指定文件（如项目根目录的 `MEMORY.md`）：

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

## 参数参考

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--db` | `./memory/memory.sqlite` | SQLite 数据库路径 |
| `--dir` | `./memory` | Markdown 文件目录 |
| `--top` | `6` | 返回搜索结果数 |
| `--min-score` | `0.35` | 最低相关度分数阈值 |
| `--json` | 关闭 | 输出机器可读的 JSON 格式 |
| `--memory-file` | *(无)* | 额外索引的文件路径（如顶层 `MEMORY.md`） |
| `--days` | `90` | `cleanup` 的时间阈值（天） |
| `--force` | 关闭 | `cleanup` 时跳过确认提示 |
| `-v` / `--verbose` | 关闭 | `status` 时显示每个文件列表 |

## 工作原理

1. **索引**：扫描 Markdown 文件，按标题/长度切分为重叠分块（约 400 tokens），使用 `sentence-transformers/all-MiniLM-L6-v2` 生成向量嵌入，存入 SQLite
2. **存储**：分块、嵌入（float32 blob）、文件哈希、FTS 内容原子写入——嵌入失败时通过 `SAVEPOINT` 自动回滚，已有数据不受影响
3. **搜索**：查询词生成嵌入后，通过 numpy 矩阵乘法一次性计算所有分块的相似度；FTS5 BM25 分数独立计算后加权合并（向量 70% + 全文 30%）；纯关键词命中会获得分数补偿，避免被 `min_score` 过滤
4. **增量**：重新索引时仅重处理 SHA-256 哈希变化的文件；FTS 在所有文件处理完毕后统一重建一次（而非每文件各重建一次）

## 目录结构

```
./memory/
├── memory.sqlite       # SQLite 数据库（含索引和嵌入）
├── MEMORY.md           # 可选：顶层记忆文件（通过 --memory-file 指定）
└── *.md                # 记忆 Markdown 文件
```

## 最佳实践

- 将记忆文件统一组织在 `./memory/` 目录中
- 批量添加新文件后运行 `index` 更新索引
- 使用描述性文件名便于管理
- 定期运行 `status` 监控数据库健康状态
- 设置定期 `cleanup` 删除过期信息

## 使用场景

- **项目文档**：记住项目决策和背景上下文
- **代码片段**：存储和检索有用的代码模式
- **研究笔记**：索引研究发现和参考资料
- **会议记录**：跨会议摘要搜索
- **学习日志**：构建可搜索的个人知识库

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| `ModuleNotFoundError: sentence_transformers` | 运行 `pip3 install sentence-transformers numpy` |
| `ModuleNotFoundError: numpy` | 运行 `pip3 install numpy` |
| 搜索无结果 | 先运行 `index` 命令建立索引 |
| FTS5 不可用 | 不影响使用，向量搜索仍正常工作，仅全文搜索降级 |
| 索引后数据库损坏 | 删除 `.sqlite` 文件后重新索引 |
| 搜索结果不相关 | 尝试降低 `--min-score`（如 `--min-score 0.2`） |

## 技术细节

| 项目 | 说明 |
|------|------|
| 向量模型 | `all-MiniLM-L6-v2`（384 维，多语言） |
| 向量存储 | SQLite BLOB（float32 little-endian，numpy tobytes） |
| 向量搜索 | numpy 矩阵乘法批量计算，O(1) 每查询（相对于 chunk 数量是 O(n) 加载但单次矩阵运算） |
| 全文搜索 | FTS5 + trigram tokenizer（中文子串匹配） |
| 分块策略 | 按 Markdown 标题 + 字符上限（1600）切分，320 字符重叠 |
| 增量索引 | SHA-256 文件哈希比对 |
| 事务安全 | SAVEPOINT 保护 index_file，embed 失败自动回滚 |
| chunk ID | `filepath\|\|startline-endline`（`\|\|` 分隔符避免 Windows 路径冒号歧义） |

## 相关技能

- [planning-with-files](./planning-with-files) — 基于文件的任务规划工作流
- [codex](../developer-tools-integrations/codex) — Web 搜索、实时技术调研与带引用的 Codex 工作流

## 参考资料

详细配置参数请参阅：[references/config.md](../../content/skills/research-learning-knowledge/memory-system/references/config.md)
