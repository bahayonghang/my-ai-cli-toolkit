# Compilation Error Patterns

## Typst Errors

| Error Pattern | Type | Fix |
|---------------|------|-----|
| `unknown import` | Missing package | Add correct `#import` statement |
| `expected ...` | Syntax error | Fix syntax at indicated position |
| `unclosed delimiter` | Unclosed bracket | Add missing closing bracket/paren |
| `unknown variable` | Undefined name | Fix variable/function name |
| `font "..." not found` | Missing font | Replace with available font |
| `cannot access file` | File not found | Check file path and existence |
| `expected content` | Content error | Ensure content blocks are properly formatted |

## LaTeX Errors

| Error Pattern | Type | Fix |
|---------------|------|-----|
| `File ... not found` | Missing package | `\usepackage{package}` or install via tlmgr |
| `Missing $ inserted` | Math mode error | Add missing `$` delimiters |
| `Missing \end{...}` | Unclosed environment | Add matching `\end{env}` |
| `Undefined control sequence` | Unknown command | Fix command name or add package |
| `Font ... not found` | Missing font | Install font or use alternative |
| `Missing \begin{document}` | Structure error | Ensure preamble is correct |
| `Too many }'s` | Extra brace | Remove extra closing brace |
| `Overfull \hbox` | Layout warning | Adjust content width or use `\sloppy` |

## Auto-Fix Strategy

1. **Read error output** (stderr for Typst, .log file for LaTeX)
2. **Match pattern** against tables above
3. **Apply fix** using Edit tool at the indicated line
4. **Recompile** and verify (max 3 retries)

## Compiler Availability Check

```python
# Check in scripts/compile.py
import shutil
typst_available = shutil.which("typst") is not None
latexmk_available = shutil.which("latexmk") is not None
```

## Log File Locations

- **Typst**: errors in stderr (captured by subprocess)
- **LaTeX**: `output/{filename}.log` (detailed), stderr (summary)
