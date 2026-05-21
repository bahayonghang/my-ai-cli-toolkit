# Scan mode

Scan mode is the quick triage step for a single paper.

## Required input

- one normalized `paper-record`
- optional `researcher-profile`

## Output shape

Return exactly these five fields, using 3-5 sentences total:

- `文章类别`
- `学术意图`
- `核心主张`
- `相关度评估`
- `阅读建议`

## Rules

- This is a triage pass, not a full summary
- If profile data exists, relevance must be evaluated against the user’s own
  research question
- If source fidelity is low, say so instead of pretending the paper was deeply
  read
