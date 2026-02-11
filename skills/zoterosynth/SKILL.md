---
name: zotero-synth
description: >
  Zotero literature management and analysis. Use when user needs to browse
  Zotero collections, read papers, summarize articles, generate literature
  reviews, or synthesize research findings from their Zotero library.
category: research
tags:
  - zotero
  - literature-management
  - paper-analysis
  - synthesis
version: 1.0
allowed-tools:
  - Bash
  - Read
  - Write
  - Task
  - Glob
argument-hint: "<command> [args] — check | collections | items | search | read | summarize | review | synthesize"
---

# ZoteroSynth

## Environment
!`cd "$SKILL_DIR" && uv run scripts/zotero_client.py check 2>/dev/null || echo '{"status":"error","hint":"Run: uv sync in $SKILL_DIR"}'`

## Setup
Run all scripts from `$SKILL_DIR`:
```
cd "$SKILL_DIR"
```

## Commands
Read [COMMANDS.md](resources/COMMANDS.md) for full CLI reference. Core commands:
- `uv run scripts/zotero_client.py collections --tree`
- `uv run scripts/zotero_client.py search "QUERY" --limit N`
- `uv run scripts/zotero_client.py detail KEY`
- `uv run scripts/pdf_extract.py "PATH" --max-pages 30`

## Workflow
1. **Single paper**: `detail KEY` → `pdf-path KEY` → `pdf_extract.py PATH` → Summarize per [summarize.md](resources/prompts/summarize.md)
2. **Multi-paper**: `items --collection KEY` or `search QUERY` → Map: summarize each (300-600 tokens) → Reduce: synthesize per [review.md](resources/prompts/review.md) or [synthesize.md](resources/prompts/synthesize.md)

## Rules
- Parse JSON output, present in natural language
- Include citation: [Author, Year, item_key]
- >10 papers: use Map-Reduce
- Fallback: `pip install pyzotero pymupdf && python scripts/xxx.py`
- Setup help: [ADVANCED.md](resources/ADVANCED.md)
