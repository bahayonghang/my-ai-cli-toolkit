# Interpret mode

Interpret mode consumes a normalized `paper-record` payload as its fact source.

## Handoff fields

Prefer these normalized fields:

- `bibliography.title`
- `bibliography.authors`
- `bibliography.venue`
- `bibliography.abstract`
- `content.summary`
- `content.problem`
- `content.method`
- `content.results`
- `content.sections`

## Rules

- Do not re-parse the original PDF or URL when the normalized record already has
  enough facts
- Keep the interpretation grounded in the normalized record
- If important fields are missing, state the limitation instead of inventing
  details
