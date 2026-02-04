# Memory System 配置参考

## 可调参数（脚本内常量）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `CHUNK_MAX_CHARS` | 1600 | 分块最大字符数（~400 tokens） |
| `CHUNK_OVERLAP_CHARS` | 320 | 分块重叠字符数（~80 tokens） |
| `EMBEDDING_DIM` | 384 | 向量维度（all-MiniLM-L6-v2） |
| `VECTOR_WEIGHT` | 0.7 | 混合搜索中向量搜索权重 |
| `TEXT_WEIGHT` | 0.3 | 混合搜索中全文搜索权重 |
| `DEFAULT_TOP_K` | 6 | 默认返回结果数 |
| `DEFAULT_MIN_SCORE` | 0.35 | 最小分数阈值 |
| `MODEL_NAME` | all-MiniLM-L6-v2 | sentence-transformers 模型 |

## SQLite Schema

```sql
-- 元数据
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- 已索引文件
CREATE TABLE files (
  path  TEXT PRIMARY KEY,
  hash  TEXT NOT NULL,      -- SHA256
  mtime REAL NOT NULL,
  size  INTEGER NOT NULL
);

-- 文本块 + 嵌入
CREATE TABLE chunks (
  id         TEXT PRIMARY KEY,   -- "filepath:startline-endline"
  path       TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line   INTEGER NOT NULL,
  hash       TEXT NOT NULL,      -- 文本 SHA256
  text       TEXT NOT NULL,
  embedding  BLOB NOT NULL       -- float32 little-endian
);

-- 全文搜索
CREATE VIRTUAL TABLE chunks_fts USING fts5(text, id UNINDEXED, path UNINDEXED, ...);
```

## 分块策略

1. 遇到 Markdown 标题（`# ` ~ `###### `）→ 切分
2. 累积字符超过 `CHUNK_MAX_CHARS` → 强制切分，保留 `CHUNK_OVERLAP_CHARS` 重叠
3. 文件末尾剩余内容作为最后一块

## 嵌入模型

- 模型: `all-MiniLM-L6-v2`（sentence-transformers）
- 维度: 384
- 大小: ~80MB（首次下载）
- 语言: 多语言支持（中英文均可）
- 归一化: 输出已 L2 归一化，余弦相似度等价于点积

## 向量存储

嵌入以 `BLOB` 存储在 SQLite 中（`float32` little-endian 编码）。
搜索时读入 Python 用 numpy 计算余弦相似度。

## 增量索引

- 每个文件计算 SHA256 哈希
- 与 `files` 表中记录的哈希比对
- 哈希相同 → 跳过
- 哈希不同或新文件 → 重新分块 + 嵌入
- 源文件被删除 → 从 SQLite 中移除对应 chunks
