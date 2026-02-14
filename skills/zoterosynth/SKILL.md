---
name: zotero-synth
description: Search, browse, and analyze Zotero libraries via zotero-mcp to summarize papers, generate topic or collection literature reviews, synthesize evidence with backlinks, and export BibTeX. Use when tasks involve Zotero collection browsing, collection-based review writing, paper summary, or evidence synthesis.
category: knowledge-management
tags: [zotero, literature-review, academic, research, synthesis, bibtex]
---

# ZoteroSynth

## 1) Environment Gate
!`zotero-mcp version 2>/dev/null || echo '{"status":"error","message":"zotero-mcp is NOT installed!","install":"uv tool install \"git+https://github.com/54yyyu/zotero-mcp.git\" && zotero-mcp setup","hint":"Install zotero-mcp first, then retry this skill. DO NOT proceed without it."}'`
If the check returns an error, stop and reply:
```bash
zotero-mcp 未安装。请先运行：
uv tool install "git+https://github.com/54yyyu/zotero-mcp.git"
zotero-mcp setup
```

## 2) Entry Workflow

Arguments: `<task> [query-or-item]`

- `check` → verify MCP and Zotero connectivity. Follow `references/ERRORS.md` on failure.
- `summarize <query|key>` → single-paper flow. Read `references/WORKFLOWS.md` § 1, output per `assets/prompts/summarize.md`.
- `review <topic|collection_key|collection_name>` → multi-paper review (Map-Reduce). For collection-based review, follow `references/WORKFLOWS.md` § 2 and output strictly per `assets/prompts/review.md`.
- `synthesize <question>` → evidence synthesis. Read `references/WORKFLOWS.md` § 3, output per `assets/prompts/synthesize.md`.
- `extract <query|collection>` → Extract papers to `papers.json` using `scripts/extract_papers.py`.
- `bibtex <query|keys>` → export citations via `zotero-mcp:zotero_get_item_metadata` with `format="bibtex"`.

## 3) Output Rules
- **Literature Review**:
    - Use `assets/prompts/review.md` as the canonical output contract.
    - Must cover at least 50 papers (if topic specified) or 80 papers (if no topic, broad review), when available.
    - Must include: `itemType`, `year`, `itemLink` (unchanged), `dataSource`, `dataSource url`.
    - Must include both detailed per-paper analysis and a final summary table.
- Add a backlink for each claim: `[Author, Year, item_key]`.
- Mark missing evidence as `[需确认]`; do not fabricate content.
- For >10 papers, use Map-Reduce and keep per-paper traceability.

## 4) Error Handling
- Follow `references/ERRORS.md` for user-facing error responses.
- Before semantic retrieval, check index status with `zotero-mcp:zotero_get_search_database_status`.
- If full text is unavailable, fallback to metadata + annotations and state limitations.

## 5) Resource Index
- Tool matrix: `references/TOOLS.md`
- Workflow specs: `references/WORKFLOWS.md`
- Output prompts: `assets/prompts/summarize.md`, `assets/prompts/review.md`, `assets/prompts/synthesize.md`
- Advanced setup: `references/ADVANCED.md`
