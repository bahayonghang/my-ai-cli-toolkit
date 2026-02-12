---
name: zotero-synth
description: >
  Searches, browses, and analyzes Zotero libraries via zotero-mcp MCP tools.
  Summarizes individual papers, generates multi-paper literature reviews,
  synthesizes cross-paper evidence with citation backlinks, and exports BibTeX.
  Use when the user mentions Zotero, literature review, paper analysis,
  research synthesis, academic references, citation management, reading notes,
  PDF annotations, or systematic review.
category: research
tags:
  - zotero
  - literature-review
  - paper-analysis
  - research-synthesis
  - citation-management
  - mcp
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
- `review <topic|collection>` → multi-paper review (Map-Reduce). Read `references/WORKFLOWS.md` § 2, output per `assets/prompts/review.md`.
- `synthesize <question>` → evidence synthesis. Read `references/WORKFLOWS.md` § 3, output per `assets/prompts/synthesize.md`.
- `bibtex <query|keys>` → export citations via `zotero-mcp:zotero_get_item_metadata` with `format="bibtex"`.

## 3) Output Rules
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
