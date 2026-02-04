# Memory System

Local memory system that indexes Markdown files to SQLite for cross-session semantic search.

## Overview

The Memory System skill provides a powerful local knowledge base that:
- Indexes Markdown files into a SQLite database
- Enables semantic search using vector embeddings
- Supports hybrid search (vector + full-text)
- Maintains cross-session memory for AI assistants
- Provides incremental indexing with SHA256 hash comparison

## Features

- **Semantic Search**: Find relevant information using natural language queries
- **Hybrid Search**: Combines vector similarity and full-text search for better results
- **Incremental Indexing**: Only processes changed files for efficiency
- **Cross-Session Memory**: Persist knowledge across multiple AI conversations
- **Memory Management**: Add, search, index, and cleanup operations
- **Status Monitoring**: View database statistics and health

## Installation

```bash
python3 install.py install memory-system
```

## Dependencies

The skill requires Python packages for vector embeddings:

```bash
pip3 install sentence-transformers numpy
```

## Usage

### Automatic Triggers

The skill automatically activates when users mention keywords like:
- "记忆" / "memory"
- "知识库" / "knowledge base"
- "索引笔记" / "index notes"
- "搜索记忆" / "search memory"
- "跨会话记忆" / "cross-session memory"
- "记住这个" / "remember this"
- "回忆" / "recall"
- "查找记忆" / "find memory"

### Commands

#### Search Memory

Search for information in the memory database:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py search "your query" \
  --db ./memory/memory.sqlite --json --top 6
```

#### Add to Memory

Save new information to memory:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py add "content to remember" \
  --file filename.md --dir ./memory --db ./memory/memory.sqlite
```

#### Index Memory

Build or update the search index:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py index \
  --dir ./memory --db ./memory/memory.sqlite
```

#### Check Status

View memory database statistics:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py status \
  --db ./memory/memory.sqlite -v
```

#### Cleanup Old Memories

Remove memories older than specified days:

```bash
python3 ~/.claude/skills/public/memory-system/scripts/memory.py cleanup \
  --days 90 --dir ./memory --force
```

## Configuration

### Directory Structure

```
./memory/
├── memory.sqlite       # SQLite database with indexed content
└── *.md               # Markdown files containing memories
```

### Options

- `--db`: Path to SQLite database (default: `./memory/memory.sqlite`)
- `--dir`: Directory containing Markdown files (default: `./memory`)
- `--json`: Output results in JSON format for programmatic parsing
- `--top`: Number of search results to return (default: 6)
- `--days`: Age threshold for cleanup operations
- `--force`: Skip confirmation prompts

## How It Works

1. **Indexing**: Scans Markdown files and generates vector embeddings using sentence-transformers
2. **Storage**: Stores content, embeddings, and metadata in SQLite
3. **Search**: Combines vector similarity search with full-text search for optimal results
4. **Incremental Updates**: Uses SHA256 hashes to detect changed files and avoid reprocessing

## Best Practices

- Keep memory files organized in the `./memory/` directory
- Run `index` after adding multiple new files
- Use descriptive filenames for better organization
- Regularly check `status` to monitor database health
- Set up periodic `cleanup` to remove outdated information

## Use Cases

- **Project Documentation**: Remember project decisions and context
- **Code Snippets**: Store and retrieve useful code patterns
- **Research Notes**: Index research findings and references
- **Meeting Notes**: Search across meeting summaries
- **Learning Journal**: Build a searchable knowledge base

## Technical Details

- **Vector Model**: Uses sentence-transformers for semantic embeddings
- **Database**: SQLite for efficient storage and querying
- **Search Algorithm**: Hybrid approach combining cosine similarity and BM25
- **Hash Algorithm**: SHA256 for change detection

## Related Skills

- [research](./research) - Technical research with web search
- [librarian](./librarian) - Documentation researcher
- [planning-with-files](./planning-with-files) - File-based task planning

## References

For detailed configuration options, see the skill's `references/config.md` file.
