# `paper-record` schema

Canonical top-level fields:

```json
{
  "schema_version": "paper-record",
  "status": "resolved|partial|unresolved",
  "source": {},
  "document": {},
  "bibliography": {},
  "content": {},
  "arxiv_enhancement": {},
  "provenance": {},
  "errors": []
}
```

## Required shape

### `source`

- `input`
- `input_kind`
- `resolved_pdf_url`
- `canonical_url`

### `document`

- `document_type`
- `degree_level`
- `language`

### `bibliography`

- `title`
- `authors`
- `year`
- `venue`
- `publisher`
- `doi`
- `abstract`
- `keywords`

### `content`

- `summary`
- `problem`
- `method`
- `results`
- `sections`
- `page_chunks`
- `full_text_markdown`
- `full_text_included`

### `content.page_chunks`

Optional page-level anchors for downstream citation or quote lookup.

```json
{
  "anchor": "p3",
  "page_start": 3,
  "page_end": 3,
  "label": "p3",
  "excerpt": "Short preview of the page text.",
  "text": "Full page text when full_text_included=true, otherwise null."
}
```

Rules:

- `page_chunks` may be empty when the source only resolved to metadata.
- `text` may be `null` when full text retention is disabled.
- Downstream modes must output `[信息待核实]` instead of inventing page numbers or verbatim quotations when the needed anchor is missing.

### `arxiv_enhancement`

- `arxiv_id`
- `alphaxiv_available`
- `intermediate_report`
- `key_insights`
- `citations`

### `provenance`

- `metadata_sources`
- `content_sources`
- `warnings`
- `confidence`

## Status semantics

- `resolved` — enough structured facts exist for downstream analysis
- `partial` — useful metadata exists, but important fields are missing
- `unresolved` — the source could not be converted into a usable paper record
