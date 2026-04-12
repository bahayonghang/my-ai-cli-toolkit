---
name: typst
description: Generate and edit idiomatic Typst (.typ) code. Use when working with Typst files or when the user mentions Typst markup or document formatting.
category: docs-writing-publishing
tags: [typst, typesetting, markup, document]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# typst

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

1. **Trust local docs first.** Training data may be outdated — verify syntax against `docs/` before generating code.
2. **Read relevant documentation** via `Read`/`Grep`/`Glob` on the paths below.
3. **Generate or modify** the `.typ` source per the user's request.
4. **Validate** by running `typst compile <file>.typ` (if tool access allows).
5. **Return** the final `.typ` content and optionally a rendered preview.

## Documentation paths

- **Guides:** `docs/guides/*.md`
- **Tutorials:** `docs/tutorial/*.md`
- **Full reference:** `docs/reference/**/*.md`
