# Learn

Single-concept anatomy skill that cuts one idea into eight angles, finds the shared deep structure, and compresses the result into an Org-mode insight note.

## When to use it

- user wants to deeply understand one concept, term, or idea
- user asks for concept anatomy rather than a simpler rewrite
- user invokes the multi-angle learning style behind `learn`

## Core workflow

1. anchor the concept with its common definition, likely misunderstandings, and core terms
2. cut it from eight angles: history, dialectic, phenomenology, linguistics, formalization, existential meaning, aesthetics, and meta-reflection
3. write a short inner monologue from the concept's point of view
4. compress the result into a formula, one-sentence epiphany, and ASCII structure sketch
5. save the result as an Org-mode note using the bundled template

## Output contract

- produces a pure Org-mode note for one concept
- uses `references/template.org` plus shell-appropriate timestamp commands
- creates `~/Documents/notes/` before writing when needed
- if note creation fails, returns the full Org text in chat and says the save failed

## Main supporting assets

- the eight-cut concept framework in `SKILL.md`
- `references/template.org` for the note skeleton
- the local notes directory under `~/Documents/notes/`

## Key constraints

- no Markdown formatting in the final note
- ASCII diagrams only
- do not over-poeticize technical concepts
- do not replace the actual concept analysis with a generic summary

## Notes

- This skill is for deep structure, not quick paraphrase.
- It should process one concept at a time.
