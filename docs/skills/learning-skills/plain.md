# Plain

Plain-language rewrite skill that turns source content or questions into natural prose a smart 12-year-old can retell.

## When to use it

- user asks for a plain-language explanation
- user wants jargon stripped away without losing the real idea
- user wants something rewritten in more natural, concrete spoken language

## Core workflow

1. read the source content and identify the real point
2. choose the explanation form that best fits the topic
3. rewrite with short, concrete, spoken-language sentences
4. keep the prose flowing instead of forcing a rigid template
5. run the red-line checks before finishing

## Output contract

- produces one continuous Org-mode article with no section labels in the body
- uses `references/template.org` plus shell-appropriate timestamp commands
- creates `~/Documents/notes/` before writing when needed
- if note creation fails, returns the full Org text in chat and says the save failed

## Main supporting assets

- the style rules and red-line checklist in `SKILL.md`
- the built-in toolbox of analogies, examples, and question framing
- `references/template.org` for the Org header

## Key constraints

- keep the language conversational and concrete
- avoid filler, stiff structure labels, and self-referential writing
- use only ASCII symbols in diagrams
- explain necessary technical terms in plain language before naming them

## Notes

- The skill prioritizes readability over visible structure.
- It is for simplification, not concept anatomy or vocabulary study.
