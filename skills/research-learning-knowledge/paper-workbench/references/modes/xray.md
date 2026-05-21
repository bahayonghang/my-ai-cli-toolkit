# X-Ray mode

X-ray mode consumes a normalized `paper-record` payload as its fact source.
This is the compact critique path for users who want logic, assumptions, and
boundaries rather than a full literature-workbench output.

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
- `content.page_chunks`
- `arxiv_enhancement.key_insights`
- `arxiv_enhancement.citations`

## Output shape

Follow `resources/ANALYSIS_FRAMEWORK.md`:

- core pain point
- solving mechanism
- delta / novelty
- hidden assumptions and open problems
- napkin formula / sketch

## Rules

- Deconstruct the paper's logic model, not just the abstract wording
- Use the normalized record as the source of truth
- Call out when critique confidence is limited by sparse source fidelity
- If a requested page or quotation cannot be grounded in `page_chunks`, output
  `[信息待核实]`
