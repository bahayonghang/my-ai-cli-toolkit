# paper-record schema

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

### source

- `input`
- `input_kind`
- `resolved_pdf_url`
- `canonical_url`

### document

- `document_type`
- `degree_level`
- `language`

### bibliography

- `title`
- `authors`
- `year`
- `venue`
- `publisher`
- `doi`
- `abstract`
- `keywords`

### content

- `summary`
- `problem`
- `method`
- `results`
- `sections`
- `full_text_markdown`
- `full_text_included`

### arxiv_enhancement

- `arxiv_id`
- `alphaxiv_available`
- `intermediate_report`
- `key_insights`
- `citations`

### provenance

- `metadata_sources`
- `content_sources`
- `warnings`
- `confidence`

## Status semantics

- `resolved` — enough structured facts exist for downstream analysis
- `partial` — useful metadata exists, but important fields are missing
- `unresolved` — the source could not be converted into a usable paper record
