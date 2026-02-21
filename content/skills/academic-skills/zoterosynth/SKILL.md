---
name: zotero-synth
description: Search, browse, and analyze Zotero libraries via zotero-mcp to summarize papers, generate topic or collection literature reviews, synthesize evidence with backlinks, and export BibTeX. Use when tasks involve Zotero collection browsing, collection-based review writing, paper summary, or evidence synthesis.
category: Research
tags: [zotero, synthesis, research, academic, mcp]
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
- **文献综述 (AI & Control 交叉学科核心约束)**:
    - 强制应用 `assets/prompts/review.md` 为规范输出契约。
    - **严厉禁止单篇流水账罗列**：必须按"AI算法/控制策略"或"被控对象特征"进行主题聚合综合（Thematic Synthesis）。
    - **交叉聚类引用**：每段论述必须涵盖 3-8 篇交叉文献以验证控制策略的有效性，使用聚类格式（如 `[Author1, Year1, key1; Author2, Year2, key2]`）。
    - 综述不仅提供信息抽取，必须在最后推导出明确的**方法论空白（Methodological Gap）与新架构构想**。
    - 至少覆盖 50 篇（指定主题）或 80 篇（广泛综述）文献（当数据可用时）。
    - 必须包含元素：`itemType`, `year`, `itemLink` (不可改写), `dataSource`, `dataSource url`。
    - 必须输出一张专门针对控制领域的结构化综合对比总表。
- **引用回链**：所有涉及机制、性能结论的主张必须有清晰可追溯的文献回链：`[Author, Year, item_key]`。
- 标注信息缺失点：用 `[需确认]` 标记，不可凭空推导控制参数或环境设定。
- 对于超过 10 篇的综述任务，必须采用 Map-Reduce 架构，在 Reduce 阶段执行交叉审查。

## 4) Error Handling
- Follow `references/ERRORS.md` for user-facing error responses.
- Before semantic retrieval, check index status with `zotero-mcp:zotero_get_search_database_status`.
- If full text is unavailable, fallback to metadata + annotations and state limitations.

## 5) Resource Index
- Tool matrix: `references/TOOLS.md`
- Workflow specs: `references/WORKFLOWS.md`
- Output prompts: `assets/prompts/summarize.md`, `assets/prompts/review.md`, `assets/prompts/synthesize.md`
- Advanced setup: `references/ADVANCED.md`
