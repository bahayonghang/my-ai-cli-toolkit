# Zotero Workflows

## 1) Single Paper Summary

Copy this checklist and track progress:

```
Summary Progress:
- [ ] Step 1: Locate paper via search/browse
- [ ] Step 2: Retrieve metadata (zotero-mcp:zotero_get_item_metadata)
- [ ] Step 3: Retrieve full text or fallback (zotero-mcp:zotero_get_item_fulltext)
- [ ] Step 4: Retrieve annotations if available (zotero-mcp:zotero_get_annotations)
- [ ] Step 5: Generate summary per assets/prompts/summarize.md
- [ ] Step 6: Verify backlinks and completeness
```

### Inputs
- 查询词、文献标题或 item 标识（至少一个）
- 可选：用户关注点（方法/结果/争议）

### Steps
1. 用 `zotero-mcp:zotero_search_items` 或 `zotero-mcp:zotero_get_collection_items` 定位候选文献。
2. 用 `zotero-mcp:zotero_get_item_metadata` 获取题录信息。
3. 用 `zotero-mcp:zotero_get_item_fulltext` 获取全文。
4. 可选补充 `zotero-mcp:zotero_get_annotations`。
5. 按 `assets/prompts/summarize.md` 输出 300-600 tokens 摘要。

### Output
- 必含：问题、方法、发现、贡献、局限。
- 每个关键结论附 `[Author, Year, item_key]`。

### Fallback
- 全文不可得时，改为"元数据+标注摘要"，并声明证据不足。

### Feedback Loop
After generating the summary:
1. Verify every claim has a `[Author, Year, item_key]` backlink.
2. Verify uncertain information is marked `[需确认]`.
3. Verify summary is 300-600 tokens.
4. If any check fails → revise and re-verify.

## 2) Multi-Paper Review (Map-Reduce)

Copy this checklist and track progress:

```
Review Progress:
- [ ] Step 1: Collect literature set (search / collection / semantic)
- [ ] Step 2: Map phase — per-paper summaries (300-600 tokens each)
- [ ] Step 3: Reduce phase — thematic grouping and comparison
- [ ] Step 4: Semantic gap-check (zotero-mcp:zotero_semantic_search)
- [ ] Step 5: Generate review per assets/prompts/review.md
- [ ] Step 6: Verify backlinks and completeness
```

### Inputs
- 主题查询词，或 collection 标识（`collection_key` / `collection_name`）
- 可选：时间范围/子主题

### Steps
1. 若输入为 collection 名称，先用 `zotero-mcp:zotero_get_collections` 定位 collection，再用 `zotero-mcp:zotero_get_collection_items` 获取条目；若输入为主题则用 `zotero-mcp:zotero_search_items` 起步。
2. 对收集到的每篇文献，至少获取一次 `zotero-mcp:zotero_get_item_metadata`，确保后续可输出 `itemType`、`year`、`itemLink`。
3. 超过 10 篇时，先按批次做 Map：逐篇摘要（300-600 tokens，可结合 fulltext/annotations）。
4. 用 `assets/prompts/review.md` 做 Reduce，输出逐篇详述 + 主题综合 + 总表。
5. 用 `zotero-mcp:zotero_semantic_search` 补检可能遗漏文献（语义索引可用时）。

### Output
- 必须遵循 `assets/prompts/review.md` 的完整结构和约束。
- 开头必须包含 `dataSource` 与 `dataSource url`（与输入 JSON 完全一致）。
- 逐篇详述必须包含 `itemType`、`year`、`itemLink`（原样）。
- 每段包含文献回链。

### Fallback
- 语义索引不可用时，显式说明"仅基于关键词/合集结果"。

### Feedback Loop (Quality Check Protocol)
After generating the review:
1. Verify NO sequential single-paper listings exist (Must use Thematic Synthesis).
2. Verify every analytical paragraph includes 3-8 CROSS-CITATIONS in clustered format `(Author1, Year1; Author2, Year2)`.
3. Verify every mechanism/performance claim has an `[Author, Year, item_key]` backlink.
4. Verify the analysis explicitly targets AI methodologies, system plant characteristics, and control metrics.
5. Verify the conclusion deduces a specific Methodological Gap and new theoretical Model/Hypothesis.
6. Verify review covers required sections in `assets/prompts/review.md`.
7. Verify review length ≥ 1500 字.
8. Verify detailed paper count: topic mode ≥ 50, broad mode ≥ 80 (or explicitly explain shortfall).
9. Verify every `itemLink` is copied unchanged from source metadata.
10. Run `zotero-mcp:zotero_semantic_search` with key terms to check for missed papers.
11. If gaps found → add to literature set and re-reduce.

## 3) Evidence Synthesis

Copy this checklist and track progress:

```
Synthesis Progress:
- [ ] Step 1: Build evidence pool (metadata + fulltext)
- [ ] Step 2: Per-paper evidence cards (support/oppose/neutral)
- [ ] Step 3: Generate evidence matrix with strength ratings
- [ ] Step 4: Consistency and conflict analysis
- [ ] Step 5: Generate Mermaid timeline (if applicable)
- [ ] Step 6: Generate synthesis per assets/prompts/synthesize.md
- [ ] Step 7: Verify backlinks and evidence traceability
```

### Inputs
- 明确研究问题（必填）
- 文献集合（检索结果或指定 key 列表）

### Steps
1. 用 `zotero-mcp:zotero_get_item_metadata` + `zotero-mcp:zotero_get_item_fulltext` 形成证据池。
2. 对每篇产出证据卡（支持/反对/中性）。
3. 按 `assets/prompts/synthesize.md` 生成证据矩阵、一致性/冲突分析与结论。
4. 如需时间脉络，按模板输出 Mermaid timeline。

### Output
- 必含证据矩阵与证据强度标注（强/中/弱）。
- 结论必须可回溯到具体文献。

### Fallback
- 若证据冲突且无法裁决，输出"冲突来源假设 + 待验证数据需求"，不得强行下结论。

### Feedback Loop
After generating the synthesis:
1. Verify evidence matrix includes strength ratings (强/中/弱) for every claim.
2. Verify every conclusion traces back to specific literature `[Author, Year, item_key]`.
3. Verify Mermaid timeline is present and renders correctly.
4. Run `zotero-mcp:zotero_semantic_search` to verify gaps are genuine.
5. If unresolvable conflicts exist → output conflict hypothesis, do not force conclusions.
