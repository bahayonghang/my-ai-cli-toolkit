# Memory System

A local memory system that indexes Markdown files into SQLite for cross-session semantic search.

**Script path:** `~/.claude/skills/public/memory-system/scripts/memory.py`
**Version:** 1.1.0

## Overview

Memory System provides a persistent local knowledge base for AI assistants:

- Indexes Markdown files into SQLite with vector embeddings
- Hybrid search: vector similarity (70%) + full-text BM25 (30%)
- Incremental indexing via SHA-256 — unchanged files are skipped
- Cross-session memory persistence
- Atomic indexing with savepoint transactions (no partial state on failure)

## Requirements

Install Python dependencies before first use:

```bash
pip3 install sentence-transformers numpy
```

- **Embedding model**: `all-MiniLM-L6-v2` (~80 MB, auto-downloaded on first run)
- **Python**: 3.10+
- **SQLite**: built-in; FTS5 optional (enhances full-text search, supports CJK via trigram tokenizer)

## Automatic Behaviors

### When user says "search memory" or "find X in memory"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py search "user query" \
  --db ./memory/memory.sqlite --json --top 6
```

Parse the JSON output and answer the user using the retrieved context. If the database does not exist, run `index` first.

### When user says "remember this" or "add to memory"

Write content to a `.md` file in the `memory/` directory:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py add "content" \
  --file suitable-filename.md --dir ./memory --db ./memory/memory.sqlite
```

### When user says "index memory" or "update memory index"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite
```

To also index a top-level `MEMORY.md` file (or any extra file):

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite --memory-file ./MEMORY.md
```

### When user says "memory status"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py status \
  --db ./memory/memory.sqlite -v
```

### When user says "clean up memory"

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py cleanup \
  --days 90 --dir ./memory --force
```

## Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `--db` | `./memory/memory.sqlite` | SQLite database path |
| `--dir` | `./memory` | Directory containing Markdown files |
| `--top` | `6` | Number of search results to return |
| `--min-score` | `0.35` | Minimum relevance score threshold |
| `--json` | off | Machine-readable JSON output |
| `--memory-file` | *(none)* | Extra file to index (e.g. a top-level `MEMORY.md`) |
| `--days` | `90` | Age threshold for `cleanup` |
| `--force` | off | Skip confirmation prompt in `cleanup` |
| `-v` / `--verbose` | off | Show per-file list in `status` |

## How It Works

1. **Index**: Scans Markdown files, splits them into overlapping chunks (~400 tokens each), generates vector embeddings via `sentence-transformers/all-MiniLM-L6-v2`, stores everything in SQLite
2. **Store**: Chunks, embeddings (float32 blob), file hashes, and FTS content are stored atomically — an embedding failure rolls back via `SAVEPOINT`, leaving existing data intact
3. **Search**: Query is embedded; a single numpy matrix multiply scores all chunks; FTS5 BM25 scores are computed separately; results are merged with weighted scores (vector 70% + text 30%). Pure keyword matches receive a score boost to avoid being filtered by `min_score`
4. **Increment**: On re-index, only files whose SHA-256 hash changed are reprocessed; FTS is rebuilt once after all files are processed (not per-file)

## Notes

- `./memory/` and `--db` paths are relative to the project working directory
- Search queries only SQLite — source `.md` files are not re-read at search time
- `--json` output is suitable for programmatic parsing; omit for human-readable output
- For detailed configuration options see: [references/config.md](../../content/skills/research-learning-knowledge/memory-system/references/config.md)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: sentence_transformers` | Run `pip3 install sentence-transformers numpy` |
| `ModuleNotFoundError: numpy` | Run `pip3 install numpy` |
| No results returned | Run `index` first to build the database |
| FTS5 not available | No action needed — vector search still works; full-text search degrades gracefully |
| Database corrupted after indexing | Delete the `.sqlite` file and re-run `index` |
| Search returns irrelevant results | Try lowering `--min-score` (e.g. `--min-score 0.2`) |

## Related Skills

- [planning-with-files](./planning-with-files) — File-based task planning workflow
- [codex](../developer-tools-integrations/codex) — Web search, live technical research, and citation-ready Codex workflows
