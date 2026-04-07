# Routing

## Source classes

Treat the input as one of:

- `paper-record` JSON
- arXiv ID
- arXiv URL
- AlphaXiv URL
- DOI string
- DOI URL
- local PDF
- remote PDF URL
- generic landing page with a PDF link

## Normalize-first rule

Before any interpretive or analytical mode, normalize the source into the shared
`paper-record` schema.

Do not let downstream modes re-parse the original source when a normalized record
is already available.

## Mode routing

- `--mode json`
  - Return the canonical normalized record
  - Prefer exact JSON output over prose
- `--mode interpret`
  - Use the normalized record as the source of truth
  - Do not re-fetch unless the record is clearly missing required facts
- `--mode xray`
  - Use the normalized record as the source of truth
  - Focus on logic model, assumptions, and critique

## Fallbacks

- arXiv / AlphaXiv → prefer AlphaXiv structured metadata, then arXiv PDF
- DOI → prefer Crossref metadata; if only metadata is available, return partial
  or resolved metadata without inventing full text
- landing page → resolve a PDF link when possible
- existing normalized JSON → trust it and reuse it directly
