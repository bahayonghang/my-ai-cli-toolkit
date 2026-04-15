---
name: typst
description: Generate, edit, compile, and debug idiomatic Typst `.typ` documents. Use when working with Typst files, packages, templates, markup, layout, citations, or document-formatting issues.
category: docs-writing-publishing
tags: [typst, typesetting, markup, document]
version: 1.2.0
argument-hint: [Typst task, file path, or formatting request]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# typst

## Preconditions

1. If the user gives a `.typ` path, edit that file in place unless they explicitly want a fresh document.
2. If no file exists and the user only wants a snippet, generate the snippet directly instead of forcing a full project scaffold.
3. If a compile error or package issue is mentioned, preserve the user's existing package versions/imports unless local docs prove they are wrong.

## Minimal template

```typst
#set document(title: "My Document", author: "Author Name")
#set page(numbering: "1")
#set text(lang: "en")
#set par(justify: true)

= Heading 1

#lorem(50)
```

## Workflow

1. **Trust local docs first.** Training data may be outdated — verify syntax against `$SKILL_DIR/docs/` before generating code.
2. **Classify the task** as one of: create, edit, refactor template, fix compile error, package/import issue, layout/styling issue, or compile/preview.
3. **Read only the relevant docs** via `Read`/`Grep`/`Glob` on the paths below.
4. **Generate or modify** the `.typ` source per the user's request.
5. **Validate** by running `typst compile <file>.typ` whenever a real file exists and verification matters.
6. **Use troubleshooting references** when imports, fonts, or syntax fail before inventing a workaround.
7. **Return** the final `.typ` content and optionally a rendered preview or the concrete remaining error.

## Documentation paths

- **Guides:** `$SKILL_DIR/docs/guides/*.md`
- **Tutorials:** `$SKILL_DIR/docs/tutorial/*.md`
- **Full reference:** `$SKILL_DIR/docs/reference/**/*.md`
- **Fast references:** `$SKILL_DIR/references/SYNTAX.md`, `$SKILL_DIR/references/ADVANCED.md`, `$SKILL_DIR/references/COMMON-MISTAKES.md`, `$SKILL_DIR/references/TROUBLESHOOTING.md`

## Task-to-doc map

- page setup / columns / spacing -> `$SKILL_DIR/docs/guides/page-setup.md`, `$SKILL_DIR/docs/reference/layout/**/*.md`
- tables -> `$SKILL_DIR/docs/guides/tables.md`, `$SKILL_DIR/docs/reference/model/table.md`
- citations / bibliography -> `$SKILL_DIR/docs/reference/model/cite.md`, `$SKILL_DIR/docs/reference/model/bibliography.md`
- styling / theming -> `$SKILL_DIR/docs/reference/styling.md`, `$SKILL_DIR/docs/reference/text/**/*.md`, `$SKILL_DIR/docs/reference/visualize/**/*.md`
- scripting / logic -> `$SKILL_DIR/docs/reference/scripting.md`, `$SKILL_DIR/docs/reference/foundations/**/*.md`
- import / package / common error recovery -> `$SKILL_DIR/references/TROUBLESHOOTING.md`, `$SKILL_DIR/references/COMMON-MISTAKES.md`

## Fallbacks

- If `typst compile` is unavailable, do a static pass against the local syntax docs and report that compilation was not executed.
- If the request is ambiguous between layout polish and semantic rewriting, preserve meaning first and change layout second.
- If a package or template is not present locally, do not hallucinate its API; use core Typst constructs or clearly mark the missing dependency.

## Rules

- Do not invent Typst package APIs, import paths, or function names that are not supported by local docs.
- Prefer the simplest valid Typst construct before introducing advanced scripting.
- If the user provides incomplete content, preserve placeholders clearly instead of hallucinating citations, data, or images.
- Return the updated `.typ` source plus compile result or the exact unresolved Typst error.
