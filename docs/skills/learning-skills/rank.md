# Rank

Domain-reduction skill that finds the smallest set of independent generators behind a messy field and proves them with four tests.

## When to use it

- user asks what really holds a field together
- user wants the irreducible structure or rank of a domain
- user wants many surface phenomena reduced to a small hidden core

## Core workflow

1. identify or infer the field's representative phenomena
2. search for the smallest set of independent generators
3. test the four rank criteria: generativity, minimality, independence, and predictive power
4. weave the validation into readable prose instead of a detached appendix
5. end with an explicit rank conclusion and one-line takeaway

## Output contract

- produces a prose-first Org note rather than a table-first answer
- uses `references/template.org` plus shell-appropriate timestamp commands
- creates `~/Documents/notes/` before writing when needed
- if note creation fails, returns the full Org text in chat and says the save failed

## Main supporting assets

- the four rank criteria defined in `SKILL.md`
- `references/template.org` for the note skeleton
- the prose-first writing guidance embedded in the skill

## Key constraints

- every generator must earn its place by explanation and validation
- the result should preserve the feeling of reduction, not just counting
- the four criteria must appear inside the reasoning, not as a detached appendix
- if the domain cannot be reduced confidently, end with `秩：未定`

## Notes

- The skill is about structure discovery, not summarization.
- It works best when the field has many surface phenomena but a small hidden core.
