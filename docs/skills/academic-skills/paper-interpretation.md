# Paper Interpretation

Paper-reading skill for non-academic readers. It turns a paper into practical understanding instead of academic critique.

## When to use it

- user shares an arxiv link, paper URL, PDF, or local paper file
- user asks to read, interpret, or analyze a research paper for understanding
- the goal is to extract ideas for personal use rather than produce a formal review

## Core workflow

1. collect the paper content from URL, PDF, local file, or paper title search
2. identify the real problem the paper is trying to solve
3. explain the core method in plain language for a smart non-specialist reader
4. extract one to three key concepts and turn them into intuition
5. summarize the paper's most valuable insight
6. provide an advisor-style critique and a practical take-away
7. generate the final Org-mode note from the bundled template

## Output contract

- writes a Denote-style Org note to `~/Documents/notes/`
- uses the bundled Org header format and file naming rules
- reports the final output path after writing the file

## Main supporting assets

- `references/template.org` for the output structure
- embedded Org-mode and Denote naming rules in `SKILL.md`
- built-in acceptance checks for tone, clarity, and practical value

## Key constraints

- diagrams must stay ASCII-only
- output must follow Org-mode syntax rather than Markdown conventions
- explanations should prefer plain language over academic jargon
- if part of the paper remains unclear, the skill should state that directly instead of guessing

## Notes

- This skill focuses on understanding and reuse, not formal peer review.
- It is optimized for readers who want to extract ideas they can apply.
