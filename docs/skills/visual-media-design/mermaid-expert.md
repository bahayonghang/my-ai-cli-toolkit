# Mermaid Expert

Use this skill when you need working Mermaid snippets for docs, READMEs, architecture notes, or Markdown-based diagrams.

## When to use it

- user mentions Mermaid directly
- user wants a diagram embedded in Markdown or documentation
- user needs help choosing a Mermaid diagram type
- user already has Mermaid code and needs a syntax or rendering fix

## Core workflow

1. identify the diagram type that best matches the request
2. consult `SKILL.md` and `references/mermaid_syntax_guide.md` when exact syntax matters
3. return a ready-to-use fenced `mermaid` block
4. keep the answer focused on the requested diagram instead of turning it into a long tutorial
5. if rendering fails, make the smallest syntax fix that restores a valid diagram

## Output contract

- default output is valid Mermaid syntax inside a fenced `mermaid` block
- flowcharts default to `TD` / `TB` unless `LR` produces a clearer layout
- integration details should only be expanded when the user asks for HTML, docs, or toolchain help

## Main supporting assets

- `content/skills/visual-media-design/mermaid-expert/SKILL.md`
- `content/skills/visual-media-design/mermaid-expert/references/mermaid_syntax_guide.md`

## Key constraints

- do not answer with pseudo-code when Mermaid syntax is requested
- avoid encyclopedic syntax dumps when the user needs one working diagram
- prefer direct fixes over rewriting the whole diagram unnecessarily

## Notes

- This page documents the skill surface, not the full Mermaid language reference.
- For exhaustive syntax details, use the bundled reference file inside the skill.
