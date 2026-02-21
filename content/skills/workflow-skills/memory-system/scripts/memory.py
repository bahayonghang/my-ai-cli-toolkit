#!/usr/bin/env python3
"""
Memory System - Markdown → SQLite 向量/全文混合搜索引擎

用法:
  python3 memory.py index  [--dir DIR] [--db DB]          索引 .md 文件
  python3 memory.py search QUERY [--top N] [--db DB]      语义搜索
  python3 memory.py status [--db DB]                       查看状态
  python3 memory.py add CONTENT [--file FILE] [--dir DIR]  添加记忆
  python3 memory.py cleanup [--days N] [--dir DIR]         清理旧文件
"""

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------------------
# 配置常量
# ---------------------------------------------------------------------------
DEFAULT_MEMORY_DIR = "memory"
DEFAULT_DB_NAME = "memory.sqlite"
CHUNK_MAX_CHARS = 1600  # ~400 tokens
CHUNK_OVERLAP_CHARS = 320  # ~80 tokens
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2
VECTOR_WEIGHT = 0.7
TEXT_WEIGHT = 0.3
DEFAULT_TOP_K = 6
DEFAULT_MIN_SCORE = 0.35
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_ID_SEP = "||"  # chunk ID 分隔符（避免 Windows 路径冒号歧义）

# ---------------------------------------------------------------------------
# 嵌入模型（懒加载）
# ---------------------------------------------------------------------------
_model = None


def get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            print("错误: 需要安装 sentence-transformers", file=sys.stderr)
            print("运行: pip3 install sentence-transformers numpy", file=sys.stderr)
            sys.exit(1)
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """批量生成嵌入向量，返回 ndarray (shape: [n, EMBEDDING_DIM])"""
    model = get_model()
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)


def embed_query(text: str) -> np.ndarray:
    """生成单个查询的嵌入向量，返回 ndarray (shape: [EMBEDDING_DIM])"""
    model = get_model()
    return model.encode([text], normalize_embeddings=True, show_progress_bar=False)[0]


# ---------------------------------------------------------------------------
# 向量工具
# ---------------------------------------------------------------------------
def vec_to_blob(vec: np.ndarray) -> bytes:
    """ndarray → bytes (little-endian float32)"""
    return np.asarray(vec, dtype=np.float32).tobytes()


def blob_to_vec(blob: bytes) -> np.ndarray:
    """bytes → ndarray (float32)"""
    return np.frombuffer(blob, dtype=np.float32).copy()


# ---------------------------------------------------------------------------
# SQLite 初始化
# ---------------------------------------------------------------------------
def init_db(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS meta (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS files (
            path  TEXT PRIMARY KEY,
            hash  TEXT NOT NULL,
            mtime REAL NOT NULL,
            size  INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chunks (
            id         TEXT PRIMARY KEY,
            path       TEXT NOT NULL,
            start_line INTEGER NOT NULL,
            end_line   INTEGER NOT NULL,
            hash       TEXT NOT NULL,
            text       TEXT NOT NULL,
            embedding  BLOB NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_chunks_path ON chunks(path);
    """)
    # FTS5 全文索引（trigram tokenizer 支持中文）
    try:
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                text,
                id UNINDEXED,
                path UNINDEXED,
                start_line UNINDEXED,
                end_line UNINDEXED,
                content=chunks,
                content_rowid=rowid,
                tokenize='trigram'
            )
        """)
    except sqlite3.OperationalError:
        # trigram 不可用，尝试默认 tokenizer
        try:
            conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                    text,
                    id UNINDEXED,
                    path UNINDEXED,
                    start_line UNINDEXED,
                    end_line UNINDEXED,
                    content=chunks,
                    content_rowid=rowid
                )
            """)
        except sqlite3.OperationalError:
            pass  # FTS5 不可用时静默跳过
    # 元数据
    conn.execute("INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?)", ("model", MODEL_NAME))
    conn.execute("INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?)", ("dims", str(EMBEDDING_DIM)))
    conn.commit()
    return conn


def has_fts(conn: sqlite3.Connection) -> bool:
    try:
        conn.execute("SELECT 1 FROM chunks_fts LIMIT 0")
        return True
    except sqlite3.OperationalError:
        return False


# ---------------------------------------------------------------------------
# Markdown 分块
# ---------------------------------------------------------------------------
def chunk_markdown(text: str) -> list[dict]:
    """按标题和段落分块，返回 [{start_line, end_line, text}]"""
    lines = text.split("\n")
    chunks = []
    current_chunk_lines = []
    current_start = 1
    current_chars = 0

    for i, line in enumerate(lines, 1):
        is_heading = re.match(r"^#{1,6}\s", line)

        # 遇到标题且当前块非空 → 切分
        if is_heading and current_chunk_lines:
            chunk_text = "\n".join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append(
                    {
                        "start_line": current_start,
                        "end_line": i - 1,
                        "text": chunk_text,
                    }
                )
            current_chunk_lines = []
            current_start = i
            current_chars = 0

        current_chunk_lines.append(line)
        current_chars += len(line) + 1

        # 超过最大字符数 → 强制切分
        if current_chars >= CHUNK_MAX_CHARS and not is_heading:
            chunk_text = "\n".join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append(
                    {
                        "start_line": current_start,
                        "end_line": i,
                        "text": chunk_text,
                    }
                )
            # 保留重叠部分
            overlap_lines = []
            overlap_chars = 0
            for ol in reversed(current_chunk_lines):
                overlap_chars += len(ol) + 1
                if overlap_chars > CHUNK_OVERLAP_CHARS:
                    break
                overlap_lines.insert(0, ol)
            # 确保至少保留当前行，避免单行超长时丢失数据
            if not overlap_lines:
                overlap_lines = [current_chunk_lines[-1]]
            current_chunk_lines = overlap_lines
            current_start = i - len(overlap_lines) + 1
            current_chars = sum(len(ol) + 1 for ol in overlap_lines)

    # 最后一块
    if current_chunk_lines:
        chunk_text = "\n".join(current_chunk_lines).strip()
        if chunk_text:
            chunks.append(
                {
                    "start_line": current_start,
                    "end_line": len(lines),
                    "text": chunk_text,
                }
            )

    return chunks


# ---------------------------------------------------------------------------
# 文件哈希
# ---------------------------------------------------------------------------
def file_hash(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


# ---------------------------------------------------------------------------
# 索引
# ---------------------------------------------------------------------------
def list_md_files(memory_dir: str, extra_files: list[str] | None = None) -> list[str]:
    """列出记忆目录中的所有 .md 文件

    Args:
        memory_dir: 记忆目录路径
        extra_files: 额外的文件路径列表（如 MEMORY.md）
    """
    d = Path(memory_dir)
    files = []
    # 添加额外指定的文件
    if extra_files:
        for ef in extra_files:
            ef_path = Path(ef)
            if ef_path.exists():
                files.append(str(ef_path))
    # memory/ 目录下的 .md
    if d.exists():
        for f in sorted(d.rglob("*.md")):
            files.append(str(f))
    return files


def index_file(conn: sqlite3.Connection, filepath: str, fhash: str) -> int:
    """索引单个文件，返回 chunk 数量。使用 savepoint 保证原子性。"""
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    chunks = chunk_markdown(content)
    if not chunks:
        return 0

    texts = [c["text"] for c in chunks]
    # 先生成 embeddings（可能失败），成功后再修改数据库
    embeddings = embed_texts(texts)

    # 使用 savepoint 保证原子性：embed 成功后才删除旧数据
    conn.execute("SAVEPOINT sp_index_file")
    try:
        conn.execute("DELETE FROM chunks WHERE path = ?", (filepath,))

        for chunk, emb in zip(chunks, embeddings, strict=False):
            chunk_id = f"{filepath}{CHUNK_ID_SEP}{chunk['start_line']}-{chunk['end_line']}"
            th = text_hash(chunk["text"])
            conn.execute(
                """INSERT OR REPLACE INTO chunks(id, path, start_line, end_line, hash, text, embedding)
                   VALUES(?, ?, ?, ?, ?, ?, ?)""",
                (chunk_id, filepath, chunk["start_line"], chunk["end_line"], th, chunk["text"], vec_to_blob(emb)),
            )

        # 更新文件记录
        stat = os.stat(filepath)
        conn.execute(
            "INSERT OR REPLACE INTO files(path, hash, mtime, size) VALUES(?, ?, ?, ?)",
            (filepath, fhash, stat.st_mtime, stat.st_size),
        )
        conn.execute("RELEASE sp_index_file")
    except Exception:
        conn.execute("ROLLBACK TO sp_index_file")
        raise

    conn.commit()
    return len(chunks)


def _do_index(memory_dir: str, db_path: str, extra_files: list[str] | None = None) -> tuple[int, int, int]:
    """核心索引逻辑，返回 (indexed, skipped, total_chunks)"""
    md_files = list_md_files(memory_dir, extra_files=extra_files)
    if not md_files:
        print(f"没有找到 .md 文件 (目录: {memory_dir})")
        return 0, 0, 0

    conn = init_db(db_path)
    try:
        # 获取已索引的文件哈希
        existing = {}
        for row in conn.execute("SELECT path, hash FROM files"):
            existing[row[0]] = row[1]

        indexed = 0
        skipped = 0
        total_chunks = 0

        for fp in md_files:
            fh = file_hash(fp)
            if fp in existing and existing[fp] == fh:
                skipped += 1
                continue
            n = index_file(conn, fp, fh)
            total_chunks += n
            indexed += 1
            print(f"  已索引: {os.path.basename(fp)} ({n} 块)")

        # 清理已删除的文件
        current_set = set(md_files)
        for old_path in list(existing.keys()):
            if old_path not in current_set:
                conn.execute("DELETE FROM chunks WHERE path = ?", (old_path,))
                conn.execute("DELETE FROM files WHERE path = ?", (old_path,))
                print(f"  已移除: {os.path.basename(old_path)}")
        conn.commit()

        # FTS 重建：仅在所有文件处理完成后执行一次
        if has_fts(conn) and indexed > 0:
            conn.execute("INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')")
            conn.commit()
    finally:
        conn.close()

    return indexed, skipped, total_chunks


def cmd_index(args: argparse.Namespace) -> None:
    """索引命令"""
    memory_dir = os.path.abspath(args.dir)
    db_path = args.db or os.path.join(memory_dir, DEFAULT_DB_NAME)

    # 收集额外文件
    extra_files = []
    if hasattr(args, "memory_file") and args.memory_file:
        extra_files.append(args.memory_file)
    else:
        # 默认查找 memory 目录同级的 MEMORY.md（保持向后兼容）
        candidate = Path(memory_dir).parent / "MEMORY.md"
        if candidate.exists():
            extra_files.append(str(candidate))

    indexed, skipped, total_chunks = _do_index(memory_dir, db_path, extra_files=extra_files)

    print(f"\n完成: 索引 {indexed} 个文件 ({total_chunks} 块)，跳过 {skipped} 个未变化文件")
    print(f"数据库: {db_path}")


# ---------------------------------------------------------------------------
# 搜索
# ---------------------------------------------------------------------------
def vector_search(conn: sqlite3.Connection, query_vec: np.ndarray, top_k: int) -> list[dict]:
    """numpy 批量向量搜索（点积 = 余弦相似度，因向量已归一化）"""
    rows = conn.execute("SELECT id, path, start_line, end_line, text, embedding FROM chunks").fetchall()
    if not rows:
        return []

    # 批量构建嵌入矩阵，单次矩阵乘法计算所有相似度
    matrix = np.array([blob_to_vec(r[5]) for r in rows])  # shape: (n, dim)
    scores = matrix @ query_vec  # shape: (n,)

    # 取 top_k * 4 候选
    candidate_count = min(top_k * 4, len(rows))
    top_indices = np.argsort(scores)[::-1][:candidate_count]

    results = []
    for idx in top_indices:
        r = rows[idx]
        results.append(
            {
                "id": r[0],
                "path": r[1],
                "start_line": r[2],
                "end_line": r[3],
                "text": r[4],
                "score": float(scores[idx]),
                "source": "vector",
            }
        )
    return results


def fts_search(conn: sqlite3.Connection, query: str, top_k: int) -> list[dict]:
    """FTS5 全文搜索（支持 trigram 和默认 tokenizer）"""
    if not has_fts(conn):
        return []

    results = []
    try:
        fts_query = query.strip()
        if not fts_query:
            return []

        rows = conn.execute(
            """SELECT id, path, start_line, end_line, text, rank
               FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?""",
            (fts_query, top_k * 4),
        ).fetchall()

        if not rows:
            # trigram 可能需要引号包裹做精确子串匹配
            rows = conn.execute(
                """SELECT id, path, start_line, end_line, text, rank
                   FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?""",
                (f'"{fts_query}"', top_k * 4),
            ).fetchall()
    except sqlite3.OperationalError as e:
        print(f"FTS 搜索错误: {e}", file=sys.stderr)
        return []

    if not rows:
        return []

    # rank 归一化: FTS5 rank 越负越好（绝对值越大 = 越相关）
    # 转换为 0-1 分数: 最相关 → 1.0，最不相关 → 接近 0
    abs_ranks = [abs(r[5]) for r in rows]
    min_rank = min(abs_ranks)
    max_rank = max(abs_ranks)
    spread = max_rank - min_rank

    for r in rows:
        if spread > 0:
            # 绝对值最大（最相关）→ 分数最高
            score = (abs(r[5]) - min_rank) / (spread + 1e-9)
        else:
            score = 1.0  # 只有一个结果时给满分
        results.append(
            {"id": r[0], "path": r[1], "start_line": r[2], "end_line": r[3], "text": r[4], "score": score, "source": "fts"}
        )
    return results


def hybrid_search(conn: sqlite3.Connection, query: str, top_k: int, min_score: float) -> list[dict]:
    """混合搜索: 向量 + 全文"""
    query_vec = embed_query(query)

    vec_results = vector_search(conn, query_vec, top_k)
    fts_results = fts_search(conn, query, top_k)

    # 合并
    merged = {}
    for r in vec_results:
        merged[r["id"]] = {
            **r,
            "vec_score": r["score"],
            "fts_score": 0.0,
        }
    for r in fts_results:
        if r["id"] in merged:
            merged[r["id"]]["fts_score"] = r["score"]
        else:
            merged[r["id"]] = {
                **r,
                "vec_score": 0.0,
                "fts_score": r["score"],
            }

    # 加权 + FTS-only 结果补偿
    for item in merged.values():
        weighted = VECTOR_WEIGHT * item["vec_score"] + TEXT_WEIGHT * item["fts_score"]
        # FTS-only 命中补偿：避免纯关键词匹配被 min_score 过滤
        if item["vec_score"] == 0.0 and item["fts_score"] > 0:
            item["score"] = max(weighted, item["fts_score"] * 0.8)
        else:
            item["score"] = weighted

    results = sorted(merged.values(), key=lambda x: x["score"], reverse=True)
    results = [r for r in results if r["score"] >= min_score]
    return results[:top_k]


def cmd_search(args: argparse.Namespace) -> None:
    """搜索命令"""
    db_path = args.db
    if not db_path:
        memory_dir = os.path.abspath(getattr(args, "dir", DEFAULT_MEMORY_DIR) or DEFAULT_MEMORY_DIR)
        db_path = os.path.join(memory_dir, DEFAULT_DB_NAME)

    if not os.path.exists(db_path):
        print(f"数据库不存在: {db_path}")
        print("请先运行: python3 memory.py index")
        sys.exit(1)

    conn = init_db(db_path)
    try:
        results = hybrid_search(conn, args.query, args.top, args.min_score)
    finally:
        conn.close()

    if not results:
        print("没有找到相关结果")
        return

    if args.json:
        output = []
        for r in results:
            output.append(
                {
                    "path": r["path"],
                    "start_line": r["start_line"],
                    "end_line": r["end_line"],
                    "score": round(r["score"], 4),
                    "snippet": r["text"][:700],
                }
            )
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        for i, r in enumerate(results, 1):
            snippet = r["text"][:200].replace("\n", " ")
            basename = os.path.basename(r["path"])
            print(f"\n[{i}] {basename}:{r['start_line']}-{r['end_line']}  (分数: {r['score']:.3f})")
            print(f"    {snippet}...")


# ---------------------------------------------------------------------------
# 状态
# ---------------------------------------------------------------------------
def cmd_status(args: argparse.Namespace) -> None:
    """查看索引状态"""
    db_path = args.db
    if not db_path:
        memory_dir = os.path.abspath(getattr(args, "dir", DEFAULT_MEMORY_DIR) or DEFAULT_MEMORY_DIR)
        db_path = os.path.join(memory_dir, DEFAULT_DB_NAME)

    if not os.path.exists(db_path):
        print(f"数据库不存在: {db_path}")
        print("请先运行: python3 memory.py index")
        return

    conn = init_db(db_path)
    try:
        file_count = conn.execute("SELECT COUNT(*) FROM files").fetchone()[0]
        chunk_count = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
        model = conn.execute("SELECT value FROM meta WHERE key='model'").fetchone()
        dims = conn.execute("SELECT value FROM meta WHERE key='dims'").fetchone()
        db_size = os.path.getsize(db_path)

        fts_ok = has_fts(conn)

        print(f"数据库:    {db_path}")
        print(f"大小:      {db_size / 1024 / 1024:.2f} MB")
        print(f"文件数:    {file_count}")
        print(f"分块数:    {chunk_count}")
        print(f"嵌入模型:  {model[0] if model else 'N/A'}")
        print(f"向量维度:  {dims[0] if dims else 'N/A'}")
        print(f"全文索引:  {'可用' if fts_ok else '不可用'}")

        if args.verbose:
            print("\n--- 已索引文件 ---")
            for row in conn.execute("SELECT path, size FROM files ORDER BY path"):
                print(f"  {os.path.basename(row[0])} ({row[1]} bytes)")
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# 添加记忆
# ---------------------------------------------------------------------------
def cmd_add(args: argparse.Namespace) -> None:
    """添加记忆内容"""
    memory_dir = os.path.abspath(args.dir)
    os.makedirs(memory_dir, exist_ok=True)

    if args.file:
        filename = args.file if args.file.endswith(".md") else args.file + ".md"
    else:
        # 自动生成文件名
        ts = datetime.now().strftime("%Y-%m-%d-%H%M")
        filename = f"{ts}.md"

    filepath = os.path.join(memory_dir, filename)

    # 追加或创建
    mode = "a" if os.path.exists(filepath) else "w"
    with open(filepath, mode, encoding="utf-8") as f:
        if mode == "a":
            f.write("\n\n")
        f.write(args.content)
        f.write("\n")

    print(f"已写入: {filepath}")

    # 自动索引
    db_path = args.db or os.path.join(memory_dir, DEFAULT_DB_NAME)
    conn = init_db(db_path)
    try:
        fh = file_hash(filepath)
        n = index_file(conn, filepath, fh)
        # 单文件索引后重建 FTS
        if has_fts(conn):
            conn.execute("INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')")
            conn.commit()
    finally:
        conn.close()
    print(f"已索引: {n} 块")


# ---------------------------------------------------------------------------
# 清理
# ---------------------------------------------------------------------------
def cmd_cleanup(args: argparse.Namespace) -> None:
    """清理旧记忆文件"""
    memory_dir = os.path.abspath(args.dir)
    cutoff = datetime.now() - timedelta(days=args.days)
    cutoff_ts = cutoff.timestamp()

    if not os.path.exists(memory_dir):
        print(f"目录不存在: {memory_dir}")
        return

    to_delete = []
    for f in Path(memory_dir).glob("*.md"):
        if f.stat().st_mtime < cutoff_ts:
            to_delete.append(f)

    if not to_delete:
        print(f"没有超过 {args.days} 天的文件")
        return

    print(f"将删除 {len(to_delete)} 个文件:")
    for f in to_delete:
        print(f"  {f.name} (修改于 {datetime.fromtimestamp(f.stat().st_mtime):%Y-%m-%d})")

    if not args.force:
        confirm = input("\n确认删除? [y/N] ")
        if confirm.lower() != "y":
            print("已取消")
            return

    for f in to_delete:
        f.unlink()
        print(f"  已删除: {f.name}")

    # 重新索引以清理 SQLite（使用共享函数，不再需要 FakeArgs）
    db_path = args.db or os.path.join(memory_dir, DEFAULT_DB_NAME)
    if os.path.exists(db_path):
        print("\n重新索引...")
        _do_index(memory_dir, db_path)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Memory System - Markdown 向量/全文混合搜索",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command")

    # index
    p_index = sub.add_parser("index", help="索引 .md 文件")
    p_index.add_argument("--dir", default=DEFAULT_MEMORY_DIR, help="记忆目录 (默认: memory/)")
    p_index.add_argument("--db", default=None, help="数据库路径")
    p_index.add_argument("--memory-file", default=None, help="额外索引的文件路径 (如 MEMORY.md)")

    # search
    p_search = sub.add_parser("search", help="语义搜索")
    p_search.add_argument("query", help="搜索查询")
    p_search.add_argument("--top", type=int, default=DEFAULT_TOP_K, help="返回结果数")
    p_search.add_argument("--min-score", type=float, default=DEFAULT_MIN_SCORE, help="最小分数")
    p_search.add_argument("--db", default=None, help="数据库路径")
    p_search.add_argument("--dir", default=DEFAULT_MEMORY_DIR, help="记忆目录")
    p_search.add_argument("--json", action="store_true", help="JSON 输出")

    # status
    p_status = sub.add_parser("status", help="查看索引状态")
    p_status.add_argument("--db", default=None, help="数据库路径")
    p_status.add_argument("--dir", default=DEFAULT_MEMORY_DIR, help="记忆目录")
    p_status.add_argument("--verbose", "-v", action="store_true", help="详细输出")

    # add
    p_add = sub.add_parser("add", help="添加记忆")
    p_add.add_argument("content", help="记忆内容")
    p_add.add_argument("--file", "-f", default=None, help="目标文件名")
    p_add.add_argument("--dir", default=DEFAULT_MEMORY_DIR, help="记忆目录")
    p_add.add_argument("--db", default=None, help="数据库路径")

    # cleanup
    p_cleanup = sub.add_parser("cleanup", help="清理旧记忆")
    p_cleanup.add_argument("--days", type=int, default=90, help="清理超过 N 天的文件")
    p_cleanup.add_argument("--dir", default=DEFAULT_MEMORY_DIR, help="记忆目录")
    p_cleanup.add_argument("--db", default=None, help="数据库路径")
    p_cleanup.add_argument("--force", "-f", action="store_true", help="不确认直接删除")

    args = parser.parse_args()

    if args.command == "index":
        cmd_index(args)
    elif args.command == "search":
        cmd_search(args)
    elif args.command == "status":
        cmd_status(args)
    elif args.command == "add":
        cmd_add(args)
    elif args.command == "cleanup":
        cmd_cleanup(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
