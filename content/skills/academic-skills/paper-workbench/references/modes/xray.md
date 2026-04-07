# X-Ray mode

X-ray mode consumes a normalized `paper-record` payload as its fact source.

## Handoff fields

Prefer these normalized fields:

- `bibliography.title`
- `bibliography.authors`
- `bibliography.abstract`
- `content.summary`
- `content.problem`
- `content.method`
- `content.results`
- `content.sections`
- `arxiv_enhancement.key_insights`
- `arxiv_enhancement.citations`

## Rules

- Deconstruct the paper's logic model, not just the abstract wording
- Use the normalized record as the source of truth
- Call out when critique confidence is limited by sparse source fidelity
