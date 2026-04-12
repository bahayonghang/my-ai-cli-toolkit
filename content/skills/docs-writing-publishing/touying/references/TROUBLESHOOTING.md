# Touying Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `set page` not working | Touying overrides page settings | Use `config-page` instead |
| Slide boundaries wrong | `slide-level` mismatch | Set via `config-common(slide-level: n)` |
| `#pause` not working | Inside `context` block | Move pause outside context |
| Theme not applied | Missing `touying-slide-wrapper` | Wrap custom slide functions |
| Page numbers wrong | Appendix not marked | Add `#show: appendix` after main deck |
| Animation not showing | Missing `#meanwhile` or wrong syntax | Check `docs/dynamic/simple.md` |
| Equations not animating | Wrong syntax | See `docs/dynamic/equation.md` |
| PDF output wrong | Wrong compiler options | Use `typst compile --font-path ...` |

## Error messages

If input validation fails, report:
- "Error: Provide a valid .typ file path." — when `$ARGUMENTS` is empty
- "Error: File not found." — when path does not exist
- "Error: Not a .typ file." — when file extension is wrong
