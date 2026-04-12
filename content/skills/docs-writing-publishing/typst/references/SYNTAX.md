# Typst Quick Syntax Reference

## Critical distinctions

- **Arrays**: `(item1, item2)` (parentheses). See [docs/reference/foundations/array.md](../docs/reference/foundations/array.md).
- **Dictionaries**: `(key: value, key2: value2)` (parentheses with colons). See [docs/reference/foundations/dictionary.md](../docs/reference/foundations/dictionary.md).
- **Content blocks**: `[markup content]` (square brackets). See [docs/reference/foundations/content.md](../docs/reference/foundations/content.md).
- **NO tuples**: Typst only has arrays.

## Hash usage (markup vs code)

- Use `#` to start a code expression inside markup or content blocks; it disambiguates code from text. This is required for content-producing function calls and field access in markup: `#figure[...]`, `#image("file.png")`, `text(...)[#numbering(...)]`.
- Do not use `#` inside code contexts (argument lists, code blocks, show-rule bodies). Example: `#figure(image("file.png"))` (no `#` before `image`).
- Reference: [docs/reference/scripting.md](../docs/reference/scripting.md), [docs/tutorial/writing-in-typst.md](../docs/tutorial/writing-in-typst.md)

```typst
// Incorrect (missing # inside content block)
text(...)[(numbering(...))]

// Correct
text(...)[(#numbering(...))]
```

## Styling rules: set vs show

- `set`: Configure optional parameters on element functions (style defaults scoped to the current block or file).
- `show`: Target selected elements and apply a set rule or transform/replace the element output.
- Use `set` for common styling; use `show` for selective or structural changes (e.g., `heading.where(level: 1)`, labels, text, regex).

```typst
// Set rule: configure optional parameters for an element type
#set heading(numbering: "I.")
#set text(font: "New Computer Modern")

// Show-set rule: apply a set rule only to selected elements
#show heading: set text(navy)

// Show transform rule: replace/reshape element output
#show heading: it => block[#emph(it.body)]
```
