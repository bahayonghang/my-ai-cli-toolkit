# Advanced Typst Features

## Custom themes

See [docs/reference/styling.md](../docs/reference/styling.md) for theme creation using `set` and `show` rules.

## Scripting

Use Typst's scripting capabilities ([docs/reference/scripting.md](../docs/reference/scripting.md)) for automatic content generation, conditional logic, and loops.

## Math and visualisation

- **Math:** [docs/reference/math/](../docs/reference/math/) for equations and formulas.
- **Visualize:** [docs/reference/visualize/](../docs/reference/visualize/) for diagrams and graphics.

## Large project organization

Split large projects across multiple files for maintainability:

- Use `#include "file.typ"` to include sub-files.
- Use `#import "module.typ": func` to import specific symbols.
- Reference: [docs/reference/foundations/module.md](../docs/reference/foundations/module.md)
