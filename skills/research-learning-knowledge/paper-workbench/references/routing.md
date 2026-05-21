# Routing

## Source classes

Treat the input as one of:

- `paper-record` JSON
- `researcher-profile` JSON
- `paper-deep-read` / `literature-synthesis` / `review-outline` JSON
- arXiv ID
- arXiv URL
- AlphaXiv URL
- DOI string
- DOI URL
- local PDF / text file
- remote PDF URL
- generic landing page with a PDF link

## Normalize-first rule

Before any single-paper analysis mode, normalize the paper source into the
shared `paper-record` schema.

Do not let downstream modes re-parse the original PDF or URL when a normalized
record already exists.

## Profile rule

`deep-read`, `card`, `synthesis`, and `review` should use a
`researcher-profile` when available.

If a profile-sensitive mode is requested and the user has not given the five
profile fields, ask only for the missing facts:

- research field
- core question
- thesis (optional)
- target tier
- current stage

## Mode routing

### Single-paper modes

- `scan`
  - Single paper
  - 3-5 sentence quick triage
- `deep-read`
  - Single paper
  - Full academic deconstruction + strategic relevance + literature card
- `card`
  - Single paper
  - Only output the reusable card and short critical summary
- `interpret`
  - Single paper
  - Lightweight explanation grounded in normalized facts
- `xray`
  - Single paper
  - Compact logic/assumption critique using the x-ray framework
- `json`
  - Return the canonical normalized record

### Cross-paper modes

- `synthesis`
  - Prefer 3+ `paper-record` or `paper-deep-read` inputs
  - If there are only 2 inputs, degrade to comparison mode and say the gap map
    is provisional
- `review`
  - Prefer a `literature-synthesis` artifact
  - Otherwise accept 3+ `paper-deep-read` artifacts plus a profile

## Compatibility aliases

- `json` keeps the old machine-readable route unchanged
- `interpret` keeps the old lightweight human-readable route
- `xray` keeps the old compact critique route
- Old “single paper with no explicit mode” behavior should default to:
  - `json` for tool-facing / save-facing / schema-facing requests
  - `scan` for human reading requests

## Fallbacks

- arXiv / AlphaXiv → prefer AlphaXiv structured metadata, then arXiv PDF
- DOI → prefer Crossref metadata; if only metadata is available, return partial
  metadata and mark missing facts instead of inventing full text
- landing page → resolve a PDF link when possible
- existing normalized JSON → trust it and reuse it directly
