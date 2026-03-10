# LaTeX Document Skill

General-purpose LaTeX and PDF workflow skill for authoring, compiling, converting, diffing, and extracting document content.

## When to use it

- create or edit `.tex`
- compile LaTeX to PDF
- convert between document formats
- extract structured content from PDFs
- build posters, cheat sheets, or Beamer decks

## Workflow

1. classify the request: create, compile, convert, extract, poster, cheat sheet, or diff
2. load only the necessary files from `references/`
3. reuse templates from `assets/templates/` where possible
4. run the matching helper scripts from `scripts/`
5. validate the output before returning source and PDF artifacts

## Main support areas

- `references/` for conversion, PDF workflows, posters, bibliography, diagrams, accessibility, and profiles
- `assets/templates/` for reusable source scaffolds
- `scripts/` for compile, lint, diff, analysis, and PDF processing

## Notes

- For large PDF-to-LaTeX jobs, the skill scales its approach by page count.
- Prefer the built-in templates and scripts over ad hoc local commands.
