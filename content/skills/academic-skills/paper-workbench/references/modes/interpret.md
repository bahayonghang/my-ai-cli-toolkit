# Interpret mode

Interpret mode consumes a normalized `paper-record` payload as its fact source.
It is the lightweight, profile-optional explanation path.

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

## Output shape

- 1 short orientation paragraph
- 3-5 bullets on problem, method, findings, and why the paper matters
- explicit limitations when normalized facts are sparse

## Rules

- Do not re-parse the original PDF or URL when the normalized record already has
  enough facts
- Keep the interpretation grounded in the normalized record
- If important fields are missing, state the limitation instead of inventing
  details
